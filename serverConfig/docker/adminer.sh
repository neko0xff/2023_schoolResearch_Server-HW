ContainerName="adminer"
restartMode="always"
port1="8084:8080"
volume1="/var/run/docker.sock:/var/run/docker.sock"
image="adminer:latest"

echo "Set Container"
docker run -d -p $port1 --name=$ContainerName --restart=$restartMode -v $volume1 $image
echo "Set Firewall"
firewall-cmd --add-port=8080/tcp --permanent
firewall-cmd --reload