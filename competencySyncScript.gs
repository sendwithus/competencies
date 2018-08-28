//Competency Sync Script

//////////////////////////////////////////////////////////////////////////////////////////////
//Config:
var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

//Get config values from spreadsheet:
var personalAccessToken = readFromCell(sheet, 2, 1);
var emailAddress = readFromCell(sheet, 4, 1);
var repoName = readFromCell(sheet, 6, 1);
var driveFolderNames = getRowContents(8, 1);
var githubFolderNames = getRowContents(10, 1);
var excludedFileNames = getRowContents(12, 1);
var branchName = readFromCell(sheet, 14, 1);
var wordToExclude = "Private";

//////////////////////////////////////////////////////////////////////////////////////////////
//Main:
function main() {
  var errors = [];
  //var githubRepoFilesDataUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/contents?ref=master&access_token=" + personalAccessToken;
  
  //Creates branch if none exists with config name:
  if (branchExists(branchName) == false) {
    createBranch(branchName);
  }
  
  for (n=0; n<driveFolderNames.length; n++) {
    var driveFolderId = DriveApp.getFoldersByName(driveFolderNames[n]).next().getId();
    var driveFiles = getDriveFiles(driveFolderId);
    
    
    var githubRepoFilesDataUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/contents/" + githubFolderNames[n] + "?ref=master&access_token=" + personalAccessToken;
    var githubRepoFilesData = UrlFetchApp.fetch(githubRepoFilesDataUrl);
    githubRepoFilesData = JSON.parse(githubRepoFilesData);
    
    //Get names of all files in GitHub repo:
    var githubFileNames = [];
    for (githubFilesIndex=0; githubFilesIndex<githubRepoFilesData.length; githubFilesIndex++) {
      githubFileNames[githubFilesIndex] = githubRepoFilesData[githubFilesIndex].name;
    }
    
    //Commit files to GitHub:
    for (driveFilesIndex=0; driveFilesIndex<driveFiles.length; driveFilesIndex++) {
    
      //Get data from object:
      var driveFileName = driveFiles[driveFilesIndex].name;
      var driveFileNameWithoutSpaces = driveFiles[driveFilesIndex].nameWithoutSpaces;
      var driveFileNameWithExtNoSpaces = driveFileNameWithoutSpaces + ".md";
      var driveFileContent = driveFiles[driveFilesIndex].content;
      
      //Create file if none exists:
      if (githubFileNames.indexOf(driveFileNameWithExtNoSpaces) == -1) { //file does not exist in GitHub already
        createFile(driveFileName, driveFileNameWithoutSpaces, driveFileNameWithExtNoSpaces, driveFileContent, githubFolderNames[n], errors); //create new file in GitHub repo
      }
      
      createCommit(driveFileName, driveFileNameWithoutSpaces, driveFileNameWithExtNoSpaces, driveFileContent, githubFolderNames[n]); //commit Drive file changes to GitHub
    }
  }
  
  createPullRequest(errors);
}

//////////////////////////////////////////////////////////////////////////////////////////////
//Functions:
function getDriveFiles(driveFolderId) {
  var driveFiles = [], driveFileIndex = 0;

  //var folder = DriveApp.getFoldersByName(driveFolderName); //get folder as object from Drive
  var folder = DriveApp.getFolderById(driveFolderId);
    //var files = folder.next().getFiles(); //get files from folder
    var files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      var fileType = file.getMimeType().toString();
      var fileName = file.getName(); //get the file name
      var fileSrc = DocumentApp.openById(file.getId()); //get document as Document object
      var titleElement = getTitleElementOfDoc(file);
      var textToCheck = fileName + titleElement;
      
      if (isInRow(fileName, excludedFileNames) == false && substrFoundCaseInsensitive(wordToExclude, textToCheck) == false) { //fileName is allowed by config
        var fileNameWithoutSpaces = removeSpacesFromStr(fileName);
        var fileTextMarkdown = convertToMarkdown(fileSrc);
       
        //Store file data in object
        var fileObject = {
          "name" : fileName,
          "nameWithoutSpaces" : fileNameWithoutSpaces,
          "content" : fileTextMarkdown
        };
        
        driveFiles[driveFileIndex] = fileObject;
        driveFileIndex ++;
      }
    }
  return driveFiles; //return array of fileObjects
}


function createBranch(branchName) {
  branchName.toString();
  var masterBranchUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/branches/master?access_token=" + personalAccessToken;
  var masterBranchData = UrlFetchApp.fetch(masterBranchUrl);
  masterBranchData = JSON.parse(masterBranchData);
  
  //Get sha for master branch:
  var masterBranchSha = masterBranchData.commit.sha;
  
  //Create branch:
  var refUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/git/refs?access_token=" + personalAccessToken;
  
  var content = {
    "ref" : "refs/heads/" + branchName,
    "sha" : masterBranchSha
  };
  
  var options = createOptions("post", "application/json", content);
  
  try {
    UrlFetchApp.fetch(refUrl, options);
  }
  catch (err) {
    Logger.log("Branch already exists with name " + branchName);
  }
}


function createFile(fileName, fileNameWithoutSpaces, fileNameWithExtNoSpaces, fileContent, githubFolderName, errors) {
  if (githubFolderName != "") {var path = githubFolderName + "/" + fileNameWithExtNoSpaces;}
  else {var path = fileNameWithExtNoSpaces;}
  
  var fileDataUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/contents/" + path + "?access_token=" + personalAccessToken;
  var commitMessage = "Create file " + fileNameWithoutSpaces;
  var fileContentEncoded = encodeBase64Str(fileContent);
  
  var content = {
    "path" : path,
    "message" : commitMessage,
    "content" : fileContentEncoded,
    "branch" : branchName
  };
  
  var options = createOptions("put", "application/json", content);
  
  try {
    UrlFetchApp.fetch(fileDataUrl, options); //This is where I get the error when the file already exists
  }
  catch (err) {
    Logger.log("File " + fileNameWithoutSpaces + " could not be created. " + err);
    errors.push("The script found an error with this file: " + githubFolderName + "/" + fileName + ". This is likely due to a duplicate file.");
  }
}


function createCommit(fileName, fileNameWithoutSpaces, fileNameWithExtNoSpaces, fileContent, githubFolderName) {
  //Create data:
  var commitMessage = "Update " + fileNameWithoutSpaces;
  
  if (githubFolderName != "") {var path = githubFolderName + "/" + fileNameWithExtNoSpaces;}
  else {var path = fileNameWithExtNoSpaces;}
  
  var fileContent = encodeBase64Str(fileContent);
  var commitUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/contents/" + path +"?ref=" + branchName + "&access_token=" + personalAccessToken;
  var fileData = UrlFetchApp.fetch(commitUrl);
  fileData = JSON.parse(fileData);
  var sha = fileData.sha;
  
  var content = {
    "message" : commitMessage,
    "content" : fileContent,
    "sha" : sha,
    "branch" : branchName
  };
  
  var options = createOptions("put", "application/json", content);
  
  try {
    UrlFetchApp.fetch(commitUrl, options);
  }
  catch (err) {
    Logger.log("Nothing to commit to the file " + fileName); //I don't think this would cause an error actually?
  }
}


function createPullRequest(errors) {
  //This function will take all the commits that have been made to a branch and create a pr to merge them to master
  var title = "Update Google Drive Competency documents";
  var base = "master";
  var body = "The Competency Sync Google script would like to update files in this repo. \n\n"; //body is a comment/message left in the pr
  if (errors.length > 0) {
    body += "The script encountered the following errors: \n";
    for (var i=0; i<errors.length; i++) {
      body += errors[i] + "\n";
    }
  }
  var url = "https://api.github.com/repos/sendwithus/" + repoName + "/pulls?access_token=" + personalAccessToken;
  
  var content = {
    "title" : title,
    "head" : branchName,
    "base" : base,
    "body" : body
  };
  
  var options = createOptions("post", "application/json", content);
  
  try {
    UrlFetchApp.fetch(url, options);
    sendPREmail();
  }
  catch (err) {
    Logger.log("Pull request already open for this branch or nothing to merge.");
    var pullsUrl = "https://github.com/sendwithus/competencies/pulls";
    sendErrorEmail("Competency Sync would like to commit changes in GitHub but a pull request is already open. Please merge the pull request in order to sync latest changes. " + pullsUrl);
  }
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


function createOptions(method, contentType, content) {
  //This function returns an object based on params that customizes an HTTPS request
  var options = {
    "method" : method,
    "contentType" : contentType,
    "payload" : JSON.stringify(content)
  };
  return options;
}

function sendPREmail() {
  //This function sends an email to the config address with a link to the pr
  
  //get data on pr's for repo:
  var pullDataUrl = "https://api.github.com/repos/sendwithus/" + repoName + "/pulls?access_token=" + personalAccessToken;
  var pullData = UrlFetchApp.fetch(pullDataUrl);
  pullData = JSON.parse(pullData);
  var prNumber = pullData[0].number; //get number for latest pr
  var prUrl = "https://github.com/sendwithus/" + repoName + "/pull/" + prNumber;
  MailApp.sendEmail(emailAddress, "Your pull request is ready to merge Competency Files!", "View pull request on GitHub: " + prUrl);
}


function sendErrorEmail(err) {
  MailApp.sendEmail(emailAddress, "Competency Sync Error", "The Competency Sync Google script received the following error: " + err);
}

function getTitleElementOfDoc(file) {
  var doc = DocumentApp.openById(file.getId());
  var numChildren = doc.getBody().getNumChildren();
  for (var i=0; i<numChildren; i++) {
    var child = doc.getBody().getChild(i);
    if (child.getType() == DocumentApp.ElementType.PARAGRAPH && child.getHeading() == DocumentApp.ParagraphHeading.TITLE) {
      return child.asText().getText();
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////
//Sub-functions:
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
  //This function gets the value of a specified cell
  var range = sheet.getRange(row, col);
  var cellValue = range.getDisplayValue(); //gets value of cell as string always, not object if value exists as object
  return cellValue;
}

function removeSpacesFromStr(str) {
  var strWithoutSpaces = "";
  for (i=0; i<str.length; i++) {
    if (str[i] == ' ') {
      if (str[i+1] != '-' && str[i-1] != '-') {
        if (i != 0 && i != str.length) {
          strWithoutSpaces += '-';
        }
      }
    }
    else if (str[i] == "/") {
      strWithoutSpaces += '-'
    }
    else {
      strWithoutSpaces += str[i];
    }
  }
  return strWithoutSpaces.toString();
}

function getRowContents(row, col) {
  var rowContents = [], colIndex=0;
  while (readFromCell(sheet, row, col) != "") {
    rowContents[colIndex] = readFromCell(sheet, row, col);
    colIndex ++;
    col++;
  }
  return rowContents;
}

function isInRow(value, rowContents) {
  return (rowContents.indexOf(value) !== -1);
}

function isLinkToInternalDoc(url) {
  var internalUrls = ["docs.google.com/document", "github.com/sendwithus", "github.com/techdroplabs", "https://youtube.com"];
  for (internalUrlsIndex=0; internalUrlsIndex<internalUrls.length; internalUrlsIndex++) {
    if (url.indexOf(internalUrls[internalUrlsIndex]) != -1) {
      return true;
    }
  }
  return false;
}

function getPath(folderName) {
  var folder = DriveApp.getFoldersByName(folderName);
  var pathPoints = [], pathPointsIndex = 0, path = "";
  
  while (folderParentName != "My Drive") {
    var folderParentName = folder.next().getParents().next().getName();
    pathPoints[pathPointsIndex] = folderParentName;
    folder = DriveApp.getFoldersByName(folderParentName);
    pathPointsIndex ++;
  }
  for (pathIndex=(pathPoints.length-1); pathIndex>=0; pathIndex--) {
    path += "/" + pathPoints[pathIndex].toString();
  }
  return path;
}

function substrFoundCaseInsensitive(substr, str) {
  return (str.toLowerCase().indexOf(substr.toLowerCase()) !== -1);
}

//////////////////////////////////////////////////////////////////////////////////////////////
//Triggers:
function triggers() {
  //Trigger to update Competency Docs every week
  ScriptApp.newTrigger('main')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .create();
}

//////////////////////////////////////////////////////////////////////////////////////////////
//Markdown:
function convertToMarkdown(doc) {
  var numChildren = doc.getActiveSection().getNumChildren();
  var text = "";
  var inSrc = false;
  var inClass = false;
  var globalImageCounter = 0;
  var globalListCounters = {};
  // edbacher: added a variable for indent in src <pre> block. Let style sheet do margin.
  var srcIndent = "";
  
  var attachments = [];
  
  // Walk through all the child elements of the doc.
  for (var i = 0; i < numChildren; i++) {
    var child = doc.getActiveSection().getChild(i);
    
    //Remove any links to internal documents:
    var childLinkUrl = child.asText().getLinkUrl();
    if (childLinkUrl != null) {
      if (isLinkToInternalDoc(childLinkUrl)) {
        //Remove link
        child.asText().editAsText().insertText(0, "").setLinkUrl("");
      }
    }
    
    var result = processParagraph(i, child, inSrc, globalImageCounter, globalListCounters);
    globalImageCounter += (result && result.images) ? result.images.length : 0;
    if (result!==null) {
      if (result.sourcePretty==="start" && !inSrc) {
        inSrc=true;
        text+="<pre class=\"prettyprint\">\n";
      } else if (result.sourcePretty==="end" && inSrc) {
        inSrc=false;
        text+="</pre>\n\n";
      } else if (result.source==="start" && !inSrc) {
        inSrc=true;
        text+="<pre>\n";
      } else if (result.source==="end" && inSrc) {
        inSrc=false;
        text+="</pre>\n\n";
      } else if (result.inClass==="start" && !inClass) {
        inClass=true;
        text+="<div class=\""+result.className+"\">\n";
      } else if (result.inClass==="end" && inClass) {
        inClass=false;
        text+="</div>\n\n";
      } else if (inClass) {
        text+=result.text+"\n\n";
      } else if (inSrc) {
        text+=(srcIndent+escapeHTML(result.text)+"\n");
      } else if (result.text && result.text.length>0) {
        text+=result.text+"\n\n";
      }
      
      if (result.images && result.images.length>0) {
        for (var j=0; j<result.images.length; j++) {
          attachments.push( {
            "fileName": result.images[j].name,
            "mimeType": result.images[j].type,
            "content": result.images[j].bytes } );
        }
      }
    } else if (inSrc) { // support empty lines inside source code
      text+='\n';
    }
      
  }
  
  text = text.replace(new RegExp("’", 'g'), "'");
  return text;
  //return str.replace(new RegExp(find, 'g'), replace);
}

function escapeHTML(text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Process each child element (not just paragraphs).
function processParagraph(index, element, inSrc, imageCounter, listCounters) {
  // First, check for things that require no processing.
  if (element.getNumChildren()==0) {
    return null;
  }  
  // Punt on TOC.
  if (element.getType() === DocumentApp.ElementType.TABLE_OF_CONTENTS) {
    return {"text": "[[TOC]]"};
  }
  
  // Set up for real results.
  var result = {};
  var pOut = "";
  var textElements = [];
  var imagePrefix = "image_";
  
  // Handle Table elements. Pretty simple-minded now, but works for simple tables.
  // Note that Markdown does not process within block-level HTML, so it probably 
  // doesn't make sense to add markup within tables.
  if (element.getType() === DocumentApp.ElementType.TABLE) {
    textElements.push("<table>\n");
    var nCols = element.getChild(0).getNumCells();
    for (var i = 0; i < element.getNumChildren(); i++) {
      textElements.push("  <tr>\n");
      // process this row
      for (var j = 0; j < nCols; j++) {
        textElements.push("    <td>" + element.getChild(i).getChild(j).getText() + "</td>\n");
      }
      textElements.push("  </tr>\n");
    }
    textElements.push("</table>\n");
  }
  
  // Process various types (ElementType).
  for (var i = 0; i < element.getNumChildren(); i++) {
    var t=element.getChild(i).getType();
    
    if (t === DocumentApp.ElementType.TABLE_ROW) {
      // do nothing: already handled TABLE_ROW
    } else if (t === DocumentApp.ElementType.TEXT) {
      var txt=element.getChild(i);
      pOut += txt.getText();
      textElements.push(txt);
    } else if (t === DocumentApp.ElementType.INLINE_IMAGE) {
      //We deleted this!
    } else if (t === DocumentApp.ElementType.PAGE_BREAK) {
      // ignore
    } else if (t === DocumentApp.ElementType.HORIZONTAL_RULE) {
      textElements.push('* * *\n');
    } else if (t === DocumentApp.ElementType.FOOTNOTE) {
      textElements.push(' (NOTE: '+element.getChild(i).getFootnoteContents().getText()+')');
    } else {
      throw "Paragraph "+index+" of type "+element.getType()+" has an unsupported child: "
      +t+" "+(element.getChild(i)["getText"] ? element.getChild(i).getText():'')+" index="+index;
    }
  }

  if (textElements.length==0) {
    // Isn't result empty now?
    return result;
  }
  
  // evb: Add source pretty too. (And abbreviations: src and srcp.)
  // process source code block:
  if (/^\s*---\s+srcp\s*$/.test(pOut) || /^\s*---\s+source pretty\s*$/.test(pOut)) {
    result.sourcePretty = "start";
  } else if (/^\s*---\s+src\s*$/.test(pOut) || /^\s*---\s+source code\s*$/.test(pOut)) {
    result.source = "start";
  } else if (/^\s*---\s+class\s+([^ ]+)\s*$/.test(pOut)) {
    result.inClass = "start";
    result.className = RegExp.$1;
  } else if (/^\s*---\s*$/.test(pOut)) {
    result.source = "end";
    result.sourcePretty = "end";
    result.inClass = "end";
  } else {

    prefix = findPrefix(inSrc, element, listCounters);
  
    var pOut = "";
    for (var i=0; i<textElements.length; i++) {
      pOut += processTextElement(inSrc, textElements[i]);
    }

    // replace Unicode quotation marks
    pOut = pOut.replace('\u201d', '"').replace('\u201c', '"');
 
    result.text = prefix+pOut;
  }
  
  return result;
}

// Add correct prefix to list items.
function findPrefix(inSrc, element, listCounters) {
  var prefix="";
  if (!inSrc) {
    if (element.getType()===DocumentApp.ElementType.PARAGRAPH) {
      var paragraphObj = element;
      switch (paragraphObj.getHeading()) {
        // Add a # for each heading level. No break, so we accumulate the right number.
        case DocumentApp.ParagraphHeading.HEADING6: prefix+="#";
        case DocumentApp.ParagraphHeading.HEADING5: prefix+="#";
        case DocumentApp.ParagraphHeading.HEADING4: prefix+="#";
        case DocumentApp.ParagraphHeading.HEADING3: prefix+="#";
        case DocumentApp.ParagraphHeading.HEADING2: prefix+="#";
        case DocumentApp.ParagraphHeading.HEADING1: prefix+="#";
        case DocumentApp.ParagraphHeading.TITLE: prefix+="# ";
        default:
      }
    } else if (element.getType()===DocumentApp.ElementType.LIST_ITEM) {
      var listItem = element;
      var nesting = listItem.getNestingLevel()
      for (var i=0; i<nesting; i++) {
        prefix += "    ";
      }
      var gt = listItem.getGlyphType();
      // Bullet list (<ul>):
      if (gt === DocumentApp.GlyphType.BULLET
          || gt === DocumentApp.GlyphType.HOLLOW_BULLET
          || gt === DocumentApp.GlyphType.SQUARE_BULLET) {
        prefix += "* ";
      } else {
        // Ordered list (<ol>):
        var key = listItem.getListId() + '.' + listItem.getNestingLevel();
        var counter = listCounters[key] || 0;
        counter++;
        listCounters[key] = counter;
        prefix += counter+". ";
      }
    }
  }
  return prefix;
}

function processTextElement(inSrc, txt) {
  if (typeof(txt) === 'string') {
    return txt;
  }
  
  var pOut = txt.getText();
  if (! txt.getTextAttributeIndices) {
    return pOut;
  }
  
  var attrs=txt.getTextAttributeIndices();
  var lastOff=pOut.length;

  for (var i=attrs.length-1; i>=0; i--) {
    var off=attrs[i];
    var url=txt.getLinkUrl(off);
    var font=txt.getFontFamily(off);
    if (url) {  // start of link
      if (i>=1 && attrs[i-1]==off-1 && txt.getLinkUrl(attrs[i-1])===url) {
        // detect links that are in multiple pieces because of errors on formatting:
        i-=1;
        off=attrs[i];
        url=txt.getLinkUrl(off);
      }
      pOut=pOut.substring(0, off)+'['+pOut.substring(off, lastOff)+']('+url+')'+pOut.substring(lastOff);
    } else if (font) {
      if (!inSrc && font===font.COURIER_NEW) {
        while (i>=1 && txt.getFontFamily(attrs[i-1]) && txt.getFontFamily(attrs[i-1])===font.COURIER_NEW) {
          // detect fonts that are in multiple pieces because of errors on formatting:
          i-=1;
          off=attrs[i];
        }
        pOut=pOut.substring(0, off)+'`'+pOut.substring(off, lastOff)+'`'+pOut.substring(lastOff);
      }
    }
    if (txt.isBold(off)) {
      var d1 = d2 = "**";
      if (txt.isItalic(off)) {
        // edbacher: changed this to handle bold italic properly.
        d1 = "**_"; d2 = "_**";
      }
      pOut=pOut.substring(0, off)+d1+pOut.substring(off, lastOff)+d2+pOut.substring(lastOff);
    } else if (txt.isItalic(off)) {
      pOut=pOut.substring(0, off)+'*'+pOut.substring(off, lastOff)+'*'+pOut.substring(lastOff);
    }
    lastOff=off;
  }
  return pOut;
}
