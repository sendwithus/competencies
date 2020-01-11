var CLIENT_ID = '220295937636-845541ei1vmqcedoa2lgtim8l215aqe5.apps.googleusercontent.com';
$.cookie.defaults.path = '/'
$.cookie.defaults.expires = 10000
$.cookie.json = true;
let personValues = {}
let people = {}
let currentSheetId = ''

$(document).ready(function (event) {
    $('h1').append($(
        '<span style="display:none" id="buttonGroup" class="float-right text-xs my-1 mr-4">' +
        ' <a title="view associated google sheet" class="sheet-link hover:underline  hover:opacity-75" target="_blank" id="sheetLink" href="">' +
        '<i class="icon fab fa-google-drive"></i> drive' +
        '</a> ' +
        ' <select class="person-chooser text-blue-600 p-1 shadow mx-2" id="personChooser"></select> ' +
        ' <a title="add a person to the dropdown" class="sheet-link  hover:opacity-75" id="addButton" href="javascript:;">' +
        '<i class="icon fas fa-user-plus"></i>' +
        '</a> ' +
        ' <a title="delete this person from the dropdown" class="trash-link hover:opacity-75" id="deleteButton" href="javascript:;">' +
        '<i class="icon fas fa-user-minus"></i>' +
        '</a> ' +
        ' <select id="titleChooser" class="person-chooser text-blue-600 mx-2"></select> ' +
        ' <a style="display:none" title="sign out" class="hover:underline sign-out-link" id="signOut" href="javascript:;">sign out</a> ' +
        '</span> ' +
        ' <a class="mr-4 text-white bg-blue-800 px-4 p-2 hover:bg-blue-600 shadow rounded-full float-right text-xs" style="display:none" title="sign in and get access to the tracking system" class="sign-in-link" id="signIn" href="javascript:;">sign in</a> '
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
    $('#signOut').on('click', () => {
        signOut();
    })
    $('#signIn').on('click', () => {
        signIn();
    })
    setupTitleDropdown()
    $('#titleChooser').on('change', () => {
        switchPage()
    })
    loadCookieValues()
    gapi.load('client:auth2', initClient);
});
function switchPage() {
    window.location.href = $('#titleChooser').val()
}
function setupTitleDropdown() {
    let titles = ''
    let pathname = window.location.pathname.substring(1)
    options.split(',').forEach((option) => {
        if (option === '') {
            return true
        }
        let link = option + ".html"
        $('#titleChooser').append($('<option value="' + link + '" ' + (pathname === link ? 'SELECTED' : '') + '>' + option.replaceAll('-', ' ') + '</option>'))
    });
}
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

    name = name.replace(/: level [0-9]+/, '')
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

function cleanValues() {
    $('.competency').removeClass('complete')
    $('.competency').removeClass('in-progress')
    $('.drive-link').hide()
    $('.fa-check').remove()
}

function checkForSheet(sheetId) {
    cleanValues()
    if (!sheetId || sheetId === '') {
        alert('must select a sheet ID or add one using the add button.')
        return
    }
    var params = {
        spreadsheetId: sheetId,
        range: 'Sheet1!A1:B'
    };

    gapi.client.sheets.spreadsheets.values.get(params).then(function (response) {
        $('.drive-link').show()
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
    var SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

    gapi.client.init({
        'clientId': CLIENT_ID,
        'scope': SCOPE,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
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
        $('#signOut').show()
        $('#signIn').hide()
        email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
        $('#buttonGroup').fadeIn()
        if (getSelected() || getSelected() !== '') {
            checkForSheet(getSelected())
        }
    } else {
        $('#signOut').hide()
        $('#buttonGroup').hide()
        $('#signIn').show()
        cleanValues()
    }
}

function signIn() {
    gapi.auth2.getAuthInstance().signIn();
}

function signOut() {
    gapi.auth2.getAuthInstance().signOut();
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};