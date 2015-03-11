FROM nshou/elasticsearch-kibana:latest

ADD ./kibana/temperature-dashboard.json /kibana/app/dashboards/default.json
ADD ./kibana/accelerometer-dashboard.json /kibana/app/dashboards/accelerometer.json

VOLUME /elasticsearch/data/

