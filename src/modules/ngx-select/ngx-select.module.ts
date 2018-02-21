import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

import { NgxSelectComponent } from './component/ngx-select';
import { NgxSelectOptionComponent } from './component/ngx-select-option/ngx-select-option';
import { NgxSelectTemplate } from './component/ngx-select-template';

@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
    ],
    exports: [
        NgxSelectComponent,
        NgxSelectOptionComponent,
        NgxSelectTemplate
    ],
    declarations: [
        NgxSelectComponent,
        NgxSelectOptionComponent,
        NgxSelectTemplate
    ],
})
export class NgxSelectModule {
}
