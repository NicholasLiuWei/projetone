
import {stateName as chromeStateName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';

import {stateName as storageName, stateUrl} from './state';
import {storageController} from './controller';

/**
 * Configures states for the home.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
    $stateProvider.state(storageName, {
        url: stateUrl,
        parent: chromeStateName,
        resolve:{
            "StorageMes":resolveStorageResource
        },
        views: {
          '': {
            controller: storageController,
            controllerAs: '$ctrl',
            templateUrl: 'storage/storage.html',
          },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': i18n.MSG_BREADCRUMBS_STORAGE_LABEL,
            },
        },
    });
}
/**
 * @param {!angular.Resource} kdStorageResource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveStorageResource(kdStorageResource, $stateParams, kdPaginationService) {
  let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
  return kdStorageResource.get(query).$promise;
}
const i18n = {
    /** @type {string} @desc Label 'Storage' that appears as a breadcrumbs on the action bar. */
    MSG_BREADCRUMBS_STORAGE_LABEL: goog.getMsg('Storage'),
};