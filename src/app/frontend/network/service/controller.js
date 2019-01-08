export class serviceController {
    /**
     * @ngInject
     */
    constructor(serviceList, kdServiceListResource) {

        /** @export */
        this.serviceListResource = kdServiceListResource;

        /** @export */
        this.serviceList = serviceList;
    }
}