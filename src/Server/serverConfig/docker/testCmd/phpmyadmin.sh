ContainerName="phpmyadmin"
port1="8083:80"
restartMode="always"
volume1="/var/run/docker.sock:/var/run/docker.sock"
env1="PMA_ARBITRARY=1"
image="phpmyadmin/phpmyadmin:latest"

echo "Set Container"
docker run -d -p $port1 --name=$ContainerName --restart=$restartMode -v $volume1 -e $env1 $image
echo "Set Firewall"
firewall-cmd --add-port=8083/tcp --permanent
firewall-cmd --reload