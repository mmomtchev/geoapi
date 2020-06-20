import * as fs from 'fs';
import * as path from 'path';
import Map from 'collections/map.js';
import { readLines } from './util.js';
import { config } from './config.js';

const AltFields = {
    'altid': 0,
    'id': 1,
    'iso': 2,
    'alt': 3,
    'pref': 4,
    'short': 5,
    'colloq': 6,
    'hist': 7,
    'from': 8,
    'to': 9
};

function parseAltLine(map, line) {
    const data = line.split('\t');

    let o = {};
    for (const f of Object.keys(config.altdb.fields))
        o[f] = data[AltFields[f]];
    o.id = +data[AltFields['id']];
    o.iso = data[AltFields['iso']];
    o.alt = data[AltFields['alt']];

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
