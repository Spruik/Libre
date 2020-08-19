# Try it Out

Try out Libre before spending time on setup. Alternatively checkout the [Spruik Technologies](https://www.youtube.com/channel/UCLSo9vtYPXkuOJkXNnooCjQ) youtube channel for videos.

## Prerequisits

- docker (>= 18 required)
- docker-compose (>= 1.25  required)
- git (>= 1.25  optional)

## Running

1. Clone this repository `git clone https://github.com/Spruik/Libre`

```shell
$ git clone https://github.com/Spruik/Libre
Cloning into 'Libre'...
remote: Enumerating objects: 165, done.
remote: Counting objects: 100% (165/165), done.
remote: Compressing objects: 100% (115/115), done.

Receiving objects: 100% (165/165), 176.45 KiB | 3.60 MiB/s, done.
Resolving deltas: 100% (49/49), done.

```

2. Start Libre with Libre Simulator `docker-compose -f docker-compose.yml -f docker-compose.sim.yml up -d`

```shell
$ docker-compose -f docker-compose.yml -f docker-compose.sim.yml up -d
Creating network "libre-grafana_default" with the default driver
Creating volume "libre-grafana_grafana_plugins" with default driver
Creating volume "libre-grafana_grafana_provisioning" with default driver
Creating volume "libre-grafana_postgres_data" with default driver
Creating volume "libre-grafana_influx_data" with default driver
Creating libre-grafana_influx_1   ... done
Creating libre-grafana_postgres_1    ... done
Recreating libre-grafana_simulator_1 ... done
Creating libre-grafana_postREST_1    ... done
Creating libre-grafana_grafana_1     ... done

```

3. Navigate to `https://localhost:3000` log into grafana with username admin and password admin. Explore the SmartFactory dashboard folder.

4. Navigate to `https://localhost:3000` to start/stop and complete a line.

![Simulation](simulator.png)

## Example
