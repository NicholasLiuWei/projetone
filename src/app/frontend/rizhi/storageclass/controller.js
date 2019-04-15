export class storageClassController {
    /**
     * @ngInject
     */
    // constructor(storageClassList, kdStorageResource) {

    //     /** @export */
    //     this.storageClassList = storageClassList;

    //     /** @export */
    //     this.storageClassListResource = kdStorageResource;
    // }
    /**
     * @ngInject
     */
    constructor($resource) {

            /** @export */
            this.resource = $resource;

            /** @export */
            this.data = [];
        }
        /**
         * @export
         */
    getData() {
        let resource = this.resource('log/platform');
        resource.query((res) => {
            this.data = res;
            console.log(this.data);
        }, (err) => {
            console.log(err)
        })
    }

    $onInit() {
        this.getData();
    }
}