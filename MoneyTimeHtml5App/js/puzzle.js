
const DROP_TARGET_HINT = '#00D0D0';
const MISPLACED_PIECE_HINT = '#D00000';

var _context;
var _canvas;
var _iframedPage;

var levelStr = getParameterByName("level");
if (levelStr) {
    var lvl  = parseInt(levelStr);
    if (lvl) {
        setLevel(lvl);
    }
}

var _img;
var _pieces;
var _puzzleWidth;
var _puzzleHeight;
var _pieceWidth;
var _pieceHeight;
var _currentPiece;
var _currentDropPiece;
var shouldCheckPassiveListeners = true;
var browserHasPassiveListeners = false;
var _bestScore4Puzzle;
var _yourPercentile;
var _gamePaused = false;

var _mouse;

var devicePixelRatio = window.devicePixelRatio || 1;
var screenWidth =  window.innerWidth ; //Math.min(window.innerWidth, getCurrentScreenWidth());
var screenHeight = window.innerHeight; //Math.min(window.innerHeight, getCurrentScreenHeight());
var images = [ "assets/p/MB-GLA-2017.jpg", "assets/p/ISki.jpeg", "assets/p/MistyBridge.com.jpg", "assets/p/Mercedes-AMG-2.jpg",
                "assets/p/Rolex-Ad.jpg", "assets/p/FunWorld.jpg", "assets/p/Zoo_Barcelona.jpg", "assets/p/NYC.jpg",
                "assets/p/Porsche.jpg", "assets/p/chanel.jpg", "assets/p/Gucci.jpg", "assets/p/Lamborghini.jpg",
                "assets/p/elsa.jpeg", "assets/p/MassEffect.jpg", "assets/p/norway.jpg", "assets/p/ayunwadi.jpg",
                "assets/p/puzzle-16.jpg", "assets/p/puzzle-17.jpg", "assets/p/puzzle-18.jpg", "assets/p/puzzle-19.jpg", "assets/p/puzzle-20.jpg"
             ];
var shortURLs = ["http://shdw.co/28YtTT", // puzzle.html
                 "http://shdw.co/1oP9wJ", // puzzle1.html
                 "http://shdw.co/-mzCqu", // puzzle2.html
                 "http://shdw.co/2tc-sU", // puzzle3.html
                 "http://shdw.co/2ZdIub", // puzzle4.html
                 "http://shdw.co/-jyTo1", // puzzle5.html
                 "http://shdw.co/1dQOyg", // puzzle6.html
                 "http://shdw.co/0XBJk8", // puzzle7.html
                 "http://shdw.co/1IOzvR", // puzzle8.html
                 "http://shdw.co/0NDmpt", // puzzle9.html
                 "http://shdw.co/0m8E5r", // puzzle10.html
                 "http://shdw.co/1tT17H", // puzzle11.html
                 "http://shdw.co/-zv41w", // puzzle12.html
                 "http://shdw.co/2og7BO", // puzzle13.html
                 "http://shdw.co/2dhQDW", // puzzle14.html
                 "http://shdw.co/-XuL-3"  // puzzle15.html
            ]
var imgIndex = 0;
var clock;
$(document).ready(function() {
			clock = $('.clock').FlipClock({
                clockFace: 'MinuteCounter'
            });
            clock.stop();
		});
var bestSolveTime;
var _onIframedPage = false;

function init(){
    if (_onIframedPage) {
        closeIframedPage();
    }
    var imgI = getImageIndexFromHref();
    if (imgI) {
        imgIndex = parseInt(imgI);
    }
    _img = new Image();
    _img.addEventListener('load',onImage,false);
    _img.src = images[imgIndex] ;
    _bestScore4Puzzle = document.getElementById("bestScore4Puzzle");
    _yourPercentile = document.getElementById("urBetterValue");
}

function convertCanvasToImage(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	return image;
}

function onImage(e){
    _puzzleWidth = Math.min(_img.width, screenWidth - document.getElementById("sideMenu").offsetWidth);
    _puzzleWidth = Math.floor(_puzzleWidth / level) * level;
    _pieceWidth = Math.floor(_puzzleWidth / level)
    _puzzleHeight = Math.min(_img.height, screenHeight);
    _puzzleHeight = Math.floor(_puzzleHeight / level) * level;
    _pieceHeight = Math.floor(_puzzleHeight / level)
    _puzzleWidth = _pieceWidth * level;
    _puzzleHeight = _pieceHeight * level;
    setCanvas();
    initPuzzle();
}
function setCanvas(){
    _canvas = document.getElementById('puzzleCanvas');
    _context = _canvas.getContext('2d');
    _canvas.width = _puzzleWidth;
    _canvas.height = _puzzleHeight;
    _canvas.style.border = "1px solid black";
    _iframedPage = document.getElementById("lbIframe");
}
var actualImg;
var _onTouch2StartState = true;

function initPuzzle(){
    _pieces = [];
    _mouse = {x:0,y:0};
    _currentPiece = null;
    _currentDropPiece = null;
    _context.drawImage(_img, 0, 0, _img.width, _img.height, 0, 0, _puzzleWidth, _puzzleHeight);
    actualImg = convertCanvasToImage(_canvas);
    createTitle("Touch to Start");
    _onTouch2StartState = true;
    bestSolveTime = parseInt(localStorage.getItem('bestPuzzleScore-' + images[imgIndex]));
    if (bestSolveTime) {
       displayBestScore(bestSolveTime);
    } else {
        displayBestScore(0);
    }
    buildPieces();
}

function displayBestScore(bst) {
    var m;
    var s;
    if (bst) {
        m = Math.floor(bst / 60) ;
        s = bst % 60;
    } else {
        m = 0;
        s = 0;
    }
    _bestScore4Puzzle.innerHTML = "<span class=" + "\"digit-" + Math.floor(m / 10) + "\">9</span> \n"
                                 + "<span class=" + "\"digit-" + Math.floor(m % 10) + "\">9</span> \n"

                                 + "<span>:</span> \n"

                                 + "<span class=" + "\"digit-" + Math.floor(s / 10) + "\">9</span> \n"
                                 + "<span class=" + "\"digit-" + Math.floor(s % 10) + "\">9</span> \n";
    if (bst) {
        _yourPercentile.innerText = calcPercentile(bst, level).toFixed(1) + "%";
    } else {
        _yourPercentile.innerText = "- - %";
    }
}

function createTitle(msg){
    _context.fillStyle = "#000000";
    _context.globalAlpha = .4;
    _context.fillRect(100,_puzzleHeight - 40,_puzzleWidth - 200,40);
    _context.fillStyle = "#FFFFFF";
    _context.globalAlpha = 1;
    _context.textAlign = "center";
    _context.textBaseline = "middle";
    _context.font = "20px Arial";
    _context.fillText(msg,_puzzleWidth / 2,_puzzleHeight - 20);
}
function buildPieces(){
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < level * level;i++){
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        _pieces.push(piece);
        xPos += _pieceWidth;
        if(xPos >= _puzzleWidth){
            xPos = 0;
            yPos += _pieceHeight;
        }
    }
    _canvas.addEventListener('mousedown', shufflePuzzle);
    _canvas.addEventListener('touchstart', shufflePuzzle);
}

function shufflePuzzle(){
    _canvas.removeEventListener('mousedown', shufflePuzzle);
    _canvas.removeEventListener('touchstart', shufflePuzzle);
    _pieces = shuffleArray(_pieces);
    _context.clearRect(0,0,_puzzleWidth,_puzzleHeight);
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < _pieces.length;i++){
        piece = _pieces[i];
        piece.xPos = xPos;
        piece.yPos = yPos;
        _context.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
        _context.strokeRect(xPos, yPos, _pieceWidth,_pieceHeight);
        xPos += _pieceWidth;
        if(xPos >= _puzzleWidth){
            xPos = 0;
            yPos += _pieceHeight;
        }
    }
    clock.setTime(0);
    clock.start();
    _canvas.onmousedown = onPuzzleClick;
    addActiveStartListener();
    _onTouch2StartState = false;
     ga('send', 'event', TIME_PUZZLE_EVENTS, 'puzzleStart', 'user="' + userName() + '", imgIndex=' + imgIndex );
}

function onPuzzleClick(e){
    e.preventDefault();
    if (e.touches && e.touches[0]) {
        _mouse.x = e.touches[0].pageX - _canvas.offsetLeft;
        _mouse.y = e.touches[0].pageY - _canvas.offsetTop;
    } else if(e.layerX || e.layerX == 0){
        _mouse.x = e.layerX - _canvas.offsetLeft;
        _mouse.y = e.layerY - _canvas.offsetTop;
    } else if(e.offsetX || e.offsetX == 0){
        _mouse.x = e.offsetX - _canvas.offsetLeft;
        _mouse.y = e.offsetY - _canvas.offsetTop;
    }
    _currentPiece = checkPieceClicked();

    if(_currentPiece != null){
        _context.clearRect(_currentPiece.xPos,_currentPiece.yPos,_pieceWidth,_pieceHeight);
        _context.save();
        _context.globalAlpha = .9;
        _context.drawImage(actualImg, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
        _context.restore();
        _canvas.onmousemove = updatePuzzle;
        addActiveMoveListener();
        _canvas.onmouseup = pieceDropped;
        _canvas.ontouchend = pieceDropped;
    }
}
function checkPieceClicked(){
    var i;
    var piece;
    for(i = 0;i < _pieces.length;i++){
        piece = _pieces[i];
        if(_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)){
            //PIECE NOT HIT
        }
        else{
            return piece;
        }
    }
    return null;
}
function updatePuzzle(e){
    e.preventDefault();
    _currentDropPiece = null;
    if (e.touches && e.touches[0]) {
        _mouse.x = e.touches[0].pageX - _canvas.offsetLeft;
        _mouse.y = e.touches[0].pageY - _canvas.offsetTop;
    } else if(e.layerX || e.layerX == 0){
        _mouse.x = e.layerX - _canvas.offsetLeft;
        _mouse.y = e.layerY - _canvas.offsetTop;
    }
    else if(e.offsetX || e.offsetX == 0){
        _mouse.x = e.offsetX - _canvas.offsetLeft;
        _mouse.y = e.offsetY - _canvas.offsetTop;
    }
    _context.clearRect(0,0,_puzzleWidth,_puzzleHeight);
    var i;
    var piece;
    for(i = 0;i < _pieces.length;i++){
        piece = _pieces[i];
        if(piece == _currentPiece){
            continue;
        }
        _context.drawImage(actualImg, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        _context.strokeRect(piece.xPos, piece.yPos, _pieceWidth,_pieceHeight);
        if(_currentDropPiece == null){
            if(_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)){
                //NOT OVER
            }
            else{
                _currentDropPiece = piece;
                _context.save();
                _context.globalAlpha = .4;
                _context.fillStyle = DROP_TARGET_HINT;
                _context.fillRect(_currentDropPiece.xPos,_currentDropPiece.yPos,_pieceWidth, _pieceHeight);
                _context.restore();
            }
        }
    }
    _context.save();
    _context.globalAlpha = .6;
    _context.drawImage(actualImg, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
    _context.restore();
    _context.strokeRect( _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth,_pieceHeight);
}
function pieceDropped(e){
    _canvas.onmousemove = null;
    _canvas.removeEventListener("touchmove", updatePuzzle);
    _canvas.ontouchmove = null;
    _canvas.onmouseup = null;
    _canvas.ontouchend = null;
    if(_currentDropPiece != null){
        var tmp = {xPos:_currentPiece.xPos,yPos:_currentPiece.yPos};
        _currentPiece.xPos = _currentDropPiece.xPos;
        _currentPiece.yPos = _currentDropPiece.yPos;
        _currentDropPiece.xPos = tmp.xPos;
        _currentDropPiece.yPos = tmp.yPos;
    }
    resetPuzzleAndCheckWin();
}
function resetPuzzleAndCheckWin(){
    _context.clearRect(0,0,_puzzleWidth,_puzzleHeight);
    var gameWin = true;
    var i;
    var piece;
    for(i = 0; i < _pieces.length; i++){
        piece = _pieces[i];
        _context.drawImage(actualImg, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        _context.strokeRect(piece.xPos, piece.yPos, _pieceWidth,_pieceHeight);
        if(piece.xPos != piece.sx || piece.yPos != piece.sy){
            gameWin = false;
        }
    }
    if(gameWin){
        clock.stop();
        var solveTime = clock.getTime().time;
        if (!bestSolveTime || solveTime < bestSolveTime) {
            bestSolveTime = solveTime;
            localStorage.setItem('bestPuzzleScore-' + images[imgIndex], bestSolveTime);
        }
        setTimeout(gameOver, 500);
        ga('send', 'event', TIME_PUZZLE_EVENTS, 'puzzleSolved', 'user="' + userName() + '", imgIndex=' + imgIndex + ", solveTime=" + solveTime);
    }
}
function gameOver(){
    clock.stop();
    clearMouseEvents();
    initPuzzle();
}
function shuffleArray(o){
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function addActiveStartListener() {
    _canvas.removeEventListener('touchstart', shufflePuzzle) ;
    _canvas.addEventListener('touchstart', onPuzzleClick, {passive:false});
}

function addActiveMoveListener() {
   _canvas.ontouchmove = null;
   _canvas.addEventListener('touchmove', updatePuzzle, {passive: false});
}

function nextImage() {
   gameOver();
   imgIndex = (imgIndex +1) % images.length;
   var imgI = getParameterByName('imgI');
   if (imgI) {
       location.search = "";
   }
   location.hash = imgIndex + "";
   clock.setTime(0);
   ga('send', 'event', TIME_PUZZLE_EVENTS, 'nextPuzzle', 'user="' + userName() + '", imgIndex=' + imgIndex );
   ga('set', 'page', '/puzzle' + imgIndex + '.html');
   ga('send', 'pageview');
   init();
}

function replayGame() {
    gameOver();
    location.hash = imgIndex + "";
    ga('send', 'event', TIME_PUZZLE_EVENTS, 'replayPuzzle', 'user="' + userName() + '", imgIndex=' + imgIndex );
    init();
}

function prevImage() {
    gameOver();
    if (imgIndex > 0) {
      imgIndex--;
    } else {
      imgIndex = images.length -1;
    }
    var imgI = getParameterByName('imgI');
    if (imgI) {
        location.search = "";
    }
    location.hash = imgIndex + "";
    clock.setTime(0);
    ga('send', 'event', TIME_PUZZLE_EVENTS, 'prevPuzzle', 'user="' + userName() + '", imgIndex=' + imgIndex );
    ga('set', 'page', '/puzzle' + imgIndex + '.html');
    ga('send', 'pageview');
    init();
}

function leadersBoard() {
    if (_onIframedPage) {
        closeIframedPage();
    } else {
        var minutes = Math.floor(bestSolveTime / 60) ;
        var seconds = bestSolveTime % 60;
        var bsStr = "&bs=" + pad0(minutes) + ":" + pad0(seconds);
        var asStr = "&as=" + calcAvgScore().toFixed(1);
        ga('send', 'event', TIME_PUZZLE_EVENTS, 'leadersBoard', 'user="' + userName() + '", imgIndex=' + imgIndex + ", avgScore=" + asStr );
        openIframedPage("leaders.html?img=" + images[imgIndex] +  bsStr + asStr);
    }
}

function iqPage() {
    if (_onIframedPage) {
        closeIframedPage();
    } else {
        var bsStr = "&bs=" + bestSolveTime;
        var asStr = "&as=" + calcAvgScore().toFixed(1);
        ga('send', 'event', TIME_PUZZLE_EVENTS, 'iqPage', 'user="' + userName() + '", imgIndex=' + imgIndex + ", avgScore=" + asStr );
        openIframedPage("iqchart.html?img=" + images[imgIndex] + bsStr + asStr);
    }
}

function calcAvgScore() {
    var nVals = 0;
    var sum = 0;
    for (var i = 0; i < images.length; i++) {
        var lsVal = localStorage.getItem('bestPuzzleScore-' + images[i]);
        var bsti;
        if (lsVal) {
            bsti = parseInt(lsVal);
        }
        if (isNaN(bsti)) continue;
        var p = calcPercentile(bsti, level);
        if (!p || isNaN(p)) continue;
        sum += p;
        nVals++;
    }
    if (nVals == 0) return 0;
    var avgScore = sum / nVals;

    return avgScore;
}

function closeIframedPage() {
    _canvas.style.visibility = "visible";
    _iframedPage.style.visibility = "hidden";
    _iframedPage.style.width = "0px";
    _iframedPage.style.height = "0px";
    _onIframedPage = false;
}

function openIframedPage(loc) {
    _canvas.style.visibility = "hidden";
    _iframedPage.src = loc;
     _iframedPage.style.width = "736px";
     _iframedPage.style.height = "460px";
    _iframedPage.style.visibility = "visible";
    _onIframedPage = true;
    ga('set', 'page', 'loc');
    ga('send', 'pageview');
}

function pad0(v) {
    var str = "" + v;
    if (str.length >= 2) return str;
    return "0" + v;
}

var prevLevel = level;
function userSettings() {
    if (_onIframedPage) {
        closeIframedPage();
        var usrlvl = localStorage.getItem(USER_LEVEL); // settings can change our level
        if (usrlvl && usrlvl != prevLevel) {
            level = usrlvl;
            gameOver();
            ga('send', 'event', TIME_PUZZLE_EVENTS, 'levelChanged', 'user="' + userName() + '", imgIndex=' + imgIndex + " level=" + level );
            init();
        }
    } else {
        var bsStr = "&bs=" + bestSolveTime;
        var asStr = "&as=" + calcAvgScore().toFixed(1);
        prevLevel = localStorage.getItem(USER_LEVEL);
        openIframedPage("usettings.html");
    }
}

var _originGlobalAlpha;

function pauseGame() {
    ga('send', 'event', TIME_PUZZLE_EVENTS, 'pausePlay', 'user="' + userName() + '", imgIndex=' + imgIndex );
    if (_onTouch2StartState) {
        shufflePuzzle(); // puzzle not started yet, we default to 'play' mode;
        return;
    }
    if (_gamePaused) {
        resumeGame();
    } else {
        clock.stop();
        _gamePaused = true;
        var gameWin = true;
        var i;
        var piece;
        _context.save();
        _originGlobalAlpha = _context.globalAlpha;
        _context.globalAlpha = .4;
        _context.fillStyle = MISPLACED_PIECE_HINT;

        for(i = 0; i < _pieces.length; i++){
            piece = _pieces[i];
            if(piece.xPos != piece.sx || piece.yPos != piece.sy){
                gameWin = false;
                _context.fillRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight); // mark the misplaced piece
            }
        }
        if (gameWin) {
            createTitle(" Puzzle is Solved");
            resumeGame();
        } else {
            createTitle( " Puzzle not solved yet. Game Paused");
            clearMouseEvents();
        }
    }
}

function resumeGame() {
    _gamePaused = false;
    clock.start();
    _context.globalAlpha = _originGlobalAlpha;
    _canvas.onmousedown = onPuzzleClick;
    addActiveStartListener();
    resetPuzzleAndCheckWin();
}

function clearMouseEvents() {
    _canvas.onmousedown = null;
    _canvas.removeEventListener("touchstart", onPuzzleClick);
    _canvas.ontouchstart = null;
    _canvas.onmousemove = null;
    _canvas.removeEventListener("touchmove", updatePuzzle);
    _canvas.onmtouchmove = null;
    _canvas.onmouseup = null;
    _canvas.ontouchend = null;
}

function sendChallenge() {
    if (isMobile.any()) {
        ga('send', 'event', TIME_PUZZLE_EVENTS, 'sendChallenge', 'user="' + userName() + '", imgIndex=' + imgIndex + ", bestTime=" + bestSolveTime);
        var hrf;
        if (bestSolveTime) {
            hrf = "whatsapp://send?text=" + userName() + " solved this puzzle in " +
                bestSolveTime + " seconds @level:" + level + ". Can you do better? " + shortURLs[imgIndex];
        } else {
             hrf = "whatsapp://send?text=" + userName() + " wasn't able to solve this puzzle. Can you?" + shortURLs[imgIndex];
        }
        document.getElementById('sendChallenge').href = hrf;
    } else {
            alert("WhatsApp messages work only on Mobile Devices")
    }
}

function userName() {
  var uName = localStorage.getItem(USER_NAME);
        if (!uName) {
            return  "I";
        }
  return uName;
}

function sendFBShare() {
    var txt;
    ga('send', 'event', TIME_PUZZLE_EVENTS, 'facebookShare', 'user="' + userName() + '", imgIndex=' + imgIndex + ", bestTime=" + bestSolveTime);
    if (bestSolveTime) {
        txt = "I solved this puzzle in " + bestSolveTime + " seconds @level:" + level + ". Can you break my record? ";
    } else {
        txt = " I wasn't able to solve this puzzle. Can you?"
    }
    var shareObject = {
                       app_id: '1911981235740510',
                       method: 'share',
                       href: shortURLs[imgIndex],
                       quote: txt
                     }
    FB.ui(shareObject, function(response){});
}

function getImageIndexFromHref() {
    var hashValue = location.hash;
    var iix;
    if (hashValue) {
        iix = parseInt(hashValue.substring(1));
        if (!isNaN(iix)) {
            return iix;
        }
    }
    var hrf = location.href;
    var l = hrf.lastIndexOf("/puzzle");
    if (l == -1) {
        return 0;
    }
    if (hrf.charAt(l + 7) == '.') {
        return 0;
    }
    var e = hrf.lastIndexOf('.');
    if (e == -1) {
        return 0;
    }
    var iixStr = hrf.substring(l + 7, e);
    iix = parseInt(iixStr);
    if (iix) {
        return iix;
    }
    return 0;
}
