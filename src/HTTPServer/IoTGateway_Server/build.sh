image="neko_0xff/ioTGateway_Server"
NetworkMode="host"
docker build . -t $image --network=$NetworkMode