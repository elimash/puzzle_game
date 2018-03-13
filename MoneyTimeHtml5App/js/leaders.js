 function bodyLoaded() {
    var imgRef = getParameterByName("img", window.location);
    var _img = document.getElementById("currentPuzzleThumbnail");
    if (_img && imgRef) {
        _img.src = imgRef;
    }
    var bestScore = getParameterByName("bs", window.location);
    var ltb = document.getElementById("cpTable");
    if (bestScore && ltb) {
        insertRow(ltb, "-->", "assets/profileQM.jpg", "You (unpublished)", bestScore);
    }
    var overallScore = getParameterByName("as", window.location);
    var rtb = document.getElementById("asTable");
    if (overallScore && rtb) {
        insertRow(rtb, " ", "assets/profileQM.jpg", "You (unpublished)", overallScore );
    }
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

function getRowColumnValue(row, col) {
    var x = row.cells[col];
    return x.innerText.toLowerCase();
}

function insertRow(tbl, seq, image, name, score) {
 var scoreStr = "" + score + "";
 var l = tbl.rows.length;

 if (seq == " ") { // I use the seq field to indicate descending sorting of the right table
    for (i=0; i < l; i++) {
       if ( scoreStr >= getRowColumnValue(tbl.rows[i], 3)) {
                        break;
      }
    }
 } else {
    for (i=0; i < l; i++) {
           if ( scoreStr <= getRowColumnValue(tbl.rows[i], 3)) {
                            break;
          }
        }
 }
    var row;
    if ( i < l) {
        row = tbl.insertRow(i);
    } else {
        row = tbl.insertRow(-1); // this trick inserts the row last
    }
    var c0 = row.insertCell(0);
    var c1 = row.insertCell(1);
    var c2 = row.insertCell(2);
    var c3 = row.insertCell(3);
    c0.innerHTML = seq;
    c1.innerHTML = "<img class=\"profilePic\" src=\"" + image + "\" >";
    c2.innerHTML = name;
    c3.innerHTML = "<div class=\"counter\">" + scoreStr + "</div> ";
    row.scrollIntoView(true);
}