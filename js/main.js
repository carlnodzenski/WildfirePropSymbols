/* Example from Leaflet Quick Start Guide*/


var map = L.map('map').setView([39.74739, -105], 13);


//add tile layer...replace project id and accessToken with your own
console.log("Hit 1")

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoibm9kemVuc2tpIiwiYSI6ImNrZWJ6Z2owcTBkdHAyeG9hYnNiY3JwM3AifQ.IuNK4rOSVUx90cq8x0FrcA'
}).addTo(map);

console.log("Hit 2")

function onEachFeature(feature, layer) {
    //does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);

var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
    }, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
  }];

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};


L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-109.05, 41.00],
          [-102.06, 40.99],
          [-102.03, 36.99],
          [-109.04, 36.99],
          [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
    style: function(feature) {
      switch (feature.properties.party){
        case 'Republican': return {color: "#ff0000"};
        case 'Democrat':   return {color: "#0000ff"};
      }
    }
}).addTo(map)

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

//converts geojson feature to create a circlemarker
L.geoJSON(someGeojsonFeature, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);


// Only the Zoo point shows up, have to comment out other code
var filterSomeFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Denver Zoo",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.9490, 39.7502]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJSON(filterSomeFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);
