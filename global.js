// Inject node globals into React Native global scope.
if (typeof __dirname === 'undefined') global.__dirname = '/';
if (typeof __filename === 'undefined') global.__filename = '';
if (typeof process === 'undefined') {
    global.process = require('process');
} else {
    const bProcess = require('process');
    for (var p in bProcess) {
        if (!(p in process)) {
            process[p] = bProcess[p];
        }
    }
}

if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer;

if (typeof btoa === 'undefined') {
    const { encode, decode } = require("base-64");
    global.atob = decode;
    global.btoa = encode;
}

// Needed so that 'stream-http' chooses the right default protocol.
global.location = {
    protocol: 'file:',
};
  
// Some modules expect userAgent to be a string
global.navigator.userAgent = 'React Native';

// If using the crypto shim, uncomment the following line to ensure
// crypto is loaded first, so it can populate global.crypto
require('crypto');
