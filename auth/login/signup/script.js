// Firebase configuration and initialization
const _0x4b82a1 = {
    apiKey: "AIzaSyBw1uA-kNKOZEufWKZ9AMBxvRGHNGF1lkA",
    authDomain: "multi-games-a2561.firebaseapp.com",
    projectId: "multi-games-a2561",
    storageBucket: "multi-games-a2561.appspot.com",
    messagingSenderId: "150551898066",
    appId: "1:150551898066:web:4e8fb185f2321ba4140a0b",
    measurementId: "G-PB8Y87E6XV",
    databaseURL: "https://multi-games-a2561-default-rtdb.firebaseio.com"
};

firebase[_0x2a4e('0x47')](_0x4b82a1);
const _0x2c7a9b = firebase[_0x2a4e('0x32')]();
const _0x5f1adb = firebase[_0x2a4e('0x15')]();

// DOM Elements
const _0x1f6e3c = document[_0x2a4e('0x1a')](_0x2a4e('0x1c'));
const _0x51af22 = document[_0x2a4e('0x31')]('.form-step');
const _0x47bd5f = document[_0x2a4e('0x31')]('.progress-step');
const _0xd0eb7a = document[_0x2a4e('0x1a')]('fullName');
const _0x2be8bf = document[_0x2a4e('0x1a')]('username');
const _0x41da86 = document[_0x2a4e('0x1a')]('email');
const _0x52ef3e = document[_0x2a4e('0x1a')]('password');
const _0x19a0cb = document[_0x2a4e('0x1a')](_0x2a4e('0x13'));
const _0x2c5af0 = document[_0x2a4e('0x1a')](_0x2a4e('0x29'));
const _0x56d7a1 = document[_0x2a4e('0x1a')](_0x2a4e('0xf'));
const _0x5e5857 = document[_0x2a4e('0x1a')](_0x2a4e('0x25'));
const _0x1a5f61 = document[_0x2a4e('0x1a')]('terms');
const _0x28b2c5 = document[_0x2a4e('0x1a')]('success-message');
const _0x4ae9d3 = document[_0x2a4e('0x1a')]('countdown');
const _0x4f5d55 = document[_0x2a4e('0x1a')](_0x2a4e('0x22'));

// Current step and captcha
let _0x3c6a77 = 1;
let _0x5c8c27 = '';

// Initialize the form
document[_0x2a4e('0x1f')]('DOMContentLoaded', function() {
    _0x4958dc();
    _0x5cb3bd();
    _0x3bc5b8();
});

// Setup event listeners
function _0x5cb3bd() {
    document[_0x2a4e('0x1a')]('step1-next')[_0x2a4e('0x1f')]('click', function() {
        if (_0x1bcfd5()) {
            _0x1abe2d(_0x2be8bf.value.trim())
                .then(_0x1e5a21 => {
                    if (_0x1e5a21) {
                        _0x33dd8c(_0x2a4e('0x11'), true);
                    } else {
                        _0x33dd8c(_0x2a4e('0x11'), false);
                        _0x5c81c2(2);
                    }
                })
                [_0x2a4e('0x6')](error => {
                    console[_0x2a4e('0x18')]("Error checking username:", error);
                    _0x5c81c2(2);
                });
        }
    });

    document[_0x2a4e('0x1a')]('step2-prev')[_0x2a4e('0x1f')]('click', function() {
        _0x5c81c2(1);
    });
    
    document[_0x2a4e('0x1a')]('step2-next')[_0x2a4e('0x1f')]('click', function() {
        if (_0x28e44d()) {
            _0x1de5a7(_0x41da86.value.trim())
                .then(_0x1e5a21 => {
                    if (_0x1e5a21) {
                        _0x33dd8c(_0x2a4e('0x12'), true);
                    } else {
                        _0x33dd8c(_0x2a4e('0x12'), false);
                        _0x5c81c2(3);
                    }
                })
                [_0x2a4e('0x6')](error => {
                    console[_0x2a4e('0x18')]("Error checking email:", error);
                    _0x5c81c2(3);
                });
        }
    });

    document[_0x2a4e('0x1a')]('step3-prev')[_0x2a4e('0x1f')]('click', function() {
        _0x5c81c2(2);
    });
    
    document[_0x2a4e('0x1a')]('step3-next')[_0x2a4e('0x1f')]('click', function() {
        if (_0x3bca35()) {
            const _0x1a5c2b = _0x2c5af0.value.trim();
            if (_0x1a5c2b) {
                _0x14fb5c(_0x1a5c2b)
                    .then(_0x2f2def => {
                        _0x33dd8c('referralCode-error', !_0x2f2def);
                        if (_0x2f2def) {
                            _0x5c81c2(4);
                        }
                    })
                    [_0x2a4e('0x6')](error => {
                        console[_0x2a4e('0x18')]("Error validating referral code:", error);
                        _0x5c81c2(4);
                    });
            } else {
                _0x5c81c2(4);
            }
        }
    });

    document[_0x2a4e('0x1a')]('step4-prev')[_0x2a4e('0x1f')]('click', function() {
        _0x5c81c2(3);
    });

    _0x1f6e3c[_0x2a4e('0x1f')](_0x2a4e('0x2a'), _0x1c77f7);

    _0xd0eb7a[_0x2a4e('0x1f')](_0x2a4e('0x5'), _0x5bb9aa);
    _0x2be8bf[_0x2a4e('0x1f')](_0x2a4e('0x5'), _0x4fa92c);
    _0x41da86[_0x2a4e('0x1f')](_0x2a4e('0x5'), _0x24b3a1);
    _0x52ef3e[_0x2a4e('0x1f')](_0x2a4e('0x5'), _0x26e9f9);
    _0x19a0cb[_0x2a4e('0x1f')](_0x2a4e('0x5'), _0x2fa1c8);
    _0x2c5af0[_0x2a4e('0x1f')](_0x2a4e('0x5'), _0x4a88c8);
    _0x52ef3e[_0x2a4e('0x1f')](_0x2a4e('0x5'), _0x3bc5b8);
    _0x5e5857[_0x2a4e('0x1f')](_0x2a4e('0x5'), _0x3404a1);
    _0x1a5f61[_0x2a4e('0x1f')]('change', _0x4f4e09);
}

// Check if username already exists in Realtime Database
async function _0x1abe2d(username) {
    try {
        const _0x2e5d9c = await _0x5f1adb.ref(`usernames/${username[_0x2a4e('0x30')]()}`)[_0x2a4e('0xe')]('value');
        return _0x2e5d9c[_0x2a4e('0x8')]();
    } catch (error) {
        console[_0x2a4e('0x18')]("Error checking username:", error);
        return false;
    }
}

// Check if email already exists
async function _0x1de5a7(email) {
    try {
        const _0x4a9bf4 = await _0x5f1adb.ref('users')[_0x2a4e('0x2')]('email').equalTo(email)[_0x2a4e('0xe')]('value');
        return _0x4a9bf4[_0x2a4e('0x8')]();
    } catch (error) {
        console[_0x2a4e('0x18')]("Error checking email:", error);
        return false;
    }
}

// Check if a referral code exists in the database
async function _0x14fb5c(code) {
    try {
        const _0x2e5d9c = await _0x5f1adb.ref('users')[_0x2a4e('0x2')]('referralCode').equalTo(code)[_0x2a4e('0xe')]('value');
        return _0x2e5d9c[_0x2a4e('0x8')]();
    } catch (error) {
        console[_0x2a4e('0x18')]("Error validating referral code:", error);
        return true;
    }
}

// Navigate to specific step
function _0x5c81c2(step) {
    _0x51af22.forEach((s, index) => {
        s[_0x2a4e('0x37')].remove(_0x2a4e('0x1'));
        _0x47bd5f[index][_0x2a4e('0x37')].remove(_0x2a4e('0x1'), 'completed');
    });

    document[_0x2a4e('0x1a')](`step-${step}`)[_0x2a4e('0x37')].add(_0x2a4e('0x1'));

    for (let i = 0; i < step; i++) {
        if (i + 1 === step) {
            _0x47bd5f[i][_0x2a4e('0x37')].add(_0x2a4e('0x1'));
        } else {
            _0x47bd5f[i][_0x2a4e('0x37')].add('completed');
        }
    }

    _0x3c6a77 = step;
}

// Generate captcha
function _0x4958dc() {
    const _0x2bd0d9 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    _0x5c8c27 = '';

    for (let i = 0; i < 6; i++) {
        const _0x2a5728 = Math.floor(Math.random() * _0x2bd0d9.length);
        _0x5c8c27 += _0x2bd0d9[_0x2a5728];
    }

    _0x56d7a1[_0x2a4e('0x1b')] = _0x5c8c27;
}

// Validation functions
function _0x5bb9aa() {
    const _0x4e2ac1 = _0xd0eb7a.value.trim();
    const _0x2f2def = _0x4e2ac1.length >= 3;
    _0x33dd8c(_0x2a4e('0x36'), !_0x2f2def);
    return _0x2f2def;
}

function _0x4fa92c() {
    const _0x4e2ac1 = _0x2be8bf.value.trim();
    const _0x4ed97c = /^[a-zA-Z0-9_]{3,20}$/;
    const _0x2f2def = _0x4ed97c[_0x2a4e('0x17')](_0x4e2ac1);
    _0x33dd8c('username-error', !_0x2f2def);
    return _0x2f2def;
}

function _0x24b3a1() {
    const _0x4e2ac1 = _0x41da86.value.trim();
    const _0x4ed97c = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const _0x2f2def = _0x4ed97c[_0x2a4e('0x17')](_0x4e2ac1);
    _0x33dd8c('email-error', !_0x2f2def);
    return _0x2f2def;
}

function _0x26e9f9() {
    const _0x4e2ac1 = _0x52ef3e.value;
    const _0x16f8f9 = _0x4e2ac1.length >= 8;
    const _0x2fba3c = /[A-Z]/[_0x2a4e('0x17')](_0x4e2ac1);
    const _0x23be13 = /[a-z]/[_0x2a4e('0x17')](_0x4e2ac1);
    const _0x5a1c5f = /[0-9]/[_0x2a4e('0x17')](_0x4e2ac1);
    const _0x15b1e2 = /[!@#$%^&*(),.?":{}|<>]/[_0x2a4e('0x17')](_0x4e2ac1);
    const _0x2f2def = _0x16f8f9 && _0x2fba3c && _0x23be13 && _0x5a1c5f && _0x15b1e2;
    _0x33dd8c('password-error', !_0x2f2def);
    return _0x2f2def;
}

function _0x3bc5b8() {
    const _0x4e2ac1 = _0x52ef3e.value;
    const _0x3bb02d = {
        'length-req': _0x4e2ac1.length >= 8,
        'uppercase-req': /[A-Z]/[_0x2a4e('0x17')](_0x4e2ac1),
        'lowercase-req': /[a-z]/[_0x2a4e('0x17')](_0x4e2ac1),
        'number-req': /[0-9]/[_0x2a4e('0x17')](_0x4e2ac1),
        'special-req': /[!@#$%^&*(),.?":{}|<>]/[_0x2a4e('0x17')](_0x4e2ac1)
    };

    for (const [id, _0x2f2def] of Object.entries(_0x3bb02d)) {
        const _0x4daa8e = document[_0x2a4e('0x1a')](id);
        if (_0x2f2def) {
            _0x4daa8e[_0x2a4e('0x37')].add('valid-requirement');
        } else {
            _0x4daa8e[_0x2a4e('0x37')].remove('valid-requirement');
        }
    }
}

function _0x2fa1c8() {
    const _0x4cbd69 = _0x52ef3e.value;
    const _0x4bfe59 = _0x19a0cb.value;
    const _0x2f2def = _0x4bfe59 && _0x4bfe59 === _0x4cbd69;
    _0x33dd8c('confirmPassword-error', !_0x2f2def);
    return _0x2f2def;
}

function _0x4a88c8() {
    return true;
}

function _0x3404a1() {
    const _0x4e2ac1 = _0x5e5857.value.trim();
    const _0x2f2def = _0x4e2ac1 === _0x5c8c27;
    _0x33dd8c('captcha-error', !_0x2f2def);
    return _0x2f2def;
}

function _0x4f4e09() {
    const _0x2f2def = _0x1a5f61.checked;
    _0x33dd8c('terms-error', !_0x2f2def);
    return _0x2f2def;
}

function _0x1bcfd5() {
    const _0x13d9a6 = _0x5bb9aa();
    const _0x367293 = _0x4fa92c();
    return _0x13d9a6 && _0x367293;
}

function _0x28e44d() {
    const _0x18c8a7 = _0x24b3a1();
    const _0x3f2b94 = _0x26e9f9();
    const _0x4ec17f = _0x2fa1c8();
    return _0x18c8a7 && _0x3f2b94 && _0x4ec17f;
}

function _0x3bca35() {
    return true;
}

function _0x41a4b5() {
    const _0x54f9e8 = _0x3404a1();
    const _0x380c32 = _0x4f4e09();
    return _0x54f9e8 && _0x380c32;
}

function _0x33dd8c(errorId, show) {
    const _0x24a6ae = document[_0x2a4e('0x1a')](errorId);
    if (_0x24a6ae) {
        _0x24a6ae.style[_0x2a4e('0x35')] = show ? _0x2a4e('0x7') : _0x2a4e('0x27');
    }
}

async function _0x1c77f7(event) {
    event[_0x2a4e('0x34')]();

    if (!_0x41a4b5()) {
        return;
    }

    _0x4f5d55.disabled = true;
    _0x4f5d55[_0x2a4e('0x1b')] = 'Creating...';

    try {
        const _0x47c2dc = _0x41da86.value.trim();
        const _0x2c6b5f = _0x52ef3e.value;
        const _0x538bf5 = _0x4fa6d5();
        const _0x2f4b9b = await _0x2c7a9b[_0x2a4e('0x19')](_0x47c2dc, _0x2c6b5f);
        const _0x26c2f0 = _0x2f4b9b.user;
        
        const _0x243df3 = {
            fullName: _0xd0eb7a.value.trim(),
            username: _0x2be8bf.value.trim(),
            email: _0x47c2dc,
            createdAt: firebase.database[_0x2a4e('0x2f')][_0x2a4e('0x33')],
            referralCode: _0x538bf5,
            referredBy: _0x2c5af0.value.trim() || null,
            dateJoined: new Date().toISOString()[_0x2a4e('0x1e')]('T')[0],
            referrals: 0,
            airtimeBalance: 0,
            airtimeScore: 0
        };

        await _0x5f1adb.ref(`users/${_0x26c2f0[_0x2a4e('0x2d')]}`).set(_0x243df3);
        await _0x5f1adb.ref(`usernames/${_0x243df3.username[_0x2a4e('0x30')]()}`).set(_0x26c2f0[_0x2a4e('0x2d')]);
        
        await _0x5f1adb.ref(`referralCodes/${_0x538bf5}`).set({
            userId: _0x26c2f0[_0x2a4e('0x2d')],
            created: new Date().toISOString()
        });

        if (_0x243df3.referredBy) {
            try {
                const _0x5b68a9 = await _0x5f1adb.ref('users')
                    [_0x2a4e('0x2')]('referralCode')
                    .equalTo(_0x243df3.referredBy)
                    [_0x2a4e('0xe')]('value');

                if (_0x5b68a9[_0x2a4e('0x8')]()) {
                    const _0x5c6bc5 = _0x5b68a9[_0x2a4e('0x20')]();
                    const _0x2622cd = Object.keys(_0x5c6bc5)[0];
                    const _0x2c4d02 = _0x5f1adb.ref(`users/${_0x2622cd}/referrals`);
                    
                    await _0x2c4d02.transaction((currentCount) => {
                        return (currentCount || 0) + 1;
                    });
                }
            } catch (_0x3f6066) {
                console.warn('Error processing referral:', _0x3f6066);
            }
        }

        _0x1f6e3c.style[_0x2a4e('0x35')] = _0x2a4e('0x27');
        _0x28b2c5.style[_0x2a4e('0x35')] = _0x2a4e('0x7');
        window.parent.postMessage({ action: _0x2a4e('0x21') }, '*');

    } catch (error) {
        console[_0x2a4e('0x18')]('Registration error:', error);
        alert(`Registration failed: ${error.message}`);
        _0x4f5d55.disabled = false;
        _0x4f5d55[_0x2a4e('0x1b')] = 'Create Account';
    }
}

function _0x4fa6d5() {
    const _0x2bd0d9 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let _0x3c6c98 = '';

    for (let i = 0; i < 8; i++) {
        const _0x2a5728 = Math.floor(Math.random() * _0x2bd0d9.length);
        _0x3c6c98 += _0x2bd0d9[_0x2a5728];
    }

    return _0x3c6c98;
}

function _0x2a4e(x, y) {
    const _0x581e = ['terms-error','display','fullName-error','classList','nextStep','parent','target','initApp','exists','stepComplete','orderBy','referralCode','bind','test','errorLog','createUserWithEmailAndPassword','getElementById','textContent','waitTime','slice','addEventListener','val','loadFB','auth','validateTerms','captcha-input','hasUpper','captcha-text','transaction','captchaCode','valid-requirement','username-taken-error','email-taken-error','fullName','indexOf','checkEmailExists','hasNumber','hasSpecial','submit','referral','equalTo','abort','update','read','keyup','catch','block','canProceed','captchaInput','initReact','active','orderByChild','toggleClass','lowerCaseName','length','input','once','apply','none','message','hasLength','success-message','validReferral','onclick','close-login-modal','step-progress','step-text','error','referralCodes','checkUsernameExists','submit-btn','usernames','error-display','changeEvent','ServerValue','toLowerCase','queryAll','auth','TIMESTAMP','preventDefault'];
    _0x2a4e = function() {
        return _0x581e;
    };
    return _0x2a4e()[x-0x0];
}