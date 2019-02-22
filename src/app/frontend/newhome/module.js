import chromeModule from 'chrome/chrome_module';
import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import namespaceModule from 'common/namespace/namespace_module';
import { NamespaceService } from 'common/namespace/namespace_service';
import stateConfig from './stateconfig';

export default angular
    .module(
        'kubernetesDashboard.newhome', [
            'ngMaterial',
            'ngResource',
            'ui.router',
            filtersModule.name,
            componentsModule.name,
            namespaceModule.name,
            chromeModule.name,
        ])
    .config(stateConfig)
    .service('kdNamespaceService1', NamespaceService)
    .factory('kdPanelResource', panelResource)
    .factory('kdFsmonResource', fsmonResource)
    .factory('kdCephResource', cephResource)
    .factory('kdReleaseResource', releaseResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function panelResource($resource) {
    return $resource('api/v1/baseinfo');
}
/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function cephResource($resource) {
    return $resource('api/v1/storage/info');
}
/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function fsmonResource($resource) {
    return $resource('api/v1/userate');
}
/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function releaseResource($resource) {
    return $resource('api/v1/helm/allrelease/default');
}