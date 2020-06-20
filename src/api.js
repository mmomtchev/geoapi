import { config, loadConfig } from './config.js';
import { getData } from './data.js';

export async function apiCall(req, res) {
    try {
        const { lat, lon, type } = { lat: +req.params.lat, lon: +req.params.lon, type: req.params.type };
        if (isNaN(lat) || isNaN(lon)) {
            res.status(400).send(e);
            return;
        }
        const t0 = Date.now();
        const r = await getData(lon, lat, type);
        r.t = Date.now() - t0;
        res.json(r).end();
    } catch (e) {
        if (!isNaN(e)) {
            res.status(e).end();
        } else {
            console.error(e);
            res.status(500).send(e);
        }
    }
}