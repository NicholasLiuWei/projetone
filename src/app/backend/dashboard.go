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

package main

import (
	"crypto/elliptic"
	"crypto/tls"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os/exec"
	// "strings"
	"os"
	"time"

	"github.com/kubernetes/dashboard/src/app/backend/args"
	"github.com/kubernetes/dashboard/src/app/backend/auth"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"github.com/kubernetes/dashboard/src/app/backend/auth/jwe"
	"github.com/kubernetes/dashboard/src/app/backend/cert"
	"github.com/kubernetes/dashboard/src/app/backend/cert/ecdsa"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/handler"
	"github.com/kubernetes/dashboard/src/app/backend/integration"
	integrationapi "github.com/kubernetes/dashboard/src/app/backend/integration/api"
	"github.com/kubernetes/dashboard/src/app/backend/settings"
	"github.com/kubernetes/dashboard/src/app/backend/sync"
	"github.com/kubernetes/dashboard/src/app/backend/systembanner"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/spf13/pflag"
	"github.com/kubernetes/dashboard/src/app/backend/alert"
	"golang.org/x/net/websocket"
	influxdbclient "github.com/influxdata/influxdb/client/v2"
	"github.com/emicklei/go-restful"
)

var (
	argInsecurePort        = pflag.Int("insecure-port", 9090, "The port to listen to for incoming HTTP requests.")
	argPort                = pflag.Int("port", 8443, "The secure port to listen to for incoming HTTPS requests.")
	argInsecureBindAddress = pflag.IP("insecure-bind-address", net.IPv4(127, 0, 0, 1), "The IP address on which to serve the --port (set to 0.0.0.0 for all interfaces).")
	argBindAddress         = pflag.IP("bind-address", net.IPv4(0, 0, 0, 0), "The IP address on which to serve the --secure-port (set to 0.0.0.0 for all interfaces).")
	argDefaultCertDir      = pflag.String("default-cert-dir", "/certs", "Directory path containing '--tls-cert-file' and '--tls-key-file' files. Used also when auto-generating certificates flag is set.")
	argCertFile            = pflag.String("tls-cert-file", "", "File containing the default x509 Certificate for HTTPS.")
	argKeyFile             = pflag.String("tls-key-file", "", "File containing the default x509 private key matching --tls-cert-file.")
	argApiserverHost       = pflag.String("apiserver-host", "", "The address of the Kubernetes Apiserver "+
		"to connect to in the format of protocol://address:port, e.g., "+
		"http://localhost:8080. If not specified, the assumption is that the binary runs inside a "+
		"Kubernetes cluster and local discovery is attempted.")
	argHeapsterHost = pflag.String("heapster-host", "", "The address of the Heapster Apiserver "+
		"to connect to in the format of protocol://address:port, e.g., "+
		"http://localhost:8082. If not specified, the assumption is that the binary runs inside a "+
		"Kubernetes cluster and service proxy will be used.")
	argKubeConfigFile     = pflag.String("kubeconfig", "", "Path to kubeconfig file with authorization and master location information.")
	argTokenTTL           = pflag.Int("token-ttl", int(authApi.DefaultTokenTTL), "Expiration time (in seconds) of JWE tokens generated by dashboard. Default: 15 min. 0 - never expires")
	argAuthenticationMode = pflag.StringSlice("authentication-mode", []string{authApi.Token.String()}, "Enables authentication options that will be reflected on login screen. Supported values: token, basic. Default: token."+
		"Note that basic option should only be used if apiserver has '--authorization-mode=ABAC' and '--basic-auth-file' flags set.")
	argMetricClientCheckPeriod   = pflag.Int("metric-client-check-period", 30, "Time in seconds that defines how often configured metric client health check should be run. Default: 30 seconds.")
	argAutoGenerateCertificates  = pflag.Bool("auto-generate-certificates", false, "When set to true, Dashboard will automatically generate certificates used to serve HTTPS. Default: false.")
	argEnableInsecureLogin       = pflag.Bool("enable-insecure-login", false, "When enabled, Dashboard login view will also be shown when Dashboard is not served over HTTPS. Default: false.")
	argSystemBanner              = pflag.String("system-banner", "", "When non-empty displays message to Dashboard users. Accepts simple HTML tags. Default: ''.")
	argSystemBannerSeverity      = pflag.String("system-banner-severity", "INFO", "Severity of system banner. Should be one of 'INFO|WARNING|ERROR'. Default: 'INFO'.")
	argDisableSettingsAuthorizer = pflag.Bool("disable-settings-authorizer", false, "When enabled, Dashboard settings page will not require user to be logged in and authorized to access settings page.")
)

func main() {
	// Set logging output to standard console out
	log.SetOutput(os.Stdout)

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	flag.CommandLine.Parse(make([]string, 0)) // Init for glog calls in kubernetes packages

	// Initializes dashboard arguments holder so we can read them in other packages
	initArgHolder()

	if args.Holder.GetApiServerHost() != "" {
		log.Printf("Using apiserver-host location: %s", args.Holder.GetApiServerHost())
	}
	if args.Holder.GetKubeConfigFile() != "" {
		log.Printf("Using kubeconfig file: %s", args.Holder.GetKubeConfigFile())
	}

	clientManager := client.NewClientManager(args.Holder.GetKubeConfigFile(), args.Holder.GetApiServerHost())
	versionInfo, err := clientManager.InsecureClient().Discovery().ServerVersion()
	if err != nil {
		handleFatalInitError(err)
	}

	log.Printf("Successful initial request to the apiserver, version: %s", versionInfo.String())

	// Init auth manager
	authManager := initAuthManager(clientManager)

	// Init settings manager
	settingsManager := settings.NewSettingsManager(clientManager)

	// Init system banner manager
	systemBannerManager := systembanner.NewSystemBannerManager(args.Holder.GetSystemBanner(),
		args.Holder.GetSystemBannerSeverity())

	// Init integrations
	integrationManager := integration.NewIntegrationManager(clientManager)
	integrationManager.Metric().ConfigureHeapster(args.Holder.GetHeapsterHost()).
		EnableWithRetry(integrationapi.HeapsterIntegrationID, time.Duration(args.Holder.GetMetricClientCheckPeriod()))

	apiHandler, err := handler.CreateHTTPAPIHandler(
		integrationManager,
		clientManager,
		authManager,
		settingsManager,
		systemBannerManager)
	if err != nil {
		handleFatalInitError(err)
	}

	var servingCerts []tls.Certificate
	if args.Holder.GetAutoGenerateCertificates() {
		log.Println("Auto-generating certificates")
		certCreator := ecdsa.NewECDSACreator(args.Holder.GetKeyFile(), args.Holder.GetCertFile(), elliptic.P256())
		certManager := cert.NewCertManager(certCreator, args.Holder.GetDefaultCertDir())
		servingCert, err := certManager.GetCertificates()
		if err != nil {
			handleFatalInitError(err)
		}
		servingCerts = []tls.Certificate{servingCert}
	} else if args.Holder.GetCertFile() != "" && args.Holder.GetKeyFile() != "" {
		certFilePath := args.Holder.GetDefaultCertDir() + string(os.PathSeparator) + args.Holder.GetCertFile()
		keyFilePath := args.Holder.GetDefaultCertDir() + string(os.PathSeparator) + args.Holder.GetKeyFile()
		servingCert, err := tls.LoadX509KeyPair(certFilePath, keyFilePath)
		if err != nil {
			handleFatalInitError(err)
		}
		servingCerts = []tls.Certificate{servingCert}
	}

	// Run a HTTP server that serves static public files from './public' and handles API calls.
	// TODO(bryk): Disable directory listing.
	http.Handle("/", handler.MakeGzipHandler(handler.CreateLocaleHandler()))
	http.Handle("/api/", apiHandler)
	// TODO(maciaszczykm): Move to /appConfig.json as it was discussed in #640.
	http.Handle("/api/appConfig.json", handler.AppHandler(handler.ConfigHandler))
	http.Handle("/api/sockjs/", handler.CreateAttachHandler("/api/sockjs"))
	http.Handle("/metrics", prometheus.Handler())

	//helm request
	http.HandleFunc("/api/v1/helm/", Handle(NewReverseProxy("127.0.0.1:8091")))
	//alert request from dashboard frontend
	http.HandleFunc("/alert/", Handle(NewReverseProxy("127.0.0.1:9999")))

	// Create a new influxdb HTTPClient
	influxdbclient, err := influxdbclient.NewHTTPClient(influxdbclient.HTTPConfig{
		Addr:     "http://127.0.0.1:32086",
		Username: "admin",
		Password: "admin",
	})

	if err != nil {
		log.Fatal(err)
	}
	defer influxdbclient.Close()
	alert.RegisterInfluxdbClient(influxdbclient)

	alertContainer := restful.NewContainer()
	alertWs := new(restful.WebService)
	alertWs.Route(alertWs.GET("/alert/alerts").To(alert.AlertsHandler))
	alertWs.Route(alertWs.POST("/alert/alerts").To(alert.AlertsHandler))
	alertWs.Route(alertWs.GET("/alert/alertsnum").To(alert.GetAlertsNumHandler))
	alertWs.Route(alertWs.POST("/alert/alertsdelete").To(alert.DelAlertsHandler))
	alertWs.Route(alertWs.POST("/alert/alertsupdate").To(alert.UpdateAlertsHandler))
	alertWs.Route(alertWs.POST("/alert/alertsclear").To(alert.ClearAlertsHandler))
	//alertWs.Route(alertWs.POST("/alert/sockjs").To(websocket.Handler(alert.AlertHandler)))
	alertWs.Route(alertWs.GET("/alert/email").To(alert.EmailHandler))
	alertWs.Route(alertWs.POST("/alert/email").To(alert.EmailHandler))
	alertWs.Route(alertWs.POST("/alert/add/email").To(alert.AddEmailHandler))

	/*alert_mux := http.NewServeMux()
	// alertmanager webhook
	alert_mux.HandleFunc("/alert/alerts", alert.AlertsHandler)
	// get alerts number
	alert_mux.HandleFunc("/alert/alertsnum", alert.GetAlertsNumHandler)
	alert_mux.HandleFunc("/alert/alertsdelete", alert.DelAlertsHandler)
	alert_mux.HandleFunc("/alert/alertsupdate", alert.UpdateAlertsHandler)
	// clear alert history
	alert_mux.HandleFunc("/alert/alertsclear", alert.ClearAlertsHandler)
	// alert websocket
	alert_mux.Handle("/alert/sockjs", websocket.Handler(alert.AlertHandler))
	// configmap for email
	alert_mux.HandleFunc("/alert/email", alert.EmailHandler)
	// configmap for email
	alert_mux.HandleFunc("/alert/add/email", alert.AddEmailHandler)*/

	alertContainer.Add(alertWs)
	alert_server := &http.Server{
		Addr: ":9999",
		ReadTimeout: 60 * time.Second,
		WriteTimeout: 60 * time.Second,
		Handler: alertContainer,
	}
	go func () {
		log.Fatal(alert_server.ListenAndServe())
	}()

	// initApp()
	// Listen for http or https
	if servingCerts != nil {
		log.Printf("Serving securely on HTTPS port: %d", args.Holder.GetPort())
		secureAddr := fmt.Sprintf("%s:%d", args.Holder.GetBindAddress(), args.Holder.GetPort())
		server := &http.Server{
			Addr:      secureAddr,
			Handler:   http.DefaultServeMux,
			TLSConfig: &tls.Config{Certificates: servingCerts},
		}
		go func() { log.Fatal(server.ListenAndServeTLS("", "")) }()
	} else {
		log.Printf("Serving insecurely on HTTP port: %d", args.Holder.GetInsecurePort())
		addr := fmt.Sprintf("%s:%d", args.Holder.GetInsecureBindAddress(), args.Holder.GetInsecurePort())
		go func() { log.Fatal(http.ListenAndServe(addr, nil)) }()
	}
	select {}
}


func NewReverseProxy(target string) *httputil.ReverseProxy {
	proxy := httputil.NewSingleHostReverseProxy(&url.URL{
		Scheme: "http",
		Host:   target,
	})

	pTransport := &http.Transport{
		Proxy:                 http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   8 * time.Second,
			KeepAlive: 8 * time.Second,
			DualStack: true,
		}).DialContext,
		IdleConnTimeout:       10 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	proxy.Transport = pTransport

	return proxy
}

func Handle(p *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// log.Println("request:", r.RemoteAddr, "want", r.RequestURI)
		// r.RequestURI = strings.Replace(r.RequestURI, "/helm", "", -1)
		log.Println("request:", r.RemoteAddr, "want", r.RequestURI)
		//Many webservers are configured to not serve pages if a request doesn’t appear from the same host.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "X-Requested-With")
		p.ServeHTTP(w, r)
		log.Println("response ok")
	}
}

func initApp() {
	appcom := "nohup /appmanager >/logs/appmanager-" + "`date +%Y%m%d%H%M%S`" + ".log 2>&1 &"
	cmd := exec.Command("/bin/bash", "-c",appcom);
	err := cmd.Run()
	if err != nil{
		fmt.Println("appmanager err:",err.Error())
		return
	}
	appcom = "nohup /monitor >/logs/monitor-" + "`date +%Y%m%d%H%M%S`" + ".log 2>&1 &"
	cmd = exec.Command("/bin/bash", "-c",appcom);
	err = cmd.Run()
	if err != nil{
		fmt.Println("monitor err:",err.Error())
	}
}

func initAuthManager(clientManager clientapi.ClientManager) authApi.AuthManager {
	insecureClient := clientManager.InsecureClient()

	// Init default encryption key synchronizer
	synchronizerManager := sync.NewSynchronizerManager(insecureClient)
	keySynchronizer := synchronizerManager.Secret(authApi.EncryptionKeyHolderNamespace, authApi.EncryptionKeyHolderName)

	// Register synchronizer. Overwatch will be responsible for restarting it in case of error.
	sync.Overwatch.RegisterSynchronizer(keySynchronizer, sync.AlwaysRestart)

	// Init encryption key holder and token manager
	keyHolder := jwe.NewRSAKeyHolder(keySynchronizer)
	tokenManager := jwe.NewJWETokenManager(keyHolder)
	tokenTTL := time.Duration(args.Holder.GetTokenTTL())
	if tokenTTL != authApi.DefaultTokenTTL {
		tokenManager.SetTokenTTL(tokenTTL)
	}

	// Set token manager for client manager.
	clientManager.SetTokenManager(tokenManager)
	authModes := authApi.ToAuthenticationModes(args.Holder.GetAuthenticationMode())
	if len(authModes) == 0 {
		authModes.Add(authApi.Token)
	}

	return auth.NewAuthManager(clientManager, tokenManager, authModes)
}

func initArgHolder() {
	builder := args.GetHolderBuilder()
	builder.SetInsecurePort(*argInsecurePort)
	builder.SetPort(*argPort)
	builder.SetTokenTTL(*argTokenTTL)
	builder.SetMetricClientCheckPeriod(*argMetricClientCheckPeriod)
	builder.SetInsecureBindAddress(*argInsecureBindAddress)
	builder.SetBindAddress(*argBindAddress)
	builder.SetDefaultCertDir(*argDefaultCertDir)
	builder.SetCertFile(*argCertFile)
	builder.SetKeyFile(*argKeyFile)
	builder.SetApiServerHost(*argApiserverHost)
	builder.SetHeapsterHost(*argHeapsterHost)
	builder.SetKubeConfigFile(*argKubeConfigFile)
	builder.SetSystemBanner(*argSystemBanner)
	builder.SetSystemBannerSeverity(*argSystemBannerSeverity)
	builder.SetAuthenticationMode(*argAuthenticationMode)
	builder.SetAutoGenerateCertificates(*argAutoGenerateCertificates)
	builder.SetEnableInsecureLogin(*argEnableInsecureLogin)
	builder.SetDisableSettingsAuthorizer(*argDisableSettingsAuthorizer)
}

/**
 * Handles fatal init error that prevents server from doing any work. Prints verbose error
 * message and quits the server.
 */
func handleFatalInitError(err error) {
	log.Fatalf("Error while initializing connection to Kubernetes apiserver. "+
		"This most likely means that the cluster is misconfigured (e.g., it has "+
		"invalid apiserver certificates or service accounts configuration) or the "+
		"--apiserver-host param points to a server that does not exist. Reason: %s\n"+
		"Refer to our FAQ and wiki pages for more information: "+
		"https://github.com/kubernetes/dashboard/wiki/FAQ", err)
}
