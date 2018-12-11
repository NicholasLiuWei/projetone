package alert

import(
        "k8s.io/client-go/kubernetes"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	//"k8s.io/client-go/pkg/api/v1"
        "k8s.io/api/core/v1"
	"strings"
	"log"

	"github.com/spf13/pflag"
)

var apiserverHost = pflag.String("apiserver-alert", "http://127.0.0.1:8080", "The address of the Kubernetes Apiserver "+
                "to connect to in the format of protocol://address:port, e.g., "+
                "http://localhost:8080. If not specified, the assumption is that the binary runs inside a "+
                "Kubernetes cluster and local discovery is attempted.")

// create clientset
//func getClientset() (*kubernetes.Clientset, error){
func getClientset() (kubernetes.Interface, error) {
        cManager := client.NewClientManager("", *apiserverHost)
        clientset := cManager.InsecureClient()
        /*clientset, _, err := client.CreateApiserverClient(*apiserverHost, "")
        if err != nil {
                return nil,err
        }*/
        return clientset,nil
}

func getConfigMap(namespace string,repoCMName string, repoCMDataKey string)(string,error){
        clientset,err:=getClientset()
        if err!=nil {
                return "",err
        }
        cm,err:=clientset.CoreV1().ConfigMaps(namespace).Get(repoCMName, metav1.GetOptions{})
        if err!=nil {
                return "",err
        } 

        data := cm.Data[repoCMDataKey]
        return data,nil
}

// update configmap
// repoCMDataKey - config.yml
func updateConfigMap(repoCMName string, namespace string, repoCMDataKey string, emailName string) error {
        clientset,err:=getClientset()
        if err!=nil {
                return err
        }
        configMap,err:=clientset.CoreV1().ConfigMaps(namespace).Get(repoCMName, metav1.GetOptions{})
        if err!=nil {
                return err
        }

        dataValue := configMap.Data[repoCMDataKey]
        tmp := strings.Split(dataValue,"email_configs:")
        if len(tmp)!=2 {
                return ErrNoEmailConfigs
        }

        begin := tmp[0] + "email_configs:"
        middle := ""
        end := ""

        tmp2 := strings.Split(tmp[1], "  webhook_configs:")
        if len(tmp2)==2{
                end = "  webhook_configs:" + tmp2[1]
        }

        // update dataValue
        emails := strings.Split(emailName,";")
        middle += "\n"
        for _,v := range emails {
                middle += "  - to: " + "\"" + v + "\"" + SEPERATOR
        }
        //middle += "\n"

        data := begin + middle + end

        // new ConfigMap
        cm := new(v1.ConfigMap)
        cm.TypeMeta = metav1.TypeMeta{Kind: "ConfigMap", APIVersion: "v1"}
        cm.ObjectMeta = metav1.ObjectMeta{Name: repoCMName, Namespace: namespace}


        log.Printf("update alertmanager data, data=%v\n", data)
        cm.Data = map[string]string{repoCMDataKey: data}
        if _,err := clientset.CoreV1().ConfigMaps(namespace).Update(cm); err!=nil {
                return err
        }

        return nil
}

