DH_VERSION=devicehive/devicehive-java:1.3.1
NAME=devicehive-server
PG_NAME=devicehive-postgresql

EXTERNAL_IP?=$(shell ip r get 8.8.8.8 2>/dev/null | head -1 | awk '{print $$7}')$(shell boot2docker ip 2>/dev/null)

DH_DOMAIN?=$(EXTERNAL_IP)
DH_PORT?=8080
DH_URL=http://$(DH_DOMAIN):$(DH_PORT)/DeviceHive/rest

PG_DATABASE=dh
PG_USER=dh_user
PG_PASSWORD=dh_StrOngPasSWorD

all: build run

build:
	# run postgres
	docker run -d --name $(PG_NAME) postgres:9.3.5
	
	sleep 10
	# add trust record
	docker exec $(PG_NAME) bash -c "echo -e ""host all all 0.0.0.0/0 trust"" >> /var/lib/postgresql/data/pg_hba.conf"
	docker stop $(PG_NAME)
	docker start $(PG_NAME)

	# create user
	docker exec $(PG_NAME) psql -U postgres -c "CREATE DATABASE $(PG_DATABASE);"
	docker exec $(PG_NAME) psql -U postgres -c "CREATE USER $(PG_USER) WITH password '$(PG_PASSWORD)'; GRANT ALL privileges ON DATABASE $(PG_DATABASE) TO $(PG_USER);"

	# migrate db
	docker run -ti --link $(PG_NAME):postgres --rm "$(DH_VERSION)" \
	sh -c 'java -jar /root/dh_dbtool.jar -migrate -url jdbc:postgresql://$${POSTGRES_PORT_5432_TCP_ADDR}/${PG_DATABASE} -user ${PG_USER} -password ${PG_PASSWORD}'
	docker stop $(PG_NAME)

run:
	docker start $(PG_NAME)
	docker run -d -p $(DH_PORT):8080 --name $(NAME) --link $(PG_NAME):postgres -e "PG_USER=$(PG_USER)" -e "PG_PASSWORD=$(PG_PASSWORD)" -e "PG_DATABASE=$(PG_DATABASE)" -e "DH_DOMAIN=$(DH_DOMAIN)" -e "DH_PORT=$(DH_PORT)" -e "DH_PROTOCOL=http" $(DH_VERSION)

	set +e ; \
	echo "Waiting for the instance to be up" ; \
	FINISH=0 ; \
	while [ $${FINISH} -eq 0 ]; do \
		echo "Attempt to get DeviceHive info in 10 seconds" ; \
		sleep 10 ; \
	    curl --fail -s ${DH_URL}"/info" ; \
	    if [ $$? -eq 0 ]; then \
	        FINISH=1 ; \
	        echo "Instance is up and running" ; \
	    fi \
	done ; \
	set -e

clean:
	docker stop $(NAME)
	docker stop $(PG_NAME)
	docker rm $(PG_NAME)
	docker rm $(NAME)

logs:
	docker logs $(NAME)

attach-pg:
	docker exec -ti $(PG_NAME) bash

logs-pg:
	docker logs $(PG_NAME)
