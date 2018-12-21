/**
 * Controller for the Service .
 *
 * @final
 */
export default class AppController {
    /**
     * @param {!ui.router.$state} $state
     * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
     * @ngInject
     */
    constructor($resource, $state, kdNamespaceService, kdService) {
        /** @export {Object} */
        this.component

        /** @export {string} */
        this.initValue = '';

        /** @export */
        this.kdService = kdService;

        /** @export {string} */
        this.index;
    }

    /** 
     * oninit
     */
    $onInit() {
        /** @type {string} */
        this.initvalue = JSON.stringify(this.component);
        console.log(this.component);
    }

    /** @export */
    addComponent() {
        this.kdService.value["content"]["components"][this.kdService.value["content"]["components"].length] = JSON.parse(this.initvalue);
        console.log(this.kdService)
    }

    /** @export */
    deleteComponent() {
        this.kdService.value["content"]["components"].splice(this.index, 1);
        console.log(this.kdService)
    }

    /** @export */
    addImage() {
        this.component["images"][this.component["images"].length] = JSON.parse(this.initvalue)["images"][0];
        console.log(this.kdService)
    }

    /** @export */
    deleteImage(index) {
        this.component["images"].splice(index, 1);
        console.log(this.kdService)
    }

    /** @export */
    addPvc(index) {
        this.component["images"][index]["pvcs"][this.component["images"][index]["pvcs"].length] = JSON.parse(this.initvalue)["images"][0]["pvcs"][0];
        console.log(this.kdService)
    }

    /** @export */
    deletePvc(outerindex, index) {
        this.component["images"][outerindex]["pvcs"].splice(index, 1);
        console.log(this.kdService)
    }

    /** @export */
    addEnv(index) {
        this.component["images"][index]["env"][this.component["images"][index]["env"].length] = JSON.parse(this.initvalue)["images"][0]["env"][0];
        console.log(this.kdService)
    }

    /** @export */
    deleteEnv(outerindex, index) {
        this.component["images"][outerindex]["env"].splice(index, 1);
        console.log(this.kdService)
    }

    /** @export */
    addPort(index) {
        this.component["images"][index]["ports"][this.component["images"][index]["ports"].length] = JSON.parse(this.initvalue)["images"][0]["ports"][0];
        console.log(this.kdService)
    }

    /** @export */
    deletePort(outerindex, index) {
        this.component["images"][outerindex]["ports"].splice(index, 1);
        console.log(this.kdService)
    }
}

/**
 * @return {!angular.Component}
 */
export const AppComponent = {
    bindings: {
        'component': '=',
        'index': '=',
    },
    controller: AppController,
    templateUrl: 'imagelist/app.html',
};