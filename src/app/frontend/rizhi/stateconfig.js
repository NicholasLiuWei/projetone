import { stateName as chromeStateName } from 'chrome/chrome_state';
import { breadcrumbsConfig } from 'common/components/breadcrumbs/breadcrumbs_service';

import { stateName as rizhiName, stateUrl } from './state';
import { rizhiController } from './controller';

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
}

const i18n = {
    /** @type {string} @desc Label 'rizhi' that appears as a breadcrumbs on the action bar. */
    MSG_BREADCRUMBS_RIZHI_LABEL: goog.getMsg('rizhi'),
};