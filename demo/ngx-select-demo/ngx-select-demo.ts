import { Component } from "@angular/core";

import { NgxSelectModel } from "../../src/modules/ngx-select";

@Component({
    selector: 'ngx-select-demo',
    templateUrl: 'ngx-select-demo.html',
    styleUrls: ['ngx-select-demo.scss']
})
export class NgxSelectDemo {
    public countries = require('../res/data/countries.json');
    public showArrowButton: boolean = true;
    public rotateArrowButton: boolean = true;
    public closeOnOutsideClick: boolean = true;
    public height: string = '200px';
    public width: string = '200px';
    public disabled: boolean = false;
    public optionDisabled: boolean = false;
    public textTransform: string = 'none';

    public onSelectionChange(event: NgxSelectModel) {
        console.warn('selectionChange event: ', event);
    }
}
