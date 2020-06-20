import * as fs from 'fs';
import express from 'express';
import { loadData } from './data.js';
import { config, loadConfig } from './config.js';
import { apiCall } from './api.js';

async function reload() {
    loadConfig();
    return loadData().catch(e => console.error(e));
}

process.on('SIGHUP', reload);
const app = express();
loadConfig(process.argv[2]);
if (config.pidfile)
    fs.writeFileSync(config.pidfile, process.pid.toString());
const port = config.port || 8080;
app.get([
    '/:lat/:lon/',
    '/:lat/:lon/:type'
], apiCall);

loadData().then(() => app.listen(port, () => {
    process.title = `geoapi :${port}`;
    console.log(`ready at :${port}`);
}));