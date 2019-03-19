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
	API "github.com/kubernetes/dashboard/src/app/backend/api"
	//metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func HandleGetUsers(client kubernetes.Interface) (RespData) {
	//create a selector
	//selector:=map[string]string{"role":UserConfigMapRole}
	//var ListBySelector = metaV1.ListOptions{
	//	LabelSelector: labels.FormatLabels(selector),
	//}
	//list with filter
	list, err :=  client.CoreV1().ConfigMaps(api.SettingsConfigMapNamespace).List(API.ListEverything)
	if err!=nil || list==nil || len(list.Items)<=0{
		return RespData{
			StatusOK,
			nil,
		}
	}
	var filteredItems []UserSpec
	for _, item := range list.Items {
			innerItem:=UserSpec{
				Username:item.Data["username"],
				Email:item.Data["email"],
				IsAdmin:FormatStringToBool(item.Data["isAdmin"]),
			}
			filteredItems=append(filteredItems,innerItem)
		}
	userList:=&ListUser{
		ListMeta:len(filteredItems),
		Items:filteredItems,
	}
   return RespData{StatusOK,userList}
}


func FormatStringToBool(s string) bool {
	if s=="true" {
		return true
	}else{
		return false
	}
}

