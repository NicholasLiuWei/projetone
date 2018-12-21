import { stateName as chromeStateName } from 'chrome/chrome_state';
import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as warningName, stateUrl } from './state';
import { warningController } from './controller';
import { stateName as listStateName } from './list/state';
import { stateName as SetStateName } from './settings/state';
import { listConfig } from './list/stateconfig';
import { listConfig as setListConfig } from './settings/stateconfig';
console.log(listConfig)


/**
 * Configures states for the warning.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
    $stateProvider.state(warningName, {
        url: stateUrl,
        parent: chromeStateName,
        resolve: {
            // 'baseimageList': resolveBaseImageList,
            // 'normalimageList': resolveNormalImageList
        },
        views: {
            '': {
                controller: warningController,
                controllerAs: 'ctrl',
                templateUrl: 'warning/warning.html',
            },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': i18n.MSG_WARNING_LABEL,
            },
        },
    });
    $stateProvider.state(listStateName, listConfig);
    $stateProvider.state(SetStateName, setListConfig);
}

/**
 * @param {!angular.Resource} kdBaseImageResource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveBaseImageList(kdBaseImageResource, $stateParams, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
    return kdBaseImageResource.query(query).$promise;
}

/**
 * @param {!angular.Resource} kdNormalImageResource
 * @param {!./../chrome/chrome_state.StateParams} $stateParams
 * @param {!./../common/pagination/pagination_service.PaginationService} kdPaginationService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveNormalImageList(kdNormalImageResource, $stateParams, kdPaginationService) {
    let query = kdPaginationService.getDefaultResourceQuery($stateParams.namespace);
    return kdNormalImageResource.query(query).$promise;
}

const i18n = {
    /** @type {string} @desc Label 'Warning' that appears as a breadcrumbs on the action bar. */
    MSG_WARNING_LABEL: goog.getMsg('Warning'),
};