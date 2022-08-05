# Competency - Prometheus

Prometheus is an open-source systems monitoring and alerting toolkit.

## How do you prove it?
* Understand the dimensions used in the data model: time series, metric names, and key/value labels.
* Explain the differences between a counter, a gauge, and a histogram.
* Give example use cases for each of these three metric types.
* Add a metric to an application using one of the Prometheus client libraries.
* Know the difference between the pull and push models for data collection and when you might need to use each one.
* Know how to expose an application's metrics to be collected by Prometheus according to the pull model.
* Know how to push metrics to Prometheus according to the push model.
* Write a PromQL query for each of the three metric types.
* Understand best practices for metric names and the usage of labels, particularly with respect to time series
  cardinality.

## How do you improve it?
* Read the [docs](https://prometheus.io/docs/introduction/overview/), particularly these sections:
  * [Concepts](https://prometheus.io/docs/concepts/data_model/)
  * [Querying](https://prometheus.io/docs/prometheus/latest/querying/basics/)
  * [Best Practices](https://prometheus.io/docs/practices/naming/)
* Write queries against existing metrics in [Grafana](stats.kube.searchspring.io/explore).
* Pick a [client library](https://prometheus.io/docs/instrumenting/clientlibs/) and build a metric with it.
* Study how we expose metrics to be scraped in k8s.
  * [Annotations](https://github.com/searchspring/search-api/blob/eccc9342f09271bfc4313250a46249c0adb65afa/kubernetes/api/base/deploy.yml#L21-L23)
  * [Exposed endpoint](https://github.com/searchspring/search-api/blob/eccc9342f09271bfc4313250a46249c0adb65afa/kubernetes/api/base/deploy.yml#L145-L147)
* Learn how to use [push metrics](https://prometheus.io/docs/instrumenting/pushing/).
  * [Internal Example](https://github.com/searchspring/k8s-cronjobs/blob/main/mysql-indexing-queue-stats/command.yml)
