// Copyright 2017 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Controller to manage title of browser window.
 *
 * @final
 */
export class TitleController {
    /**
     * @param {!angular.$interpolate} $interpolate
     * @param {!./common/state/futurestate_service.FutureStateService} kdFutureStateService
     * @ngInject
     */
    constructor($interpolate, kdFutureStateService, $http, $rootScope, $timeout, $resource) {
            /** @private {!./common/state/futurestate_service.FutureStateService} */
            this.kdFutureStateService_ = kdFutureStateService;
            // let self = this;
            /** @private {!angular.$interpolate} */
            this.interpolate_ = $interpolate;

            /** @private {!angular.$timeout} */
            this.timeout_ = $timeout;
            /** @export */
            this.rootScope_ = $rootScope;
            /** @export */
            this.resource_ = $resource;
            // var Timeout = function () {
            //
            //     // alert("您的登录已超时, 请点确定后重新登录!");
            //         // console.log('title Controller');
            //       var dataa = {
            //         "name":self.rootScope_["mes"]["Name"],
            //         "namespace":self.rootScope_["mes"]["Namespace"]
            //       };
            //         let resource = self.resource_('http://auth.'+self.rootScope_["mes"]["Authserver"]+'/logout');
            //         //let resource = self.resource_('http://'+self.rootScope_["mes"]["Authserver"]+':5012'+'/logout');
            //         resource.get(dataa,
            //             (res) => {
            //               // console.log('success');
            //               location.href = 'http://'+self.rootScope_["mes"]["Authserver"];
            //             },
            //             (err) => {
            //                 console.log(err);
            //             });
            //
            // }

            //         var myTime = $timeout(Timeout, 180000);
            // function getCookie(name){
            //     var strCookie = document.cookie;
            //     var arrCookie = strCookie.split('; ');
            //     for(var i=0; i<arrCookie.length; i++){
            //         var arr = arrCookie[i].split('=');
            //         if(arr[0] == name){
            //             return arr[1];
            //         }
            //     }
            //     return "";
            // };
            //           function delCookie(name){
            //     var exp = new Date();
            //     exp.setTime(exp.getTime() - 1);
            //     var cval = getCookie(name);
            //     if(cval != null){
            //         document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
            //     }
            // };
            //
            // let resetTime = function () {
            //
            //     $timeout.cancel(myTime);
            //
            //     myTime = $timeout(Timeout, 180000);
            //
            // }
            //
            // document.documentElement.onkeydown=resetTime;
            //
            // document.documentElement.onclick=resetTime;
        }
        /**
         * Returns title of browser window based on current state's breadcrumb label.
         *
         * @export
         * @return {string}
         */
    title() {
        if (this.kdFutureStateService_.state && this.kdFutureStateService_.state.data &&
            this.kdFutureStateService_.state.data.kdBreadcrumbs &&
            this.kdFutureStateService_.state.data.kdBreadcrumbs.label) {
            let breadcrumbs = this.kdFutureStateService_.state.data.kdBreadcrumbs;
            let params = this.kdFutureStateService_.params;
            let state = this.interpolate_(breadcrumbs.label)({ '$stateParams': params }).toString();
            return `${state} - ThinkCloud Dashboard`;
        } else {
            return 'ThinkCloud Dashboard';
        }
    }
}