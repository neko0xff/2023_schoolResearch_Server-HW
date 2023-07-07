echo "Set Container"
docker run -d -p 9515:9515 --name=mqttExplorer --restart=always -v /var/run/docker.sock:/var/run/docker.sock ccll/mqtt-explorer
echo "Set Firewall"
firewall-cmd --add-port=9515/tcp --permanent
firewall-cmd --add-port=9515/udp --permanent
firewall-cmd --reload