port1="3095:3095"
port2="3094:3094"
image="neko_0xff/sensor_api"
NetworkMode="host"
ContainerName="sensor_apiServer"
docker run --network=$NetworkMode --name=$ContainerName  --restart=always -p $port1 -p $port2 -d $image 