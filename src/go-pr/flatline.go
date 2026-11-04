package main

import (
	"fmt"
	"sync"
	"time"
)

func iff(condition bool, trueVal string, falseVal string) string {
	if condition {
		return trueVal
	}
	return falseVal
}

func heartbeat(ch chan <- bool) {
	ch <- true
	for {
		fmt.Println("Heartbeat")
		time.Sleep(1 * time.Second)
	}
}

func very_expensive_computation() {
	fmt.Println("Very expensive computation running...")
	for {
	}
}

func first_task(intensive bool, wg *sync.WaitGroup) {
	fmt.Printf("Task 1 is running...%s\n", iff(intensive, "(intensive)", "not intensive"))
	defer wg.Done()
	if intensive {
		very_expensive_computation()
	} else {
		time.Sleep(10 * time.Second)
		fmt.Println("Task 1 finished")
	}
}

func second_task(wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Println("Task 2 is running...")
	time.Sleep(5 * time.Second)
	fmt.Println("Task 2 finished")
}

func main() {
	heartbeat_channel := make(chan bool)
	// first_task_channel := make(chan bool)
	// second_task_channel := make(chan bool)

	var wg = sync.WaitGroup{}

	go heartbeat(heartbeat_channel)
	<-heartbeat_channel

	wg.Add(2)

	go first_task(true, &wg)
	go second_task(&wg)

	wg.Wait()
	
	// <-first_task_channel
	// <-second_task_channel
}