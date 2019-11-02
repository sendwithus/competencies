var CLIENT_ID = '220295937636-845541ei1vmqcedoa2lgtim8l215aqe5.apps.googleusercontent.com';
$(document).ready(function (event) {
    $('h1').append($('<button id="addButton" class="add-button">add</button> <select class="person-chooser" id="personChooser"></select>'))
    $('#addButton').on('click', ()=>{
        let response = prompt('enter spreadsheet ID')
        checkForSheet()
    })
    gapi.load('client:auth2', initClient);
});


function checkForSheet(sheetId){
    console.log('checking for sheet: ' + sheetId)

    var params = {
        spreadsheetId: sheetId,
        range: 'Sheet1!A1'
    };

    gapi.client.sheets.spreadsheets.values.get(params).then(function(response) {
        let name = response.result.values[0][0]
        $('#personChooser').append($('<option>' + name + '</option>'))
    });
}
function initClient() {
    console.log('init client')
    var SCOPE = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive';

    gapi.client.init({
        'clientId': CLIENT_ID,
        'scope': SCOPE,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4', "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}
function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
        checkForSheet('1fB1hUn0NVbTqkIwLGBL-nxoRA1BO7dP4a6DNgYDTmoE')
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}