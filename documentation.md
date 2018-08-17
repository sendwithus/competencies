# Development Instructions
The [Competency script](https://github.com/sendwithus/competencies/blob/master/competencySyncScript.gs) is what makes this project work. The script is attached to a Google Spreadsheet containing configuration values. The script is written in Google Apps Script, a language based off of JavaScript that is specific to the G Suite products.

## What the script does:
The script takes values from the config spreadsheet. It first gets the contents of all files in the specified Google Drive folders. If a file already exists in the competencies repo, any changes will be updated, or, if the file does not exist, a new file will be created in GitHub. It then commits all new files and changed files to the specified branch name. After all commits have been made, a pull request is created to merge the branch to `master`. An email will be sent to the configured address with a link to the pull request in GitHub. Don't worry if you delete the branch after merging - the script will create it again.

## How to use the script:
To use the Competency script to sync your Google Drive folders to GitHub, first, create a Google Spreadsheet. To attach the script to your spreadsheet, go to <b>Tools > Script editor</b> and paste in the contents of [the script](https://raw.githubusercontent.com/sendwithus/competencies/master/competencySyncScript.gs). For first time set-up only, run the `triggers()` function in your script editor. This will install the trigger in your script. Since the script runs on a time-based trigger, the only work you have to do is merge the pull request when you get an email!

<b>Notes about spreadsheet configuration:
- The spreadsheet must contain values for each cell in the mock spreadsheet below marked with *.
- The folder names in row (i.e. the contents of a Google Drive folder in row 8 will go into the GitHub folder with the name specified in the corresponding column in row 10). This means that for each value in row 8, there must be a value in the corresponding column in row 10.
- If a row has a cell with `...`, you can add as many values as needed to that row.
</b>

|    | A                                   | B                      | C     |
|----|-------------------------------------|------------------------|-------|
| 1  | <b>Github Personal access token:</b>       |                        |
| 2  | *Github Personal access token**      |                        |
| 3  | <b>Email:</b>                              |                        |
| 4  | *Email address**                     |                        |
| 5  | <b>Repo name:</b>                          |                        |
| 6  | *Repo name**                         |                        |
| 7  | <b>Source Google Drive folder name(s):</b> |                        |
| 8  | *Folder name 1**                     | *Folder name 2*        | *...* |
| 9  | <b>Destination GitHub Folder Name(s):</b>  |
| 10 | *Folder name 1**                     | *Folder name 2*        | *...* |
| 11 | <b>Excluded File Name(s):</b>              |
| 12 | *Excluded file name 1*              | *Excluded file name 1* | *...* |
| 13 | <b>Branch name:</b>                        |
| 14 | *branch name**                       |
