import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';
import Map from 'collections/map.js';
import { config } from './config.js';
const readFile = promisify(fs.readFile);

function matchFilter(conf, o) {
    for (const f of Object.keys(conf.apply_filter))
        if (!o[f] || !o[f].match(conf.apply_filter[f]))
            return false;
    for (const f of Object.keys(conf.match))
        if (!o[f])
            return false;
    return true;
}

function matchStringArray(conf, o) {
    let r = '';
    for (const f of Object.keys(conf.match))
        r += f + ':' + o[f] + ';';
    return r;
}

function matchStringGeoJSON(conf, o) {
    let r = '';
    for (const f of Object.keys(conf.match))
        r += f + ':' + o.properties[conf.match[f]] + ';';
    return r;
}

export async function load(array) {
    let matchMap = new Map();

    for (const conf of config.geojson) {
        array.filter(x => matchFilter(conf, x)).map(x => matchMap[matchStringArray(conf, x)] = x);
        const file = conf.file;
        console.debug('start loading geojson', file);
        const t0 = Date.now();
        const geojson = JSON.parse(await readFile(path.resolve(config.data_dir, file)));
        for (const f of geojson.features) {
            const key = matchStringGeoJSON(conf, f);
            const match = matchMap[key];
            if (match !== undefined)
                match.coordinates = f.geometry.coordinates;
        }
        console.log(`${file} loaded ${Date.now() - t0}ms`);
    }
}