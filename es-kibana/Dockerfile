FROM nshou/elasticsearch-kibana:latest

ADD ./kibana/temperature-dashboard.json /kibana/app/dashboards/default.json
ADD ./kibana/light-dashboard.json /kibana/app/dashboards/light.json

VOLUME /elasticsearch/data/

