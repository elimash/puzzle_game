const PUZZLE_LEVEL = 5;
const DROP_TARGET_HINT = '#00D0D0';

var _context;
var _canvas;
var _iframedPage;

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

var _mouse;

var devicePixelRatio = window.devicePixelRatio || 1;
var screenWidth = devicePixelRatio * Math.min(window.innerWidth, screen.width);
var screenHeight = devicePixelRatio * Math.min(window.innerHeight, screen.height);
var images = [ "assets/MB-GLA-2017.jpg", "assets/ISki.jpeg", "assets/MistyBridge.com.jpg", "assets/Mercedes-AMG-2.jpg", "assets/Rolex-Ad.jpg",
                "assets/FunWorld.jpg", "assets/Zoo_Barcelona.jpg", "assets/NYC.jpg", "assets/Porsche.jpg"
             ];
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
    var hashValue = location.hash;
    if (hashValue) {
        imgIndex = parseInt(hashValue.substring(1));
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
    _puzzleWidth = Math.min(_img.width, screenWidth);
    _puzzleWidth = Math.floor(_puzzleWidth / PUZZLE_LEVEL) * PUZZLE_LEVEL;
    _pieceWidth = Math.floor(_puzzleWidth / PUZZLE_LEVEL)
    _puzzleHeight = Math.min(_img.height, screenHeight);
    _puzzleHeight = Math.floor(_puzzleHeight / PUZZLE_LEVEL) * PUZZLE_LEVEL;
    _pieceHeight = Math.floor(_puzzleHeight / PUZZLE_LEVEL)
    _puzzleWidth = _pieceWidth * PUZZLE_LEVEL;
    _puzzleHeight = _pieceHeight * PUZZLE_LEVEL;
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

function initPuzzle(){
    _pieces = [];
    _mouse = {x:0,y:0};
    _currentPiece = null;
    _currentDropPiece = null;
    _context.drawImage(_img, 0, 0, _img.width, _img.height, 0, 0, _puzzleWidth, _puzzleHeight);
    actualImg = convertCanvasToImage(_canvas);
    createTitle("Touch to Start");
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
        _yourPercentile.innerText = calcPercentile(bst).toFixed(1) + "%";
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
    for(i = 0;i < PUZZLE_LEVEL * PUZZLE_LEVEL;i++){
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
    for(i = 0;i < _pieces.length;i++){
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
        setTimeout(gameOver,500);
    }
}
function gameOver(){
    clock.stop();
    _canvas.onmousedown = null;
    _canvas.removeEventListener("touchstart", onPuzzleClick);
    _canvas.ontouchstart = null;
    _canvas.onmousemove = null;
    _canvas.removeEventListener("touchmove", updatePuzzle);
    _canvas.onmtouchmove = null;
    _canvas.onmouseup = null;
    _canvas.ontouchend = null;
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
   location.hash = imgIndex + "";
   clock.setTime(0);
   init();
}

function replayGame() {
    gameOver();
    location.hash = imgIndex + "";
    init();
}

function prevImage() {
    gameOver();
    if (imgIndex > 0) {
      imgIndex--;
    } else {
      imgIndex = images.length -1;
    }
    location.hash = imgIndex + "";
    clock.setTime(0);
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
        openIframedPage("leaders.html?img=" + images[imgIndex] +  bsStr + asStr);
    }
}

function iqPage() {
    if (_onIframedPage) {
        closeIframedPage();
    } else {
        var bsStr = "&bs=" + bestSolveTime;
        var asStr = "&as=" + calcAvgScore().toFixed(1);
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
        var p = calcPercentile(bsti);
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
}

function pad0(v) {
    var str = "" + v;
    if (str.length >= 2) return str;
    return "0" + v;
}

function userSettings() {
    if (_onIframedPage) {
        closeIframedPage();
    } else {
        var bsStr = "&bs=" + bestSolveTime;
        var asStr = "&as=" + calcAvgScore().toFixed(1);
        openIframedPage("usettings.html");
    }
}

function sendChallenge() {
    console.log("sending challenge");
    var hrf = "whatsapp://send?text=Hello%20World https://shadow.com";
    document.getElementById('sendChallenge').href = hrf;
}