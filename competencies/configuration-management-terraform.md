# Competency - Configuration Management - Terraform

Terraform is part of our infrastructure as code initiative. It allow us to review our infrastructure before deploying it. It also keep for us a state of our infrastructure at a instant and will always try to revert to that instant in case unwanted changes. 

Wikipedia: [https://en.wikipedia.org/wiki/Terraform_(software)](https://en.wikipedia.org/wiki/Terraform_(software)) 

Home: [https://www.terraform.io/](https://www.terraform.io/) 

## How do you prove it?

You can import an already existing resource into terraform.

You can create a module from scratch that will start an aws instance using the last version of ubuntu.

You can create a RDS instance using an external module.

You can explain Terraform lock state and enforce it.

You can, in case of emergency or corrupted state, interact with the terraform state file.

You can force the rebuild of a resource.

## How do you improve it?

Tao:

* [https://www.hashicorp.com/tao-of-hashicorp](https://www.hashicorp.com/tao-of-hashicorp)

Books:

* [Terraform Up & Running](https://www.amazon.ca/Terraform-Running-Writing-Infrastructure-Code/dp/1491977086?th=1&psc=1&source=googleshopping&locale=en-CA&tag=googcana-20&ref=pd_sl_2e491zlwv6_e)

* [Infrastructure As Code](http://shop.oreilly.com/product/0636920039297.do)

Videos:

* [Hashicorp Youtube](https://www.youtube.com/channel/UC-AdvAxaagE9W2f0webyNUQ/playlists)

Blogs:

* [https://gruntwork.io](https://gruntwork.io) 

    * [https://blog.gruntwork.io/an-introduction-to-terraform-f17df9c6d180](https://blog.gruntwork.io/an-introduction-to-terraform-f17df9c6d180)

    * [https://blog.gruntwork.io/a-comprehensive-guide-to-terraform-b3d32832baca](https://blog.gruntwork.io/a-comprehensive-guide-to-terraform-b3d32832baca) 

### Resources

Official module registry: [https://registry.terraform.io/](https://registry.terraform.io/)

Pretty print your output: [https://github.com/coinbase/terraform-landscape](https://github.com/coinbase/terraform-landscape) 

Manage terraform changes from a PR: [https://www.runatlantis.io/](https://www.runatlantis.io/)

