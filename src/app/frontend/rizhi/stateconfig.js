import { stateName as chromeStateName } from 'chrome/chrome_state';
import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as rizhiName, stateUrl } from './state';
import { rizhiController } from './controller';
import { stateName as logManagementStateName } from './logManagement/state';
import { stateName as nodeStateName } from './node/state';
import { stateName as platformStateName } from './platform/state';
import { stateName as logAnalysisStateName } from './logAnalysis/state';
import { logManagementConfig } from './logManagement/stateconfig';
import { nodeConfig } from './node/stateconfig';
import { platformConfig } from './platform/stateconfig';
import { logAnalysisConfig } from './logAnalysis/stateconfig';

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
    $stateProvider.state(logManagementStateName, logManagementConfig);
    $stateProvider.state(platformStateName, platformConfig);
    $stateProvider.state(logAnalysisStateName, logAnalysisConfig);

    $mdDateLocaleProvider.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    $mdDateLocaleProvider.shortMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    // $mdDateLocaleProvider.days = ['dimanche', 'lundi', 'mardi', ...];

    $mdDateLocaleProvider.shortDays = ['日', '一', '二', '三', '四', '五', '六'];

}

const i18n = {
    /** @type {string} @desc Label 'rizhi' that appears as a breadcrumbs on the action bar. */
    MSG_BREADCRUMBS_RIZHI_LABEL: goog.getMsg('rizhi'),
};