export class rizhiController {
    /**
     * @ngInject
     */
    constructor($state, $stateParams, $cookies, $resource) {

        /** @export */
        this.resource = $resource;

        /** @export */
        this.state = $state;

        /** @export */
        this.stateParams = $stateParams["namespace"];

        /** @private */
        this.cookies = $cookies;
    }

    /**
     * state 切换
     */
    change(name) {
        if (name == 'set') {
            this.state.go('rizhi.storageclass')
        } else {
            this.state.go('rizhi.pvc')
        }
    }

    /**
     * @export
     */
    url() {
        return "http://log.lenovo.com";
    }

    /** @export */
    active(name) {
        if (this.state.current.name == name) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @export
     */
    show() {
        let user = this.cookies.get('username');
        if (user == "admin") {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @export
     */
    $onInit() {}

}