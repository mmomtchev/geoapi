import Flatbush from 'flatbush';
import { around } from 'geoflatbush/index.mjs';
import { config } from './config.js';
import * as geodb from './geodb.js';
import * as altdb from './altdb.js';
import * as geojson from './geojson.js';
import { polygonIncludes, WGS84Distance } from './util.js';

let geoDataRTree;
let geoDataArray;

function addBBox(flatbush, o) {
    let { minx, miny, maxx, maxy } = { minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity };
    if (o.coordinates)
        for (const c of o.coordinates[0]) {
            if (c[0] < minx)
                minx = c[0];
            if (c[0] > maxx)
                maxx = c[0];
            if (c[1] < miny)
                miny = c[1];
            if (c[1] > maxy)
                maxy = c[1];
        }
    else {
        minx = maxx = o.lon;
        miny = maxy = o.lat;
    }
    return flatbush.add(minx, miny, maxx, maxy);
}

export async function loadData() {
    let tempArray = [];
    
    await geodb.load(tempArray);
    await altdb.load(tempArray);
    await geojson.load(tempArray);

    const t0 = Date.now();
    let newRTree = new Flatbush(tempArray.length);
    let newArray = new Array();
    tempArray.map(x => newArray[addBBox(newRTree, x)] = x);
    newRTree.finish();
    console.log(`data sorted ${Date.now() - t0}ms`);

    geoDataRTree = newRTree;
    geoDataArray = newArray;
}

export async function getData(lon, lat, type) {
    let geoMatch = geoDataRTree.search(lon, lat, lon, lat).map(x => geoDataArray[x]);
    for (const g of geoMatch) {
        if (polygonIncludes(g.coordinates, lon, lat) && (type === undefined || type === g.class))
            return g;
    }
    const r = around(geoDataRTree, lon, lat, 1, config.max_distance * 1.2,
        x => x.coordinates === undefined && (type === undefined || type === geoDataArray[x].class))[0];
    if (r === undefined)
        throw 404;
    const o = geoDataArray[r];
    if (WGS84Distance(lon, lat, o.lon, o.lat) > config.max_distance)
        throw 404;
    return geoDataArray[r];
}