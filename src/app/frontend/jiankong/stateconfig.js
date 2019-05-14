import { stateName as chromeStateName } from 'chrome/chrome_state';
import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';
import { stateName as cephclusterStateName } from './cephcluster/state';
import { stateName as cephpoolsStateName } from './cephpools/state';
import { stateName as cephosdStateName } from './cephosd/state';
import { stateName as dashboardStateName } from './dashboard/state';
import { stateName as rizhiName, stateUrl } from './state';
import { jiankongController } from './controller';
import { cephclusterConfig } from './cephcluster/stateconfig';
import { cephpoolsConfig } from './cephpools/stateconfig';
import { cephosdConfig } from './cephosd/stateconfig';
import { dashboardConfig } from './dashboard/stateconfig';

/**
 * Configures states for the home.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
    $stateProvider.state(rizhiName, {
        url: stateUrl,
        parent: chromeStateName,
        resolve: {},
        views: {
            '': {
                controller: jiankongController,
                controllerAs: '$ctrl',
                templateUrl: 'jiankong/rizhi.html',
            },
        },
        data: {
            [breadcrumbsConfig]: {
                'label': i18n.MSG_BREADCRUMBS_JIANKONG_LABEL,
            },
        },
    });


    $stateProvider.state(cephclusterStateName, cephclusterConfig);
    $stateProvider.state(cephpoolsStateName, cephpoolsConfig);
    $stateProvider.state(cephosdStateName, cephosdConfig);
    $stateProvider.state(dashboardStateName, dashboardConfig);
}

const i18n = {
    /** @type {string} @desc Label 'rizhi' that appears as a breadcrumbs on the action bar. */
    MSG_BREADCRUMBS_JIANKONG_LABEL: goog.getMsg('jiankong'),
};