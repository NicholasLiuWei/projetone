package handler

//storage_info
type StorageInfo struct {
	StorageStatus     interface{} `json:"storageStatus"`
	StorageUseRate    interface{} `json:"storageUseRate"`
	StorageTotal      interface{} `json:"storageTotal"`
	StorageAvailable  interface{} `json:"storageAvailable"`
	StorageUsed       interface{} `json:"storageUsed"`
	StorageReadBytes  interface{} `json:"storageReadBytes"`
	StorageReadOps    interface{} `json:"storageReadOps"`
	StorageWriteBytes interface{} `json:"storageWriteBytes"`
	StorageWriteOps   interface{} `json:"storageWriteOps"`
}

//useRate
type UseRateInfo struct {
	CpuUseRate    interface{} `json:"cpuUseRate"`
	MemoryUseRate interface{} `json:"memoryUseRate"`
}

//BseInfo
type BaseInfo struct {
	Cpu    []ResultData `json:"cpu"`
	Memory []ResultData `json:"memory"`
	Net1000 []ResultData `json:"net1000"`
	Net10000 []ResultData `json:"net10000"`
	Rx1000 []ResultData `json:"rx1000"`
	Rx10000 []ResultData `json:"rx10000"`
	Tx1000 []ResultData `json:"tx1000"`
	Tx10000 []ResultData `json:"tx10000"`
}


//storage_status
type CephRespInt struct {
	Status string   `json:"status"`
	Data   CephDataInt`json:"data"`
}

type CephDataInt struct {
	Result []CephResultInt `json:"result"`
}

type CephResultInt struct {
	Value []interface{} `json:"value"`
}



type CephRespFloat struct {
	Status string        `json:"status"`
	Data   CephDataFloat `json:"data"`
}

type CephDataFloat struct {
	Result []CephResultFloat `json:"result"`
}
type CephResultFloat struct {
	Value []interface{} `json:"value"`
}


//range date
type RangeResp struct {
	Status string      `json:"status"`
	Data   RangeResult `json:"data"`
}

type RangeResult struct {
	ResultType string       `json:"resultType"`
	Result     []ResultData `json:"result"`
}


type ResultData struct {
	Metric Metric     `json:"metric"`
	Values [][]interface{} `json:"values"`
}


type Metric struct {
	Name     string `json:"__name__,omitempty"`
	Alias    string `json:"alias",omitempty`
	Cluster  string `json:"cluster,omitempty"`
	Instance string `json:"instance,omitempty"`
	Job      string `json:"job,omitempty"`
	Feature interface{}  `json:"feature,omitempty"`
	Model string   `json:"model,omitempty"`
	NumCores interface{} `json:"numCores,omitempty"`
	SupportedPageSizes interface{} `json:"supportedPageSizes,omitempty"`
	TotalPhysicalBytes interface{} `json:"totalPhysicalBytes,omitempty"`
	TotalUsableBytes interface{}   `json:"totalUsableBytes,omitempty"`
	BusType         string `json:"busType,omitempty"`
	Good            string `json:"good,omitempty"`
	SectorSizeBytes string `json:"sectorSizeBytes,omitempty"`
	SerialNumber    string `json:"serialNumber,omitempty"`
	SizeBytes       string `json:"sizeBytes,omitempty"`
	Type            string `json:"type,omitempty"`
	Vendor          string `json:"vendor,omitempty"`
	DiskName          string `json:"diskName,omitempty"`
	Driver       string `json:"driver,omitempty"`
	MacAddress   string `json:"macAddress,omitempty"`
	// Model        string `json:"model,omitempty"`
	NetName         string `json:"netName,omitempty"`

}

type NodeInfo struct {
	BaseInfo BaseInfo `json:"baseinfo"`
	CPU CPU           `json:"cpu"`
	Memory MemoryInfo `json:"memory"`
	Disk []DiskInfo     `json:"disk"`
	Net []NetInfo       `json:"net"`
}

type CPU struct {
	Feature interface{}  `json:"feature"`
	Model interface{}   `json:"model"`
	NumCores interface{} `json:"numCores"` 
}

type MemoryInfo struct {
	SupportedPageSizes interface{} `json:"supportedPageSizes"`
	TotalPhysicalBytes interface{} `json:"totalPhysicalBytes"`
	TotalUsableBytes interface{}   `json:"totalUsableBytes"`
}

type DiskInfo struct {
	BusType         string `json:"busType"`
	Good            string `json:"good"`
	SectorSizeBytes string `json:"sectorSizeBytes"`
	SerialNumber    string `json:"serialNumber"`
	SizeBytes       string `json:"sizeBytes"`
	Type            string `json:"type"`
	Vendor          string `json:"vendor"`
	Name          string `json:"name"`
}

type NetInfo struct {
	Driver       string `json:"driver"`
	MacAddress   string `json:"macAddress"`
	Model        string `json:"model"`
	Name         string `json:"name"`
}