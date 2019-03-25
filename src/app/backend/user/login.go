// Copyright 2017 The Kubernetes Authors.
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

package user

import (
	"k8s.io/client-go/kubernetes"
	"github.com/kubernetes/dashboard/src/app/backend/settings/api"
	 metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func HandleLogin(client kubernetes.Interface,user *LoginSpec) ErrResponse{
	userConfigMap:= UserConfigMapPrefix + user.Username
	configMap, err := client.CoreV1().ConfigMaps(api.SettingsConfigMapNamespace).Get(userConfigMap,metaV1.GetOptions{})
	if err != nil&&configMap==nil{
		return ErrUserNotExist
	}
    if password,ok:=configMap.Data["password"]; ok{
			if password==user.Password{
				return StatusOK
			}else{
				return ErrPasswordNotCorrect
			}
    }
	return ErrUserNotExist
}
