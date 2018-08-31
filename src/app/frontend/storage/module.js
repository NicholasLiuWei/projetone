import chromeModule from 'chrome/chrome_module';
import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import namespaceModule from 'common/namespace/namespace_module';
import {NamespaceService} from 'common/namespace/namespace_service';
import stateConfig from './stateconfig';

export default angular
    .module(
        'kubernetesDashboard.storage',
        [
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
        .factory('kdStorageResource', storageResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function storageResource($resource) {
  return $resource('fsmon');
}