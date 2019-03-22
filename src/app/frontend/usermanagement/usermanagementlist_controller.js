// Copyright 2015 Google Inc. All Rights Reserved.
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
 * Controller for the replica set list view.
 *
 * @final
 */
export class UsermanagementListController {
    //  @param {!backendApi.UsermanagementList} usermanagementList
    /**
     * @param {!angular.Resource} kdUsermanagementListResource
     * @ngInject
     */
    constructor($state, $resource, usermanagementList, kdUsermanagementListResource, $mdDialog, toastr) {
            /** @export  */
            this.usermanagementList = usermanagementList["Data"];
            /** @private */
            this.state = $state;
            /** @private */
            this.resource = $resource;
            /** @export  */
            this.toastr = toastr;

            console.log(this.usermanagementList);
            // {
            //     "typeMeta": {
            //         "kind": "usermanagement"
            //     },
            //     "items": [
            //         { "name": "name1", "email": "11@163.com", "root": "普通用户" },
            //         { "name": "name2", "email": "22@163.com", "root": "普通用户" },
            //         { "name": "name3", "email": "33@163.com", "root": "普通用户" },
            //         { "name": "name4", "email": "44@163.com", "root": "普通用户" },
            //         { "name": "name5", "email": "55@163.com", "root": "普通用户" }
            //     ],
            //     "listMeta": {
            //         "totalitems": 5
            //     }
            // };

            /** @export {!angular.Resource} */
            this.usermanagementListResource = kdUsermanagementListResource;

            /**@export */
            this.$mdDialog = $mdDialog;

            /**@export */
            this.oNewUserMsg = {
                "name": "",
                "email": "",
                "root": "普通用户",
                "password": "",
                "confirmPassword": "",
            };
            /**@export */
            this.aRootAge = ["普通用户", "管理员"];
            /**@export */
            this.bPasswordError = false;
            /**@export */
            this.userCheck = false;
        }
        /**
         * @return {boolean}
         * @export
         */
    shouldShowZeroState() {
            return this.usermanagementList.items.length === 0;
        }
        /**
         * @export 
         */
    fMonitorUsername() {
            if (/^(?!\d+$)[\da-zA-Z]+$/.test(this.oNewUserMsg.name)) {
                if (this.userCheck !== false) {
                    this.userCheck = false;
                }
            }
        }
        /**
         * @export 
         */
    fCreateNewUser() {
            if (/^(?!\d+$)[\da-zA-Z]+$/.test(this.oNewUserMsg.name)) {
                if (this.userCheck !== false) {
                    this.userCheck = false;
                }
                if (this.oNewUserMsg.password !== this.oNewUserMsg.confirmPassword) {
                    this.bPasswordError = true;
                } else {
                    this.bPasswordError = false;
                    this.$mdDialog.hide();
                    console.log(this.oNewUserMsg)
                    let userMsg = {
                        "username": this.oNewUserMsg.name,
                        "password": window["sha1"](this.oNewUserMsg.password),
                        "email": this.oNewUserMsg.email,
                        "isadmin": false
                    };
                    let resource = this.resource(`api/v1/user/create`, {}, { save: { method: 'post' } });
                    resource.save(
                        userMsg,
                        (res) => {
                            if (res['errcode'] == "0") {
                                console.log(res)
                                this.state.reload();
                                this.toastr["success"]("创建成功");
                            } else {
                                this.toastr["error"](res['errmsg']);
                            }
                        },
                        (err) => {
                            alert("创建失败")
                        }
                    )
                    document.getElementById("reset-id").reset()
                    console.log(this.oNewUserMsg)
                }
            } else {
                this.userCheck = true;
            }

        }
        /**
         * @export
         */
    cancel() {
        this.$mdDialog.cancel();
    }
    $onInit() {
        // let userMsg = {
        //     "username": "qwerasdsa",
        //     "password": "ewqeqdada",
        //     "email": "111@163.com",
        //     "isadmin": false
        // };

        // let resource = this.resource(`api/v1/user/create`, {}, { save: { method: 'POST' } });
        // resource.save(
        //     userMsg,
        //     (res) => {
        //         console.log(res)
        //     }, (err) => {
        //         console.log(err)
        //     }
        // );
    }
}