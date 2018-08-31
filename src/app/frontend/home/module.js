import chromeModule from 'chrome/chrome_module';
import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import namespaceModule from 'common/namespace/namespace_module';
import {NamespaceService} from 'common/namespace/namespace_service';
import stateConfig from './stateconfig';

export default angular
    .module(
        'kubernetesDashboard.home',
        [
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
        .factory('kdPanelResource', panelResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function panelResource($resource) {
  return $resource('api/v1/panel/:namespace');
}