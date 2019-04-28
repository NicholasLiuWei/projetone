import chromeModule from 'chrome/chrome_module';
import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import namespaceModule from 'common/namespace/namespace_module';
import { NamespaceService } from 'common/namespace/namespace_service';
import stateConfig from './stateconfig';

export default angular
    .module(
        'kubernetesDashboard.rizhi', [
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
    .factory('kdPlatFormResource', platFormListResource)
    .factory('kdLogNodeResource', logNodeListResource)
    // .factory('kdPVCResource', persistentVolumeClaimListResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function logNodeListResource($resource) {
    return $resource('log/node');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function platFormListResource($resource) {
    return $resource('log/platform');
}

// /**
//  * @param {!angular.$resource} $resource
//  * @return {!angular.Resource}
//  * @ngInject
//  */
// function persistentVolumeListResource($resource) {
//     return $resource('api/v1/persistentvolume');
// }