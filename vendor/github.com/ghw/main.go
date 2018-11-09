package ghw
import "fmt"
import "time"


type HostInfo struct {
	Memory   *MemoryInfo
	Block    *BlockInfo
	CPU      *ArmProcessor
	Topology *TopologyInfo
	Network  *NetworkInfo
}

func Host(debug bool) (*HostInfo, error) {
	info := &HostInfo{}
	var t1,t2,t3,t4,t5 time.Time
	if debug {
	  t1 = time.Now()
	}
	mem, err := Memory()
	if err != nil {
		return nil, err
	}
	if debug {
	  t2 = time.Now()
	}

	info.Memory = mem
	block, err := Block()
	if err != nil {
		return nil, err
	}
	if debug {
	  t3 = time.Now()
	}


	info.Block = block
	cpu, err := ArmCPU()
	if err != nil {
		return nil, err
	}
	if debug {
	  t4 = time.Now()
	}


	info.CPU = cpu
	//topology, err := Topology()
	//if err != nil {
	//	return nil, err
	//}
	//info.Topology = topology
	net, err := Network()
	if err != nil {
		return nil, err
	}
	if debug {
	  t5 = time.Now()
          fmt.Println("ghw: Memory interval:", t2.Sub(t1), "  Block interval:", t3.Sub(t2), "  CPU interval:", t4.Sub(t3), "  Network interval:", t5.Sub(t4))
	}


	info.Network = net
	return info, nil
}


