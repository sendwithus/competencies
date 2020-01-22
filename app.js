var CLIENT_ID = '220295937636-845541ei1vmqcedoa2lgtim8l215aqe5.apps.googleusercontent.com';
$.cookie.defaults.path = '/'
$.cookie.defaults.expires = 10000
$.cookie.json = true;
let personValues = {}
let people = {}
let currentSheetId = ''
let title = ''
$(document).ready(function (event) {

    if (window.location.hash) {
        $.cookie('selectedPerson', window.location.hash.substring(1))
    }
    title = $('h1').text()
    $('h1').html($(`
		<img class="w-6 inline-block mr-3" src="seedling.png">
        <a class="mr-4 text-white bg-blue-800 px-2 p-1 hover:bg-blue-600 shadow-2xl rounded-full float-right text-xs" style="display:none" title="sign in and get access to the tracking system" class="sign-in-link" id="signIn" href="javascript:;">sign in</a>
        <div style="display:none" id="buttonGroup">
        <select class="person-chooser mr-4 bg-white" id="personChooser"></select> 
        <select id="titleChooser" class="person-chooser text-gray-600 bg-white"></select> 
        <a style="display:none" title="view associated google sheet" class="sheet-link text-sm pt-1 ml-4 hover:opacity-75" target="_blank" id="sheetLink" href=""><i class="icon fab fa-google-drive"></i> drive</a> 
        
        <span class="float-right whitespace-no-wrap">
        <div id="error" style="display:none" class="mr-10 inline-block p-1 px-4 text-sm rounded-full bg-red-700 text-white"></div>
        <a title="add a person to the dropdown" class="text-sm sheet-link pt-1 mr-4  hover:opacity-75" id="addButton" href="javascript:;"><i class="icon fas fa-user-plus"></i> add person</a> 
        <a title="delete this person from the dropdown" class="text-sm trash-link pt-1 mr-4  hover:opacity-75" id="deleteButton" href="javascript:;"><i class="icon fas fa-user-minus"></i> remove person</a> 
        <a style="display:none" title="sign out" class="mr-4 text-white bg-blue-800 p-1 px-2 hover:bg-blue-600 shadow-2xl rounded-full text-xs" id="signOut" href="javascript:;">sign out</a> 
        </span>
        </div> 
         `
    ))
    $('#addButton').on('click', () => {
        let response = prompt('enter spreadsheet ID')
        if (response && response !== '') {
            checkForSheet(response)
        }
    })
    $('#deleteButton').on('click', () => {
        let doit = confirm('Delete this person from the drop down list?')
        if (doit) {
            removeSelected()
        }
    })
    $('#personChooser').on('change', () => {
        let selected = getSelected()
        $.cookie('selectedPerson', selected)
        window.location.hash = selected
        checkForSheet(selected)
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
    window.location.href = $('#titleChooser').val() + (window.location.hash ? window.location.hash : '')
}
function setupTitleDropdown() {
    let titles = ''
    let pathname = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1)
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
        error(reason.result.error.message)
        console.error('error: ' + reason);
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

function createOption(sheetId, name, selected) {
    $('#personChooser').append($('<option value="' + sheetId + '"' + (selected ? ' selected' : '') + '>' + name + '</option>'))
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
        $('#sheetLink').hide()
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
        $('#sheetLink').show()
        let values = response.result.values
        if (!values || !values[0] || values[0][0].trim() === '') {
            error('must have name in cell A1 - add a name then try again')
            return;
        }
        let name = values[0][0]
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
        errorHide()
    }).catch((err) => {
        $('#sheetLink').hide()
        console.error('error', err)
        error(err.result.error.message)
    });
}
function errorHide() {
    $('#error').hide()
}
function error(msg) {
    $('#error').html(msg)
    $('#error').show()
    setTimeout(errorHide, 3000)
}

function setSelected(sheetId) {
    $('#personChooser').val(sheetId);
    $.cookie('selectedPerson', sheetId)
    window.location.hash = sheetId
}
function checkOffCompetencies() {

    for (skill in personValues) {
        let id = name2Id(skill)
        let level = parseInt(personValues[skill])
        $('.' + id).each((i, el) => {
	    let targetLevel = parseInt($(el).attr('level'))
            $('.drive-link', $(el)).hide();
            if (level === 0 || level < targetLevel) {
                $(el).addClass('in-progress')
            }
            if (targetLevel <= level) {
                $(el).addClass('complete')
                $(el).prepend('<i class="fas fa-check"></i> ')
            }
        })
    }
}

function name2Id(name) {
    return "c-" + name.toLowerCase().replaceAll(' ', '')
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
        document.getElementById('buttonGroup').style.display = 'inline'
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
    $('h1').html(title)
    gapi.auth2.getAuthInstance().signOut();
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
