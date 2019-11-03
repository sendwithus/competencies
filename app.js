var CLIENT_ID = '220295937636-845541ei1vmqcedoa2lgtim8l215aqe5.apps.googleusercontent.com';
$.cookie.defaults.path = '/'
$.cookie.defaults.expires = 10000
$.cookie.json = true;
let personValues = {}
let people = {}
let currentSheetId = ''

$(document).ready(function (event) {
    $('h1').append($(
        '<span style="display:none" id="buttonGroup">' +
        ' <a title="view associated google sheet" class="sheet-link" target="_blank" id="sheetLink" href="">' +
        '<i class="icon fab fa-google-drive"></i>' +
        '</a> ' +
        ' <a title="add a person to the dropdown" class="sheet-link" id="addButton" href="javascript:;">' +
        '<i class="icon fas fa-user-plus"></i>' +
        '</a> ' +
        ' <select class="person-chooser" id="personChooser"></select> ' +
        ' <a title="delete this person from the dropdown" class="trash-link" id="deleteButton" href="javascript:;">' +
        '<i class="icon fas fa-user-minus"></i>' +
        '</a> ' +
        '</span> '
    ))
    $('#addButton').on('click', () => {
        let response = prompt('enter spreadsheet ID')
        if (response && response !== '') {
            checkForSheet(response)
        }
    })
    $('#deleteButton').on('click', () => {
        removeSelected()
    })
    $('#personChooser').on('change', () => {
        $.cookie('selectedPerson', getSelected())
        checkForSheet(getSelected())
    })
    $('.drive-link').on('click', (e) => {
        let el = $(e.target).parent().parent();
        let name = el.text().trim()
        let id = $(el).attr('id')
        addInProgress(id, name)
    })
    loadCookieValues()
    gapi.load('client:auth2', initClient);
});
function removeSelected() {
    delete people[currentSheetId]
    $.cookie('people', people)
    $.cookie('selectedPerson', '')
    $("#personChooser option[value='" + currentSheetId + "']").remove();
    checkForSheet(getSelected())

}
function addInProgress(id, name) {
    $('.drive-link', $('#' + id)).fadeOut(() => {
        $('.' + id).addClass('in-progress')
    });

    var params = {
        spreadsheetId: currentSheetId,
        range: 'Sheet1!A2:B',
        valueInputOption: 'USER_ENTERED'
    };

    var valueRangeBody = {
        'range': 'Sheet1!A2:B',
        'majorDimension': 'ROWS',
        'values': [
            [name, '0']
        ]
    }

    gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody).then(function (response) {
        // expected path.
    }, function (reason) {
        console.error('error: ' + reason.result.error.message);
    });
}

function getSelected() {
    if ($('#personChooser').children("option:selected").length == 0) { return ''; }
    return $('#personChooser').children("option:selected").val();
}

function loadCookieValues() {
    peopleLoaded = $.cookie('people')
    if (!peopleLoaded) {
        return
    }
    people = peopleLoaded
    let selectedPerson = $.cookie('selectedPerson')
    for (person in people) {
        createOption(person, people[person], selectedPerson == person)
    }
}


function checkForSheet(sheetId) {
    $('.competency').removeClass('complete')
    $('.competency').removeClass('in-progress')
    $('.drive-link').show()
    $('.fa-check').remove()
    if (!sheetId || sheetId === '') {
        alert('must select a sheet ID or add one using the add button.')
        return
    }
    var params = {
        spreadsheetId: sheetId,
        range: 'Sheet1!A1:B'
    };

    gapi.client.sheets.spreadsheets.values.get(params).then(function (response) {
        currentSheetId = sheetId
        $('#sheetLink').attr('href', 'https://docs.google.com/spreadsheets/d/' + sheetId);
        let values = response.result.values
        let name = values[0][0]
        if (!name || name.trim() === '') {
            alert('must have name in cell A1 - add a name then try again')
            return;
        }
        personValues = {}
        for (var i = 1; i < values.length; i++) {
            personValues[values[i][0]] = values[i][1]
        }
        if (!people[sheetId]) {
            createOption(sheetId, name)
            addName(name, sheetId)
        }
        checkOffCompetencies()
        setSelected(sheetId)
    }).catch((err) => {
        $('#sheetLink').html('')
        $('#sheetLink').attr('href', '')
        console.error('error', err)
    });
}

function setSelected(sheetId) {
    $('#personChooser').val(sheetId);
    $.cookie('selectedPerson', sheetId)
}
function checkOffCompetencies() {

    for (skill in personValues) {
        let id = name2Id(skill)
        let level = parseInt(personValues[skill])
        $('.' + id).each((i, el) => {
            $('.drive-link', $(el)).hide();
            if (level === 0) {
                $(el).addClass('in-progress')
            }
            if (parseInt($(el).attr('level')) <= level) {
                $(el).addClass('complete')
                $(el).prepend('<i style="color:white" class="fas fa-check"></i> ')
            }
        })
    }
}

function name2Id(name) {
    return "c-" + name.toLowerCase().replaceAll(' ', '')
}
function createOption(sheetId, name, selected) {
    $('#personChooser').append($('<option value="' + sheetId + '"' + (selected ? ' selected' : '') + '>' + name + '</option>'))
}

function initClient() {
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

function addName(name, sheetId) {
    let people = $.cookie('people')
    if (!people) {
        people = {}
    }
    people[sheetId] = name;
    $.cookie('people', people)
}


function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
        $('#buttonGroup').fadeIn()
        if (getSelected() || getSelected() !== '') {
            checkForSheet(getSelected())
        }
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};