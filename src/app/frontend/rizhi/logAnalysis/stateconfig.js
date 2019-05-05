import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as rizhiName, stateUrl } from './state';
import { logAnalysisController } from './controller';
import { stateName as parentState } from '../state';

/**
 * Configures states for the pvc.
 * @type {!ui.router.StateConfig}
 */
export const logAnalysisConfig = {
    url: stateUrl,
    parent: parentState,
    // resolve: {
    //     "logAnalysisList": resolveStorageResource,
    // },
    views: {
        '': {
            controller: logAnalysisController,
            controllerAs: '$ctrl',
            templateUrl: 'rizhi/logAnalysis/logAnalysis.html',
        },
    },
    data: {
        [breadcrumbsConfig]: {
            'label': 'logAnalysis',
        },
    },
};

// /**
//  * @param {!angular.Resource} kdStorageResource
//  * @param {!./../../common/pagination/pagination_service.PaginationService} kdPaginationService
//  * @return {!angular.$q.Promise}
//  * @ngInject
//  */
// export function resolveStorageResource(kdStorageResource, kdPaginationService) {
//     let query = kdPaginationService.getDefaultResourceQuery("default");
//     return kdStorageResource.get(query).$promise;
// }