# Competencies

A project to help you manage your employees careers.

Why - your employees care deeply about their career.  They want to learn, they want to contribute to the company and they want to see a direct path to progression and increase in pay.
This tool allows you to accomplish all of that.

### Goals
- Zero cost.  To run, to use.
- Open-source so all companies can contribute back to the tool in terms of roles, competencies and the tool itself.
- Private and secure. All data should belong to the company using the tool.  By all, we mean all.  No logs, no tracking, no usage data and definitely no PII outside of your company infrastructure.

### Competency Rules
Competencies should be agnostic to the company.  Try and create competencies that are useful no matter what your company.

## Usage

Go to: https://searchspring.github.io/competencies/index.html and sign in with your Google account.

## Glossary

**Role**: A role is a document describing a role and containing a list of competencies that are helpful in excelling in that role.

**Competency**: Each competency document is broken into three sections.
- Title and Description
A brief overview of what the skill is.  For example `Github` is the title of the competency and technology we use for version control.
- How do you prove it?
A section detailing how you would prove to your direct manager that you have this competency.  What is that manager going to look for to verify this skill.  This section is by far the most challenging as sometimes the task will be a technical skill that the manager doesn't have.  Or it might a soft skill like `One on Ones` that requires feedback from the employees team members.
- How do you improve it?
This is the section that lists of resources to improve this skill set.  This section tends to grow over time as tribal knowledge can be captured and stored here.

**Snippets**: Snippets are sections of text that can be included in a role rather than copy/pasting the text in multilpe places.

## Fork your own copy

If you're going to use this project for your company you will probably want to create your own role docs and that will require you to fork this project into your organization's github account.  Here are the steps.

### Prerequisites

1. Install Go (https://golang.org/doc/install)
1. Install NodeJS (https://nodejs.org/en/download/)

### Setup

1. Fork the project.
1. Create a new GCP Oauth consent screen.  Internal only if it's just for employees on a single domain, or you'll have to jump through the hoops of making it a public app and the Goog will ask you to verify your domain etc...  Create a new one here: https://console.cloud.google.com/apis/credentials/consent add a scope of `auth/spreadsheets` so that we can edit spreadsheets with this app.
1. Create new OAuth credentials here: https://console.cloud.google.com/apis/credentials.  You want an OAuth 2.0 Client ID for a web application.   Your authorized domains should be `http://localhost:8080` for testing and whatever domain you're going to be running this service on.
1. In your forked github project edit `app.js`, and change the `CLIENT_ID` to the one you generated in the step above.

Run locally by

Compiling the roles and competencies into html files

```bash
go run main.go
```

If you want to run this compilation in a loop use  `watch`

```bash
watch -n 2 go run main.go
``` 

Then run the http server

```bash
npx http-server docs
```

Now go to http://localhost:8080
