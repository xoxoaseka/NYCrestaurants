var ZIPCODE_URL = "https://raw.githubusercontent.com/hvo/datasets/master/nyc_zip.geojson";
var RES_BY_CUISINE_URL = "https://raw.githubusercontent.com/hvo/datasets/master/nyc_restaurants_by_cuisine.json";

d3.queue()
  .defer(d3.json, ZIPCODE_URL)
  .defer(d3.json, RES_BY_CUISINE_URL)
  .await(createChart);

function createChart(error, zipcodes, byCuisine) {
  if (error) throw error;
  
  var svg        = d3.select("svg"),
      gMap       = svg.append("g"),
      canvasSize = [800, 650],
      dataTotal = byCuisine.map(function (row) {
  return [row.cuisine, row.total];
});
dataTotal = dataTotal.slice(0, 25);

var maxValue = d3.max(dataTotal, function(d) {return d[1];});

var cuisineCount = 1;

console.log(dataTotal.map(function (d) {return d[0];}));


var x = d3.scaleLinear()
  .domain([0, maxValue])
  .range([0,200]);
  // .rangeRound([155, 200]);

var yb = d3.scaleBand()
  .domain(dataTotal.map(function (d) {return d[0];}))
  .rangeRound([140, 450]);

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

// var y = d3.scaleLinear()
//   .domain([1, 25])
//   .rangeRound([170, 450]);

  gMap.append("g")
  .attr("class", "axis axis--y")
  .attr("transform", "translate(150,0)")
  .call(d3.axisLeft(yb))
  .append("text")
    .attr("class", "label")
    // .attr("transform", "rotate(-90)")
    .attr("x", 160)
    .attr("y", 130)
    .text("Number of Restaurants");


gMap.selectAll(".bar")
    .data(dataTotal)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", x(0)+160)
      .attr("y", function(d,i) { return yb(d[0]); })
      .attr("width", function(d,i) { return x(d[1]); })
      .attr("height", yb.bandwidth()-2)
      .on("mouseover", function(d) {
        d3.select(this)
          .transition().duration(300)
          .attr("x", x(0)+150)
          .attr("y", yb(d[0])-2)
          .attr("width", x(d[1])+10)
          .attr("height", yb.bandwidth()+2)
        ;
        tooltip.text(d[1]);
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        return tooltip
          .style("top", (d3.event.pageY+10)+"px")
          .style("left",(d3.event.pageX+10)+"px");
      })
      .on("mouseout", function(d) { 
        d3.select(this)
          .transition().duration(300)
          .attr("x", x(0)+160)
          .attr("y", yb(d[0]))
          .attr("width", x(d[1]))
          .attr("height", yb.bandwidth()-2)
        ;
        return tooltip.style("visibility", "hidden");
      })
      .on("click", function(d){
        cuisineCount = d.indexOf(d[0]);
        console.log(cuisineCount);
        console.log(d.indexOf(d[0]));
      })
      ;    
      // We create Mercator projection that zoom to level, e.g., 10.66, with a center
      // in Finacial District (lat: 40.7, lon: -73.975). Note that we need to add
      // 5.34 to the zoom level due to the default Mercator map to [0,2*PI] instead of
      // [0,256] in WebMercator: log2(256/(2*PI)) ~ 5.34.
      projection = d3.geoMercator()
                     .scale(Math.pow(2, 9.66 + 5.34))
                     .center([-73.975,40.7])
                     .translate([canvasSize[0]/2, canvasSize[1]/2]),
      
      // We create a path generator (which can take a set of points to generate a path)
      // using the created projection.
      path       = d3.geoPath()
                     .projection(projection);
  
  // Let's create a path for each (new) zipcode shape
  gMap.selectAll(".zipcode")
    .data(zipcodes.features)
    .enter().append("path")
      .attr("class", "zipcode")
      .attr("d", path);
  
  // Below we map shapes to appropriate colors
  var counts   = byCuisine[cuisineCount].perZip,
      data     = Object.entries(counts),      // convert counts to a list
      maxCount = d3.max(data, d => d[1]),     // get the max count
      color    = d3.scaleThreshold()          // then create a scale with 5 periods
                   .domain(d3.range(0, maxCount, maxCount/5))
                   .range(d3.schemeBlues[5]); // using 5 shades of blue
  //console.log(byCuisine[0].perZip);
  // We update all elements of the 'zipcode' class
  gMap.selectAll(".zipcode")
      .data(data, myKey) // we must join data and visual elements using the right keys
      .style("fill", d => color(d[1]));

  gMap.append("text")
    .attr("class", "caption")
    .attr("x", 20)
    .attr("y", 20)
    .attr("fill", "#000")
    .attr("font-size", "14")
    .attr("font-weight", "bold")
    .text("The distribution of American restaurants in NYC");
}

/*
Using this myKey function, we would like to map data with the existing zip code data.
This function must return the key, aka. zipcode, for both the byCuisine data, and the
zipcode shapes.

We know that for zipcode shapes, the zipcode info is stored in the properties.zipcode 
element of each item. For the byCuisine data, the zipcode is stored in the first item
of each tuple. Thus, we would like:

    myKey(data[0]) to return data[0][0]
 
and

    myKey(zipcodes.features[0]) to return zipcodes.features[0].properties.zipcode
    
NOTE: data and zipcodes are expected to be variables in the previous function.

*/
function myKey(d) {
  return (d[0]?d[0]:d.properties.zipcode);
}



















