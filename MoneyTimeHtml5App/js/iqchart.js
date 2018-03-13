var cpPercentage = 79;
var asPercentage = 67;
var scaleColor = "#267072";
var Z_MAX = 6;

var imgRef = getParameterByName("img", window.location);
var _img = document.getElementById("currentPuzzleThumbnail");
if (_img && imgRef) {
    _img.src = imgRef;
}

var bestScore = getParameterByName("bs", window.location);
cpPercentage = calcPercentile(bestScore, level).toFixed(1); // level is defined in puzzutils.js
var overallScore = getParameterByName("as", window.location);
if (isNaN(overallScore)) {
    asPercentage = 0;
} else {
    asPercentage = overallScore;
}

var _cpBarContainer = document.getElementById("cpBarContainer");
_cpBarContainer.innerHTML = percentageText(100 - cpPercentage ) + " " + _cpBarContainer.innerHTML;

var _cpPercentageBar = document.getElementById("cpPercentageBar");
_cpPercentageBar.innerText = percentageText(cpPercentage) ;
_cpPercentageBar.style.setProperty('--cpPercentage', percentageText(cpPercentage));

var _asBarContainer = document.getElementById("asBarContainer");
_asBarContainer.innerHTML = percentageText(100 - asPercentage) + " " + _asBarContainer.innerHTML;


var _asPercentageBar = document.getElementById("asPercentageBar");
_asPercentageBar.innerText = percentageText(asPercentage) ;
_asPercentageBar.style.setProperty('--asPercentage', percentageText(asPercentage) );


var _timeScale = document.getElementById("timeScale");
drawTimeScale(bestScore);
var _iqScale = document.getElementById("iqScale");
drawIQScale(overallScore);

var _uimg = new Image();
_uimg.src = "assets/profileQM.jpg";
_uimg.addEventListener('load',onUImage,false);
function onUImage() {
    var uCanvas = document.getElementById("youCanvas");
    var _uCtx = uCanvas.getContext('2d');
    var ppts = 75; // Profile Pic Target Size
    var posX = (uCanvas.width - ppts) / 2;
    var posY = 10;
    _uCtx.drawImage(_uimg, 0, 0, _uimg.width, _uimg.height, posX, posY, ppts, ppts);
    var z = critz(asPercentage / 100);
    var txt = "iq." + Math.round(100 + (z * 15)) ;
    _uCtx.fillStyle = "white";
    _uCtx.font = "26px Arial";
    var w = _uCtx.measureText(txt).width;
    var h = 26;
    posX = (uCanvas.width - w) / 2;
    posY = posY + ppts + h + 25;
    _uCtx.fillText(txt, posX, posY);
    _uCtx.stroke();
    txt = getTimeText(bestScore);
    w = _uCtx.measureText(txt).width;
    posX = (uCanvas.width - w) / 2;
    posY = posY + h + 25;
    _uCtx.fillText(txt, posX, posY);
}


function drawTimeScale(bst) {
    var arrowSize = 10;
    var ctx = _timeScale.getContext('2d');
    ctx.fillStyle = scaleColor;
    ctx.beginPath();
    var sX =  3 * _timeScale.width / 4;
    var sY = 0;
    var eX = sX;
    var eY = _timeScale.height -1;

    ctx.moveTo(sX, sY); // draw the vertical line
    ctx.lineTo(eX, eY);

    drawArrow(ctx, sX, sY, arrowSize); // draw the arrows
    drawArrow(ctx, eX, eY, arrowSize);
    ctx.strokeStyle = scaleColor;
    ctx.stroke();

    ctx.font = "13px Arial";
    var minTime = 38;
    for ( var yi = sY + 10; yi < eY; yi += 20 ) {
        ctx.moveTo(sX - arrowSize, yi);
        ctx.lineTo(sX, yi);
        if (yi == 30 || yi == 350) {
            var txt = getTimeText(minTime + (yi / 2));
            ctx.fillText(txt, sX - 50, yi);
        }
    }
    var bsY = eY - ((eY - sY) * (parseFloat(cpPercentage) / 100) );
    ctx.clearRect(0, bsY - 8, sX - 10, 12);
    ctx.fillText(getTimeText(bst), sX - 50, bsY);
    ctx.fillText("TIME", sX - 50, eY - 2);
    var w = sX - 52;
    ctx.fillRect(0, bsY - 8, w, 8);
    w = _timeScale.width - (sX + 5);
    ctx.fillRect(sX + 5, bsY - 8, w, 8);
    ctx.stroke();
}

function drawIQScale(as) {
    var arrowSize = 10;
    var ctx = _iqScale.getContext('2d');
    ctx.fillStyle = scaleColor;
    ctx.beginPath();
    var sX = _iqScale.width / 4;
    var sY = 0;
    var eX = sX;
    var eY = _iqScale.height - 1;

    ctx.moveTo(sX, sY); // draw the vertical line
    ctx.lineTo(eX, eY);

    drawArrow(ctx, sX, sY, arrowSize); // draw the arrows
    drawArrow(ctx, eX, eY, arrowSize);
    ctx.strokeStyle = scaleColor;
    ctx.stroke();

    ctx.font = "13px Arial";
    var maxPer = 100;
    for ( var yi = sY + 10; yi < eY; yi += 20 ) {
        ctx.moveTo(sX, yi);
        ctx.lineTo(sX + arrowSize, yi);
        if (yi == 30 || yi == 350) {
            var p = (maxPer - ( (yi - 10 - sY) / 4)) / 100;
            var z = critz(p);
            var txt = Math.round(100 + (z * 15)) + "" ;
            ctx.fillText(txt, sX + 12, yi);
        }
    }
    ctx.stroke();
    var bsY = eY - ((eY - sY) * (parseFloat(asPercentage) / 100) );
    var z = critz(as / 100);
    var txt = Math.round(100 + (z * 15)) + "";
    ctx.fillText(txt, sX + 10, bsY);
    var wTxt = Math.round(ctx.measureText(txt).width);
    var w = _iqScale.width - sX - 15 -  wTxt;
    ctx.fillRect(sX + 15 + wTxt , bsY - 8, w, 8);
    ctx.fillText("IQ", sX + 14, eY - 2);
    ctx.fillRect(0, bsY - 8, sX, 8);
    ctx.stroke();

}

function getTimeText(t) {
    if (isNaN(t)) {
        return "--:--";
    }
    var m = Math.floor(t / 60) + "";
    var s = t % 60 + "";
    if (m.length == 1) {
        m = "0" + m;
    }
    if (s.length == 1) {
        s = "0" + s;
    }
    var timeTxt = m + ":" + s;
    return timeTxt;
 }

function drawArrow(ctx, x, y, arrowSize) {
    var basey;
    if ( y == 0) { // up arrow
        basey = y + arrowSize;
    } else { // down arrow
        basey = y - arrowSize;
    }
    lx = x - arrowSize;
    rx = x + arrowSize;
    ctx.moveTo(x, y);
    ctx.lineTo(lx, basey);
    ctx.lineTo(rx, basey);
    ctx.lineTo(x, y);
    ctx.fill();
}


function percentageText(p) {
    if (p) {
        p = parseFloat(p).toFixed(1);
        return (p + "%");
    }
    return "";
}

function poz(z) {
        var y, x, w;

        if (z == 0.0) {
            x = 0.0;
        } else {
            y = 0.5 * Math.abs(z);
            if (y > (Z_MAX * 0.5)) {
                x = 1.0;
            } else if (y < 1.0) {
                w = y * y;
                x = ((((((((0.000124818987 * w
                         - 0.001075204047) * w + 0.005198775019) * w
                         - 0.019198292004) * w + 0.059054035642) * w
                         - 0.151968751364) * w + 0.319152932694) * w
                         - 0.531923007300) * w + 0.797884560593) * y * 2.0;
            } else {
                y -= 2.0;
                x = (((((((((((((-0.000045255659 * y
                               + 0.000152529290) * y - 0.000019538132) * y
                               - 0.000676904986) * y + 0.001390604284) * y
                               - 0.000794620820) * y - 0.002034254874) * y
                               + 0.006549791214) * y - 0.010557625006) * y
                               + 0.011630447319) * y - 0.009279453341) * y
                               + 0.005353579108) * y - 0.002141268741) * y
                               + 0.000535310849) * y + 0.999936657524;
            }
        }
        return z > 0.0 ? ((x + 1.0) * 0.5) : ((1.0 - x) * 0.5);
}


/*  CRITZ  --  Compute critical normal z value to
               produce given p.  We just do a bisection
               search for a value within CHI_EPSILON,
               relying on the monotonicity of pochisq().  */
function critz(p) {
    var Z_EPSILON = 0.000001;     /* Accuracy of z approximation */
    var minz = -Z_MAX;
    var maxz = Z_MAX;
    var zval = 0.0;
    var pval;

    if (p < 0.0 || p > 1.0) {
        return -1;
    }

    while ((maxz - minz) > Z_EPSILON) {
        pval = poz(zval);
        if (pval > p) {
            maxz = zval;
        } else {
            minz = zval;
        }
        zval = (maxz + minz) * 0.5;
    }
    return(zval);
}
