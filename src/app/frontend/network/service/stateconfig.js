import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as storageName, stateUrl } from './state';
import { serviceController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pvc.
 * @type {!ui.router.StateConfig}
 */
export const serviceConfig = {
    url: stateUrl,
    parent: parentState,
    resolve: {
        'serviceList': resolveServiceList
    },
    views: {
        '': {
            controller: serviceController,
            controllerAs: '$ctrl',
            templateUrl: 'network/service/service.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'pvc',
        },
    },
}

/**
 * @param {!angular.Resource} kdServiceListResource
 * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveServiceList(kdServiceListResource, $stateParams, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
    return kdServiceListResource.get(query).$promise;
}