# ![Libre](docs/libre-logo.png)

> Open source Manufacturing Execution and Performance Monitoring built on [Grafana](https://grafana.com), [Influx](https://www.influxdata.com/), and [Postgres](https://www.postgresql.org/).

Define your master data, push your machine metrics to modernize your manufacturing and start collecting and analysing your manufacturing data with Libre. Libre is an open source manufacturing execution and performance monitoring tool.

- _Define:_ Your manufacturing master data including your enterprise model, downtime reasons, products, ingredients and product steps.
- _Capture:_ Connect up your machines using a variety of methods into key buckets with an InfluxDB Historian
- _Use:_ Schedullers create and schedule orders, operators execute orders and capture downtime reasons.
- _Improve:_ Get key insights into your manufacturing, understand your biggest losses, visualize OEE.
- _Extensible:_ Built on Grafana, Influx and postgres push your key process parameters to view alongside your production dashboards. Extend with your Grafana dashboards.

## Try it out

Use the [Libre Simulator](https://github.com/Spruik/Libre-Simulator) to test out Libre. The quickest way to run Libre and the Libre Simulator it is with with docker-compose `docker-compose -f docker-compose.yml -f docker-compose.sim.yml up -d` command. This will start up Libre and the simulator together. After running the command, browse to `http://localhost:3000` to access Grafana and `http://localhost:1880` to control the simulation.

See [Try it out](/docs/try-it-out.md) for more information.

## Getting Started

### Installation

Libre requires the following on an x86 architecture server

- docker (>= 18 required)
- docker-compose (>= 1.25 required)
- git (>= 2 optional)

The `docker-compose.yml` file is required to start. Easiest way to get is to clone this repository.

```shell
$ git clone https://github.com/Spruik/Libre
Cloning into 'Libre'...
remote: Enumerating objects: 165, done.
remote: Counting objects: 100% (165/165), done.
remote: Compressing objects: 100% (115/115), done.

Receiving objects: 100% (165/165), 176.45 KiB | 3.60 MiB/s, done.
Resolving deltas: 100% (49/49), done.

$ docker-compose up -d
Creating libre-grafana_postgres_1 ... done
Creating libre-grafana_influx_1   ... done
Creating libre-grafana_postREST_1 ... done
Creating libre-grafana_grafana_1  ... done

$
```

#### Set Grafana Admin Password

Once Libre is installed and running. Navigate to `http://<server>:3000/` and you will be prompted to login. Use the default grafana login username `admin` and password `admin`. You will then be prompted to change the default password.

### Define your factory Model

Define your factory model using the provided `SmartFactory/Master Data` dashboard. Start by long-clicking the Enterprise in the equipment panel and add a Site. Long-click the newly created site and add an Area. Continue this process to add in a Line and equipment on the line. Add in any additional Sites, area, lines and equipment to mimic your enterprise.

Next, define your reason codes. Long click ReasonCodes in the Reason Codes panel and add a category. Once a category has been created, long click the category to add in a reason.

| Two recommend categories are `Planned` and `Unplanned`

Ingredients are added during product operations. Products are made up of a number of product operations. Finally products can be categorized by groups. Start by entering in Raw Material information by clicking the (+) on the Raw Material panel. These are the ingredients that go into your final product. Once raw materials have been added, add in the required Product Operationsin the Product Operation panel. Product Operations are the steps to manufacture the final product and is where a raw ingredient is added. For example `Fill Tank` or `Add Label`.

Once Raw Materials and Product Operations are added create a Product group using the Products Panel. Click the (+) and select Product Group, enter a name and save. Follow the same process and select Product. You can now add any number of product operations, and optionally an ingredient, to the product definition. At a minimum provide a product name, product group and save. Repeat for all your products.

Now that you have defined your factory model, downtime reasons, ingredients, product operations and products your are ready to start schedulling orders.

### Schedulling Orders

Schedule orders on your lines using the `SmartFactory/Schedulling` dashboard. To setup use the `Production Line Start Time Setter` to define the start time for each line. This is the time whereby an order will be first scheduled for the day. For 24hr operation, set to 12:00AM.

Use the `Scheduler Order Management Table` panel to create orders. Click the (+) define the order details and submit. Orders can be edited until they are released. Once an order has been released it can no longer be edited. Orders are edited by clicking in them in the panel. Orders have the following state model:

```mermaidjs
stateDiagram
  Created --> Released
  Released --> Next
  Released --> Running
  Released --> Closed
  Next --> Released
  Next --> Running
  Running --> Paused
  Paused --> Running
  Paused --> Complete
  Running --> Complete
  Paused --> Closed
  Complete --> Closed
```

The `SmartFactory/Line Schedule` dashboard shows the schedule for the selected manufacturing line. Orders can be set to next/running so that they are visible on the `SmartFactory/Line Performance` dashboard.

### Executing Orders and Integrating Machines

Orders be executed by clicking from the list in either `SmartFactory/Line Performance` or `SmartFactory/Line Schedule` and selecting Running. Only a single order can be Running at once per line. The Paused state can be used to pause orders until they are ready to be execute on again or completed. Once an order is running machine state and counts are logged against that order.

#### Integrating Machine State

Machines will need to push data to the following buckets and schemas.

#### Availability

The machine will need to publish to the `Availability` Influx bucket with the following information. It is important that the tags match the [model definition](#Define-your-factory-Model). Log data on state change.

- `Site`
- `Area`
- `Line`

and fields:

- `idle`, `stopped` - number -  ∈ [1, 0] for active / not active
- `stopped` - number -  ∈ [1, 0] for active / not active
- `held` - number -  ∈ [1, 0] for active / not active
- `execute` - number -  ∈ [1, 0] for active / not active
- `complete` - number - ∈ [1, 0] for active / not active
- `status` - string - ∈ ['idle', 'stopped', 'held', 'execute', 'complete']. String representation of state

the following fields are for classification of downtime category/reason. The Machine can self report (if known), otherwise leave blank. An operator can always split a reason and override

- `category` - string - Label of Category
- `reason` - string - Label of Reason
- `parentReason` - string - child reason of category (same as reason above)
- `comment` - string - Comment on the reason

#### Performance

The machine will need to publish to the `Performance` Influx bucket with the following information. It is important that the tags match the [model definition](#Define-your-factory-Model). Log data on state, planned rate or a significant actual_rate change.

- `Site`
- `Area`
- `Line`

and fields:

- `idle`, `stopped` - number -  ∈ [1, 0] for active / not active
- `stopped` - number -  ∈ [1, 0] for active / not active
- `held` - number -  ∈ [1, 0] for active / not active
- `execute` - number -  ∈ [1, 0] for active / not active
- `complete` - number - ∈ [1, 0] for active / not active
- `status` - string - ∈ ['idle', 'stopped', 'held', 'execute', 'complete']. String representation of state

the following fields are for performance calculation

- `planned_rate` - float - The planned rate or line theoretically best possible rate
- `actual_rate` - float - The actual machine rate

Ensure to use identical units for planned_rate and actual_rate.

#### Quality

The machine will need to publish to the `Quality` Influx bucket with the following information. It is important that the tags match the [model definition](#Define-your-factory-Model). Log data on state, planned rate or a significant actual_rate change.

- `Site`
- `Area`
- `Line`

and fields:

- `Temp` - number -  Quantity of good product this order

#### Order Performance

The machine will need to publish to the `OrderPerformance` Influx bucket with the following information. Log data on issued_qty change.

- `order_id`

and fields:

- `issued_qty` - number -  Quantity of good product this order

### Analysing the Manufacturing Data

Analyse your manufacturing data using the `SmartFactory/Line Performance` and `SmartFactory/Analysis` dashboards. Line Performance offers analysis of performance and availability whilst the Analysis dashboard drills into time loss through Downtime paretos and sunbursts of both Downtime duration and frequency.

## Contributing

For any issue, there are fundamentally three ways an individual can contribute:

- By opening the issue for discussion: For instance, if you believe that you have uncovered a bug in, creating a new issue in the [GitHub issue tracker](https://github.com/Spruik/Libre/issues) is the way to report it.
- By helping to triage the issue: This can be done either by providing supporting details (a test case that demonstrates a bug), or providing suggestions on how to address the issue.
- By helping to resolve the issue: Typically, this is done either in the form of demonstrating that the issue reported is not a problem after all, or more often, by opening a Pull Request that changes some bit of something in the panel in a concrete and reviewable manner.

## License

Libre is distrbuted under the [Apache 2.0 License](https://github.com/spruik/libre/blob/master/LICENSE).

## Change Log

- 1.0.0 Initial Public Release
