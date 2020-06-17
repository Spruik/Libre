# Dockerfile
FROM grafana/grafana:6.7.4

COPY ./provisioning/datasources/*.yaml /etc/grafana/provisioning/datasources/

COPY ./provisioning/dashboards/*.yaml /etc/grafana/provisioning/dashboards/
COPY ./provisioning/dashboards/smart-factory/*.json /etc/grafana/provisioning/dashboards/smart-factory/

COPY ./plugins/smart-factory-equipment-crud-tree-chart-panel/dist /var/lib/grafana/plugins/smart-factory-equipment-crud-tree-chart-panel/
COPY ./plugins/smart-factory-event-editor-table-panel/dist /var/lib/grafana/plugins/smart-factory-event-editor-table-panel/
COPY ./plugins/smart-factory-material-crud-table-panel/dist /var/lib/grafana/plugins/smart-factory-material-crud-table-panel/
COPY ./plugins/smart-factory-operation-crud-table-panel/dist /var/lib/grafana/plugins/smart-factory-operation-crud-table-panel/
COPY ./plugins/smart-factory-operator-order-mgt-table-panel/dist /var/lib/grafana/plugins/smart-factory-operator-order-mgt-table-panel/
COPY ./plugins/smart-factory-pareto-reason-codes-bar-chart-panel/dist /var/lib/grafana/plugins/smart-factory-pareto-reason-codes-bar-chart-panel/
COPY ./plugins/smart-factory-pareto-reason-codes-pie-chart-panel/dist /var/lib/grafana/plugins/smart-factory-pareto-reason-codes-pie-chart-panel/
COPY ./plugins/smart-factory-pareto-reason-codes-sunburst-chart-panel/dist /var/lib/grafana/plugins/smart-factory-pareto-reason-codes-sunburst-chart-panel/
COPY ./plugins/smart-factory-prod-line-time-setter-panel/dist /var/lib/grafana/plugins/smart-factory-prod-line-time-setter-panel/
COPY ./plugins/smart-factory-production-schedule-gantt-chart-panel/dist /var/lib/grafana/plugins/smart-factory-production-schedule-gantt-chart-panel/
COPY ./plugins/smart-factory-products-crud-table-panel/dist /var/lib/grafana/plugins/smart-factory-products-crud-table-panel/
COPY ./plugins/smart-factory-qacheck-history-table-panel/dist /var/lib/grafana/plugins/smart-factory-qacheck-history-table-panel/
COPY ./plugins/smart-factory-reason-codes-crud-tree-chart-panel/dist /var/lib/grafana/plugins/smart-factory-reason-codes-crud-tree-chart-panel/
COPY ./plugins/smart-factory-scheduler-order-mgt-table-panel/dist /var/lib/grafana/plugins/smart-factory-scheduler-order-mgt-table-panel/
