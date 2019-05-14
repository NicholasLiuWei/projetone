export class rizhiController {
    constructor($state, $stateParams, $cookies, $resource) {

            /** @export */
            this.resource = $resource;

            /** @export */
            this.state = $state;

            /** @export */
            this.stateParams = $stateParams["namespace"];

            /** @private */
            this.cookies = $cookies;
        }
        // /**
        //  * 日志中心地址
        //  * @export
        //  */
        // url() {
        //     return `http://${location.hostname}:30810`
        // }

    // /** @type {!angular.Resource<!backendApi.AppDeploymentFromChartSpec>} */
    // let resource = this.resource('api/v1/helm/deploychartprepare', {}, { save: { method: 'POST' } });
    // resource.save(
    //     deploymentSpec,
    //     (response) => {
    //         this.oWorkloadIngress = JSON.parse(response['content'])['ingress'];
    //         this.deploymentSpec = deploymentSpec;
    //         this.kdService.value = response;
    //         this.kdService.value["content"] = JSON.parse(this.kdService.value["content"]);
    //         this.kdService.value["content"]["components"][0]["name"] = value;
    //         this.kdService.value.content["components"][0].images[0]["repository"] = this.choicedNormalimage["url"];
    //         // this.value = this.kdService.value.content.services;
    //     }
    // )

    /**
     * state 切换
     */
    change(name) {
        if (name == 'set') {
            this.state.go('rizhi.storageclass')
        } else {
            this.state.go('rizhi.pvc')
        }
    }

    /**
     * @export
     */
    active(name) {
        if (this.state.current.name == name) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @export
     */
    show() {
        let user = this.cookies.get('username');
        if (user == "admin") {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @export
     */
    $onInit() {}

}