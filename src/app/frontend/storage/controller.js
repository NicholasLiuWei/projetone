/**
 * Controller for the storage view. The view shows storage and pvc.
 *
 * @final
 */
export class storageController {
    /**
     * @ngInject
     */
    constructor($state, $stateParams, $cookies) {
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
            this.state.go('storage.storageclass')
        } else {
            this.state.go('storage.pvc')
        }
    }

    /**
     * @export
     */
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
}