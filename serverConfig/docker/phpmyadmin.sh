echo "Set Container"
docker run -d -p 8083:80 --name=phpmyadmin --restart=always -v /var/run/docker.sock:/var/run/docker.sock -e PMA_ARBITRARY=1 phpmyadmin/phpmyadmin:latest
echo "Set Firewall"
firewall-cmd --add-port=8083/tcp --permanent
firewall-cmd --reload