import * as fs from 'fs';
import * as path from 'path';
import { readLines } from './util.js';
import { config } from './config.js';

const Fields = {
    'id': 0,
    'name': 1,
    'ascii': 2,
    'alt': 3,
    'lat': 4,
    'lon': 5,
    'class': 6,
    'feature': 7,
    'country': 8,
    'cc2': 9,
    'admin1': 10,
    'admin2': 11,
    'admin3': 12,
    'admin4': 13,
    'pop': 14,
    'elev': 15,
    'dem': 16,
    'tz': 17,
    'updated': 18
};

function parseLine(array, line) {
    const data = line.split('\t');

    for (const f of Object.keys(config.geodb.filter))
        if (!data[Fields[f]].match(config.geodb.filter[f]))
            return;

    let o = {};
    for (const f of config.geodb.fields)
        o[f] = data[Fields[f]];

    o.lat = +data[Fields['lat']];
    o.lon = +data[Fields['lon']];
    o.id = data[Fields['id']];

    array.push(o);
}

export async function load(array) {
    console.debug('start loading geodb');
    const geodb = fs.createReadStream(path.resolve(config.data_dir, config.geodb.file));

    await readLines(geodb, array, parseLine);
}