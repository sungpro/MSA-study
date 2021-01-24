package main

import (
	"context"
	"log"
	"net"

	"google.golang.org/grpc"
	// pb "google.golang.org/grpc/examples/helloworld/helloworld"
	pb "github.com/sungpro/MSA-study/week1/helloworld/helloworld"
)

const (
	port = ":50051"
)

// server is used to implement helloworld.GreeterServer.
type server struct {
	pb.UnimplementedGreeterServer
}

// SayHello implements helloworld.GreeterServer
func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
	id := in.GetId()

	log.Printf("Received ID: %v", id)

	// //////////////////////////////////////////////////
	// FAKE DB LOOK-UP... LOL
	var name string

	switch id {
	case "123":
		name = "John"
	case "456":
		name = "Mary"
	case "789":
		name = "Sebina"
	default:
		log.Printf("I don't know you")
	}
	// //////////////////////////////////////////////////

	return &pb.HelloReply{Message: "Hello, " + name}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterGreeterServer(s, &server{})
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
