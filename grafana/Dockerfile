# Dockerfile
FROM grafana/grafana:6.7.4

COPY ./plugins/ /var/lib/grafana/plugins/
COPY ./provisioning/datasources/*.yaml /etc/grafana/provisioning/datasources/

COPY ./provisioning/dashboards/*.yaml /etc/grafana/provisioning/dashboards/
COPY ./provisioning/dashboards/smart-factory/*.json /etc/grafana/provisioning/dashboards/smart-factory/
