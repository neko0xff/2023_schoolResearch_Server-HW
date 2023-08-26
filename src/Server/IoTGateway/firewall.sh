echo "Add Firewall rule(Firewalld)"
firewall-cmd --add-port=3095/tcp --permanent
firewall-cmd --add-port=3094/tcp --permanent
firewall-cmd --reload