import * as fs from 'fs';
import * as path from 'path';
import Map from 'collections/map.js';
import { readLines } from './util.js';
import { config } from './config.js';

const AltFields = [
    'altid',
    'id',
    'iso',
    'alt',
    'pref',
    'short',
    'colloq',
    'hist',
    'from',
    'to'
];

export function loadConfig(config) {
    config.altdb._includeFields = [];
    for (const f in AltFields)
        config.altdb._includeFields = ['id', 'iso', 'alt', ...config.altdb.fields.first, ...config.altdb.fields.all].includes(AltFields[f]);
}

function parseAltLine(map, line, lineStart, lineEnd) {
    let o = {};
    lineStart = lineStart || 0;
    lineEnd = lineEnd || line.length;
    for (let start = lineStart, end = line.indexOf('\t', lineStart), i = 0;
        end != -1 && end < lineEnd;
        start = end + 1, end = line.indexOf('\t', start), i++) {
        
        if (config.geodb._includeFields[i])
            o[AltFields[i]] = line.substring(start, end);

    }
    if (map[o.id] !== undefined) {
        if (config.altdb.fields.all.includes(o.iso)) {
            if (map[o.id][o.iso] === undefined)
                map[o.id][o.iso] = [];
            map[o.id][o.iso].push(o.alt);
        } else if (config.altdb.fields.first.includes(o.iso)) {
            if (map[o.id][o.iso] === undefined)
                map[o.id][o.iso] = o.alt;
        }
    }
}

export async function load(array) {
    console.debug('start loading altdb');
    const altdb = fs.createReadStream(path.resolve(config.data_dir, config.altdb.file));
    let idMap = new Map();
    array.map(x => idMap[x.id] = x);
    await readLines(altdb, idMap, parseAltLine);
}
