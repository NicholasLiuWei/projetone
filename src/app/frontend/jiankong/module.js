import stateConfig from './stateconfig';

export default angular
    .module(
        'kubernetesDashboard.jiankong', [
            'ngMaterial',
            'ngResource',
            'ui.router',
        ])
    .config(stateConfig);