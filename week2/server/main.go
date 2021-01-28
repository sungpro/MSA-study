package main

import (
	"context"
	"log"
	"net"

	"google.golang.org/grpc"
	pb "github.com/sungpro/MSA-study/week2/next-grpc/protos/chat"
)

const (
	port = ":50051"
)

// server is used to implement helloworld.GreeterServer.
type server struct {
	pb.UnimplementedGreeterServer
}

func (s *server) join(ctx context.Context, in *pb.Message) (*pb.Message, error) {
	user := in.GetUser()
	message := in.GetText()

	log.Printf("[Message] %v: %v", user, message)

	if user != "" && message != "" {
		return &pb.Message{User: user, Text: message}, nil
	} else {
		return, nil
	}
}

func (s *server) send(ctx context.Context, in *pb.Message) (*pb.Message, error) {
	user := in.GetUser()
	message := in.GetText()

	log.Printf("[Message] %v: %v", user, message)

	if user != "" && message != "" {
		return &pb.Message{User: user, Text: message}, nil
	} else {
		return, nil
	}
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterChatServer(s, &server{})
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}