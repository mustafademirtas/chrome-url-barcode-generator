let generateCode = document.getElementById('generateCode');
let codeHolder = document.getElementById("qrcode");

window.onload = function () {
    // getUserSetting();
    init();
    randomBackground();
};

function init() {
    generateCode.onclick = function (element) {
        playTickSound();
        chrome.tabs.query({
            'active': true,
            'lastFocusedWindow': true
        }, function (tabs) {
            let url = tabs[0].url;
            getLocalIPs(function (ips) {
                let localip = ips[0];
                url = url.replace("localhost", localip);
                let qrcode = new QRCode(codeHolder, {
                    text: url,
                    width: 200,
                    height: 200,
                    colorDark: "#373737",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                generateCode.disabled = true;
            })
        });
    }
}

function getLocalIPs(callback) {
    var ips = [];

    var RTCPeerConnection = window.RTCPeerConnection ||
        window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    var pc = new RTCPeerConnection({
        // Don't specify any stun/turn servers, otherwise you will
        // also find your public IP addresses.
        iceServers: []
    });
    // Add a media line, this is needed to activate candidate gathering.
    pc.createDataChannel('');

    // onicecandidate is triggered whenever a candidate has been found.
    pc.onicecandidate = function (e) {
        if (!e.candidate) { // Candidate gathering completed.
            pc.close();
            callback(ips);
            return;
        }
        var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
        if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
            ips.push(ip);
    };
    pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
    }, function onerror() {});
}

function randomBackground() {
    var rand = Math.floor((Math.random() * 5) + 1);
    var filename = "../images/" + rand + ".jpg";
    document.querySelector(".qr-code-holder").style.backgroundImage = "url('" + filename + "')";
}

function playTickSound() {
    var myAudio = new Audio(); // create the audio object
    myAudio.src = "../sound/glass-button.mp3"; // assign the audio file to its src
    myAudio.play();
}

function getUserSetting() {
    chrome.storage.sync.get(['user__setting'], function (result) {
        if (result.key) {
            console.log('Value currently is ' + result.key);
        } else {
            console.log('Value currently is ' + result.key);
            setUserSetting({
                playClickSound: true
            });
        }

    });
}

function setUserSetting(setting) {
    chrome.storage.sync.set({
        user__setting: setting
    }, function () {
        console.log('Value is set to ' + setting);
    });

}