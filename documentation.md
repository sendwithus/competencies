# Documentation
The Competency script is what makes this project work. The script is attached to a Google Spreadsheet containing configuration values. The script is written in Google Apps Script, a language based off of JavaScript that is specific to the G Suite products.

## What the script does:
The script takes values from the config spreadsheet. First, it gets the contents of all files in the specified Google Drive folders. It then commits all the changes to GitHub. If a file already exists in the competencies repo, any changes will be updated. If a file doesn't exist in the repo, it will be created and filled with the contents of the Google Drive file. After all commits have been made, 

## How to use the script:
To use the Competency script to sync your Google Drive folders to GitHub, first, create a spreadsheet with the following configuration values

|    | A                                   | B                      | C     | D | E | F | G | H | I |
|----|-------------------------------------|------------------------|-------|---|---|---|---|---|---|
| 1  | <b>Github Personal access token:</b>       |                        |       |   |   |   |   |   |   |
| 2  | *Github Personal access token*      |                        |       |   |   |   |   |   |   |
| 3  | <b>Email:</b>                              |                        |       |   |   |   |   |   |   |
| 4  | *Email address*                     |                        |       |   |   |   |   |   |   |
| 5  | <b>Repo name:</b>                          |                        |       |   |   |   |   |   |   |
| 6  | *Repo name*                         |                        |       |   |   |   |   |   |   |
| 7  | <b>Source Google Drive folder name(s):</b> |                        |       |   |   |   |   |   |   |
| 8  | *Folder name 1*                     | *Folder name 2*        | *...* |   |   |   |   |   |   |
| 9  | <b>Destination GitHub Folder Name(s):</b>  |                        |       |   |   |   |   |   |   |
| 10 | *Folder name 1*                     | *Folder name 2*        | *...* |   |   |   |   |   |   |
| 11 | <b>Excluded File Name(s):</b>              |                        |       |   |   |   |   |   |   |
| 12 | *Excluded file name 1*              | *Excluded file name 1* | *...* |   |   |   |   |   |   |
| 13 | <b>Branch name:</b>                        |                        |       |   |   |   |   |   |   |
| 14 | *branch name*                       |                        |       |   |   |   |   |   |   |
