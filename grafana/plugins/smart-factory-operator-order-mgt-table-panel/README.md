## Order Mgt Table Panel for operator
Custom Plugin that enables the operator to create and realease order

------

### InfluxDB Query example: 
SELECT last("order_date") AS "order_date", last("order_state") AS "order_state", last("order_qty") AS "order_qty", sum("completion_qty") AS "completed_qty", last("setpoint_rate") AS "setpoint_rate", last("production_line") AS "production_line" FROM "OrderPerformance" WHERE ("production_line" = '$Site | $Area | $Line') AND $timeFilter GROUP BY "product_desc", "product_id", "order_id"

-------

### Data format
Data MUST be formatted as a TABLE!

