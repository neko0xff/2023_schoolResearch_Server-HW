port="3095:3095"
image="neko_0xff/sensor_api"
NetworkMode="host"
docker run --network=$NetworkMode --restart=always -p $port -d $image 