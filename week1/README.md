# MicroServices with Go & gRPC & Python

This is a simple and trivial tutorial on using gRPC in Go to enable communication between a **Go server** and a **Python client**. A majority of code was referenced from the quickstart sections from the [official gRPC docs](https://grpc.io/docs/); however, modified slightly.

## Prerequisites
- **Go**
- **Python** (3.5 or higher)
- **pip** (9.0.1 or higher)
- **protoc**, Protocol buffer compiler
- **grpcio**, Python gRPC package
	```sh
	$ python -m pip install grpcio
	```
- **Go plugins** for the protocol compiler:

	1.  Install the protocol compiler plugins for Go using the following commands:

		```sh
		$ export GO111MODULE=on  # Enable module mode
		$ go get google.golang.org/protobuf/cmd/protoc-gen-go \
		     google.golang.org/grpc/cmd/protoc-gen-go-grpc
		```
    
	2.  Update your  `PATH`  so that the  `protoc`  compiler can find the plugins:
    
		```sh
		$ export PATH="$PATH:$(go env GOPATH)/bin"
		```


## Define Protobufs

Create a file named `helloworld.proto` in the project directory, which contains the following code.

```go
syntax = "proto3";

option go_package = "google.golang.org/grpc/examples/helloworld/helloworld";
option java_multiple_files = true;
option java_package = "io.grpc.examples.helloworld";
option java_outer_classname = "HelloWorldProto";

package helloworld;

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's id
message HelloRequest {
  string id = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```

## Generate gRPC code

Run the following code in terminal to auto-generate gRPC code.

```sh
$ protoc \
	--go_out=. --go_opt=paths=source_relative \
	--go-grpc_out=. --go-grpc_opt=paths=source_relative \
	./helloworld.proto
```

This will compile `helloworld.proto` file and generate the  `helloworld.pb.go`  and  `helloworld_grpc.pb.go`  files, which contain:
-   Code for populating, serializing, and retrieving  `HelloRequest`  and  `HelloReply`  message types.
-   Generated client and server code.

## Write Server Code by Implementing gRPC Code

Create a file named `main.go` in the project directory, which contains the following code.

```go
package main

import (
	"context"
	"log"
	"net"
	"google.golang.org/grpc"
	pb "google.golang.org/grpc/examples/helloworld/helloworld"
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

```

## Generate Python client code

```python
python -m grpc_tools.protoc -I helloworld/ --python_out=. --grpc_python_out=. helloworld/helloworld.proto
```

## Write Client Code

Create a file named `main.py` in the project directory, which contains the following code.

```python
import sys
import logging
import grpc
import helloworld_pb2
import helloworld_pb2_grpc

def run(id):
  with grpc.insecure_channel('localhost:50051') as channel:
    stub = helloworld_pb2_grpc.GreeterStub(channel)      
    response = stub.SayHello(helloworld_pb2.HelloRequest(id=id))

  output = f"{response.message} (ID: #{id})"
  print(output)

if __name__ == "__main__":
  if len(sys.argv) != 2:
    print("You may look-up one person at a time using their ID. (Try '123', '456', or '789'")
  logging.basicConfig()
  run(sys.argv[1])
```

## Run

We have defined the gRPC service using protocol buffers, a.k.a. protobuf and thus both the server and the client stub have a `SayHellow()` RPC method that takes a `HelloRequest` parameter from the client and returns a `HelloReply` from the server. Now, let's test it out.

1. Run the server:
	```
	$ go run greeter_server/main.go
	```

2. From another terminal, run the client:

	```
	$ python3 main.py 123
	```
	> OUTPUT: &nbsp;&nbsp; ``` Hello John (ID: #123) ```

	```
	$ python3 main.py 456
	```
	> OUTPUT: &nbsp;&nbsp; ``` Hello Mary (ID: #456) ```

	```
	$ python3 main.py 789
	```
	> OUTPUT: &nbsp;&nbsp; ``` Hello Sebina (ID: #789) ```
