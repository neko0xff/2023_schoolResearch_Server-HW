CC1:=docker compose
IMAGE:=crawlerdata

.PHONY: build-img up logs stop clean

all: stop clean build-img

build-img:
	@$(CC1) up --build -d

up:
	@$(CC1) up -d

logs:
	@$(CC1) logs --tail=100 -f

stop:
	@$(CC1) stop

clean:
	@$(CC1) down
