NAME=devicehive-demo-bridge
TAG=devicehive-bridge:1.0.0

#EXTERNAL_IP=$(shell boot2docker ip 2>/dev/null || echo "localhost")
EXTERNAL_IP=$(shell ip r get 8.8.8.8 2>/dev/null | head -1 | awk '{print $$7}' || echo "localhost")

ES_URL?=http://$(EXTERNAL_IP):9200/
DH_URL?=http://$(EXTERNAL_IP):8080/DeviceHive/rest
DEVICE_ID?=demo-device

ENV= -e "serviceUrl=$(DH_URL)" -e "deviceId=$(DEVICE_ID)" -e "elastic-host=$(ES_URL)"

all: build run

build:
	docker build -t $(TAG) .

run:
	$(eval ACCESS_KEY:=$(shell curl -s --user dhadmin:dhadmin_\#911 "$(DH_URL)/user/1/accesskey" -H 'Content-Type: application/json' --data-binary '{"permissions":[{"domains":null,"subnets":null,"actions":["GetNetwork","GetDevice","GetDeviceState","GetDeviceNotification","GetDeviceCommand","RegisterDevice","CreateDeviceNotification","CreateDeviceCommand","UpdateDeviceCommand"],"networkIds":null,"deviceGuids":null}],"label":"Admin key","expirationDate":null}' | python -c 'import json,sys;obj=json.load(sys.stdin);print obj["key"]'))
	@echo Access key: $(ACCESS_KEY)

	docker run -d --name $(NAME) $(ENV)  -e "accessKey=$(ACCESS_KEY)" $(TAG)

stop:
	docker stop $(NAME)

clean: stop
	docker rm $(NAME)
	docker rmi $(TAG)
	rm -rf node_modules

logs:
	docker logs $(NAME)
