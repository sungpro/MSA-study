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