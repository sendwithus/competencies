# Competency - Kubernetes

Most of our systems are deployed in kubernetes.  

Kubernetes (commonly referred to as K8s) is an open-source system for automating deployment, scaling and management of containerized applications that was originally designed by Google and donated to the Cloud Native Computing Foundation. It aims to provide a "platform for automating deployment, scaling, and operations of application containers across clusters of hosts".It supports a range of container tools, including Docker

Wikipedia: [https://en.wikipedia.org/wiki/Kubernetes](https://en.wikipedia.org/wiki/Kubernetes) 

Home: [https://kubernetes.io/](https://kubernetes.io/) 

## How do you prove it?

You can explain what docker is good for and how it operates in relation to a k8s cluster.

You can build all the yaml files for a new service and deploy it into production.

You can explain what each of the parts of the yaml represent and common pitfalls of using them and how they relate to scale and reliability.

You can build an app with health check and graceful shutdown handling connected to liveness and readiness probes.

## How do you improve it?

Tinker locally with minikube, to gain an understanding of the API [https://github.com/kubernetes/minikube](https://github.com/kubernetes/minikube)

Nice little script for tailing multiple pods in k8s [https://github.com/johanhaleby/kubetail](https://github.com/johanhaleby/kubetail) 

And another one for gathering logs from multiple pods [https://github.com/wercker/stern](https://github.com/wercker/stern)

Great tool for fast switching between contexts and namespaces [https://github.com/ahmetb/kubectx](https://github.com/ahmetb/kubectx) - it works great in the [interactive mode](https://github.com/ahmetb/kubectx#interactive-mode)
