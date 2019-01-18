import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as storageName, stateUrl } from './state';
import { pvController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pv.
 * @type {!ui.router.StateConfig}
 */
export const pvConfig = {
    url: stateUrl,
    parent: parentState,
    resolve: {
        "PVList": resolvePVResource
    },
    views: {
        '': {
            controller: pvController,
            controllerAs: '$ctrl',
            templateUrl: 'storage/pv/pv.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'pv',
        },
    },
}

/**
 * @param {!angular.Resource} kdPVResource
 * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolvePVResource(kdPVResource, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery("default");
    return kdPVResource.get(query).$promise;
}