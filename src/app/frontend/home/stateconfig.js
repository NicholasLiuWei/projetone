
import {stateName as chromeStateName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';

import {stateName as homeName, stateUrl} from './state';
import {homeController} from './controller';

/**
 * Configures states for the home.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
    $stateProvider.state(homeName, {
        url: stateUrl,
        parent: chromeStateName,
        resolve:{
            "panelMes":resolvePanelResource
        },
        views: {
          '': {
            controller: homeController,
            controllerAs: '$ctrl',
            templateUrl: 'home/home.html',
          },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': i18n.MSG_BREADCRUMBS_HOME_LABEL,
            },
        },
    });
}
/**
 * @param {!angular.Resource} kdPanelResource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolvePanelResource(kdPanelResource, $stateParams, kdPaginationService) {
  let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
  return kdPanelResource.get(query).$promise;
}
const i18n = {
    /** @type {string} @desc Label 'home' that appears as a breadcrumbs on the action bar. */
    MSG_BREADCRUMBS_HOME_LABEL: goog.getMsg('home'),
};

