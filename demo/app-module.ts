import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from "./app-cmp";
import { routing } from "./app.routing";
import { NgxSelectDemo } from "./ngx-select-demo/ngx-select-demo";
import { NgxSelectModule } from "../src/modules/ngx-select";

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, NgxSelectDemo],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    routing,
    NgxSelectModule
  ]
})
export class AppModule { }
