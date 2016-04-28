// JSONP implementation
// ref: http://www.nekman.se/cors-jsonp-promises/
var jsonp = (function (global, body) {
    'use strict';

    if (!window.Promise) {
        throw 'Promise is not available.';
    }

    return function (url) {
        return new window.Promise(function (resolve, reject) {
            var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', url + '&jsonp=' + callbackName);

            // If we fail to get the script, reject the promise.
            script.onerror = reject;

            body.appendChild(script);

            global[callbackName] = function (data) {
                // Script inserted, resolve promise.
                resolve(data);

                // Clean up.
                global[callbackName] = null;
                delete global[callbackName];
                body.removeChild(script);
            };
        });
    }
}(this, document.body));

var Bing = L.TileLayer.extend({
    _quadKey: function (x, y, z) {
        var index = '';
        for (var i = z; i > 0; i--) {
            var b = 0;
            var mask = 1 << (i - 1);
            if ((x & mask) !== 0) b++;
            if ((y & mask) !== 0) b += 2;
            index += b.toString();
        }
        return index;
    },

    _readMetaData: function (result) {
        if (result.statusCode !== 200 && result.statusDescription !== 'OK') {
            alert('Reading meta data from Bing Maps is failed. Error: ' + result.responseText);
        }

        var resource = result.resourceSets[0].resources[0];
        this._url = resource.imageUrl;
        this.options.subdomains = resource.imageUrlSubdomains;
        return window.Promise.resolve();
    },

    statics: {
        METADATA_URL: 'http://dev.virtualearth.net/REST/v1/Imagery/Metadata/{imagerySet}?key={bingMapsKey}',
        VALID_IMAGERY_SET: ['Road', 'Aerial', 'AerialWithLabels'],
        CULTURE: 'en-US'
    },

    initialize: function (options) {
        if (typeof options == 'undefined' || options === null) {
            throw new Error('Options are not provided.');
        }

        if (!('key' in options)) {
            throw new Error('Bing Maps key is not provided. Key is required to read tiles.');
        }

        if (!('imagery' in options)) {
            options.imagery = Bing.VALID_IMAGERY_SET[0];
        } else if (Bing.VALID_IMAGERY_SET.indexOf(options.imagery) < 0) {
            console.log('Overriding imagery set from ' + options.imagery + ' to ' + Bing.VALID_IMAGERY_SET[0]);
            options.imagery = Bing.VALID_IMAGERY_SET[0];
        }

        if (!('culture' in options)) {
            console.log('Overriding culture to ' + Bing.CULTURE);
            options.culture = Bing.CULTURE;
        }

        options = L.setOptions(this, options);

        var url = L.Util.template(Bing.METADATA_URL, {
            bingMapsKey: options.key,
            imagerySet: options.imagery
        });

        var callback = this._readMetaData.bind(this);
        this._fetch = jsonp(url).then(function (data) {
            callback(data);
        }).catch(function (e) {
            alert('Bing Maps meta data read operation is failed. Error: ' + e);
        });

        // for https://github.com/Leaflet/Leaflet/issues/137
        if (!L.Browser.android) {
            this.on('tileunload', this._onTileRemove);
        }
    },

    createTile: function (coords, done) {
        var tile = document.createElement('img');

        L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', L.bind(this._tileOnError, this, done, tile));

        if (this.options.crossOrigin) {
            tile.crossOrigin = '';
        }

        /*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
        tile.alt = '';

        if (this._url) {
            tile.src = this.getTileUrl(coords);
        } else {
            this._fetch.then(function () {
                tile.src = this.getTileUrl(coords);
            }.bind(this)).catch(function (e) {
                alert('Bing Maps meta data read operation is failed. Error: ' + e);
            });
        }

        return tile;
    },

    getTileUrl: function (coords) {
        var urlParameters = {
            quadkey: this._quadKey(coords.x, coords.y, coords.z),
            subdomain: this._getSubdomain(coords),
            culture: this.options.culture
        }
        return L.Util.template(this._url, urlParameters);
    }
});

L.TileLayer.Bing = function (options) {
    return new Bing(options);
};
