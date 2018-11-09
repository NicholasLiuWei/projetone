package main

import (
	"fmt"
	"os"


	"ghw"
)

var (
	info *ghw.HostInfo
)

func main() {
	i, err := ghw.Host()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	info = i
        showAll()
}



func showAll() {
	showMemory()
	showCPU()
	showBlock()
	showTopology()
	showNetwork()
}



func showMemory() {
	mem := info.Memory
	fmt.Printf("%v\n", mem)
}



func showCPU() {
	cpu := info.CPU
	fmt.Printf("%v\n", cpu)
}



func showBlock() {
	block := info.Block
	fmt.Printf("%v\n", block)
	for _, disk := range block.Disks {
	  fmt.Printf("%v\n", disk)
	}
}



func showTopology() {
	topology := info.Topology
	fmt.Printf("%v\n", topology)
}



func showNetwork() {
	net := info.Network
	fmt.Printf("%v\n", net)
	for _, nic := range net.NICs {
	  fmt.Printf("%v\n", nic)
	}
}
