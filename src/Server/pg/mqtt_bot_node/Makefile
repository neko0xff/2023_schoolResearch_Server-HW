CC1:=docker compose
IMAGE:=Telegram_bot2

.PHONY: build up logs stop clean pnpm-start

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
