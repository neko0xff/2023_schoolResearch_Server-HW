sleep_time=30
echo "---------------------------------------------------------"
echo "Add Firewall rule in Firewalld"
echo "---------------------------------------------------------"
firewall-cmd --add-port=8000/tcp --permanent
firewall-cmd --add-port=8082/tcp --permanent
firewall-cmd --add-port=8083/tcp --permanent
firewall-cmd --add-port=8084/tcp --permanent
firewall-cmd --add-port=8086/tcp --permanent
firewall-cmd --add-port=9000/tcp --permanent
sleep $sleep_time
echo "---------------------------------------------------------"
echo "Firewall now reload a new rule "
echo "---------------------------------------------------------"
firewall-cmd --reload