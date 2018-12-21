/**
 * Controller for the Service .
 *
 * @final
 */
export default class ServiceController {
    /**
     * @param {!ui.router.$state} $state
     * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
     * @ngInject
     */
    constructor($resource, $state, kdNamespaceService, kdService) {
        /** @export {Object} */
        this.service

        /** @export {string} */
        this.index

        /** @export */
        this.kdService = kdService;

        /** @export {string} */
        this.initvalue = '';
    }

    /** oninit */
    $onInit() {
        console.log(this.index);
        this.initvalue = JSON.stringify(this.service);
    }

    /** @export */
    addService() {
        this.kdService.value["content"]["services"][this.kdService.value["content"]["services"].length] = JSON.parse(this.initvalue);
        this.kdService.value["content"]["ingress"]["servicename"] = this.kdService.value["content"]["services"][0].name;
        console.log(this.kdService)
    }

    /** @export */
    deleteService() {
        this.kdService.value["content"]["services"].splice(this.index, 1);
    }

    /** @export */
    addport() {
        this.service["ports"][this.service["ports"].length] = JSON.parse(this.initvalue)["ports"][0];
        console.log(this.kdService)
            // this.kdService.value["content"]["services"][this.kdService.value["content"]["services"].length] = this.service;
    }

    /** @export */
    deleteport(index) {
        console.log(this.service)
        this.service["ports"].splice(index, 1);
    }
}


/**
 * @return {!angular.Component}
 */
export const ServiceComponent = {
    bindings: {
        'service': '=',
        'index': '=',
    },
    controller: ServiceController,
    templateUrl: 'imagelist/service.html',
};