# Dockerfile
FROM grafana/grafana:6.7.4

LABEL maintainer="Tom Hollingworth <tom.hollingworth@spruiktec.com>"

#
# Copy in Provisioned datasources & dashboards
#

COPY ./provisioning/datasources/*.yaml /etc/grafana/provisioning/datasources/
COPY ./provisioning/dashboards/*.yaml /etc/grafana/provisioning/dashboards/
COPY ./provisioning/dashboards/smart-factory/*.json /etc/grafana/provisioning/dashboards/smart-factory/

#
# Add in latest versions of all plugins
# - One liners so we down leave container layers and bloat our container
#
RUN cd /var/lib/grafana/plugins \
  && wget https://github.com/Spruik/Libre-Operation-CRUD-Table-Panel/releases/latest/download/libre-operation-crud-table-panel.tar.gz \
  && mkdir ./libre-operation-crud-table-panel \
  && tar -xf libre-operation-crud-table-panel.tar.gz -C ./libre-operation-crud-table-panel \
  && rm libre-operation-crud-table-panel.tar.gz

RUN cd /var/lib/grafana/plugins \
  && wget https://github.com/Spruik/Libre-Downtime-Sunburst-Chart-Panel/releases/latest/download/libre-downtime-sunburst-chart-panel.tar.gz \
  && mkdir ./libre-downtime-sunburst-chart-panel \
  && tar -xf libre-downtime-sunburst-chart-panel.tar.gz -C ./libre-downtime-sunburst-chart-panel \
  && rm libre-downtime-sunburst-chart-panel.tar.gz

RUN cd /var/lib/grafana/plugins \
  && wget https://github.com/Spruik/Libre-Equipment-CRUD-Tree-Chart-Panel/releases/latest/download/libre-equipment-crud-tree-chart-panel.tar.gz \
  && mkdir ./libre-equipment-crud-tree-chart-panel \
  && tar -xf libre-equipment-crud-tree-chart-panel.tar.gz -C ./libre-equipment-crud-tree-chart-panel \
  && rm libre-equipment-crud-tree-chart-panel.tar.gz

RUN cd /var/lib/grafana/plugins \
  && wget https://github.com/Spruik/Libre-Reason-Codes-CRUD-Tree-Chart-Panel/releases/latest/download/libre-reason-codes-crud-tree-chart-panel.tar.gz \
  && mkdir ./libre-reason-codes-crud-tree-chart-panel \
  && tar -xf libre-reason-codes-crud-tree-chart-panel.tar.gz -C ./libre-reason-codes-crud-tree-chart-panel \
  && rm libre-reason-codes-crud-tree-chart-panel.tar.gz

RUN cd /var/lib/grafana/plugins \
  && wget https://github.com/Spruik/Libre-Production-Line-Time-Setter-Panel/releases/latest/download/libre-production-line-time-setter-panel.tar.gz \
  && mkdir ./libre-production-line-time-setter-panel \
  && tar -xf libre-production-line-time-setter-panel.tar.gz -C ./libre-production-line-time-setter-panel \
  && rm libre-production-line-time-setter-panel.tar.gz

RUN cd /var/lib/grafana/plugins \
    && wget https://github.com/Spruik/Libre-Material-CRUD-Table-Panel/releases/latest/download/libre-material-crud-table-panel.tar.gz \
    && mkdir ./libre-material-crud-table-panel \
    && tar -xf libre-material-crud-table-panel.tar.gz -C ./libre-material-crud-table-panel \
    && rm libre-material-crud-table-panel.tar.gz

RUN cd /var/lib/grafana/plugins \
    && wget https://github.com/Spruik/Libre-Product-CRUD-Table-Panel/releases/latest/download/libre-product-crud-table-panel.tar.gz \
    && mkdir ./libre-product-crud-table-panel \
    && tar -xf libre-product-crud-table-panel.tar.gz -C ./libre-product-crud-table-panel \
    && rm libre-product-crud-table-panel.tar.gz

RUN cd /var/lib/grafana/plugins \
    && wget https://github.com/Spruik/Libre-Scheduler-Order-Mgt-Table-Panel/releases/latest/download/libre-scheduler-order-mgt-table-panel.tar.gz \
    && mkdir ./libre-scheduler-order-mgt-table-panel \
    && tar -xf libre-scheduler-order-mgt-table-panel.tar.gz -C ./libre-scheduler-order-mgt-table-panel \
    && rm libre-scheduler-order-mgt-table-panel.tar.gz

RUN cd /var/lib/grafana/plugins \
    && wget https://github.com/Spruik/Libre-Operator-Order-Mgt-Table-Panel/releases/latest/download/libre-operator-order-mgt-table-panel.tar.gz \
    && mkdir ./libre-operator-order-mgt-table-panel \
    && tar -xf libre-operator-order-mgt-table-panel.tar.gz -C ./libre-operator-order-mgt-table-panel \
    && rm libre-operator-order-mgt-table-panel.tar.gz

RUN cd  /var/lib/grafana/plugins \
    && wget https://github.com/Spruik/Libre-Downtime-Pie-Chart-Panel/releases/latest/download/libre-downtime-pie-chart-panel.tar.gz \
    && mkdir ./libre-downtime-pie-chart-panel \
    && tar -xf libre-downtime-pie-chart-panel.tar.gz -C ./libre-downtime-pie-chart-panel \
    && rm libre-downtime-pie-chart-panel.tar.gz

RUN cd  /var/lib/grafana/plugins \
    && wget https://github.com/Spruik/Libre-Production-Schedule-Gantt-Chart-Panel/releases/latest/download/libre-production-schedule-gantt-chart-panel.tar.gz \
    && mkdir ./libre-production-schedule-gantt-chart-panel \
    && tar -xf libre-production-schedule-gantt-chart-panel.tar.gz -C ./libre-production-schedule-gantt-chart-panel \
    && rm libre-production-schedule-gantt-chart-panel.tar.gz

RUN cd  /var/lib/grafana/plugins \
    && wget https://github.com/Spruik/Libre-Event-Editor-Table-Panel/releases/latest/download/libre-event-editor-table-panel.tar.gz \
    && mkdir ./libre-event-editor-table-panel \
    && tar -xf libre-event-editor-table-panel.tar.gz -C ./libre-event-editor-table-panel \
    && rm libre-event-editor-table-panel.tar.gz

RUN cd  /var/lib/grafana/plugins \
    && wget https://github.com/Spruik/Libre-Downtime-Pareto-Chart-Panel/releases/latest/download/libre-downtime-pareto-chart-panel.tar.gz \
    && mkdir ./libre-downtime-pareto-chart-panel \
    && tar -xf libre-downtime-pareto-chart-panel.tar.gz -C ./libre-downtime-pareto-chart-panel \
    && rm libre-downtime-pareto-chart-panel.tar.gz
