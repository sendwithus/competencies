# Development

## What the script is:
`competencySyncScript.gs` is what makes this project work. The script is written in Google Apps Script, a language based off of JavaScript that is specific to the G Suite products. The script takes configuration values from the Google Spreadsheet to which it is attached. You are free to use the script for your own projects. Follow the instructions below to start syncing your Google Drive documents to GitHub.

## What the script does:
The script's job is to go through the entire process of syncing your Drive files to GitHub. It first gets the contents of all files in the configured Google Drive folders. If a file already exists in the GitHub repo, any changes will be updated, or, if the file does not exist, a new file will be created in GitHub. It then commits all new files and changed files to the specified branch name. After all commits have been made, a pull request is created to merge the branch to `master`. An email will be sent to the configured address with a link to the pull request in GitHub. Don't worry if you delete the branch after merging - the script will create it again.

## How to use the script:
To use `competencySyncScript.gs`, first create a Google Spreadsheet, following the guidelines and mock spreadsheet below. Once you have your spreadsheet set up, you will need to attach the script. In your spreadsheet, go to <b>Tools > Script editor</b> and paste in the contents of the script. If this is a new spreadsheet, run the `triggers()` function in your script editor. This will install the trigger in your script, which will run your script once a week. Google will then prompt you to authorize the script to access your Google Drive. When that's all done, you're ready to go! Since the script runs on a time-based trigger, the only work you have to do is merge the pull request when you get the weekly email. If you want to run the script manually, you can run `main()` in the script editor.

## GitHub Personal Access Token
A GitHub personal access token is a key that allows a user to access their GitHub information throught the GitHub API. In order for the script to work, you will need to create a GitHub personal access token. Click on the icon in the top right corner of your GitHub homepage, then click <b>Settings > Developer settings > Personal access tokens > Generate new token</b>. Make sure to store your token somewhere secure, such as a password manager.

## Spreadsheet Configuration
|    | A                                   | B                      | C           |
|----|-------------------------------------|------------------------|-------|
| 1  | <b>Github Personal access token:</b>       |                        |
| 2  | *Github Personal access token**      |                        |
| 3  | <b>Email:</b>                              |                        |
| 4  | *Email address**                     |                        |
| 5  | <b>Repo name:</b>                          |                        |
| 6  | *Repo name**                         |                        |
| 7  | <b>Source Google Drive folder name(s):</b> |                        |
| 8  | *Folder name 1**                     | *Folder name 2*        |    *...*    |
| 9  | <b>Destination GitHub Folder Name(s):</b>  |
| 10 | *Folder name 1**                     | *Folder name 2*        |    *...*    |
| 11 | <b>Excluded File Name(s):</b>              |
| 12 | *Excluded file name 1*              | *Excluded file name 1* |    *...*    |
| 13 | <b>Branch name:</b>                        |
| 14 | *branch name**                       |

<b>Notes about spreadsheet configuration:</b>
- The spreadsheet must contain values for each cell in the mock spreadsheet below marked with *.
- The folder names in row (i.e. the contents of a Google Drive folder in row 8 will go into the GitHub folder with the name specified in the corresponding column in row 10). This means that for each value in row 8, there must be a value in the corresponding column in row 10.
- If a row in the mock spreadsheet above has a cell with `...`, you can add as many values as needed to that row.
