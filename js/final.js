var myLoader;

function myFunction() {
  myLoader = setTimeout(showPage, 3000);
}

function showPage() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("myDiv").style.display = "block";
};


function createMap(){
    //create the map
    var map = L.map('map', {
        center: [44, -120],
        zoom: 7,
        renderer: L.canvas()
        //minZoom:8
    });

    //add OSM base tilelayer
    var Esri_WorldTopoMap =  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> AnciWeb Wildfire Data, USFS Spatial Data, Oregon Spatial Data Library, US Drought Monitor Spatial Data, Homeland Infrastructure Foundation-Level Power Transmssion Lines Spatial Data, Bureau of Land Management, W3 Schools CSS Loader',
  detectRetina: true,
       minZoom:7

     }).addTo(map);

    //call getData function

    getData(map);

};

function calcNewRadius(attributeValue) {

    //scale factor to adjust symbol size evenly
    var scaleFactor = 10000;
    //area based on attribute value and scale factor
    var area = attributeValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function pointToLayer(feature, latlng, attributes){
    var attribute = attributes[0];

    //console.log("attributes[0] is...",attribute);

    var symbolOptions = {
        radius:8,
        fillColor: "#FF0000",
        color: "#FFFFFF",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6
    };

    var attributeValue = Number(feature.properties[attribute]);
    console.log("attribute value is...",attributeValue)
    if (attributeValue==0){console.log("Attribute Value is 0",attributeValue)};


    symbolOptions.radius = calcNewRadius(attributeValue);


    var layer = L.circle(latlng, symbolOptions);

    var popUpinfo = "<p><b>Wildfire Name:</b> " + feature.properties.Name + "</p><p><b>" + attribute + ":</b> " + Math.round(feature.properties[attribute]) + "</p><i>acres</i>";

    layer.bindPopup(popUpinfo, {
        offset: new L.Point(0,(-symbolOptions.radius/1000000))
    });

    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            this.openPopup;
        }
    });

    return layer;
};

function createSymbols(data,map,attributes){

  L.geoJson(data, {
      pointToLayer: function(feature, latlng){
        return pointToLayer(feature, latlng, attributes);
      }
  }).addTo(map);

};



function updateSymbols(map, attribute){
	map.eachLayer(function(layer){
		if (layer.feature && layer.feature.properties[attribute]){
			//access feature properties
      layer.bringToFront();
      //console.log("symbol size check",layer.feature.properties[attribute])
        //console.log("Layer Name is...",layer)
        //console.log("updateSymbols attibute",attribute);
        console.log("Layer.feature.properties[attribute]",layer.feature.properties[attribute]);

            var wildAcres = layer.feature.properties[attribute];

            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcNewRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popUpinfo = "<p><b>Wildfire:</b> " + props.Name + "</p>";

            //add formatted attribute to panel content string
            //var fire = attribute.split("_")[1];
            //console.log("Fire attribute split?...",fire);
            popUpinfo +=  Math.round(props[attribute]) + " acres</p>";

            //replace the layer popup
            layer.bindPopup(popUpinfo, {
                offset: new L.Point(0,(-radius/1000000))
            });
		      };
	      });
        updateLegend(map, attribute);
     };

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            var svg = '<svg id="attribute-legend" width="150px" height="80px" >';

            //Example 3.5 line 15...Step 1: start attribute legend svg string
            //var svg = '<svg id="attribute-legend" width="160px" height="60px">';
            var circles = {
                max: 20,
                mean: 40,
                min: 60
            };

            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#FF0000" fill-opacity="0.6" stroke="#FFFFFF" cx="30"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
            };

            //close svg string
            svg += "</svg>";
            console.log(svg);

            //add attribute legend svg to container
            $(container).append(svg);


            return container;
        }
    });

    map.addControl(new LegendControl());

    updateLegend(map, attributes[0]);
};

function createTitle(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'title-container');

            L.DomUtil.setOpacity(container,0.7);

            //add temporal legend div to container
            $(container).append('<div id="title-text">Wildfire Season Oregon 2020')

return container;
        }
    });
map.addControl(new LegendControl());
};

function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

function updateLegend(map, attribute){
    console.log("updateLegend attribute is...",attribute)
    //create content for legend
    var year = attribute;
    var content =  year;

    //replace legend content
    $('#temporal-legend').html(content);

    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        console.log("key in updateLegend is...",key)
        //get the radius
        var radius = calcNewRadius(circleValues[key])/900;

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });

        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " acres");
    };

};



function createSlider(map,attributes){
  var SequenceControl = L.Control.extend({
      options: {
          position: 'bottomright'
      },

      onAdd: function (map) {
          // create the control container div with a particular class name
          var container = L.DomUtil.create('div', 'sequence-control-container');

          //create range input element (slider)
          $(container).append('<input class="range-slider" type="range">');

          //add skip buttons
          $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
          $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');

          //disable any mouse event listeners for the container
          L.DomEvent.disableClickPropagation(container);

          return container;
      }
  });

  map.addControl(new SequenceControl());
    //create range input element (slider)
    //$('#panel').append('<input class="range-slider" type="range">');

    $('.range-slider').attr({
        max: 55,
        min: 0,
        value: 0,
        step: 1,
      });

    $('#reverse').html('<img src="img/back.svg">');
    $('#forward').html('<img src="img/forward.svg">');

    var index = 0;
    $('.range-slider').val(index);


    //Step 5: click listener for buttons
	$('.skip').click(function(){
		//get the old index value
		var index = $('.range-slider').val();
    //console.log("Range Slider value is...",index);

		//Step 6: increment or decriment depending on button clicked
		if ($(this).attr('id') == 'forward'){
			index++;
			//Step 7: if past the last attribute, wrap around to first attribute
			index = index > 55 ? 0 : index;
		} else if ($(this).attr('id') == 'reverse'){
			index--;
			//Step 7: if past the first attribute, wrap around to last attribute
			index = index < 0 ? 55 : index;
		};

		//Step 8: update slider
		$('.range-slider').val(index);

		//Step 9: pass new attribute to update symbols
		updateSymbols(map, attributes[index]);

    console.log(attributes[index]);

    //console.log("attributes[index] is...",attributes[index])
	});



	//Step 5: input listener for slider
	$('.range-slider').on('input', function(){
		//Step 6: get the new index value
		var index = $(this).val();

		//Step 9: pass new attribute to update symbols
		updateSymbols(map, attributes[index]);
	});

};


function processInput(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array


    for (var attribute in properties){
        //only take attributes with population values

        if (attribute != "Name"){
        attributes.push(attribute)};
    };

    //check result
    //console.log("Here are the properties",properties);

    //console.log("And the attributes",attributes);

    return attributes;
};

function getDroughtColor(d){
    return d == 4 ? '#cc4c02' :
           d == 3 ? '#fe9929' :
           d == 2 ? '#fed98e' :
           d == 1 ? '#ffffd4' :
                   '#FFFFFF';
};

function getTreeColor(d){
    return d == 'Douglas-fir'       ? '#006600' :
           d == 'Grand Fir'         ? '#66cc66' :
           d == 'Juniper Woodland'  ? '#c6ecc6' :
           d == 'Lodgepole Pine'    ? '#4d9900' :
           d == 'Mountain Hemlock'  ? '#b2b266' :
           d == 'Ponderosa Pine'    ? '#79d279' :
           d == 'Red Alder'         ? '#bf8040' :
           d == 'Subalpine Fir'     ? '#99ffdd' :
           d == 'Western Juniper'   ? '#00e673' :
           d == 'White Fir'         ? '#c2d6d6' :
                                      '#FFFFFF';
};

function droughtStyle(feature) {
    return {
        fillColor: getDroughtColor(feature.properties.OBJECTID),
        weight: 2,
        opacity: 0.2,
        color: 'white',
        fillOpacity: 0.7,

    };
};

function treeStyle(feature){
    return {
        fillColor: getTreeColor(feature.properties.Class_Name),
        weight: 2,
        opacity: 0.2,
        color: 'gray',
        fillOpacity: 0.8,
    };
};

function stateStyle(feature){
    return {
        fillOpacity: 0.0,
        weight:1.5,
        color: 'gray'

    };
};

function powerStyle(feature){
    return {
        fillOpacity: 0.0,
        weight:1,
        color: 'gray'

    };
};

function privateStyle(feature){
    return {
        fillOpacity:0.7,
        fillColor: '#2b8cbe',
        weight: 0.0
    }
};

function federalStyle(feature){
    return {
        fillOpacity:0.7,
        fillColor: '#ffcc00',
        weight: 0.0
    }
};

function stateLandStyle(feature){
    return {
        fillOpacity:0.7,
        fillColor: '#beaed4',
        weight: 0.0
    }
};

function localStyle(feature){
    return {
        fillOpacity:0.7,
        fillColor: '#fb9a99',
        weight: 0.0
    }
};

function getLegendItems(map){

var stateLand_geo = L.geoJson(stateLand,{style:stateLandStyle});

var federal_geo = L.geoJson(federal,{style:federalStyle});

var local_geo = L.geoJson(local, {style:localStyle});

var private_geo = L.geoJson(private_land,{style:privateStyle});

var tree_geo = L.geoJson(simple_tree,{style: treeStyle}).bindPopup(
    function(layer){return layer.feature.properties.Class_Name.toString()});

var drought_geo = L.geoJson(drought_level,{style: droughtStyle}).bindPopup(
    function(layer){return layer.feature.properties.Drought_Le.toString()});

var state_geo = L.geoJson(or_state,{style: stateStyle});

var powerLines_geo = L.geoJson(powerLines,{style: powerStyle});

var overlays = {

    "Federally Owned Land":federal_geo,
    "State Owned Land":stateLand_geo,
    "Locally Owned Land":local_geo,
    "Privately Owned Land":private_geo,
    "Common Trees":tree_geo,
    "Drought September 2020":drought_geo,
    "Power Transmission Lines": powerLines_geo
};



L.control.layers(null,overlays,{collapsed:false}).addTo(map);
}
function getData(map){
    //load the data
    console.log("getData running...");
    $.ajax("data/perimeterEdit.geojson", {
        dataType: "json",
        success: function(response){

              var attributes = processInput(response);

              //var drought = getDrought(map);
              L.geoJson(or_state,{style: stateStyle}).addTo(map);
              getLegendItems(map);
              createSymbols(response,map,attributes);
              createSlider(map,attributes);
              createLegend(map,attributes);
              createTitle(map);

        }
    });
};



$(document).ready(createMap);
