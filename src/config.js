import * as fs from 'fs';
import * as geodb from './geodb.js';
import * as altdb from './altdb.js';

export let config;
let confName;

export function loadConfig(altConf) {
    !confName && (confName = altConf || 'config.json');
	const newConf = JSON.parse(fs.readFileSync(confName));
	geodb.loadConfig(newConf);
	altdb.loadConfig(newConf);

	config = newConf;
    return config;
}