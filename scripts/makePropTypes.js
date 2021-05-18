#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const types = ['ViewPropTypes', 'TextPropTypes', 'ColorPropType', 'EdgeInsetsPropType', 'PointPropType'];

(() => {
    const dirPath = process.cwd();
    types.forEach((type) => {
        const baseDest = `${dirPath}/node_modules/react-native-web/dist/exports/${type}/`;
        if (!fs.existsSync(baseDest)) {
            fs.mkdirSync(baseDest);
        }
        fs.writeFileSync(`${baseDest}index.js`, 'module.exports = {}', 'utf8');
    });

    const distPath = `${dirPath}/node_modules/react-native-web/dist/index.js`;

    const dist = fs.readFileSync(distPath, 'utf8');
    if (!dist.includes(types[0])) {
        const e = types.map((type) => `export { default as ${type} } from './exports/${type}';`).join('\n');
        fs.writeFileSync(distPath, `${dist}\n\n${e}`, 'utf8');
    }
})();
