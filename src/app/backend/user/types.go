
package user

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
)


const(
	UserConfigMapPrefix="thinkuser-"
	UserConfigMapRole="thinkuser"
)


const(
	UserNotExist= "user not exist"
	PasswordNotCorrect="password not correct"
	UserAlreadyExist="user already exist"
	PasswordIsNull="password is null"
)
type UserList struct {
	ListMeta	api.ListMeta	`json:"listMeta"`
	Items		[]UserSpec		`json:"items"`
}

type UserSpec struct {
	Username 	string 	`json:"username"`
	Password 	string 	`json:"password"`
	Email 		string 	`json:"email"`
	IsAdmin 	bool 	`json:"isadmin"`
}

type LoginSpec struct {
	// Username is the username for basic authentication to the kubernetes cluster.
	Username string `json:"username"`
	// Password is the password for basic authentication to the kubernetes cluster.
	Password string `json:"password"`
}

type AuthResponse struct{
	loginOK bool `json:loginok`
}

type ListUser struct{
	ListMeta int `json:"listMeta"`
	Items   []UserSpec `json:"items"`
}


