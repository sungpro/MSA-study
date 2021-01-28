# MicroServices with Go & gRPC & Python

This is a simple and trivial tutorial on using gRPC in Go to enable communication between a **Go server** and a **Python client** (unary RPC mode). A majority of code was referenced from the quickstart sections from the [official gRPC docs](https://grpc.io/docs/); however, modified slightly.

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

## `go mod init` (make the current directory the root of a module)
```sh
$ go mod init github.com/sungpro/MSA-study/week1
```

## Define Protobufs

Create a file named `helloworld.proto` in the project directory, which contains the following code.

```go
syntax = "proto3";

option go_package = "github.com/sungpro/MSA-study/week1/helloworld/helloworld";
option java_multiple_files = true;
option java_package = "io.grpc.examples.helloworld";
option java_outer_classname = "HelloWorldProto";

package helloworld;

// The greeting service definition.
service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply) {} // Sends a greeting
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

## Generate gRPC code to use in Go server

Run the following code in terminal to auto-generate gRPC code.

```sh
$ protoc \
	--go_out=. --go_opt=paths=source_relative \
	--go-grpc_out=. --go-grpc_opt=paths=source_relative \
	helloworld/helloworld.proto
```

This will compile `helloworld.proto` file and generate the `helloworld.pb.go` and `helloworld_grpc.pb.go` files in `helloworld` directory, which contain:
-   Code for populating, serializing, and retrieving  `HelloRequest`  and  `HelloReply`  message types.
-   Generated client and server code.

## Write some server code which implements the generated gRPC code

Create a file named `main.go` in the project directory, which contains the following code.

```go
package main

import (
	"context"
	"log"
	"net"

	"google.golang.org/grpc"
	// pb "google.golang.org/grpc/examples/helloworld/helloworld"
	pb "github.com/sungpro/MSA-study/week1/helloworld"
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
		name = "" // name is emtpy if not found on DB
	}
	// //////////////////////////////////////////////////

	if name != "" {
		return &pb.HelloReply{Message: "Hello, " + name + ", welcome!"}, nil
	} else {
		return &pb.HelloReply{Message: ""}, nil
	}

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

## Generate gRPC code to use in Python client

Run the following code in terminal to auto-generate gRPC code.

```python
python -m grpc_tools.protoc -I helloworld/ \
  --python_out=client/ --grpc_python_out=client/ \
	helloworld/helloworld.proto
```

This generates `helloworld_pb2.py` which contains our generated request and response classes and `helloworld_pb2_grpc.py` which contains our generated client and server classes in `client` directory.

## Write some client code which implements the generated gRPC code

Create a file named `main.py` in the project directory, which contains the following code.

```python
import sys
import grpc
import helloworld_pb2
import helloworld_pb2_grpc


def run(id):
  with grpc.insecure_channel('localhost:50051') as channel:
    stub = helloworld_pb2_grpc.GreeterStub(channel)
    response = stub.SayHello(helloworld_pb2.HelloRequest(id=id))

  if response.message != "":
    output = f"{response.message} (ID: #{id})"
  else:
    output = f"Wait... I don't know you! (ID: #{id})"
    
  print(output)


if __name__ == "__main__":
  if len(sys.argv) != 2:
    sys.exit("You may look-up one person at a time using their ID. (Try '123', '456', or '789')")
  
  run(sys.argv[1])
```

## Run

We have defined the gRPC service using protocol buffers, a.k.a. protobuf and thus both the server and the client stub have a `SayHello()` RPC method that takes a `HelloRequest` parameter from the client and returns a `HelloReply` from the server. Now, let's test it out.

1. Run the server:
	```sh
	$ go run server/main.go
	```

2. From another terminal, run the client:

	```sh
	$ python client/main.py 123
	```
	> OUTPUT: &nbsp;&nbsp; ``` Hello, John, welcome! (ID: #123) ```

	```sh
	$ python client/main.py 456
	```
	> OUTPUT: &nbsp;&nbsp; ``` Hello, Mary, welcome! (ID: #456) ```

	```sh
	$ python client/main.py 789
	```
	> OUTPUT: &nbsp;&nbsp; ``` Hello, Sebina, welcome! (ID: #789) ```

	```sh
	$ python client/main.py 777 # error case
	```
	> OUTPUT: &nbsp;&nbsp; ``` Wait... I don't know you! (ID: #777) ```