// https://docs.unity3d.com/Manual/webgl-interactingwithbrowserscripting.html
canvas.addEventListener('touchstart', e => {
    console.log(e);
    for(let i = 0; i < e.touches.length; i++)
    {
        let touchInfo = e.touches[i].clientX.toString() + "," + e.touches[i].clientY.toString() + "," + e.touches[i].identifier.toString();
        myGameInstance.SendMessage('GameState', 'TouchStartEvent', touchInfo);
    }
});

canvas.addEventListener('touchend', e => {
    console.log(e);

    for(let i = 0; i < e.changedTouches.length; i++)
    {
        myGameInstance.SendMessage('GameState', 'TouchReleaseEvent', e.changedTouches[i].identifier.toString());
    }
});


function _ketnetSDKEventListener(event) {
    console.log({ 'ketnet->game': event.type });
    switch (event.type) {
    case "ketnetsdk_init":
        uiInitialized();
        break; 
    case "ketnetsdk_login":
        uiLoggedIn();
        break;
    case "ketnetsdk_logout":
        uiLoggedOut();
        break;
    case "ketnetsdk_back":
        uiBack();
        break;
    case "ketnetsdk_refresh":
        updateUserData();
        break;
    default:
        console.log("unkown event "+ event.type +" from ketnet sdk");
    }
}

//actual SDK instantiation
var sdk = ketnetSDK.createSDK(_ketnetSDKEventListener);

// Change the visibility and contents of a div
function _showNotification(elementId, innerText) {
    var divElement = document.getElementById(elementId);
    divElement.innerText = innerText;
    divElement.style.visibility = 'visible';
}

function uiLoggedIn() {
    setSession();
    _showNotification(
    'notification-login',
    'Game received the login-event from app/web'
    );
};

function uiLoggedOut() {
    setSession();
    _showNotification(
    'notification-login',
    'Game received the logout-event from app/web'
    );
}

function setSession() {
    updateUserData();
    if (sdk.user.isLoggedIn()) {
    loginBtn.innerText = 'Afmelden';
    requestConsentBtn.style.display = 'inherrit';
    stateWidget.style.display = 'block';
    loadState();
    } else {
    stateWidget.style.display = 'none';
    loginBtn.innerText = 'Aanmelden';
    requestConsentBtn.style.display = 'none';
    }
}

function uiInitialized() {
    var id = sdk.game.getId();
    var name = sdk.game.getName();
    var permissions = sdk.game.getPermissions();
    var isInApp = sdk.game.isInApp();
    var appVersion = sdk.game.getAppVersion();
    document.getElementById('gamedata').textContent = JSON.stringify({ id, name, permissions, isInApp, appVersion }, null, 2);
    setSession();
    _showNotification(
    'notification-init',
    'Game received the init-event from app/web'
    );
}

var backPresses = 0;
function uiBack() {
    backPresses++;
    _showNotification(
    'notification-back',
    `Back was pressed ${backPresses} times. Press ${5-backPresses} more times to close the game`,
    );
    if (backPresses >= 5) {
    sdk.game.exit();                
    }
}

function savePhotoGifToCameraRoll() {
    var image = "data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7";
    sdk.nativeApp.savePhotoToCameraRoll(image);
}

function toDataURL(url) {
    return fetch(url)
    .then(function (response) { return response.blob(); })
    .then(function (blob) {
        return new Promise(function(resolve, reject) {
        var reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
        });
    });
}

function savePhotoPngToCameraRoll() {
    toDataURL('https://images.vrt.be/w480hx/2020/07/13/7689ecbe-c51f-11ea-aae0-02b7b76bf47f.png')
    .then(function(dataUrl) {
        sdk.nativeApp.savePhotoToCameraRoll(dataUrl);
    });
}

function savePhotoJpgToCameraRoll() {
    toDataURL('https://images.vrt.be/w1280hx_j80/2020/07/13/750f81bc-c51f-11ea-aae0-02b7b76bf47f.jpg')
    .then(function(dataUrl) {
        sdk.nativeApp.savePhotoToCameraRoll(dataUrl);
    });
}

function saveMovieMovToCameraRoll() {
    toDataURL('https://file-examples-com.github.io/uploads/2018/04/file_example_MOV_480_700kB.mov')
    .then(function(dataUrl) {
        sdk.nativeApp.saveMovieToCameraRoll(dataUrl);
    });
}

function saveMovieM4vToCameraRoll() {
    toDataURL('https://filesamples.com/samples/video/m4v/sample_640x360.m4v')
    .then(function(dataUrl) {
        sdk.nativeApp.saveMovieToCameraRoll(dataUrl);
    });
}

function saveMovieMp4ToCameraRoll() {
    toDataURL('https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4')
    .then(function(dataUrl) {
        sdk.nativeApp.saveMovieToCameraRoll(dataUrl);
    });
}

function saveHighscore(highscoreString, highscoreNumber) {
    // var loggedIn = sdk.user.isLoggedIn();

    // if(!loggedIn)
    // {
    //     console.log('not logged in!');
    //     myGameInstance.SendMessage('GameState', 'SendMessageToGame', 'not logged in!');
    //     return;
    // }

    sdk.state.saveState(highscoreString, 'highscore_list', highscoreNumber, '0').then(function(){
        console.log(highscoreNumber + ' 0');
        myGameInstance.SendMessage('GameState', 'SendMessageToGame', highscoreNumber + ' is saved in state ' +  highscoreString);
    }).catch(function(error) { 
        console.error({ error });
        myGameInstance.SendMessage('GameState', 'SendMessageToGame', highscoreNumber + ' is not saved');
    });
}

function loadHighscore(highscoreString)
{
    sdk.state.loadState(highscoreString, 'highschore_list', true)
    .then(function (state) {
        document.getElementById('storedstate').textContent = JSON.stringify(state, null, 2);
        console.log(JSON.stringify(state, null, 2));
        myGameInstance.SendMessage('GameState', 'ReceiveHighscore', highscoreString + '_' + JSON.stringify(state, null, 2));
    }).catch(function(error){ 
        console.error({ error });
        myGameInstance.SendMessage('GameState', 'ReceiveHighscore', '0');
    });
}

function logIn()
{
    if(!sdk.user.isLoggedIn())
    {
        sdk.user.triggerLogin();
    }
    return sdk.user.isLoggedIn();
}

function saveState() {
    var value = document.getElementById('stateValue').value;
    var largeValue = document.getElementById('stateLargeValue').value;
    sdk.state.saveState('test-state-id', 'test-list-id', value, largeValue).then(function() {
    loadState();
    }).catch(function (error) { console.error({ error }) });
}

function loadState() {
    sdk.state.loadState('test-state-id', 'test-list-id', true)
    .then(function (state) {
        storedState.innerText = JSON.stringify(state, null, 2)
    });
}

function updateUserData() {
    if (sdk.user.isLoggedIn()) {
    userdata.textContent = JSON.stringify({
        info: sdk.user.getInfo(),
        consents: sdk.user.getConsents(),
    }, null, 2);
    userdata.style.display = 'block';
    } else {
    userdata.textContent = '';
    userdata.style.display = 'none';
    }
}

function requestConsent() {
    sdk.user.triggerRequestConsent({
    consent: 'publicUsage',
    childTitle: `Je hebt de toestemming van jouw ouders nodig om foto's door te sturen`,
    childDescription: `Wil je deze toestemming graag? Klik dan op de onderste knop om deze toestemming te vragen. Er wordt dan een mail gestuurd naar jouw ouders met instructies.`,
    childButton: `vraag toestemming aan mijn ouders`,
    parentTitle: `Dit spelletje heeft jouw toestemming nodig`,
    parentDescription: `Omwille van privacy redenen moet je jouw toestemming geven om de tekeningen ingezonden door jouw kind deel te laten nemen aan wedstrijden. Zonder deze toestemming mogen we de tekening niet tonen op televisie.`,
    });
}

        
