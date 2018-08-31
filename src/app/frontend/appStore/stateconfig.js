
import {stateName as chromeStateName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';

import {stateName as appstoreName, stateUrl} from './state';
import {AppStoreController} from './controller';

/**
 * Configures states for the Ingress resource.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
    $stateProvider.state(appstoreName, {
        url: stateUrl,
        parent: chromeStateName,
        resolve: {
          // charts: resolveappStoreList
        },
        views: {
          '': {
            controller: AppStoreController,
            controllerAs: 'ctrl',
            templateUrl: 'appStore/appStore.html',
          },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': i18n.MSG_BREADCRUMBS_APPSTORE_LABEL,
            },
        },
    });
}
/**
 * @param {!angular.$resource} kdConfigResource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 */
const i18n = {
    /** @type {string} @desc Label 'AppStore' that appears as a breadcrumbs on the action bar. */
    MSG_BREADCRUMBS_APPSTORE_LABEL: goog.getMsg('AppStore'),
};

// export function appStoreListResource($resource) {
//     return $resource('api/v1/repository/kubernetes-charts');
// }
//
// export function resolveappStoreList(kdappStoreListResource, kdDataSelectService) {
//     let query = kdDataSelectService.getDefaultResourceQuery('');
//     return kdappStoreListResource.get(query).$promise;
// }

