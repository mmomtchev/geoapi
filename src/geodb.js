import * as fs from 'fs';
import * as path from 'path';
import { readLines } from './util.js';
import { config } from './config.js';

const Fields = [
    'id',
    'name',
    'ascii',
    'alt',
    'lat',
    'lon',
    'class',
    'feature',
    'country',
    'cc2',
    'admin1',
    'admin2',
    'admin3',
    'admin4',
    'pop',
    'elev',
    'dem',
    'tz',
    'updated'
];

export function loadConfig(config) {
    /* Precompile the regexps */
    config.geodb._filterRE = {};
    for (const r in config.geodb.filter)
        config.geodb._filterRE[r] = new RegExp(config.geodb.filter[r]);

    config.geodb._includeFields = [];
    for (const f in Fields)
        config.geodb._includeFields[f] = ['lat', 'lon', 'id', ...config.geodb.fields].includes(Fields[f]);

}

function parseLine(array, line) {
    for (let start = 0, end = line.indexOf('\t'), i = 0; end != -1; start = end + 1, end = line.indexOf('\t', start), i++) {
        if (config.geodb.filter[Fields[i]]) {
            if (!line.substring(start, end).match(config.geodb._filterRE[Fields[i]]))
                return;
        }
    }

    let o = {};
    for (let start = 0, end = line.indexOf('\t'), i = 0; end != -1; start = end + 1, end = line.indexOf('\t', start), i++) {
        if (config.geodb._includeFields[i])
            o[Fields[i]] = line.substring(start, end);
            
    }

    array.push(o);
}

export async function load(array) {
    console.debug('start loading geodb');
    const geodb = fs.createReadStream(path.resolve(config.data_dir, config.geodb.file));

    await readLines(geodb, array, parseLine);
}

export function t() {
	console.log(t0, t1, t2);
}