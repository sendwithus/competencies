# Competency - GitHub

Version control 

## How do you prove it?

You can clone a project, create a branch, handle merge conflicts, squash, create a pull request.

Do a code review on a Pull Request.

Can verbally explain git and github to someone else and help them learn the git processes.

Can safely and securely use git and github.

Knows the difference between squashing and merging

Great at Pull Requests

## How do you improve it?

Read the github manual ([https://git-scm.com/book/en/v2](https://git-scm.com/book/en/v2)) 

Memorize the basic set of commands ([https://www.git-tower.com/blog/git-cheat-sheet/](https://www.git-tower.com/blog/git-cheat-sheet/)) 

Learn hub ([https://github.com/github/hub](https://github.com/github/hub)) 

Git Extras for common use-cases -[ https://github.com/tj/git-extras](https://github.com/tj/git-extras)

# Competency - GitHub - Level 2

Have achieved all the things for the basic competency and additionally can administer GitHub {teams, orgs, security} and help with advanced git issues.

## How do you prove it?

People come to you and say things like, "I did this merge and now I'm in a tangle of branches and somebody did a force push and now I'm stuck", and you can calmly untangle the knot. This can involve solving merge-conflicts, cherry-picking commits from other branches, and rebasing.

You can integrate and manage webhooks and build process tie ins.  

You can explain how git hashing works and explain the pros and cons in relation to other version control systems such as svn and mercurial.

You can explain and use pre and post hooks.

You understand and can modify configuration in .git/config.

## How do you improve it?

Read ALL the github manual ([https://git-scm.com/book/en/v2](https://git-scm.com/book/en/v2)) and build prototypes.

Learn how to set up machine users: https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users

Read blogs about people doing weird things to git (like using it as a database [https://www.kenneth-truyers.net/2016/10/13/git-nosql-database/](https://www.kenneth-truyers.net/2016/10/13/git-nosql-database/)) 

Try experiments in git and github.  

Build your own git aliases.

Clean a repository's history of all files larger than 200kb.

Build a GitHub PR plugin.

~/.gitconfig add `autocorrect = -1` turns on autocorrect on your git commands.  So `git statsu` --> `git status` automatically.  :

If using GitHub apps Status Checks, you can [skip Status Checks](https://help.github.com/articles/about-status-checks/#skipping-and-requesting-checks-for-individual-commits) on a per-commit basis (instead of closing quote, add two new lines, followed by `skip-checks: true`)
```
$ git commit -m "Update README.

>

>

skip-checks: true

```

Install and learn `tig` https://github.com/jonas/tig
