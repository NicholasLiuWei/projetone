import chromeModule from 'chrome/chrome_module';
import helpSectionModule from 'deploy/helpsection/helpsection_module';
import errorHandlingModule from 'common/errorhandling/errorhandling_module';
import validatorsModule from 'common/validators/validators_module';
import historyModule from 'common/history/history_module';
import componentsModule from 'common/components/components_module';
import csrfTokenModule from 'common/csrftoken/csrftoken_module';

import stateConfig from './stateconfig';
// import initConfig from 'deploy/deploy_initconfig';

import { portMappingsComponent } from 'deploy/portmappings_component';
// import uniqueNameDirective from 'deploy/uniquename_directive';
import validImageReferenceDirective from 'deploy/validimagereference_directive';
import validProtocolDirective from 'deploy/validprotocol_directive';
import fileReaderDirective from 'deploy/filereader_directive';
import uploadDirective from 'deploy/upload_directive';
import { environmentVariablesComponent } from 'deploy/environmentvariables_component';
import deployLabelDirective from 'deploy/deploylabel_directive';

export default angular
    .module(
        'kubernetesDashboard.appStore', [
            'ngMaterial',
            'ngResource',
            'ui.router',
            'ngMessages',
            chromeModule.name,
            helpSectionModule.name,
            errorHandlingModule.name,
            validatorsModule.name,
            historyModule.name,
            componentsModule.name,
            csrfTokenModule.name,
        ])
    .config(stateConfig)
    // .run(initConfig)
    .component('kdPortMappings', portMappingsComponent)
    // .directive('kdUniqueName', uniqueNameDirective)
    .directive('kdValidImagereference', validImageReferenceDirective)
    .directive('kdValidProtocol', validProtocolDirective)
    .directive('kdFileReader', fileReaderDirective)
    .directive('kdUpload', uploadDirective)
    .component('kdEnvironmentVariables', environmentVariablesComponent)
    .directive('kdDeployLabel', deployLabelDirective)
    .directive('repeat', ['$resource', function($resource) {
        return {
            restrict: "A",
            require: "ngModel",
            link: function(scope, element, attr, ngModel) {
                scope.$watch(attr["ngModel"], function(modelValue) {
                    let some = $resource('api/v1/helm/allrelease');
                    some.get(
                        (res) => {
                            let has;
                            for (let i = 0; i < res.releases.length; i++) {
                                if (modelValue == res.releases[i]["name"]) {
                                    has = true;
                                    break;
                                };
                            }
                            has == true ? ngModel.$setValidity('repeat', false) : ngModel.$setValidity('repeat', true);
                        }
                    );
                });
            }
        };
    }]);