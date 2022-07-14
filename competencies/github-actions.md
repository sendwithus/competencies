# Competency - GitHub Actions Level 1

GitHub Actions are an API for cause and effect on GitHub: orchestrate any workflow, based on any event, while GitHub manages the execution, provides rich feedback, and secures every step along the way. With GitHub Actions, workflows and steps are just code in a repository, so you can create, share, reuse, and fork your software development practices.

## How do you prove it?
* You can create a workflow that automatically runs tests for your code.
* You can use branch protection to only allow pull requests to be merged if the tests pass.
* You can list three events that can trigger a workflow to run and explain the use cases of each.
* You can explain the differences between workflows, events, jobs, steps, actions, and runners.
* You can add an action from the [GitHub Marketplace](https://github.com/marketplace) to your workflow.
* You know why you should use commit hashes instead of tags or branch names for third party actions.
* You know why you should review an action's code before you add it to your repository.
* You know how to securely store secrets within GitHub, and are aware of the security risks in not doing so.

## How do you improve it?
* Read the [docs](https://docs.github.com/en/free-pro-team@latest/actions)
* Read [Use GitHub actions at your own risk](https://julienrenaux.fr/2019/12/20/github-actions-security-risk/)

# Competency - GitHub Actions Level 2

## How do you prove it?
* You can list three actions from the GitHub Marketplace and explain the use cases of each.
* You can create a workflow that produces packages (such as NPM packages) and uploads them to GitHub Packages or another package hosting service.
* You know how to cache dependencies using `actions/cache@v2` in order to speed up workflows.
* You know how to add conditional steps, such as `if: github.event.pull_request.draft == false`, to a job.
* You know how to use `upload-artifact` and `download-artifact` actions in order to persist and share data across workflows.
* You know how to create workflow templates and use templates created by others.

## How do you improve it?
* Read the [docs](https://docs.github.com/en/free-pro-team@latest/actions)
