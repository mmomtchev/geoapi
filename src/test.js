import * as fs from 'fs';

const rs = fs.createReadStream('allCountries.txt');
let c = 0;
(async () => {
    let remainder = '';
    for await (const buf of rs) {
        const lines = (remainder + buf).split(/\r?\n/g);
        remainder = lines.pop();
        for await (const line of lines) {
            const f = line.split('\t');
            if (f.length)
                c++;
        }
    }
    console.log(c);
})();