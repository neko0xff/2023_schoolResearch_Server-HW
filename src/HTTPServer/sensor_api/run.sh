port1="3095:3095"
port2="3094:3094"
image="neko_0xff/sensor_api"
NetworkMode="host"
docker run --network=$NetworkMode --restart=always -p $port1 -p $port2 -d $image 