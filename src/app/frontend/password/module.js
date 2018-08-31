/**
 * Created by huimi on 17-7-18.
 */

import stateConfig from './stateconfig';

export default angular
    .module(
        'kubernetesDashboard.password', [
            'ngMaterial',
            'ngMessages',
            'ngResource',
            'ui.router',
        ])
    .config(stateConfig);