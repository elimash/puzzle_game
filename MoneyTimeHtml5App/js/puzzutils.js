var USER_NAME = 'userName';
var USER_GENDER = 'userGender';
var USER_BORN_DATE = 'bornDate';
var USER_COUNTRY = 'userCountry';
var TIME_PUZZLE_EVENTS = 'TimePuzzleEvents';
var USER_LEVEL = 'userLevel';

var userName = localStorage.getItem(USER_NAME);
var userGender = localStorage.getItem(USER_GENDER);
var userBornDate = localStorage.getItem(USER_BORN_DATE);
var userCountry = localStorage.getItem(USER_COUNTRY);
var userLevel = localStorage.getItem(USER_LEVEL);

const PUZZLE_LEVEL = 4; // default level
var level ;
if (userLevel) {
    level = userLevel;
} else {
    level = PUZZLE_LEVEL;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function calcPercentile(bst, level) {
    if (isNaN(bst)) {
        return 0;
    }
    const PPS = 1 / 100; // percentage of solvers per secnond
    var MINST = level * level; // minimal time in seconds for solving a puzzle, assume 1s per piece.

    var remP = 1 - PPS; // remaining Percentage
    var n = bst - MINST;
    if ( n < 0) { n = 1; }
    var result = (100 * Math.pow(remP, n));

    var factor = 40 ; // last we factor the average because puzzle solvers are higher than the general population
    result = factor + (1 - (factor/100)) * result;

    return result;
}

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

function getCurrentScreenWidth() {
    if (!window.orientation || window.orientation % 180 == 0) {
        return screen.width;
    } else {
        return screen.height;
    }
}

function getCurrentScreenHeight() {
    if (!window.orientation || window.orientation % 180 == 0) {
        return screen.height;
    } else {
        return screen.width;
    }

}

function setLevel(lvl) {
    level = lvl;
}
