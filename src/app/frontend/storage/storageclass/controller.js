export class storageClassController {
    /**
     * @ngInject
     */
    constructor(storageClassList, kdStorageResource) {

        /** @export */
        this.storageClassList = storageClassList;

        /** @export */
        this.storageClassListResource = kdStorageResource;
    }
}