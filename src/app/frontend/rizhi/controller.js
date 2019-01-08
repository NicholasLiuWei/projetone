export class rizhiController {
    /**
     * @ngInject
     */
    constructor() {}

    /**
     * 日志中心地址
     * @export
     */
    url() {
        return `http://${location.hostname}:30001`
    }
}