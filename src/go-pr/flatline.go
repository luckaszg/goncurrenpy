package main

import (
	"fmt"
	"io"
	"log"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

type Event struct {
	Message chan Heartbeat

	NewClients    chan chan string

	ClosedClients chan chan string

	TotalClients map[chan string]bool
}

type Heartbeat struct {
	Message string

	Active bool
}

type ClientChan chan string

func cpu_hog(intensive bool, wg *sync.WaitGroup) {
	fmt.Printf("Task 1 is running...%s\n", iff(intensive, "(intensive)", "not intensive"))
	defer wg.Done()
	if intensive {
		very_expensive_computation()
	} else {
		time.Sleep(10 * time.Second)
		fmt.Println("Task 1 finished")
	}
}

func NewServer() (event *Event) {
	event = &Event{
		Message: make(chan Heartbeat),
		NewClients: make(chan chan string),
		ClosedClients: make(chan chan string),
		TotalClients: make(map[chan string]bool),
	}

	go event.listen()

	return event
}

func (stream *Event) listen() {
	for {
		select {
		case client := <-stream.NewClients:
			stream.TotalClients[client] = true
			log.Printf("Client added. %d registered clients", len(stream.TotalClients))
		
		case client := <-stream.ClosedClients:
			delete(stream.TotalClients, client)
			close(client)
			log.Printf("Removed client. %d registered clients", len(stream.TotalClients))

		case eventMsg := <-stream.Message:
			for clientMessageChan := range stream.TotalClients {
				select {
				case clientMessageChan <- eventMsg.Message:
					// message sent successfully
				default:
					// Failed to send, dropping message
				}
			}
		}
	}
}

func (stream *Event) serveHTTP() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientChan := make(ClientChan)

		stream.NewClients <- clientChan

		go func() {
			<-c.Writer.CloseNotify()

			stream.ClosedClients <- clientChan
		}()

		c.Set("clientChan", clientChan)

		c.Next()
	}
}

func HeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "text/event-stream")
		c.Writer.Header().Set("Cache-Control", "no-cache")
		c.Writer.Header().Set("Connection", "keep-alive")
		c.Writer.Header().Set("Transfer-Encoding", "chunked")
		c.Next()
	}
}


func main() {

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:9000"},
		AllowMethods: []string{"GET"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		MaxAge: 12 * time.Hour,
	}))

	stream := NewServer()

	go func() {
		for {
			time.Sleep(time.Second * 10)
			heartbeat := Heartbeat{
				Message: "heartbeat",
				Active: true,
			}

			stream.Message <- heartbeat
		}
	}()

	// authorized := router.Group("/", gin.BasicAuth(gin.Accounts{
	// 	"admin": "admin123",
	// }))

	router.GET("/heartbeat", HeadersMiddleware(), stream.serveHTTP(), func(c *gin.Context) {
		v, ok := c.Get("clientChan")
		if !ok {
			return
		}
		clientChan, ok := v.(ClientChan)
		if !ok {
			return
		}
		c.Stream(func(w io.Writer) bool {
			if msg, ok := <-clientChan; ok {
				c.SSEvent("heartbeat", msg)
				return true
			}
			return false
		})
	})

	_ = router.Run(":8085")


	// var wg = sync.WaitGroup{}


	// wg.Add(2)

	// go first_task(true, &wg)
	// go second_task(&wg)

	// wg.Wait()
	
}