echo "Running a Service Dashboard"
docker-compose up -d
echo "Add Firewall rules"
firewall-cmd --add-port=8000/tcp --permanent
firewall-cmd --add-port=8083/tcp --permanent
firewall-cmd --add-port=8084/tcp --permanent
firewall-cmd --add-port=9000/tcp --permanent
firewall-cmd --reload
echo "Finnish Create Service Dashboard"
