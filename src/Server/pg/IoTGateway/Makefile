CC1:=docker compose
CC2:=npm
IMAGE:=IoTGateway

.PHONY: build-img build-apidoc up logs stop clean test-mqtt

all: stop clean build-img

build-img:
	@$(CC1) up --build -d

build-apidoc:
	@$(CC2) run swagger-autogen

test-mqtt:
	@$(CC2) run mqttTest-Sub

up:
	@$(CC1) up -d

logs:
	@$(CC1) logs --tail=100 -f

stop:
	@$(CC1) stop

clean:
	@$(CC1) down
