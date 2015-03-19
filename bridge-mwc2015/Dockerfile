FROM node:0.10
ADD . /usr/src/myapp/
RUN cd /usr/src/myapp && npm i
COPY run-bridge.sh /run-bridge.sh
RUN chmod +x /run-bridge.sh
CMD ["/run-bridge.sh"]
