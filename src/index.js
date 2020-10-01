import * as fs from 'fs';
import express from 'express';
import { loadData } from './data.js';
import { config, loadConfig } from './config.js';
import { apiCall } from './api.js';

async function reload() {
    loadConfig();
    return loadData().catch(e => console.error(e));
}

function cors(req, res, next) {
    if (config.cors) {
        res.header("Access-Control-Allow-Origin", config.cors);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
}

process.on('SIGHUP', reload);
const app = express();
loadConfig(process.argv[2]);
app.use(cors);
if (config.pidfile)
    fs.writeFileSync(config.pidfile, process.pid.toString());
const port = config.port || 8080;
app.get([
    '/:lat/:lon/',
    '/:lat/:lon/:type'
], apiCall);

loadData()
    .then(() => app.listen(port, () => {
        process.title = `geoapi :${port}`;
        console.log(`ready at :${port}`);
    }))
    .catch(e => console.error(e));