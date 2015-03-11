EXTERNAL_IP=$(shell boot2docker ip 2>/dev/null || echo "localhost")

ES_HOST=$(EXTERNAL_IP)
ES_PORT=9200
ES_URL=http://$(ES_HOST):$(ES_PORT)

KIBANA_HOST:=$(EXTERNAL_IP)
KIBANA_PORT=8081

DH_DOMAIN=$(EXTERNAL_IP)
DH_PORT=8080
DH_URL=http://$(DH_DOMAIN):$(DH_PORT)/DeviceHive/rest

DEVICE_ID?=demo-device

.PHONY: bridge

all: build run

build:
	$(MAKE) -C bridge-mwc2015 build
	$(MAKE) -C es-kibana build
	$(MAKE) -C devicehive build
	
run:
	$(MAKE) -C devicehive run \
		DH_DOMAIN=$(DH_DOMAIN) \
		DH_PORT=$(DH_PORT)

	$(MAKE) -C es-kibana run \
		KIBANA_PORT=$(KIBANA_PORT) \
		ES_PORT=$(ES_PORT)

bridge:
	$(MAKE) -C bridge-mwc2015 run \
		DH_URL=$(DH_URL) \
		ES_URL=$(ES_URL) \
		DEVICE_ID=$(DEVICE_ID)

clean:
	$(MAKE) -C bridge-mwc2015 clean
	$(MAKE) -C es-kibana clean
	$(MAKE) -C devicehive clean
