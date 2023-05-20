echo "Set Container"
docker volume create portainer_data
docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
echo "Set Firewall"
firewall-cmd --add-port=8000/tcp --permanent
firewall-cmd --add-port=9000/tcp --permanent
firewall-cmd --reload