
// We stat by initializing all vars and constants
window.requestAnimationFrame = window.requestAnimationFrame
                               || window.mozRequestAnimationFrame
                               || window.webkitRequestAnimationFrame
                               || window.msRequestAnimationFrame
                               || function(f){return setTimeout(f, 1000/60)}

window.cancelAnimationFrame = window.cancelAnimationFrame
                              || window.mozCancelAnimationFrame
                              || function(requestID){clearTimeout(requestID)} //fall back
var requestframeref;

var moneyBagCanvas = document.getElementById('moneyBagCanvas');

var coinsCollected = parseInt(localStorage.getItem('totalCoins'));
if (isNaN(coinsCollected)) {
    coinsCollected = 0;
}
var BEGINER_COINS = 5000;
var borderWidth = 3;
var headerHeight = 41;
var footerHeight = 20;
var footerWidth = 300;
var screenWidth = Math.min(window.innerWidth, screen.width);
var screenHeight = Math.min(window.innerHeight, screen.height);

var adSpaceWidth = 320;
if (adSpaceWidth + 2 * borderWidth > screenWidth ) {
    adSpaceWidth = screenWidth - (2 * borderWidth);
}
var adSpaceHeight = 480;
if (adSpaceHeight + 2 * borderWidth + headerHeight + footerHeight > screenHeight) {
    adSpaceHeight = screenHeight - (2 * borderWidth + footerHeight + headerHeight);
}
var contentWidth = adSpaceWidth + 2 * borderWidth ;
var contentHeight = adSpaceHeight + 2 * borderWidth + headerHeight + footerHeight ;
var contentTop = 0;
var contentLeft = 0;
if (contentLeft + contentWidth < screenWidth) {
    contentLeft = (screenWidth - contentWidth) / 2 ; // align content to center
}
if (contentTop + contentHeight < screenHeight) {
    contentTop = (screenHeight - contentHeight) / 2 ; // align vertically
}
var moneyBagFrameWidth = 146;
var moneyBagFrameHeight = 250;
var moneyBagTargetWidth = 110;
var moneyBagTargetHeight = 188;

var adIndex = 0;
var coinsToCollect = 1;
var ads = ["ads/amazonElectronics.html", "ads/amazonLaLaLand.html", "ads/wix2.html", "ads/adBuff.html",
           "ads/amazonMoana.html", "ads/amazon3DPrinters.html", "ads/wix1.html" ];

var headerElement = document.getElementById("header");
headerElement.style.width = contentWidth;
headerElement.style.height = headerHeight
headerElement.style.left = contentLeft;
headerElement.style.top = contentTop - 7; // allow some space (7px) between the frame and the header

var adFrameElement = document.getElementById("AdFrame");
adFrameElement.style.width = adSpaceWidth;
adFrameElement.style.height = adSpaceHeight;
adFrameElement.style.left = contentLeft;
adFrameElement.style.top = contentTop + headerHeight;

moneyBagCanvas.style.top = borderWidth + adSpaceHeight - moneyBagTargetHeight ;
moneyBagCanvas.style.left = borderWidth + adSpaceWidth - moneyBagTargetWidth;
moneyBagCanvas.width = moneyBagTargetWidth;
moneyBagCanvas.height = moneyBagTargetHeight;

var rulesImg = document.getElementById("rulesImg");

var moneyBagImg = document.createElement('img');
moneyBagImg.src = 'assets/Coins1-5.png';
var ctx = moneyBagCanvas.getContext('2d');
moneyBagImg.onload = function() {
  redrawMoneyBag(0);
};



var footer = document.getElementById("footer");
footer.style.top = contentTop + contentHeight;
footer.style.left = contentLeft + (contentWidth - footerWidth)/4 ;

// 1. Create the button
var adCycleTime = 8; // each ad gets 8 seconds
var framesCount = 64;
var timePerFrame = adCycleTime / framesCount;
var fps = framesCount / adCycleTime;
var secondsLeft = adCycleTime;
var myTimeout ;
var button = document.getElementById("skipButton");
button.innerHTML = "Win " + 5 + " coins in " + Math.trunc(secondsLeft) + "s | SKIP";

// 1.1 get reference to the iframe object
var ifrm = [ document.getElementById('ifid-0'), document.getElementById('ifid-1')];
var activeIframe = 0;
ifrm[0].onload = ifrm0Loaded;
var firstIframeLoaded = false;
function ifrm0Loaded() {
    firstIframeLoaded = true;
    if (coinsCollected < BEGINER_COINS) { // beginers (with less than $0.50) enjoy no clicking on ads
        centerFactor = 0.5;
        ifrm[activeIframe].style.pointerEvents = "none";
    } else {
        centerFactor = 0.9;
        ifrm[activeIframe].style.pointerEvents = "auto";
    }
    console.log("first Ad loaded !!")
}

// 2. Append somewhere
var body = document.getElementsByTagName("body")[0];

// 3. Add event handler
button.addEventListener("click", function() {
  coinsDropAudio.play();
  coinsDropAudio.pause();
  if (messageBox.style.visibility != "hidden") {
    closeMsgBox();
  }
  var curAd = getNextAd();
  var nxtAd = preRenderedAd();
  nextIframe = activeIframe;
  activeIframe = (activeIframe + 1) % 2;
  ifrm[nextIframe].style.visibility = "hidden"
  ifrm[nextIframe].src = nxtAd;
  ifrm[activeIframe].style.visibility = "";
  secondsLeft = adCycleTime;
  clearTimeout(myTimeout)
  lastFrameTS = performance.now();
  countdown(lastFrameTS);
});



// 4. set the the coinsDrop sound effect
var coinsDropAudio = new Audio('assets/coinsDrop.mp3');

// 5. set the sideNav menu
var isSideNavOpen = false;
var sideNav = document.getElementById("mySidenav");
sideNav.style.top = contentTop + headerHeight + borderWidth;
sideNav.style.left = contentLeft + borderWidth;
sideNav.style.width = "0px";
sideNav.style.height = contentHeight - 2 * (footerHeight +  headerHeight);


// 6. set the stinger to come once a while.
var stingerEvery = 64;
var stingerIntervalRef;
var stingerShowPaused = true;
resumeStingerShow(); // start the stingerShow every xx seconds.
var stingerTimeoutRef;
var stingerCanvas = document.getElementById('stingerCanvas');
stingerCanvas.style.top = borderWidth;
stingerCanvas.style.left = borderWidth;
stingerCanvas.style.visibility = "hidden";
stingerCanvas.width = 50;
stingerCanvas.height = 50;
var stingerShowTime = 8; // 8 seconds stinger Show time
var stringerFrameTime = 0.125; // we change image every 1/8 second
var stingerImg = document.createElement('img');
stingerImg.src = 'assets/stingerSprite.png';
var sCtx = stingerCanvas.getContext('2d');
stingerImg.onload = function() {
  console.log("stingerImage loaded");
};

// now let's start the party
ifrm[0].src = getNextAd();
ifrm[1].src = preRenderedAd();

var lastFrameTS = performance.now();
var firstAdAttempts = 0;

if (coinsCollected == 0) {
    showRules(); // we show rules for the first time only
} else {
    hideRules();
    countdown(lastFrameTS);
}

function countdown(timestamp) {
  if (!firstIframeLoaded) { // wait for the first ad to load
      if (firstAdAttempts++ < 8) { // we don't wait more than 8 attempts (2 seconds)
           console.log("1st ad hasn't loaded yet");
           myTimeout = setTimeout(countdown, 250);
           return;
      } else {
           console.log("we've been waiting " + firstAdAttempts + " wait no more, we continue without 1st ad");
      }
  }
  if (secondsLeft <= timePerFrame) {
    button.innerHTML = "You won " + coinsToCollect + " coins | NEXT";
    if (coinsCollected < BEGINER_COINS && coinsCollected + coinsToCollect >= BEGINER_COINS) {
        openMsgBox("From now on, all Ad clicks are enabled", "DarkSlateGrey")
    }
    coinsCollected += coinsToCollect;
    redrawMoneyBag(framesCount - 1);
    localStorage.setItem('totalCoins', coinsCollected);
    return;
  }
  if (secondsLeft < 1.0) {
    coinsDropAudio.play();
  }
  secondsLeft -= timePerFrame;
  button.innerHTML = "Win " + coinsToCollect + " coins in " + Math.trunc(secondsLeft) + "s | SKIP";
  var frameIndex = (adCycleTime - secondsLeft) * fps % framesCount;
  redrawMoneyBag(frameIndex);
  lastFrameTS = timestamp;
  myTimeout = setTimeout( function() {requestframeref = window.requestAnimationFrame(countdown); }, 1000/fps);
}

function getNextAd() {
  adIndex = adIndex % ads.length;
  coinsToCollect =  Math.floor(Math.random() * 5) + 1;
  return ads[adIndex++];
}

function preRenderedAd() {
   return ads[adIndex % ads.length];
}

function redrawMoneyBag(frameIndex) {
  ctx.clearRect(0, 0, moneyBagTargetWidth, moneyBagTargetHeight);
  ctx.drawImage(moneyBagImg, frameIndex * moneyBagFrameWidth, (coinsToCollect -1) * moneyBagFrameHeight, // which frame of the sprite we take (frameIndex)
                 moneyBagFrameWidth, moneyBagFrameHeight, // frame size w,h
                 0, 0, // target x, y
                 moneyBagTargetWidth, moneyBagTargetHeight); // target w, h
  writeSum();
}

function writeSum() {
  ctx.font = "bold 16px Georgia";
  ctx.fillStyle = 'LightGoldenRodYellow';
  var dollars = Math.floor(coinsCollected / 100) * 0.01 ;
  var dollarsText = "" + dollars ;
  if (dollars == 0) {
    dollarsText = "0.00";
  }
  var remainingCoins = Math.floor(coinsCollected - (dollars /0.01 * 100));
  ctx.fillText("$" + dollarsText,
              moneyBagTargetWidth * 0.25, moneyBagTargetHeight * 0.8 );
  ctx.fillText(remainingCoins + " coins",
            moneyBagTargetWidth * 0.17, moneyBagTargetHeight * 0.9 );

}


/* SideNav Handling */
function toggleSideNav() {
    if (isSideNavOpen) {
        closeNav();
    } else {
        openSideNav();
    }
}
/* Set the width of the side navigation to 200px */
function openSideNav() {
    sideNav.style.width = "200px";
    isSideNavOpen = true;
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    isSideNavOpen = false;
}

/* MessageBox handling */
var msgBoxInnerText = document.getElementById("msgBoxInnerText");
var messageBox = document.getElementById("messageBox");
messageBox.addEventListener("click", closeMsgBox);

function closeMsgBox() {
    messageBox.style.visibility = "hidden";
    adFrameElement.removeEventListener("click", closeMsgBox);
    if (stingerShowPaused == true) {
        resumeStingerShow();
    }
}
function openMsgBox(msg, color) {
    if (color) {
        messageBox.style.background = color;
        msgBoxInnerText.style.background = color;
    } else { // red is our default background
        messageBox.style.background = "DarkRed";
        msgBoxInnerText.style.background = "DarkRed";
    }
    msgBoxInnerText.innerHTML = "<br>" + msg;
    messageBox.style.top = contentTop + contentHeight / 3 ;
    messageBox.style.left = contentLeft + contentWidth / 3;
    messageBox.style.visibility = "";
    pauseStingerShow();
}

// Stinger Thief animation
var rafID;
var stingerStartX;
var stingerStartY;
var stingerEndX;
var stingerEndY;
var stingerCurrentX;
var stingerCurrentY;
var flyLeftStartFrame = 8;
var flyDownStartFrame = 24;
var flyUpStartFrame = 16;
var flyRightStartFrame = 0;
var currentAnimationFrame;
var flyStartFrame = flyUpStartFrame;
var flyFrame = flyStartFrame;
var xPoints;
var yPoints;
var showStartTime;
var isShowFirstFrame = true;
var stingerGotCaught = false;
var startingScale = adSpaceHeight + adSpaceWidth;
stingerCanvas.addEventListener("click", function(event) {
    var x = event.pageX - (this.offsetLeft + this.parentElement.offsetLeft);
    var y = event.pageY - (this.offsetTop + this.parentElement.offsetTop);
    if ( isInCenterOf(x, y, stingerCanvas.width, stingerCanvas.height) ) {
        var winCoins = Math.floor(Math.random() * 5) + 7; // 7-12 coins winning
        openMsgBox("Ouch. You won my money, " +  winCoins + " coins", "DarkGreen");
        if (coinsCollected < BEGINER_COINS && coinsCollected + coinsToCollect >= BEGINER_COINS) {
            openMsgBox("From now on, Ad clicks are enabled", "DarkSlateGrey")
        }
        coinsCollected += winCoins;
        localStorage.setItem('totalCoins', coinsCollected);
        redrawMoneyBag(0);
        cancelAnimationFrame(rafID);
        clearTimeout(stingerTimeoutRef);
        clearInterval(stingerIntervalRef);
        stingerCanvas.style.visibility = "hidden";
        stingerGotCaught = true;

    } else {
        console.log("You can't catch me");
    }
});
// prevent doubleTap zooming when trying to kill the musquitto
stingerCanvas.addEventListener('touchstart', preventZoom);

var centerFactor = 1.0;
function isInCenterOf(x, y, w, h) {
    var centerW = w * centerFactor;
    var centerH = h * centerFactor;
    var lowerX = (w - centerW) / 2;
    var upperX = lowerX + centerW;
    var lowerY = (h - centerH) / 2;
    var upperY = lowerY + centerH;
    if ( x > lowerX && x < upperX && y > lowerY && y < upperY ) {
        return true;
    }
    return false;
}

/* make the stinger Show */
function stingerShow() {
  stingerCanvas.style.visibility = "";
  var startingPoint = randomInRange(0, startingScale);
  if (startingPoint <= adSpaceHeight / 2) {
    stingerStartX = 0;
    stingerStartY = (adSpaceHeight / 2) - startingPoint;
    flyStartFrame = flyRightStartFrame;
  } else if (startingPoint <= (adSpaceHeight/2) + adSpaceWidth) {
    stingerStartY = 0;
    stingerStartX = startingPoint - (adSpaceHeight / 2);
    flyStartFrame = flyDownStartFrame;
  } else {
    stingerStartX = adSpaceWidth;
    stingerStartY = startingPoint - (adSpaceHeight / 2 + adSpaceWidth);
    flyStartFrame = flyLeftStartFrame;
  }
  flyFrame = flyStartFrame;
  stingerEndY = borderWidth + adSpaceHeight - moneyBagTargetHeight ; // the stinger wants to reach the money
  stingerEndX = borderWidth + adSpaceWidth - moneyBagTargetWidth;
  xPoints = randomPointsInRange(0, adSpaceWidth, stingerShowTime);
  yPoints = randomPointsInRange(0, adSpaceHeight, stingerShowTime);
  stingerCurrentX = stingerStartX;
  stingerCurrentY = stingerStartY;
  isShowFirstFrame = true;
  stingerShowPaused = false;
  stingerCanvas.style.pointerEvents = "auto";
  stingerGotCaught = false;
  stingerRedraw(performance.now());
}

function randomInRange(min, max) {
	var x = Math.random() * (max-min) + min;
  return Math.floor(x);
}

function randomPointsInRange(min, max, n) {
  var start = min;
  var end = max;
  var points = new Array(n);
  points[0] = min;
  for (i=1; i < points.length - 1; i++) {
  	var j = randomInRange(0, adSpaceWidth);
    points[i] = j;
  }
  points[points.length -1] = max;
  return points;
}

function pauseStingerShow() {
        cancelAnimationFrame(rafID); // close/cancel all recursive calls
        clearTimeout(stingerTimeoutRef);
        clearInterval(stingerIntervalRef);
        stingerShowPaused = true;
        stingerCanvas.style.visibility = "hidden";
        console.log("stingerShow paused");
}

function resumeStingerShow() {
    if (stingerShowPaused == true) {
        stingerIntervalRef = setInterval(stingerShow, stingerEvery * 1000);
        stingerShowPaused = false;
        console.log("stingerShowResumed");
    } else {
        console.log("resume called twice, ignoring 2nd call");
    }
}

function pauseGame() {
    if (stingerShowPaused) {
        closeMsgBox();
        openMsgBox("Game Resumed", "DarkGreen");
        closeNav();
        setTimeout(closeMsgBox, 1500);
        resumeStingerShow();
    } else {
        openMsgBox("Game Paused", "DarkSlateGrey");
        closeNav();
        pauseStingerShow();
    }
}


function stingerRedraw(timestamp) {
   if (stingerShowPaused) {
       return;
   }
   if (isShowFirstFrame) {
        showStartTime = timestamp;
        isShowFirstFrame = false;
    }
    var nextStation = Math.floor( (timestamp - showStartTime) / 1000 ) + 1;
    if (nextStation >= stingerShowTime || stingerGotCaught) {
        console.log("stinger reached destination");
        stingerCanvas.style.visibility = "hidden";
        isShowFirstFrame = true;
        if (!stingerGotCaught) {
            var lostCoins = Math.floor(Math.random() * 5) + 3; // 3-8 coins can be lost to the stinger
            openMsgBox("Stinger took " + lostCoins + " coins from you", "DarkRed");
            coinsCollected -= lostCoins;
            localStorage.setItem('totalCoins', coinsCollected);
        }
        redrawMoneyBag(0);
        return;
    }
    var deltaX = xPoints[nextStation] - stingerCurrentX;
    var deltaY = yPoints[nextStation] - stingerCurrentY;
    stingerCurrentX += deltaX / fps;
    stingerCurrentY += deltaY / fps;
    flyFrame = (flyFrame + 1)%8;
    if (Math.abs(deltaY) > Math.abs(deltaX) ) {
        if (deltaY >= 0) {
            flyStartFrame = flyDownStartFrame;
        } else {
            flyStartFrame = flyUpStartFrame;
        }
    } else {
        if (deltaX >= 0) {
            flyStartFrame = flyRightStartFrame;
        } else {
            flyStartFrame = flyLeftStartFrame;
        }
    }
    currentAnimationFrame = flyStartFrame + flyFrame;

    sCtx.clearRect(0, 0, stingerCanvas.width, stingerCanvas.height);
    stingerCanvas.style.top = stingerCurrentY;
    stingerCanvas.style.left = stingerCurrentX;
    sCtx.beginPath();
    sCtx.drawImage(stingerImg, 50 * currentAnimationFrame, 0, // which frame of the sprite we take (frameIndex)
                 50, 50, // frame size w,h
                 0, 0, // target x, y
                 50, 50); // target w, h
    stingerTimeoutRef = setTimeout(function() {rafID = requestAnimationFrame(stingerRedraw);}, 1000/fps);
}

function preventZoom(e) {
  var t2 = e.timeStamp;
  var t1 = e.currentTarget.dataset.lastTouch || t2;
  var dt = t2 - t1;
  var fingers = e.touches.length;
  e.currentTarget.dataset.lastTouch = t2;

  if (!dt || dt > 500 || fingers > 1) return; // not double-tap

  e.preventDefault();
  e.target.click();
}

function   hideRules() {
   rulesImg.style.visibility = "hidden";
   ifrm[activeIframe].style.visibility = "";
   ifrm[activeIframe].style.height = "100%";
   rulesImg.style.height = 0;
   rulesImg.style.width = 0;
   moneyBagCanvas.style.visibility = "";
   if (coinsCollected == 0) {
      lastFrameTS = performance.now();
      countdown(lastFrameTS);
   }
   resumeStingerShow();
}

function showRules() {
   closeNav();
   rulesImg.style.visibility = "";
   rulesImg.style.height = "100%";
   rulesImg.style.width = "100%";
   ifrm[activeIframe].style.visibility = "hidden";
   moneyBagCanvas.style.visibility = "hidden";
   ifrm[activeIframe].style.height = 0;
   pauseStingerShow();
}

