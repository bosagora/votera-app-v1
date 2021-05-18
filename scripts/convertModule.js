#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const rules = [
  {
    fileName: 'buffer-xor/index.js',
    search: 'module.exports = function xor (a, b) {',
    func: 'startsWith',
    replace: 'var Buffer = require(\'safe-buffer\').Buffer\nmodule.exports = function xor (a, b) {'
  },
  {
    fileName: 'react-native-crypto/node_modules/pbkdf2/browser.js',
    search: 'var createHmac = require(\'create-hmac\')',
    func: 'startsWith',
    replace: 'var Buffer = require(\'safe-buffer\').Buffer\nvar createHmac = require(\'create-hmac\')'
  },
  {
    fileName: 'tiny-secp256k1/js.js',
    search: 'const BN = require(\'bn.js\')',
    func: 'startsWith',
    replace: 'var Buffer = require(\'safe-buffer\').Buffer\nconst BN = require(\'bn.js\')'
  },
  {
    fileName: 'typeforce/extra.js',
    search: 'function _Buffer (value) {\n  return Buffer.isBuffer(value)\n}',
    func: 'indexOf',
    replace: 'function _Buffer (value) {\n  return Buffer.isBuffer(value) || value._isBuffer;\n}'
  },
  {
    fileName: 'asn1.js/lib/asn1/base/buffer.js',
    search: 'DecoderBuffer.prototype.raw = function raw(save) {\n  return this.base.slice(save ? save.offset : this.offset, this.length);\n}',
    func: 'indexOf',
    replace: 'DecoderBuffer.prototype.raw = function raw(save) {\n  var res = this.base.slice(save ? save.offset : this.offset, this.length);\n  if (res._isBuffer === undefined)  res._isBuffer = true;\n  return res;\n}'
  },
  {
    fileName: 'react-native-tcp/android/src/main/java/com/peel/react/TcpSocketManager.java',
    search: 'import android.support.annotation.Nullable;',
    func: 'indexOf',
    replace: 'import androidx.annotation.Nullable;'
  },
  {
    fileName: 'react-native-tcp/android/src/main/java/com/peel/react/TcpSockets.java',
    search: 'import android.support.annotation.Nullable;',
    func: 'indexOf',
    replace: 'import androidx.annotation.Nullable;'
  },
  {
    fileName: 'react-native-udp/android/src/main/java/com/tradle/react/UdpSockets.java',
    search: 'import android.support.annotation.Nullable;',
    func: 'indexOf',
    replace: 'import androidx.annotation.Nullable;'
  },
  {
    fileName: 'react-native-udp/android/src/main/java/com/tradle/react/UdpSocketClient.java',
    search: 'import android.support.annotation.Nullable;',
    func: 'indexOf',
    replace: 'import androidx.annotation.Nullable;'
  },
  {
    fileName: '@types/apollo-upload-client/package.json',
    search: '"dependencies": {\n        "@apollo/client": "^3.1.3",',
    func: 'indexOfReplaceFile',
    replace: '_types_apllo-upload-client_package.json',
    exec: 'cd node_modules/@types/apollo-upload-client && rm -rf node_modules && yarn install'
  }
];

(() => {
  const sourceDir = process.cwd();

  rules.forEach(rule => {
    try {
      const fileName = './node_modules/' + rule.fileName;
      fs.access(fileName, fs.constants.F_OK | fs.constants.W_OK, (err) => {
        if (err) {
          console.log(`${fileName} : ${err.code}`);
          return;
        }

        const data = fs.readFileSync(fileName, 'utf8');
        if (rule.func === 'indexOf') {
          const pos = data.indexOf(rule.search);
          if (pos !== -1) {
            console.log('replaceFile : ', rule.fileName);
            const header = data.substring(0, pos);
            const tail = data.substring(pos + rule.search.length);
            fs.writeFileSync(fileName, header + rule.replace + tail, 'utf8');
            // console.log(header + rule.replace + tail);
          }
        } else if (rule.func === 'startsWith') {
          if (data.startsWith(rule.search)) {
            console.log('replaceFile : ', rule.fileName);
            const tail = data.substring(rule.search.length);
            fs.writeFileSync(fileName, rule.replace + tail, 'utf8');
            // console.log(rule.replace + tail);
          }
        } else if (rule.func === 'indexOfReplaceFile') {
          const pos = data.indexOf(rule.search);
          if (pos !== -1) {
            console.log('replaceFile : ', rule.fileName);
            fs.copyFileSync(`${__dirname}/${rule.replace}`, fileName);
            if (rule.exec) {
              console.log(`exec : ${rule.exec}`);
              exec(rule.exec, (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return;
                }

                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
              });
            }
          }
        } else if (rule.func === 'startsWithReplaceFile') {
          if (data.startsWith(rule.search)) {
            console.log('replaceFile : ', rule.fileName);
            fs.copyFileSync(`${__dirname}/${rule.replace}`, fileName);
            if (rule.exec) {
              console.log(`exec : ${rule.exec}`);
              exec(rule.exec, (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return;
                }

                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
              });
            }
          }
        } else {
          console.log('unknown func : ' + rule.func);
        }
      });
    } catch (e) {
      console.log('caught exception : ', e);
    }
  });
})();
