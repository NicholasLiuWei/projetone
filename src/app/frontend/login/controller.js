/**
 * Created by huimi on 17-7-18.
 * @final
 */


export class LoginController {
    /**
     * @ngInject
     */
    constructor($resource, $cookies, $state, $rootScope) {
            this.$resource = $resource;
            this.cookies = $cookies;
            this.rootScope = $rootScope;
            this.state = $state;
            /** @export */
            this.rootScope.usermes = {};
            /** @export */
            this.username = '';
            /** @export */
            this.password = '';
            /** @export 用户名或密码错误提示*/
            this.showtip = false;
            /** @export {!angular.FormController}*/
            this.form;
            // let rexg = '/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/';
        }
        /**
         * login
         * @export
         */
    login() {
        if (this.form.$valid) {
            this.cookies.put('login', true);
            this.cookies.put('username', this.username);
            // this.state.go('release', { "namespace": "_all" });
            let data = {
                "username": this.username,
                "password": window["sha1"](this.password),
            };
            let login = this.$resource('api/v1/user/login', {}, { save: { method: 'POST' } });
            login.save(data).$promise.then((res) => {
                if (res["errcode"] == 0) {
                    let user = this.cookies.get('username');
                    if (user == "admin") {
                        user = "_all";
                        this.state.go('home', { "namespace": user });
                    } else {
                        this.state.go('release', { "namespace": user });
                    }
                } else {
                    alert(res["errmsg"]);
                }
            }, () => {
                /** @type {string} @desc 请求失败,后端服务异常 Request failure, backend service exception*/
                let MSG_login_login_error = goog.getMsg('请求失败,后端服务异常');
                alert(MSG_login_login_error);
            });
        }
    }
}