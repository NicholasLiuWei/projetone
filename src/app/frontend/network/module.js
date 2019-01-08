import chromeModule from 'chrome/chrome_module';
import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import namespaceModule from 'common/namespace/namespace_module';
import { NamespaceService } from 'common/namespace/namespace_service';
import stateConfig from './stateconfig';

export default angular
    .module(
        'kubernetesDashboard.network', [
            'ngMaterial',
            'ngResource',
            'ui.router',
            componentsModule.name,
            namespaceModule.name,
            chromeModule.name,
            filtersModule.name,
        ])
    .config(stateConfig)
    .service('kdNamespaceService1', NamespaceService)
    .factory('kdServiceListResource', serviceListResource)
    .factory('kdIngressListResource', ingressListResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function serviceListResource($resource) {
    return $resource('api/v1/service/default');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function ingressListResource($resource) {
    return $resource('api/v1/ingress/default');
}