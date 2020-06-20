import * as fs from 'fs';

export let config;
let confName;

export function loadConfig(altConf) {
    !confName && (confName = altConf || 'config.json');
    config = JSON.parse(fs.readFileSync(confName));
    return config;
}