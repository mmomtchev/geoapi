# geoapi

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

geoapi is an open-source API server that provides resolution of lat:lon coordinates to inhabited places and/or geographical features. It uses the free Geonames database and public GeoJSON data sources.

The data structure is a packed Hilbert R-Tree provided by [mourner/Flatbush](https://github.com/mourner/flatbush).

It supports refreshing the data on the fly without restart and without service interruption. Hot reloading doubles the amount of memory required, as the process needs to be able to store two copies of the data while it is rebuilding the R-Tree.

The principle is that all data is to be aggregated directly from the original source to allow automated updates.

Currently two data sources are supported: geonames and the French GeoJSON database. When querying the geonames database postal codes are resolved through centroids, while the GeoJSON data sources are resolved with the actual administrative boundaries.

## Design Principle

*geoapi* is designed around a principle I have decided to call the ***MEME*** principle for **M**aximal **E**volutivity with **M**inimal Compl**e**xity.
In practice this means that maybe one day *geoapi* will have plugins and will support a large array of input formats. Today only the configuration file, which we should not change that much across different versions, follows this principle. The only part of that plugin system that is actually implemented is the part needed to make the two supported formats work.

All geographical coordinates are in lon:lat format in the source code and lat:lon in the externally visible API.

## Medium story on the file reading method used

[There is a medium story on the method used for efficiently reading the 1.6GB CSV file in memory that was featured on The Startup.](https://medium.com/swlh/reading-large-structured-text-files-in-node-js-7c4c4b84332b)

## Installation

The current version is available only here:
```bash
git clone https://github.com/mmomtchev/geoapi.git
cd geoapi
npm run download   # requires unzip (or Expand-Archive on Win32)
```

Create a config file or use the default
```js
{
    "data_dir": "data",
    "max_distance": 22.224,
    "geodb": {
        "file": "allCountries.txt",
        "src": "https://download.geonames.org/export/dump/allCountries.zip",
        "filter": {
            "class": "P",
            "country": "FR|AD"
        },
        "fields": [
            "name",
            "ascii",
            "class",
            "country",
            "tz",
            "alt"
        ]
    },
    "altdb": {
        "file": "alternateNamesV2.txt",
        "src": "https://download.geonames.org/export/dump/alternateNamesV2.zip",
        "fields": {
            "first": [ "post" ],
            "all": []
        }
    },
    "geojson": [
        {
            "file": "contour-des-codes-postaux.geojson",
            "src": "https://public.opendatasoft.com/explore/dataset/contour-des-codes-postaux/download/?format=geojson&timezone=Europe/Berlin&lang=en",
            "apply_filter": {
                "country": "FR",
                "class": "P"
            },
            "match": {
                "post": "code_postal"
            }
        }
    ],
    "pidfile": "geo.pid"
}
```
This files configures three data sources: the Geonames main table, the Geonames alt table and the French GeoJSON data. The full Geonames database is quite large (1.5G), so you can filter the items and select to include only a subset of the fields. This example config file will include only the inhabited places (class="P") of France and Andorra. Remove the *country* field to include all countries. The world database of inhabited places requires about 4GB of RAM per process if you do not need to hot-reload the database and 8GB of RAM per process if you need it. The full database of all features requires twice those amounts. Omitting the *alt* and *tz* fields can cut memory usage by almost 2.

The Geonames alt table is configured with only one field, *post*, the postal code. Fields in *first* will add only the first matched item, fields in *all* will add all matching items. For the postal codes, the additional postal codes will usually be the various CEDEX codes.

The GeoJSON data is added over the Geonames data by using the *apply_filter* and *match* fields. In this example all GeoJSON features will be match on their *postal_code* field to the *post* field of the Geonames table, applying them only to those that have *country=FR*.

# Usage

Loading the world database can take up to two minutes but during hot-reloading, the server should remain accessible.
Once running, a single process should be able to scale up to a few thousands of requests per second.

```bash
npm run start
# Request the nearest feature
curl http://localhost:8080/48.81389/2.38778
# Request the nearest administrative division (the default config file includes only P records so this is not needed)
curl http://localhost:8080/48.81389/2.38778/P
```

Example response
```js
{
  "name": "Ivry-sur-Seine",
  "ascii": "Ivry-sur-Seine",
  "class": "P",
  "country": "FR",
  "tz": "Europe/Paris",
  "alt": "Ivri sir Sen,Ivri sjur Sen,Ivri-sjur-Sen,Ivry,Ivry sobre Sena,Ivry-sur-Seine,ayfry swr syn,aywry swr sn,aywry-swr-sn,ibeuliswileusen,ivuri=shuru=senu,sai na he pan yi fu li,ʼybry-syr-sn,Іврі-сюр-Сен,Иври сир Сен,Иври сюр Сен,Иври-сюр-Сен,איברי-סיר-סן,إيفري سور سين,ایوری سور سن,ایوری-سور-سن,イヴリー＝シュル＝セーヌ,塞纳河畔伊夫里,이브리쉬르센",
  "lat": 48.81568,
  "lon": 2.38487,
  "id": "3012621",
  "post": "94200",
  "coordinates": [
    [
      [
        2.364204,
        48.8163982
      ],
    ...
    ]
  ],
  "t": 1
}
```

Hot-reloading is triggered by sending the process a SIGHUP
```bash
kill -HUP `cat geo.pid`
```

## License
[GPL](https://choosealicense.com/licenses/gpl-3.0/)
