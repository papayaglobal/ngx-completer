import { SelectionModel } from '@angular/cdk/collections';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
    DOWN_ARROW,
    END,
    ENTER,
    HOME,
    SPACE,
    UP_ARROW,
    LEFT_ARROW,
    RIGHT_ARROW,
} from '@angular/cdk/keycodes';
import {
    Component,
    Input,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ContentChildren,
    QueryList,
    NgZone,
    OnInit,
    AfterContentInit,
    ChangeDetectorRef,
    OnDestroy,
    Optional,
    Self,
    Output,
    EventEmitter,
    HostListener,
    ViewChild,
    ElementRef,
    ContentChild,
    HostBinding
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Observable, Subject, merge, defer } from 'rxjs';
import { switchMap, startWith, takeUntil, filter, take  } from 'rxjs/operators';

import { isNill, noop, parseNumber, compare } from '../../../common/common';
import { NgxSelectModel } from './ngx-select-model';
import { NgxOptionSelectionChange, NgxSelectOptionComponent } from './ngx-select-option/ngx-select-option.component';
import { NgxSelectTemplate } from './ngx-select-template';

@Component({
    selector: 'ngx-select',
    templateUrl: 'ngx-select.component.html',
    styleUrls: ['ngx-select.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'ngx-select'
    }
})
export class NgxSelectComponent implements OnInit, AfterContentInit, ControlValueAccessor, OnDestroy {
    @ViewChild('selectPanel') public selectPanel: ElementRef;
    @ViewChild('selectContent') public selectContent: ElementRef;
    @ViewChild(CdkOverlayOrigin) public origin: CdkOverlayOrigin;
    @ViewChild(CdkConnectedOverlay) public connectedOverlay: CdkConnectedOverlay;
    @ContentChild(NgxSelectTemplate) public ngxSelectTemplate: NgxSelectTemplate;
    @ContentChildren(NgxSelectOptionComponent, { descendants: true }) public options: QueryList<NgxSelectOptionComponent>;

    @Input() public isPanelOpen: boolean = false;
    @Input() public showArrow: boolean = true;
    @Input() public rotateArrow: boolean = true;
    @Input() public closeOutsideClick: boolean = true;
    @Input() public placeholder: string;
    @Input() public textTransform: 'none' | 'lowercase' | 'uppercase' | 'capitalize';
    @Input() public maxHeight: string;
    @Input() public width: string;
    @Input() public preSelectedItem: any;

    @HostBinding('class.ngx-disabled')
    @Input() public disabled: boolean = false;

    @HostBinding('attr.tabindex')
    @Input()
    public get tabIndex(): number {
        if (this.disabled) {
            return -1;
        }

        return this._tabIndex;
    }

    public set tabIndex(value: number) {
        this._tabIndex = value;
    }

    @Input()
    public get value(): any {
        return this._value;
    }

    public set value(newValue: any) {
        if (newValue !== this._value) {
            this.writeValue(newValue);
            this._value = newValue;
        }
    }

    @Output() public readonly valueChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() public readonly selectionChange: EventEmitter<NgxSelectModel> = new EventEmitter<NgxSelectModel>();
    @Output() public readonly opened: EventEmitter<void> = new EventEmitter<void>();
    @Output() public readonly closed: EventEmitter<void> = new EventEmitter<void>();

    /** Check is anything selected. */
    public get isEmpty(): boolean {
        return !this._selectionModel || this._selectionModel.isEmpty();
    }

    /** The currently selected option. */
    public get selected(): NgxSelectOptionComponent {
        return this._selectionModel.selected[0];
    }

    /** The value displayed in the select. */
    public get displayValue(): string {
        return this.selected.viewValue;
    }

    public get isFocused(): boolean {
        return this._focused;
    }

    private _iconClosed: string = 'icon-closed';
    private _iconOpened: string = 'icon-opened';
    private _tabIndex: number = 0;
    private _focused = false;
    private _value: any;
    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    /** Deals with the selection logic. */
    private _selectionModel: SelectionModel<NgxSelectOptionComponent>;
    private _keyManager: ActiveDescendantKeyManager<NgxSelectOptionComponent>;
    private readonly _destroy = new Subject<void>();

    /** Combined stream of all of the child options' change events. */
    private readonly _optionSelectionChanges: Observable<NgxOptionSelectionChange> = defer(() => {
        if (this.options) {
            return merge(...this.options.map((option) => option.onSelectionChange));
        }

        return this._ngZone.onStable
            .asObservable()
            .pipe(
                take(1),
                switchMap(() => this._optionSelectionChanges)
            );
    });

    public constructor(private _elementRef: ElementRef,
                       private _ngZone: NgZone,
                       private _changeDetectorRef: ChangeDetectorRef,
                       @Self() @Optional() public ngControl: NgControl) {
        if (this.ngControl) {
            // Using value accessor, instead of using the `provider`
            this.ngControl.valueAccessor = this;
        }
    }

    public ngOnInit() {
        this._selectionModel = new SelectionModel<NgxSelectOptionComponent>(false, undefined, false);
    }

    public ngAfterContentInit() {
        this.initKeyManager();
        this.optionChangesHandler();
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    @HostListener('blur')
    public onBlur(): void {
        this._focused = false;

        if (!this.disabled && !this.isPanelOpen) {
            this._onTouchedCallback();
            this._changeDetectorRef.markForCheck();
        }
    }

    @HostListener('focus')
    public onFocus(): void {
        if (!this.disabled) {
            this._focused = true;
        }
    }

    @HostListener('keydown', ['$event'])
    public onKeydown(event: KeyboardEvent): void {
        if (!this.disabled) {
            this.isPanelOpen ? this.handleOpenKeydown(event) : this.handleClosedKeydown(event);
        }
    }

    public toggle(): void {
        this.isPanelOpen ? this.close() : this.open();
    }

    public open(): void {
        if (this.disabled || !this.options || !this.options.length) {
            return;
        }

        this.isPanelOpen = true;
        this.opened.emit();

        this._keyManager.withHorizontalOrientation(null);
        this.highlightCorrectOption();
        this._changeDetectorRef.markForCheck();
    }

    public close(): void {
        if (this.isPanelOpen) {
            this.isPanelOpen = false;
            this.closed.emit();

            this._keyManager.withHorizontalOrientation('ltr');
            this._onTouchedCallback();
            this._changeDetectorRef.markForCheck();
        }
    }

    public focus(): void {
        this._elementRef.nativeElement.focus();
    }

    public onOverlayAttached(): void {
        this.connectedOverlay.overlayRef.updateSize({
            width: this.origin.elementRef.nativeElement.offsetWidth,
            maxHeight: this.maxHeight
        });

        this.connectedOverlay.positionChange
            .pipe(
                take(1)
            )
            .subscribe(() => {
                this.scrollToSelectedElement();
                this._changeDetectorRef.detectChanges();
            });
    }

    /**
     * Sets the select's value. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param value New value to be written to the model.
     */
    public writeValue(value: any): void {
        if (this.options) {
            this.setSelectionByValue(value);
        }
    }

    /**
     * Saves a callback function to be invoked when the select's value
     * changes from user input. Part of the ControlValueAccessor interface
     * required to integrate with Angular's core forms API.
     *
     * @param fn Callback to be triggered when the value changes.
     */
    public registerOnChange(fn: (value: any) => void): void {
        this._onChangeCallback = fn;
    }

    /**
     * Saves a callback function to be invoked when the select is blurred
     * by the user. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param fn Callback to be triggered when the component has been touched.
     */
    public registerOnTouched(fn: any) {
        this._onTouchedCallback = fn;
    }

    /**
     * Disables the select. Part of the ControlValueAccessor interface required
     * to integrate with Angular's core forms API.
     *
     * @param isDisabled Sets whether the component is disabled.
     */
    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Sets the selected option based on a value. If no option can be
     * found with the designated value, the select trigger is cleared.
     */
    private setSelectionByValue(value: any): void {
        this.clearSelection();

        const correspondingOption = this.selectValue(value);

        // Set activeItem in keyManager for other operations with closed ngx-select
        if (correspondingOption) {
            this._keyManager.setActiveItem(this.options.toArray().indexOf(correspondingOption));
        }

        this._changeDetectorRef.markForCheck();
    }

    /**
     * Finds and selects and option based on its value.
     * @returns Option that has the corresponding value.
     */
    private selectValue(value: any): NgxSelectOptionComponent | undefined {
        const correspondingOption = this.findOptionByValue(value);

        if (correspondingOption) {
            correspondingOption.select();
            this._selectionModel.select(correspondingOption);
        }

        return correspondingOption;
    }

    private findOptionByValue(value: any): NgxSelectOptionComponent | undefined {
        return this.options.find((option: NgxSelectOptionComponent) => {
            return !isNill(option.value) && compare(option.value, value);
        });
    }

    /** Resets subscriptions on options. */
    private resetOptions(): void {
        const changedOrDestroyed = merge(this.options.changes, this._destroy);

        this._optionSelectionChanges
            .pipe(
                takeUntil(changedOrDestroyed),
                filter((event) => event.isUserInput)
            )
            .subscribe((event) => {
                this.onSelect(event.source);

                if (this.isPanelOpen) {
                    this.close();
                    this.focus();
                }
            });
    }

    /** Invoked when an option was selected manually by User. */
    private onSelect(option: NgxSelectOptionComponent): void {
        const previousValue = this.selected ? this.selected.value : null;
        const newValue = option.value;
        const isEmptyValue = isNill(newValue);

        this.clearSelection(isEmptyValue ? undefined : option);

        if (!isEmptyValue) {
            this._selectionModel.select(option);
        }

        this._value = newValue;
        this.propagateChanges(previousValue, newValue);
    }

    /**
     * Clears the select trigger and deselects every option in the list.
     * @param skip Option that should not be deselected.
     */
    private clearSelection(skip?: NgxSelectOptionComponent): void {
        this._selectionModel.clear();
        this.options.forEach((option) => {
            if (option !== skip) {
                option.deselect();
            }
        });
    }

    /**
     * Emits change events.
     * @param previousValue Value that was selected before.
     * @param selectedValue Value that was selected.
     */
    private propagateChanges(previousValue?: any, selectedValue?: any): void {
        const valueToEmit: NgxSelectModel = {
            previous: previousValue,
            current: selectedValue
        };

        this.valueChange.emit(valueToEmit.current);
        this._onChangeCallback(valueToEmit.current);
        this.selectionChange.emit(valueToEmit);
        this._changeDetectorRef.markForCheck();
    }

    /** Sets up a key manager to listen to keyboard events on the overlay panel. */
    private initKeyManager() {
        this._keyManager = new ActiveDescendantKeyManager<NgxSelectOptionComponent>(this.options)
            .withTypeAhead()
            .withVerticalOrientation()
            .withHorizontalOrientation('ltr');

        this._keyManager.tabOut
            .pipe(
                takeUntil(this._destroy)
            )
            .subscribe(() => this.close());

        this._keyManager.change
            .pipe(
                takeUntil(this._destroy)
            )
            .subscribe((itemIndex: number) => {
                const isAlreadySelected = this.options.toArray()[itemIndex].selected;

                if (this.isPanelOpen && this.selectPanel) {
                    this.scrollActiveOptionIntoView();
                } else if (!this.isPanelOpen && this._keyManager.activeItem && !isAlreadySelected) {
                    this._keyManager.activeItem.selectViaInteraction();
                }
            });
    }

    private handleOpenKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;
        const manager = this._keyManager;

        if (keyCode === HOME || keyCode === END) {
            event.preventDefault();
            keyCode === HOME ? manager.setFirstItemActive() : manager.setLastItemActive();
        } else if (isArrowKey && event.altKey) {
            event.preventDefault();
            this.close();
        } else if ((keyCode === ENTER || keyCode === SPACE) && manager.activeItem) {
            event.preventDefault();
            manager.activeItem.selectViaInteraction();
        } else {
            manager.onKeydown(event);
        }
    }

    private handleClosedKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        const isArrowKey =
            keyCode === DOWN_ARROW ||
            keyCode === UP_ARROW ||
            keyCode === LEFT_ARROW ||
            keyCode === RIGHT_ARROW;
        const isOpenKey = keyCode === ENTER || keyCode === SPACE || (event.altKey && isArrowKey);

        if (isOpenKey) {
            event.preventDefault(); // prevents the page from scrolling down when pressing space
            this.open();
        } else {
            this._keyManager.onKeydown(event);
        }
    }

    /**
     * Highlights the selected item. If no option is selected, it will highlight
     * the first item instead.
     */
    private highlightCorrectOption(): void {
        if (this._keyManager) {
            if (this.isEmpty) {
                this._keyManager.setFirstItemActive();
            } else {
                this._keyManager.setActiveItem(this.getOptionIndex(this.selected)!);
            }
        }
    }

    /** Scrolls the active option into view. */
    private scrollActiveOptionIntoView(): void {
        const itemHeight = this.getOptionHeight();
        const activeOptionIndex = this._keyManager.activeItemIndex || 0;
        const selectContentEl: HTMLElement = this.selectContent.nativeElement;
        const selectPanelEl: HTMLElement = this.selectPanel.nativeElement;
        const panelTop = selectPanelEl.scrollTop;
        const panelHeight = selectPanelEl.offsetHeight;
        const scrollOffset = activeOptionIndex * itemHeight + parseNumber(getComputedStyle(selectContentEl).paddingTop);

        if (scrollOffset < panelTop) {
            selectPanelEl.scrollTop = scrollOffset;
        } else if (scrollOffset + itemHeight > panelTop + panelHeight) {
            selectPanelEl.scrollTop = Math.max(0, scrollOffset - panelHeight + itemHeight);
        }
    }

    private scrollToSelectedElement() {
        const activeSelectEl = this.options.toArray()[this._keyManager.activeItemIndex || 0];

        if (activeSelectEl) {
            const divider: number = 2.5; // 2.5 to strictly align in middle
            const selectPanelEl = this.selectPanel.nativeElement;
            selectPanelEl.scrollTop = activeSelectEl.element.nativeElement.offsetTop - selectPanelEl.offsetHeight / divider;
        }
    }

    /** Gets the index of the provided option in the option list. */
    private getOptionIndex(option: NgxSelectOptionComponent): number | undefined {
        return this.options.reduce((result: number | undefined, current: NgxSelectOptionComponent, index: number) => {
            return result === undefined ? (option === current ? index : undefined) : result;
        }, undefined);
    }

    /** Calculates the height of the select's options. */
    private getOptionHeight(): number {
        const selectContentEl: HTMLElement = this.selectContent.nativeElement;

        const panelContentPaddingTop = parseNumber(getComputedStyle(selectContentEl).paddingTop);
        const panelContentPaddingBottom = parseNumber(getComputedStyle(selectContentEl).paddingBottom);
        const panelContentHeight = selectContentEl.clientHeight - panelContentPaddingTop - panelContentPaddingBottom;

        return panelContentHeight / this.options.length;
    }

    /** Subscribe on any changes in options. */
    private optionChangesHandler() {
        this.options.changes
            .pipe(
                startWith(null),
                takeUntil(this._destroy)
            )
            .subscribe(() => {
                this.resetOptions();
                this.initializeSelection();
            });
    }

    /** Initialize selection when options was changed */
    private initializeSelection(): void {
        // Waiting for all sync operations and then selects value
        Promise.resolve().then(() => {
            this.setSelectionByValue(this.ngControl && this.ngControl.value ? this.ngControl.value : this.preSelectedItem || this._value);
        });
    }

    private rotateIcon(): string {
        return this.rotateArrow && this.isPanelOpen ? this._iconOpened : this._iconClosed;
    }
}
