export async function readLines(rs, ctx, parseLine) {
    // This is much faster than the "official" async readline in node
    // which requires resolving one Promise per line read
    let t0 = Date.now();
    rs.setEncoding('utf-8');
    let remainder = '';
    // This is the secret to geoapi responding even while hot-reloading
    // Resolving a Promise requires one full Node.js event loop, giving
    // a chance to all network sockets to deliver their data and run 
    // their handlers
    for await (const buf of rs) {
        const lines = (remainder + buf).split(/\r?\n/g);
        remainder = lines.pop();
        for (const line of lines) {
            parseLine(ctx, line);
        }
    }
    console.log(rs.path, `data read ${Date.now() - t0}ms`);
}

export function radians(x) {
    return x / 180 * Math.PI;
}

export function WGS84Distance(lon1, lat1, lon2, lat2) {
    // FCC formula for ellipsoidal Earth projected to a plane
    // https://en.wikipedia.org/wiki/Geographical_distance

    const df = (lat1 - lat2);
    const dg = (lon1 - lon2);
    const fm = radians((lat1 + lat2) / 2);
    const k1 = 111.13209 - 0.566605 * Math.cos(2 * fm) + 0.00120 * Math.cos(4 * fm);
    const k2 = 111.41513 * Math.cos(fm) - 0.09455 * Math.cos(3 * fm) + 0.00012 * Math.cos(5 * fm);
    const d = Math.sqrt((k1 * df) * (k1 * df) + (k2 * dg) * (k2 * dg));
    return d;
}

export function polygonIncludes(polygon, lon, lat) {
    // ray-casting algorithm
    // http://philliplemons.com/posts/ray-casting-algorithm

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i][0], yi = polygon[i][1];
        let xj = polygon[j][0], yj = polygon[j][1];

        let intersect;
        try {
            intersect = ((yi > lat) != (yj > lat))
                && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        } catch (e) {
            intersect = true;
        }
        if (intersect) inside = !inside;
    }

    return inside;
};
