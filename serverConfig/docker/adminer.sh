echo "Set Container"
docker run -d -p 8080:8080 --name=adminer --restart=always -v /var/run/docker.sock:/var/run/docker.sock adminer:latest
echo "Set Firewall"
firewall-cmd --add-port=8080/tcp --permanent
firewall-cmd --reload