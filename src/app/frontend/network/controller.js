/**
 * Controller for the storage view. The view shows storage and pvc.
 *
 * @final
 */
export class storageController {
    /**
     * @ngInject
     */
    constructor($state) {
        /** @export */
        this.state = $state;
    }

    /**
     * state 切换
     */
    change(name) {
        if (name == 'set') {
            this.state.go('chrome.storage.storageclass')
        } else {
            this.state.go('chrome.storage.pvc')
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
}