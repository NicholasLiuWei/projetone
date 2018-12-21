/**
 * Controller for the warning view. The view shows waringlist and warning setting.
 *
 * @final
 */
export class warningController {
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
            this.state.go('chrome.monitoring.setting')
        } else {
            this.state.go('chrome.monitoring.list')
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