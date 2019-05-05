import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as rizhiName, stateUrl } from './state';
import { logManagementController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the logManagement.
 * @type {!ui.router.StateConfig}
 */
export const logManagementConfig = {
    url: stateUrl,
    parent: parentState,
    // resolve: {
    //     "logManagementList": resolvePVCResource
    // },
    views: {
        '': {
            controller: logManagementController,
            controllerAs: '$ctrl',
            templateUrl: 'rizhi/logManagement/logManagement.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'logManagement',
        },
    },
}

// /**
//  * @param {!angular.Resource} kdPVCResource
//  * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
//  * @return {!angular.$q.Promise}
//  * @ngInject
//  */
// export function resolvePVCResource(kdPVCResource, $stateParams, kdPaginationService) {
//     let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
//     return kdPVCResource.get(query).$promise;
// }