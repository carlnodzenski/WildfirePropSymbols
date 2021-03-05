





/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	  maxZoom: 20,
	  attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    //call getData function
    getData(map);
};


/*
//This block creates custom vector circle symbols for geojson points
function getData(map){
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
            //create geojson vector instead of leaflet default png marker
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        }
    }
)};
*/

/*
//This block uses a loop to add data from geojson to popup window.
//The marker is the default leaflet png
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                onEachFeature: onEachFeature
            }).addTo(map);
        }
    });
};
*/

/*
//This code block adds geojson data to the map and filters what is displayed
function getData(map){
  $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                //use filter function to only show cities with 2015 populations greater than 20 million
                filter: function(feature, layer) {
                    return feature.properties.Pop_2015 > 20;
                }
            }).addTo(map);
        }
    });
};
*/

//This code block creates geojson proportional symbols
//The code block includes createPropSymbols() and getData()
/*
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function createPropSymbols(data, map){
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    // determine which attribute to visualize for symbols
    var attribute = "Pop_2015";

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //for each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            console.log(feature.properties, attValue)

            //Give each feature's circle marker a radius based on attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            console.log(geojsonMarkerOptions.radius)

            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

//Import geojson data
function getData(map){
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
              //call function to create prop symbols
              createPropSymbols(response,map);
        }
    });
};
*/


//This code block should create popup window for proportional
//symbols which are styled in css
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//Example 1.2 line 1...Popup constructor function
function Popup(properties, attribute, layer, radius){
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
    this.year = attribute.split("_")[1];
    this.population = this.properties[attribute];
    this.content = "<p><b>City:</b> " + this.properties.City + "</p><p><b>Population in " + this.year + ":</b> " + this.population + " million</p>";

    this.bindToLayer = function(){
        this.layer.bindPopup(this.content, {
            offset: new L.Point(0,-radius)
        });
    };
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //console.log("pointToLayer attributes plural...",attributes)
    console.log("pointToLayer feature...",feature);
    console.log("pointToLayer attribute...",attribute);

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //Example 1.3 line 1...in pointToLayer()
    //create new popup
    var popup = new Popup(feature.properties, attribute, layer, options.radius);

    //add popup to circle marker
    popup.bindToLayer();

    //event listeners to open popup on hover and fill panel on click
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }//,
    //  click: function(){
    //      $("#panel").html(panelContent);
    //  }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

/*
//Slider in the panel from module 2
//create new sequence controls
function createSequenceControls(map, attributes){
	//create range input element (slider)
	$('#panel').append('<input class="range-slider" type="range">');

	//set slider attributes
	$('.range-slider').attr({
		max: 6,
		min: 0,
		value: 0,
		step: 1
	});

	//add skip buttons
	$('#panel').append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
	$('#panel').append('<button class="skip" id="forward" title="Forward">Skip</button>');

	//replace button content with images
	$('#reverse').html('<img src="img/back.svg">');
	$('#forward').html('<img src="img/forward.svg">');

	//Step 5: click listener for buttons
	$('.skip').click(function(){
		//get the old index value
		var index = $('.range-slider').val();
    console.log("Old range-slider.val() or index value is...", index)


		//Step 6: increment or decriment depending on button clicked
		if ($(this).attr('id') == 'forward'){
			index++;
			//Step 7: if past the last attribute, wrap around to first attribute
			index = index > 6 ? 0 : index;
		} else if ($(this).attr('id') == 'reverse'){
			index--;
			//Step 7: if past the first attribute, wrap around to last attribute
			index = index < 0 ? 6 : index;
		};

		//Step 8: update slider
		$('.range-slider').val(index);
    console.log("New range-slider.val() or index value is...", index)
		//Step 9: pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
	});

	//Step 5: input listener for slider
	$('.range-slider').on('input', function(){
		//Step 6: get the new index value
		var index = $(this).val();

		//Step 9: pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
	});
};
*/

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Module 3, put the slider on the map
//Create new sequence controls
function createSequenceControls(map, attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
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

	//set slider attributes
	$('.range-slider').attr({
		max: 6,
		min: 0,
		value: 0,
		step: 1
	});

	//replace button content with images

	$('#reverse').html('<img src="img/back.svg">');
	$('#forward').html('<img src="img/forward.svg">');

	//click listener for buttons
	$('.skip').click(function(){

		//get the old index value
		var index = $('.range-slider').val();

		//increment or decriment depending on button clicked
		if ($(this).attr('id') == 'forward'){
			index++;
			//if past the last attribute, wrap around to first attribute
			index = index > 6 ? 0 : index;
		} else if ($(this).attr('id') == 'reverse'){
			index--;
			//if past the first attribute, wrap around to last attribute
			index = index < 0 ? 6 : index;
		};

		//update slider
		$('.range-slider').val(index);

		//pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
	});

	//input listener for slider
	$('.range-slider').on('input', function(){
		//get the new index value
		var index = $(this).val();

		//pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
	});
};

//Resize proportional symbols based on new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //Example 1.3 line 6...in UpdatePropSymbols()
            var popup = new Popup(props, attribute, layer, radius);

            //add popup to circle marker
            popup.bindToLayer();
        };
    });

    updateLegend(map, attribute);
};


function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Example 3.5 line 15...Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            // //array of circle names to base loop on
            // var circles = ["max", "mean", "min"];

            //object to base loop on...replaces Example 3.10 line 1
            var circles = {
                max: 20,
                mean: 40,
                min: 60
            };

            // //Step 2: loop to add each circle and text to svg string
            // for (var i=0; i<circles.length; i++){
            //     //circle string
            //     svg += '<circle class="legend-circle" id="' + circles[i] +
            //     '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';

            //     //text string
            //     svg += '<text id="' + circles[i] + '-text" x="65" y="60"></text>';
            // };

            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';

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

//Calculate the max, mean, and min values for a given attribute
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

//Example 3.7 line 1...Update the legend with new attribute
function updateLegend(map, attribute){
    console.log("updateLegend attribute is...",attribute)
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "Population in " + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        console.log("key in updateLegend is...",key)
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });

        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " million");
    };
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Pop")>-1){
            attributes.push(attribute);
        };
    };

    //console.log("Hit attributes",attributes);
    console.log(data);
    return attributes;
};

function getData(map){
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){

              //create variable to hold attributes array
              var attributes= processData(response);
              console.log("attributes from process data reponse...",attributes)
              //call function to create prop symbols
              createPropSymbols(response,map,attributes);
              createSequenceControls(map, attributes);
              createLegend(map, attributes);
        }
    });
};




$(document).ready(createMap);
