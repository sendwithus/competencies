/*Competency Sync script
  Written in Google Apps Script.
  See readme file for set-up instructions and documentation.
*/

/****************************************************************************/
//Config:
//Set spreadsheet to pull config values from:
var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

//Get config values from spreadsheet:
var personalAccessToken = readFromCell(sheet, 2, 1);
var emailAddress = readFromCell(sheet, 4, 1);
var repoName = readFromCell(sheet, 6, 1);
var driveFolderNames = readFromCell(sheet, 8, 1);
var excludedFileNames = readFromCell(sheet, 10, 1);

//Initialize tracking variables:
var prCounter = 1; //keeps track of how many pr's have been made
var dateOfLastPR; //keeps track of the date the last pr was made
var date = Utilities.formatDate(new Date(), "GMT-8", "dd-MM-yyyy");

//Initialize branch name (only one branch will be used forever!):
var branchName = "update-competency-docs";


/****************************************************************************/
//Main function:
function main() {
  var driveFiles = getDriveFiles(driveFolderNames);
  
  var githubRepoFilesDataUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/contents?ref=master&access_token=" + personalAccessToken;
  var githubRepoFilesData = UrlFetchApp.fetch(githubRepoFilesDataUrl);
  githubRepoFilesData = JSON.parse(githubRepoFilesData);
  
  //Get names of all files in GitHub repo:
  var githubFileNames = [];
  for (githubFilesIndex=0; githubFilesIndex<githubRepoFilesData.length; githubFilesIndex++) {
    githubFileNames[githubFilesIndex] = githubRepoFilesData[githubFilesIndex].name;
  }
  
  if (branchExists(branchName) == false) {
    createBranch(branchName);
  }
  
  //Commit changed files:
  for (driveFilesIndex=0; driveFilesIndex<driveFiles.length; driveFilesIndex++) {
    var driveFileName = driveFiles[driveFilesIndex].name, driveFileContent = driveFiles[driveFilesIndex].content; //get data for current file
    
    if (githubFileNames.indexOf(driveFileName) == -1) { //file does not exist in GitHub already
      createFile(driveFileName, driveFileContent); //create new file in GitHub repo
    }
    
    createCommit(driveFileName, driveFileContent); //commit Drive file changes to GitHub
  }
  
  createPullRequest();
  
  prCounter ++;
}

/****************************************************************************/
//Main functions - specific for use with this project:
function getDriveFiles(driveFolderName) {
  driveFolderName = "Engineering Competencies";
  var driveFiles = [], driveFileIndex = 0;
  //Get names of all files in a Drive folder:
  var folder = DriveApp.getFoldersByName(driveFolderName); //get folder as object from Drive
  while (folder.hasNext()) {
    var files = folder.next().getFiles(); //get files from folder
    while (files.hasNext()) { //for each file in the folder
      var file = files.next();
      var fileName = file.getName(); //get the file name
      
      if (fileName != excludedFileNames) {
        //Get file contents:
        var fileSrc = DocumentApp.openById(file.getId());
        var fileContents = fileSrc.getBody().getText();
        
        var fileObj = {
          "name" : fileName,
          "content" : fileContents
        };
        
        driveFiles[driveFileIndex] = fileObj;
        driveFileIndex ++;
      }
    }
  }
  return driveFiles;
}


function createCommit(fileName, fileContent) {
  //Create data:
  var commitMessage = "Update " + fileName;
  
  var fileContent = encodeBase64Str(fileContent);
  var commitUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/contents/" + fileName +"?ref=" + branchName + "&access_token=" + personalAccessToken;
  var fileData = UrlFetchApp.fetch(commitUrl);
  fileData = JSON.parse(fileData);
  var sha = fileData.sha;
  
  var content = {
    "message" : commitMessage,
    "content" : fileContent,
    "sha" : sha,
    "branch" : branchName
  };
  
  var options = {
    "method" : "put",
    "contentType" : "application/json",
    "payload" : JSON.stringify(content)
  };
  
  UrlFetchApp.fetch(commitUrl, options);
}


function createPullRequest() {
  //This function will take all the commits that have been made to a branch and create a pr to merge them to master
  var title = "Update Google Drive Competency documents";
  var base = "master";
  var body = "The Competency Sync Google script would like to update files in this repo."; //body is a comment/message left in the pr
  var url = "https://api.github.com/repos/sendwithus/" + repoName + "/pulls?access_token=" + personalAccessToken;
  
  var content = {
    "title" : title,
    "head" : branchName,
    "base" : base,
    "body" : body
  };
  
  var options = {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(content)
  };
  
  try {
    UrlFetchApp.fetch(url, options);
    sendPREmail();
  }
  catch (err) {
    Logger.log("Pull request already open for this branch or othing to merge.");
  }
}


function sendPREmail() {
  //This function sends an email to the config address with a link to the pr
  
  //get data on pr's for repo:
  var pullDataUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/pulls?access_token=" + personalAccessToken;
  var pullData = UrlFetchApp.fetch(pullDataUrl);
  pullData = JSON.parse(pullData);
  var prNumber = pullData[0].number; //get number for latest pr
  Logger.log(prNumber);
  var prUrl = "https://github.com/sendwithus/" + repoName + "/pull/" + prNumber;
  MailApp.sendEmail(emailAddress, "Your pull request is ready to merge Competency Files!", "View pull request on GitHub: " + prUrl);
}


function sendErrorEmail(err) {
  MailApp.sendEmail(emailAddress, "Competency Sync Error", "The Competency Sync Google script received the following error:" + err);
}

function createBranch(branchName) {
  var refUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/git/refs?access_token=" + personalAccessToken;
  
  var content = {
    "ref" : "refs/heads/" + branchName,
    "sha" : "1fed42829b1873162c98c1bd528a8e1d394fce12"
  };
  
  var options = {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(content)
  };
  
  UrlFetchApp.fetch(refUrl, options);
}


function createBranch(branchName) {
  var refUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/git/refs?access_token=" + personalAccessToken;
  var refData = UrlFetchApp.fetch(refUrl);
  refData = JSON.parse(refData);
  
  for (refDataIndex=0; refDataIndex<refData.length; refDataIndex++) {
    if (refData[refDataIndex].ref == "refs/heads/master") {
      masterBranchSha = refData[refDataIndex].object.sha;
    }
    
  }
  
  var content = {
    "ref" : "refs/heads/" + branchName,
    "sha" : masterBranchSha
  };
  
  var options = {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(content)
  };
  
  try {
    UrlFetchApp.fetch(refUrl, options);
  }
  catch (err) {
    Logger.log("Branch already exists with name " + branchName);
  }
}


function createFile(fileName, fileContent) {
  var fileDataUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/contents/" + fileName + "?access_token=" + personalAccessToken;
  Logger.log(fileDataUrl);
  var commitMessage = "Create file " + fileName;
  var fileContentEncoded = encodeBase64Str(fileContent);
  
  var content = {
    "path" : fileName + ".txt",
    "message" : commitMessage,
    "content" : fileContentEncoded,
    "branch" : branchName
  };
  
  var options = {
    "method" : "put",
    "contentType" : "application/json",
    "payload" : JSON.stringify(content)
  };
  
  UrlFetchApp.fetch(fileDataUrl, options);
}

function branchExists(branchNameToCheck) {
  //This function checks if a branch exists in a GitHub repo
  branchNameToCheck = branchNameToCheck.toString();
  var url = "https://api.github.com/repos/sendwithus/" + repoName + "/branches?access_token=" + personalAccessToken;
  var branchData = UrlFetchApp.fetch(url);
  var branches = JSON.parse(branchData);
  
  for (branchIndex=0; branchIndex<branches.length; branchIndex++) {
    if (branches[branchIndex].name == branchNameToCheck) {
      return true;
    }
  }
  
  return false;
}

/****************************************************************************/
//Sub-functions - general functions that can be re-used in other projects:
function decodeBase64Str(encodedStr) {
  //This function decodes a string that is encoded in Base 64
  var decodedStrAsByteArray = Utilities.base64Decode(encodedStr); //returns decoded string as a byte array
  var decodedStr = Utilities.newBlob(decodedStrAsByteArray).getDataAsString(); //converts byte array to string
  return decodedStr;
}

function encodeBase64Str(str) {
  //This function takes a string and encodes it in base 64
  var encodedStr = Utilities.base64Encode(str);
  return encodedStr;
}

function readFromCell(sheet, row, col) {
  //THIS FUNCTION WILL NOT GO IN THE FINAL SCRIPT IN GITHUB
  //This function gets the value of a specified cell
  var range = sheet.getRange(row, col);
  var cellValue = range.getDisplayValue(); //gets value of cell as string always, not object if value exists as object
  return cellValue;
}
