export class pvcController {
    /**
     * @ngInject
     */
    constructor(PVCList, kdPVCResource) {

        /** @export */
        this.persistentVolumeClaimListResource = kdPVCResource;

        /** @export */
        this.persistentVolumeClaimList = PVCList;
    }
}