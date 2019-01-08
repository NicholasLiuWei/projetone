import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as storageName, stateUrl } from './state';
import { ingressController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pvc.
 * @type {!ui.router.StateConfig}
 */
export const ingressConfig = {
    url: stateUrl,
    parent: parentState,
    resolve: {
        "ingressList": resolveIngressList
    },
    views: {
        '': {
            controller: ingressController,
            controllerAs: '$ctrl',
            templateUrl: 'network/ingress/ingress.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'pvc',
        },
    },
}

/**
 * @param {!angular.Resource} kdIngressListResource
 * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveIngressList(kdIngressListResource, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery("default");
    return kdIngressListResource.get(query).$promise;
}