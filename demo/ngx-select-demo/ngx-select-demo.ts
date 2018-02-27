import { Component } from "@angular/core";

import { NgxSelectModel } from "../../dist/src/modules/ngx-select/component/ngx-select-model";

@Component({
    selector: 'ngx-select-demo',
    templateUrl: 'ngx-select-demo.html',
    styleUrls: ['ngx-select-demo.css']
})
export class NgxSelectDemo {
    public countries = require('../res/data/countries.json');
    public showArrowButton: boolean = true;
    public rotateArrowButton: boolean = true;
    public closeOnOutsideClick: boolean = true;
    public height: string = '200px';
    public width: string = '200px';
    public disabled: boolean = false;

    public onSelectionChange(event: NgxSelectModel) {
        console.warn('selectionChange event: ', event);
    }

    public toggleDisablingSelect() {
        this.disabled = !this.disabled;
    }

    public toggleDisablingOption() {
        this.countries[3].disabled = !this.countries[3].disabled;
    }
}
