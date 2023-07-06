image="neko_0xff/IoTGateway_Server"
NetworkMode="host"
docker build . -t $image --network=$NetworkMode