sleep_time=30
echo "---------------------------------------------------------"
echo "Add Firewall rule in Firewalld"
echo "---------------------------------------------------------"
firewall-cmd --add-port=3095/tcp --permanent
firewall-cmd --add-port=3094/tcp --permanent
sleep $sleep_time
echo "---------------------------------------------------------"
echo "Firewall now reload a new rule "
echo "---------------------------------------------------------"
firewall-cmd --reload

