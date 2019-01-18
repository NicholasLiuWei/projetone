export class pvController {
    /**
     * @ngInject
     */
    constructor(PVList, kdPVResource) {

        /** @export */
        this.persistentVolumeListResource = kdPVResource;

        /** @export */
        this.persistentVolumeList = PVList;
    }
}