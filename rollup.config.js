import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

/**
 * Add here external dependencies that actually you use.
 *
 * Angular dependencies
 * - '@angular/animations' => 'ng.animations'
 * - '@angular/animations/browser': 'ng.animations.browser'
 * - '@angular/common' => 'ng.common'
 * - '@angular/compiler' => 'ng.compiler'
 * - '@angular/core' => 'ng.core'
 * - '@angular/forms' => 'ng.forms'
 * - '@angular/common/http' => 'ng.common.http'
 * - '@angular/platform-browser-dynamic' => 'ng.platformBrowserDynamic'
 * - '@angular/platform-browser' => 'ng.platformBrowser'
 * - '@angular/platform-browser/animations' => 'ng.platformBrowser.animations'
 * - '@angular/platform-server' => 'ng.platformServer'
 * - '@angular/router' => 'ng.router'
 *
 * RxJS dependencies
 * Each RxJS functionality that you use in the library must be added as external dependency.
 * - For main classes use 'Rx':
 *      e.g. import { Observable } from 'rxjs/Observable'; => 'rxjs/Observable': 'Rx'
 * - For observable methods use 'Rx.Observable':
 *      e.g. import 'rxjs/add/observable/merge'; => 'rxjs/add/observable/merge': 'Rx.Observable'
 *      or for lettable operators:
 *      e.g. import { merge } from 'rxjs/observable/merge'; => 'rxjs/observable/merge': 'Rx.Observable'
 * - For operators use 'Rx.Observable.prototype':
 *      e.g. import 'rxjs/add/operator/map'; => 'rxjs/add/operator/map': 'Rx.Observable.prototype'
 *      or for lettable operators:
 *      e.g. import { map } from 'rxjs/operators'; => 'rxjs/operators': 'Rx.Observable.prototype'
 *
 * Other dependencies
 * - Angular libraries: refer to their global namespace
 * - TypeScript/JavaScript libraries:
 *      e.g. lodash: 'lodash' => 'lodash'
 *
 * Also, if the dependency uses CommonJS modules, such as lodash,
 * you should also use a plugin like rollup-plugin-commonjs,
 * to explicitly specify unresolvable "named exports".
 *
 */
const globals = {
    '@angular/animations': 'ng.animations',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/forms': 'ng.forms',
    '@angular/common/http': 'ng.common.http',
    '@angular/router': 'ng.router',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-server': 'ng.platformServer',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
    '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
    '@angular/core/testing': 'ng.core.testing',
    '@angular/common/testing': 'ng.common.testing',
    '@angular/common/http/testing': 'ng.common.http.testing',

    '@angular/cdk': 'ng.cdk',
    '@angular/cdk/keycodes': 'ng.cdk.keycodes',
    '@angular/cdk/collections': 'ng.cdk.collections',
    '@angular/cdk/a11y': 'ng.cdk.a11y',
    '@angular/cdk/overlay': 'ng.cdk.overlay',

    'rxjs/Observer': 'Rx',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/Subscription': 'Rx',

    'rxjs/Observable/defer': 'Rx.Observable',
    'rxjs/Observable/merge': 'Rx.Observable',

    'rxjs/operators/take': 'Rx.Observable.prototype',
    'rxjs/operators/switchMap': 'Rx.Observable.prototype',
    'rxjs/operators/startWith': 'Rx.Observable.prototype',
    'rxjs/operators/takeUntil': 'Rx.Observable.prototype',
    'rxjs/operators/filter': 'Rx.Observable.prototype'
};

export default {
    external: Object.keys(globals),
    plugins: [
        resolve(),
        sourcemaps()
    ],
    onwarn: () => { return },
    output: {
        format: 'umd',
        name: 'ngx.selectBox',
        globals: globals,
        sourcemap: true,
        exports: 'named',
        amd: { id: 'ngx-select-box' }
    }
}
