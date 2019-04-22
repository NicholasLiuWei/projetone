import { stateName as chromeStateName } from 'chrome/chrome_state';
import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as rizhiName, stateUrl } from './state';
import { rizhiController } from './controller';
import { stateName as pvcStateName } from './pvc/state';
import { stateName as nodeStateName } from './node/state';
import { stateName as storageclassStateName } from './storageclass/state';
import { stateName as logStateName } from './log/state';
import { pvcConfig } from './pvc/stateconfig';
import { nodeConfig } from './node/stateconfig';
import { storageclassConfig } from './storageclass/stateconfig';
import { logConfig } from './log/stateconfig';

/**
 * Configures states for the home.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider, $mdDateLocaleProvider) {
    $stateProvider.state(rizhiName, {
        url: stateUrl,
        parent: chromeStateName,
        resolve: {},
        views: {
            '': {
                controller: rizhiController,
                controllerAs: '$ctrl',
                templateUrl: 'rizhi/rizhi.html',
            },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': i18n.MSG_BREADCRUMBS_RIZHI_LABEL,
            },
        },
    });
    $stateProvider.state(nodeStateName, nodeConfig);
    $stateProvider.state(pvcStateName, pvcConfig);
    $stateProvider.state(storageclassStateName, storageclassConfig);
    $stateProvider.state(logStateName, logConfig);

    $mdDateLocaleProvider.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    $mdDateLocaleProvider.shortMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    // $mdDateLocaleProvider.days = ['dimanche', 'lundi', 'mardi', ...];

    $mdDateLocaleProvider.shortDays = ['日', '一', '二', '三', '四', '五', '六'];

}

const i18n = {
    /** @type {string} @desc Label 'rizhi' that appears as a breadcrumbs on the action bar. */
    MSG_BREADCRUMBS_RIZHI_LABEL: goog.getMsg('rizhi'),
};