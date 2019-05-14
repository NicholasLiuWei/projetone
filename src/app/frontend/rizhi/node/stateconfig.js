// import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as rizhiName, stateUrl } from './state';
import { nodeController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the node.
 * @type {!ui.router.StateConfig}
 */
export const nodeConfig = {
    url: stateUrl,
    parent: parentState,
    // resolve: {
    //     "PVList": resolvePVResource
    // },
    views: {
        '': {
            controller: nodeController,
            controllerAs: '$ctrl',
            templateUrl: 'rizhi/node/node.html',
        },
    },
    // data: {
    //     [breadcrumbsConfig]: {
    //         'label': 'node',
    //     },
    // },
}

// /**
//  * @param {!angular.Resource} kdPVResource
//  * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
//  * @return {!angular.$q.Promise}
//  * @ngInject
//  */
// export function resolvePVResource(kdPVResource, kdPaginationService) {
//     let query = kdPaginationService.getDefaultResourceQuery("default");
//     return kdPVResource.get(query).$promise;
// }