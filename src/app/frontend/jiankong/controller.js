export class jiankongController {
    /**
     * @ngInject
     */
    constructor() {}

    /**
     * 监控中心地址
     * @export
     */
    url() {
        return `http://${location.hostname}:30000`
    }
}