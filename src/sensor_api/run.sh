port="3000:3000"
image="neko_0xff/sensor_api"
docker run --network="host" --restart=always -p $port -d $image 