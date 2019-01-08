export class ingressController {
    /**
     * @ngInject
     */
    constructor(ingressList, kdIngressListResource) {

        /** @export */
        this.ingressListResource = kdIngressListResource;

        /** @export */
        this.ingressList = ingressList;
    }
}