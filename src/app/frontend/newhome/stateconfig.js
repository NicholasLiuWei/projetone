import { stateName as chromeStateName } from 'chrome/chrome_state';
import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as homeName, stateUrl } from './state';
import { homeController } from './controller';

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
        resolve: {
            "homeLoading": homeloading,
        },
        views: {
            '': {
                controller: homeController,
                controllerAs: '$ctrl',
                templateUrl: 'newhome/home.html',
            },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': i18n.MSG_BREADCRUMBS_NEWHOME_LABEL,
            },
        },
    });
}
/**
 * home loading
 * @ngInject
 */
function homeloading($q, $timeout) {
    let defer = $q.defer();
    $timeout(() => {
        defer.resolve();
    }, 200);
    return defer.promise;
}
/**
 * @param {!angular.$resource} kdFsmonResource
 * @ngInject
 */
export function resolveFsmon(kdFsmonResource) {
    return kdFsmonResource.get().$promise;
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
/**
 * @param {!angular.Resource} kdReleaseResource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveReleaseResource(kdReleaseResource, $stateParams, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
    return kdReleaseResource.get(query).$promise;
}
const i18n = {
    /** @type {string} @desc Label 'home' that appears as a breadcrumbs on the action bar. */
    MSG_BREADCRUMBS_NEWHOME_LABEL: goog.getMsg('newhome'),
};