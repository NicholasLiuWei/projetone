import stateConfig from './stateconfig'
import { ServiceComponent } from './service_component'
import { AppComponent } from './app_component'
import { ImagelistService } from './service'

export default angular
    .module(
        "kubernetesDashboard.imagelist", [
            'ngMaterial',
            'ngResource',
            'ui.router',
            'ngMessages',
        ])
    .config(stateConfig)
    .component('kdService', ServiceComponent)
    .component('kdAppPanel', AppComponent)
    .service('kdService', ImagelistService)
    .factory('kdBaseImageResource', baseImageResource)
    .factory('kdNormalImageResource', normalImageResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function baseImageResource($resource) {
    return $resource('api/v1/helm/baseimage');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function normalImageResource($resource) {
    return $resource('api/v1/helm/normalimage');
}