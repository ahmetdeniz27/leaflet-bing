# leaflet-bing
Bing Maps Layer for leaflet v1.0. This plugin is created by following [leaflet-bing-layer](https://github.com/gmaclennan/leaflet-bing-layer) plugin. External dependency on [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) is removed and plugin is made simpler to follow and understand.

### L.TileLayer.Bing(options)
Creates a new Bing Maps layer.

### Parameters

| parameter                     | type           | description                                                                                           |
| ----------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `options`                     | object | Inherits from [L.TileLayer options](http://mourner.github.io/Leaflet/reference.html#tilelayer-options) (e.g. you can set `minZoom` and `maxZoom` etc.) |
| `options.key`         | string         | A valid [Bing Maps Key](https://msdn.microsoft.com/en-us/library/ff428642.aspx) [_required_]                                                                   |
| `[options.imagery]` | string         | _optional:_ [Imagery Type](https://msdn.microsoft.com/en-us/library/ff701716.aspx) [_default=Road_] <br>- `Aerial` - Aerial imagery<br>- `AerialWithLabels` - Aerial imagery with a road overlay<br>- `Road` - Roads without additional imagery<br>      |
| `[options.culture]`   | string         | _optional:_ Language for labels, [see options](https://msdn.microsoft.com/en-us/library/hh441729.aspx) [_default=en_US_]           |


### Example

```js
var map = L.map('map').setView([51.505, -0.09], 13)
L.tileLayer.bing({ key: 'YOUR-BING-MAPS-KEY' }).addTo(map)
```

### License

MIT
