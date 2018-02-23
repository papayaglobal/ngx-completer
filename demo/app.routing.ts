import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { NgxSelectDemo } from "./ngx-select-demo/ngx-select-demo";

const appRoutes: Routes = [
    {
        path: "",
        redirectTo: "/ngx-select",
        pathMatch: "full"
    },
    {
        path: "ngx-select",
        component: NgxSelectDemo
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {useHash: true});
