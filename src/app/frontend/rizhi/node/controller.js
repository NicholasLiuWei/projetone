export class nodeController {
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
        let resource = this.resource('log/node');
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