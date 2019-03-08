
package user

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
)

type UserList struct {
	ListMeta	api.ListMeta	`json:"listMeta"`
	Items		[]UserSpec		`json:"items"`
}

type UserSpec struct {
	Username 	string 	`json:"username"`
	Password 	string 	`json:"password"`
	Email 		string 	`json:"email"`
	IsAdmin 	bool 	`json:isadmin`
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
