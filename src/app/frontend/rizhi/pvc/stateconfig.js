import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as rizhiName, stateUrl } from './state';
import { pvcController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pvc.
 * @type {!ui.router.StateConfig}
 */
export const pvcConfig = {
    url: stateUrl,
    parent: parentState,
    // resolve: {
    //     "PVCList": resolvePVCResource
    // },
    views: {
        '': {
            controller: pvcController,
            controllerAs: '$ctrl',
            templateUrl: 'rizhi/pvc/pvc.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'pvc',
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