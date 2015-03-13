TAG=devicehive-demo-ek
NAME=devicehive-demo-ek

ES_MOUNT=-v $(shell pwd)/data:/elasticsearch/data/

KIBANA_PORT?=8081
ES_PORT?=9200

.PHONY: kibana

all: build run

build:
	docker build -t $(TAG) .

run:
	docker run -d -p $(KIBANA_PORT):8000 -p $(ES_PORT):9200 $(ES_MOUNT) -it --name $(NAME) $(TAG)

stop:
	docker stop $(NAME)

start:
	docker start $(NAME)
	
attach:
	docker exec -ti $(NAME) bash

remove:
	docker rm $(NAME)

clean: stop
	docker rm $(NAME)
	docker rmi $(TAG)

logs:
	docker logs $(NAME)
