port1="8000:8000"
port2="9000:9000"
ContainerName="portainer"
restartMode="always"
volume1="/var/run/docker.sock:/var/run/docker.sock"
volume2="portainer_data:/data"
image="portainer/portainer-ce"

echo "Set Container"
docker volume create portainer_data
docker run -d -p $port1 -p $port2 --name=$ContainerName --restart=$restartMode -v $volume1 -v $volume2 $image
echo "Set Firewall"
firewall-cmd --add-port=8000/tcp --permanent
firewall-cmd --add-port=9000/tcp --permanent
firewall-cmd --reload