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

import showEditReleaseDialog from './editRelease_dialog';
import showEditReleaseImageDialog from './editReleaseImage_dialog';

/**
 * Opens release update dialog.
 *
 * @final
 */
export class ReleaseService {
    /**
     * @param {!md.$dialog} $mdDialog
     * @ngInject
     */
    constructor($mdDialog) {
        /** @private {!md.$dialog} */
        this.mdDialog_ = $mdDialog;
    }

    /**
     * Opens an update release dialog. Returns a promise that is resolved/rejected when
     * user wants
     * to updagte a release. Nothing happens when user clicks cancel on the dialog.
     *
     * @returns {!angular.$q.Promise}
     */
    showEditReleaseDialog(release) {
        return showEditReleaseDialog(this.mdDialog_, release);
    }

    /**
     * Opens an update release image dialog. Returns a promise that is resolved/rejected when
     * user wants
     * to updagte a release image. Nothing happens when user clicks cancel on the dialog.
     *
     * @returns {!angular.$q.Promise}
     */
    showEditReleaseImageDialog(release) {
        return showEditReleaseImageDialog(this.mdDialog_, release);
    }
}