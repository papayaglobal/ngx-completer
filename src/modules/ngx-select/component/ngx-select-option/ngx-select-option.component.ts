import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
    HostListener,
    ElementRef,
    HostBinding
} from '@angular/core';

/**
 * Option IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueIdCounter = 0;

/** Event object emitted by NgxSelectOption when selected or deselected. */
export class NgxOptionSelectionChange {
    public constructor(public source: NgxSelectOptionComponent,
                       public isUserInput = false) {
    }
}

@Component({
    selector: 'ngx-select-option',
    exportAs: 'ngxSelectOption',
    templateUrl: 'ngx-select-option.component.html',
    styleUrls: ['ngx-select-option.component.css'],
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSelectOptionComponent {
    @Input() public value: any;
    @Input() public disabled: boolean = false;

    @Output() public onSelectionChange = new EventEmitter<NgxOptionSelectionChange>();

    @HostBinding('class.ngx-selected')
    public get selected(): boolean {
        return this._selected;
    }

    @HostBinding('class.ngx-active')
    public get active(): boolean {
        return this._active;
    }

    @HostBinding('attr.id')
    public get id(): string {
        return this._id;
    }

    public get viewValue(): string {
        return (this.getHostElement().textContent || '').trim();
    }

    public get element(): ElementRef {
        return this._element;
    }

    private _selected: boolean = false;
    private _active: boolean = false;
    private _id = `ngx-option-${_uniqueIdCounter++}`;

    public constructor(private _changeDetectorRef: ChangeDetectorRef,
                       private _element: ElementRef) {
    }

    @HostListener('click')
    public onClick() {
        this.selectViaInteraction();
    }

    public select(): void {
        this._selected = true;
        this._active = true;
        this._changeDetectorRef.markForCheck();
        this.emitSelectionChangeEvent();
    }

    public deselect(): void {
        this._selected = false;
        this._active = false;
        this._changeDetectorRef.markForCheck();
        this.emitSelectionChangeEvent();
    }

    public focus(): void {
        const element = this.getHostElement();

        if (typeof element.focus === 'function') {
            element.focus();
        }
    }

    /**
     * This method sets display styles on the option to make it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    public setActiveStyles(): void {
        if (!this._active) {
            this._active = true;
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * This method removes display styles on the option that made it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    public setInactiveStyles(): void {
        if (this._active) {
            this._active = false;
            this._changeDetectorRef.markForCheck();
        }
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    public getLabel(): string {
        return this.viewValue;
    }

    /**
     * `Selects the option while indicating the selection came from the user. Used to
     * determine if the select's view -> model callback should be invoked.`
     */
    public selectViaInteraction(): void {
        if (!this.disabled) {
            this._selected = true;
            this._active = true;
            this._changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent(true);
        }
    }

    private emitSelectionChangeEvent(isUserInput = false): void {
        this.onSelectionChange.emit(new NgxOptionSelectionChange(this, isUserInput));
    }

    private getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }
}
