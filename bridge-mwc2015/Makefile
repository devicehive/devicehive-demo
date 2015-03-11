NAME=devicehive-demo-bridge

EXTERNAL_IP=$(shell boot2docker ip 2>/dev/null || echo "localhost")

ES_URL?=http://$(EXTERNAL_IP):9200/
DH_URL?=http://$(EXTERNAL_IP):8080/DeviceHive/rest
DEVICE_ID?=demo-device

ENV= -e "serviceUrl=$(DH_URL)" -e "deviceId=$(DEVICE_ID)" -e "elastic-host=$(ES_URL)"

CDIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

all: build run

build:
	npm i

run:
	$(eval ACCESS_KEY:=$(shell curl --user dhadmin:dhadmin_\#911 "$(DH_URL)/user/1/accesskey" -H 'Content-Type: application/json' --data-binary '{"permissions":[{"domains":null,"subnets":null,"actions":["GetNetwork","GetDevice","GetDeviceState","GetDeviceNotification","GetDeviceCommand","RegisterDevice","CreateDeviceNotification","CreateDeviceCommand","UpdateDeviceCommand"],"networkIds":null,"deviceGuids":null}],"label":"Admin key","expirationDate":null}' | python -c 'import json,sys;obj=json.load(sys.stdin);print obj["key"]'))
	@echo Access key: $(ACCESS_KEY)

	docker run -dt --name $(NAME) $(ENV)  -e "accessKey=$(ACCESS_KEY)" -v "${CDIR}":/usr/src/myapp -w /usr/src/myapp node:0.10 node app.js

stop:
	docker stop $(NAME)

clean: stop
	docker rm $(NAME)
	rm -rf node_modules

logs:
	docker logs $(NAME)
