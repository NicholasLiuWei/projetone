import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as storageName, stateUrl } from './state';
import { pvcController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pvc.
 * @type {!ui.router.StateConfig}
 */
export const pvcConfig = {
    url: stateUrl,
    parent: parentState,
    resolve: {
        "PVCList": resolvePVCResource
    },
    views: {
        '': {
            controller: pvcController,
            controllerAs: '$ctrl',
            templateUrl: 'storage/pvc/pvc.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'pvc',
        },
    },
}

/**
 * @param {!angular.Resource} kdPVCResource
 * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolvePVCResource(kdPVCResource, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery("default");
    return kdPVCResource.get(query).$promise;
}