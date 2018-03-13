
var _nameField = document.getElementById("nameField");
if (userName) {
    _nameField.value = userName;
}
var _bornField = document.getElementById("bornDate");
if (userBornDate) {
    _bornField.value = userBornDate;
}
var _guyButton = document.getElementById('radio1');
var _girlButton = document.getElementById('radio2');
var _unsetButton = document.getElementById('radio3');
if (userGender) {
    switch (userGender) {
        case 'Guy':
            _guyButton.checked = true;
            break;
        case 'Girl':
            _girlButton.checked = true;
            break;
        case 'Unset':
            _unsetButton.checked = true;
            break;
    }
}

var _countryField = document.getElementById("countrySelect");
if (userCountry) {
    _countryField.value = userCountry;
}

var _userLevel = document.getElementById("levelSelect");
if (userLevel) {
    _userLevel.value = userLevel;
    setLevel(userLevel);
}

function validateForm() {
    if (_nameField ) {
        localStorage.setItem(USER_NAME, _nameField.value);
    }
    if (_bornField) {
        localStorage.setItem(USER_BORN_DATE, _bornField.value);
    }
    if (_guyButton) {
        saveGender();
    }
    if (_countryField) {
        localStorage.setItem(USER_COUNTRY, _countryField.value);
    }
    if (_userLevel) {
        localStorage.setItem(USER_LEVEL, _userLevel.value);
        setLevel(_userLevel.value);
    }
}

function saveGender() {
    if (_guyButton.checked) {
        localStorage.setItem(USER_GENDER, "Guy");
    } else if (_girlButton.checked) {
        localStorage.setItem(USER_GENDER, "Girl");
    } else if (_unsetButton.checked) {
        localStorage.setItem(USER_GENDER, "Unset");
    }
}