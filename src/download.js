import * as http from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as child from 'child_process';
const config = JSON.parse(fs.readFileSync('config.json'));

fs.mkdirSync(config.data_dir, { recusrive: true });
for (const conf of [config.geodb, config.altdb, ...config.geojson]) {
    const ext = path.parse((new URL(conf.src)).pathname).ext;
    let outf = path.resolve(config.data_dir, conf.file);
    if (ext.toLowerCase() === '.zip')
        outf += '.zip';
    const file = fs.createWriteStream(outf);
    http.get(conf.src, function (response) {
        response.pipe(file);
    });
    file.on('finish', () => {
        console.log('downloaded', outf);
        if (ext.toLowerCase() === '.zip') {
            child.execFile('unzip', ['-ox', outf], {cwd: config.data_dir}, (err, stdout, stderr) => {
                if (err)
                    console.error('unzip failed', err, stderr);
            });
        }
    });
}