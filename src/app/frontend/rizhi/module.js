import stateConfig from './stateconfig';

export default angular
    .module(
        'kubernetesDashboard.rizhi', [
            'ngMaterial',
            'ngResource',
            'ui.router',
        ])
    .config(stateConfig);