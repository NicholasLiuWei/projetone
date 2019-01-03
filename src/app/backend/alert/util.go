package alert

import(
        "k8s.io/client-go/kubernetes"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
        "k8s.io/api/core/v1"
	"strings"
	"log"
        "time"
        "strconv"
        "encoding/json"
        "github.com/ghodss/yaml"
        "errors"

	"github.com/spf13/pflag"
        influxdbclient "github.com/influxdata/influxdb/client/v2"
        "fmt"
        "github.com/emicklei/go-restful"
)

var apiserverHost = pflag.String("apiserver-alert", "http://127.0.0.1:8080", "The address of the Kubernetes Apiserver "+
                "to connect to in the format of protocol://address:port, e.g., "+
                "http://localhost:8080. If not specified, the assumption is that the binary runs inside a "+
                "Kubernetes cluster and local discovery is attempted.")

// create clientset
//func getClientset() (*kubernetes.Clientset, error){
func getClientset(req *restful.Request) (kubernetes.Interface, error) {
        cManager := client.NewClientManager("", *apiserverHost)
        //clientset := cManager.InsecureClient()
        clientset, err := cManager.Client(req)
        if err != nil {
                log.Printf("getClientset error : ", err)
                return nil,err
        }
        /*clientset, _, err := client.CreateApiserverClient(*apiserverHost, "")
        if err != nil {
                return nil,err
        }*/
        return clientset,nil
}

func getConfigMap(namespace string,repoCMName string, repoCMDataKey string, req *restful.Request)(string,error){
        clientset,err:=getClientset(req)
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
func updateConfigMap(action string, repoCMName string, namespace string, repoCMDataKey string, emailName string, req *restful.Request) error {
        clientset,err:=getClientset(req)
        if err!=nil {
                return err
        }
        configMap,err:=clientset.CoreV1().ConfigMaps(namespace).Get(repoCMName, metav1.GetOptions{})
        if err!=nil {
                return err
        }

        dataValue := configMap.Data[repoCMDataKey]
        values,_ := yaml.YAMLToJSON([]byte(dataValue))
        fmt.Println("shuju:",string(values))
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

        // get email name
        list := strings.Split(dataValue, "email_configs:")
        emailArr := make([]string,0)
        if len(tmp) > 0{
                tmp2 := strings.Split(list[1],"webhook_configs:")
                tmp3 := strings.Split(tmp2[0], SEPERATOR)
                for _,v := range tmp3 {
                        if v=="\n" || v=="" {
                                continue
                        }
                        v = strings.TrimSpace(v)
                        if len(v)>1 && v[0]=='#'{
                                continue
                        }
                        if len(v)>7 {
                                v = v[7:len(v)-1]
                                emailArr = append(emailArr, v)
                        }
                }
        }

        //new email arr
        newEmailArr := make([]string,0)
        switch action {
                case "delete":
                        for _,val := range emailArr{
                                if val == emailName{
                                        continue
                                }else{
                                        newEmailArr = append(newEmailArr,val)
                                }
                        }     
                case "add":
                        newEmailArr = append(newEmailArr,emailArr...)
                        for _,val := range emailArr{
                                if val == emailName{
                                        continue
                                }else{
                                        newEmailArr = append(newEmailArr,emailName)
                                        break
                                }
                        }
                default:
                        return errors.New("updateConfigMap miss action")
        }
        middle += "\n"
        for _,v := range newEmailArr {
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

func queryDB(cmd string) (res []influxdbclient.Result, err error) {
        q := influxdbclient.Query{
                Command:  cmd,
                Database: "alert",
        }
        if response, err := s.client.Query(q); err == nil {
                if response.Error() != nil {
                        return res, response.Error()
                }
                res = response.Results
        } else {
                return res, err
        }
        return res, nil
}

func writeDB(value interface{}, t time.Time)(err error) {
        // Create a new point batch
        log.Printf("writeDB")
        bp, err := influxdbclient.NewBatchPoints(influxdbclient.BatchPointsConfig{
		Database:  "alert",
		Precision: "s",
	})
	if err != nil {
		log.Fatal(err)
                return err
	}
	// Create a point and add to batch
	tags := map[string]string{}
	fields := map[string]interface{}{
		"value":  value,
	}
        log.Printf("writeDB after NewBatchPoints")
	pt, err := influxdbclient.NewPoint("node_alert", tags, fields, t)
	if err != nil {
		log.Fatal(err)
                return err
	}
        log.Printf("writeDB after NewPoint")
	bp.AddPoint(pt)
        log.Printf("writeDB after AddPoint")
	// Write the batch
	if err := s.client.Write(bp); err != nil {
		log.Fatal(err)
                return err
	}
        log.Printf("writeDB after Write")
        return nil
}

func countDB()(count int, err error) {
        var items string
        res, err := queryDB("select count(value) from node_alert")
        if err != nil {
                log.Fatal("countDB queryDB error!", err)
                return 0, err
        }
        if len(res[0].Series) == 1 {
                log.Println("countDB get result!")
                items = string(res[0].Series[0].Values[0][1].(json.Number))
                log.Println("countDB count: ", items)
        } else {
                log.Println("countDB have no result!")
                items = "0"
        }
        count, _ =  strconv.Atoi(string(items))
        return count, nil
}


func queryDBMessages(pageIndex AlertPageIndex)(messages DashboardAlert, err error) {
        var alerts = DashboardAlert{}
        var items int = 0
        loc, _ := time.LoadLocation("Local")
        cmd := fmt.Sprintf("select * from node_alert LIMIT %s offset %s", strconv.Itoa(pageIndex.itemsPerPage), strconv.Itoa(pageIndex.page))
        log.Println("queryDBMessages cmd: ", cmd)
        res, err := queryDB(cmd)
        if err != nil {
                log.Fatal("queryDBMessages queryDB error!", err)
                return alerts, err
        }
        log.Println("queryDBMessages res: ", res)

        if len(res[0].Series) == 1 {
                for i := 0; i < len(res[0].Series[0].Values); i++ {
                        log.Println("queryDBMessages res- ",i,":", res)
                        var m = InfluxAlert{}
                        var buf []byte = []byte(res[0].Series[0].Values[i][1].(string))
                        if err = json.Unmarshal(buf, &m); err != nil {
                                log.Println("json unmarshal error:", err)
                        }

                        dbTime, _ := time.ParseInLocation(time.RFC3339, res[0].Series[0].Values[i][0].(string), loc)
                        m.InfluxdbIndex = strconv.FormatInt(dbTime.UnixNano(), 10)
                        alerts.Alerts = append(alerts.Alerts, m)
                }
        } else {
               // nothing to do
                log.Println("queryDBMessages NULL res!")
        }

        if items, err = countDB(); err != nil {
                log.Fatal("queryDBMessages countDB error!", err)
                return alerts, err
        }
        alerts.ListMeta.TotalItems = items
        log.Println("queryDBMessages items: ", items)


        return alerts, nil
}

func deleteDB(records []InfluxAlert) (err error) {
        log.Println("deletesBD records")
        for i:=0; i<len(records); i++ {
                cmd := fmt.Sprintf("delete from node_alert where time=%s", records[i].InfluxdbIndex)
                log.Println("deleteDB cmd: ", cmd)
                _, err = queryDB(cmd)
                if err != nil {
                        log.Fatal("deleteDB queryDB error!", err)
                        return err
                }
        }
        log.Println("deleteDB success!")
        return nil
}

func updateDB(record InfluxAlert) (err error) {
        log.Println("updateBD record")

        cmd := fmt.Sprintf("delete from node_alert where time=%s", record.InfluxdbIndex)
        log.Println("updateDB cmd: ", cmd)
        _, err = queryDB(cmd)
        if err != nil {
                log.Fatal("updateDB queryDB error!", err)
                return err
        }

        var newRecord = record
        var buf []byte
        newRecord.UserProcessed = "true"

        if buf, err = json.Marshal(newRecord); err != nil {
                log.Fatal("updateDB json marshal error:", err)
                return err
        }

        dbIndexInt64, _ := strconv.ParseInt(record.InfluxdbIndex, 10, 64)
        err = writeDB(string(buf), time.Unix(0, dbIndexInt64))
        log.Printf("write context: %s", string(buf))
        if err != nil {
                log.Printf("Failed to write alert messages to influxdb!", string(buf))
                return
        }

        /*cmd = fmt.Sprintf("insert node_alert value=%s %s", string(buf), record.InfluxdbIndex)
        _, err = queryDB(cmd)
        log.Printf("write context: %s", cmd)
        if err != nil {
                log.Printf("Failed to write alert messages to influxdb!", cmd)
                return
        }*/

        log.Println("updateDB success!")
        return nil
}

