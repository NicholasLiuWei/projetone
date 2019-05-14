import stateConfig from './stateconfig';
import chromeModule from 'chrome/chrome_module';
import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import namespaceModule from 'common/namespace/namespace_module';
import { NamespaceService } from 'common/namespace/namespace_service';
// import { chartComponent } from './charts/chart_component';
export default angular
    .module(
        'kubernetesDashboard.jiankong', [
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
    .factory('kdCephclusterResource', fsmonResource)
    .factory('kdCephPoolsResource', storageClassListResource)






/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function storageClassListResource($resource) {
    return $resource('api/v1/storageclass');
}

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function fsmonResource($resource) {
    return $resource('api/v1/query_range?query=ceph_health_status&start=1555049160&end=1555052820&step=60');
}