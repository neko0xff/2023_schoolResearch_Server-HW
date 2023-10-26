port1="8085:3000"
volume1="/var/run/docker.sock:/var/run/docker.sock"
image="grafana/grafana-oss"
ContainerName="grafana-oss"
docker run -d -v $volume1 -p $port1 --name=$ContainerName $image