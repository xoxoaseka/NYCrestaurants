var ZIPCODE_URL = "https://raw.githubusercontent.com/xoxoaseka/NYCrestaurants/master/nyc_zip.geojson.txt";
var RES_BY_CUISINE_URL = "https://raw.githubusercontent.com/xoxoaseka/NYCrestaurants/master/nyc_restaurants_by_cuisine.json";

d3.queue()
  .defer(d3.json, ZIPCODE_URL)
  .defer(d3.json, RES_BY_CUISINE_URL)
  .await(createChart);

function createChart(error, zipcodes, byCuisine) {
  if (error) throw error;
  
var dataTotalAll = byCuisine.map(function (row) { return [row.cuisine, row.total]; }),
    dataTotal = dataTotalAll.slice(0, 25);

var maxValue = d3.max(dataTotal, function(d) {return d[1];});

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
 
var svg        = d3.select("svg"),
    gMap       = svg.append("g"),
    canvasSize = [800, 650];

  gMap.append("g")
  .attr("class", "axis axis--y")
  .attr("transform", "translate(150,0)")
  .call(d3.axisLeft(yb))
 
  gMap.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(160,135)")
    .call(d3.axisTop(x)
        .ticks(4))
  
  gMap.append("text") 
    .attr("class","xlabel")
    .attr("transform", "translate(210,100)")
    .text("Number of Restaurants");

  gMap.append("text")
    .attr("class", "caption")
    .attr("x", 230)
    .attr("y", 50)
    .attr("fill", "#000")
    .attr("font-size", "14")
    .attr("font-weight", "bold")
    .text("The distribution of cuisines in NYC");
  

  gMap.selectAll(".bar")
      .data(dataTotal)
      .enter().append("rect")
              .attr("class", "bar")
              .attr("x", x(0)+160)
              .attr("y", function(d,i) { return yb(d[0]); })
              .attr("width", function(d,i) { return x(d[1]); })
              .attr("height", yb.bandwidth()-2)
              .on("mouseover", function(d, i) {

                index = i;

                var svg    = d3.select("svg"),
                    gMap   = svg.append("g"),
                    canvasSize = [800, 650],
                    projection = d3.geoMercator()
                                   .scale(Math.pow(2, 9.66 + 5.34))
                                   .center([-73.975,40.7])
                                   .translate([canvasSize[0]/2, canvasSize[1]/2]),
                    path = d3.geoPath()
                             .projection(projection);

                gMap.selectAll(".zipcode")
                    .data(zipcodes.features)
                    .enter().append("path")
                    .attr("class", "zipcode")
                    .attr("d", path)
                    .style("opacity", 1)
                    ;

                var counts   = byCuisine[index].perZip,
                    data     = Object.entries(counts),      // convert counts to a list
                    maxCount = d3.max(data, d => d[1]),     // get the max count
                    color    = d3.scaleThreshold()          // then create a scale with 5 periods
                                 .domain(d3.range(0, maxCount, maxCount/5))
                                 .range(d3.schemeBlues[5]); // using 5 shades of blue
                    zip      = gMap.selectAll(".zipcode")
                                   .data(data, d=> (d[0]?d[0]:d.properties.zipcode))
                                   .transition().duration(300)
                                   ;
                    zip.style("fill", d=> color(d[1]));
              

                d3.select(this)
                  .transition().duration(300)
                  .attr("x", x(0)+150)
                  .attr("y", yb(d[0])-2)
                  .attr("width", x(d[1])+10)
                  .attr("height", yb.bandwidth()+2)
                ;

                d3.selectAll(".legendtitle").style("visibility", "hidden");   
                
                gMap.append("text") 
                    .attr("class", "legendtitle")
                    .attr("transform", "translate(410,100)")
                    .text("Number of " + dataTotal[index][0] + " Restaurants");

                var kFormat = function(num){ return Math.round(num/1000 * 10) / 10 + 'k' };
        

                var x2Scale = d3.scaleLinear()
                                .domain([0, maxCount])
                                .range([0, 150])
                                ;
                              
                increment = maxCount / 4
                
                //console.log(maxCount);

                d3.selectAll(".legendticks").remove();
                
                gMap.append("g")
                  .attr("class", "legendticks")
                  .attr("transform", "translate(420,130)")
                  .call(d3.axisBottom(x2Scale)
                      .tickValues([0, increment, increment * 2, increment * 3, maxCount])
                      .tickFormat(kFormat))
                  ;
                  var palette = {
                                      0: 'rgb(190,215,230)',
                                      1: 'rgb(109,175,212)',
                                      2: 'rgb(54,131,187)',
                                      3: 'rgb(16,83,154)'
                                  }
    
                gMap.selectAll(".colorLegend")
                  .data([0,1,2,3])
                  .enter().append("rect")
                    .attr("class", "colorLegend")
                    .attr("x", function(d){return 360 + d * 37.5})
                    .attr("transform", "translate(60,120)")
                    .attr("y", 0)
                    .attr("width", 37.5)
                    .attr("height", 10)
                    .style("fill", function(d, i){
                    return palette[i]
                })
    
                //gMap.append("text") 
                //.attr("class","legendtitle")
                //.attr("transform", "translate(410,100)")
                // .text("Number of American Restaurants");
              
                // var projection = d3.geoMercator()
                //      .scale(Math.pow(2, 9.66 + 5.34))
                //      .center([-73.975,40.7])
                //      .translate([canvasSize[0]/2, canvasSize[1]/2]),
                // path = d3.geoPath()
                //      .projection(projection);
  
                // gMap.selectAll(".zipcode")
                //   .data(zipcodes.features)
                //   .enter().append("path")
                //     .attr("class", "zipcode")
                //     .attr("d", path);
              
                // var counts   = byCuisine[0].perZip,
                //     data     = Object.entries(counts),      // convert counts to a list
                //     maxCount = d3.max(data, d => d[1]),     // get the max count
                //     color    = d3.scaleThreshold()          // then create a scale with 5 periods
                //                  .domain(d3.range(0, maxCount, maxCount/5))
                //                  .range(d3.schemeBlues[5]); // using 5 shades of blue
                //     zip       = gMap.selectAll(".zipcode")
                //                    .data(data, d=> (d[0]?d[0]:d.properties.zipcode));
                
                // zip.style("fill", d=> color(d[1]));
                
                var kFormat = function(num){
                  return Math.round(num/1000 * 10) / 10 + 'k'
                             };
                
                
                var x2Scale = d3.scaleLinear()
                  .domain([0, maxCount])
                  .range([0, 150]);
                
                increment = maxCount / 4
                
                gMap.append("gMap")
                  .attr("class", "legendticks")
                  .attr("transform", "translate(360,20)")
                  .call(d3.axisBottom(x2Scale)
                      .tickValues([0, increment, increment * 2, increment * 3, maxCount])
                      .tickFormat(kFormat))


                gMap.selectAll(".zipcode")
                    .data(data, myKey) 
                    .style("fill", d => color(d[1]));


                tooltip.text(d[1]);
                return tooltip.style("visibility", "visible");
                })

      
      // .on("click", function(d){
      //   gMap.selectAll(".legendtitle").style("visibility", "hidden");   
      //   gMap.append("text") 
      //       .attr("class", "legendtitle")
      //       .attr("transform", "translate(410,100)")
      //       .text("Number of " + dataTotal[index][0] + " Restaurants");
      // })

                .on("mousemove", function() {
                  return tooltip
                    .style("top", (d3.event.pageY+10)+"px")
                    .style("left",(d3.event.pageX+10)+"px")
                    ;
                })

                .on("mouseout", function(d) { 
                  d3.select(this)
                    .transition().duration(300)
                    .attr("x", x(0)+160)
                    .attr("y", yb(d[0]))
                    .attr("width", x(d[1]))
                    .attr("height", yb.bandwidth()-2)
                  ;
                  // gMap.selectAll(".zipcode")
                  //   .transition().duration(1000)
                  //   .style("opacity", 0)
                  //   ;
                  
                  return tooltip.style("visibility", "hidden");
                })

                var svg    = d3.select("svg"),
                    gMap   = svg.append("g"),
                    canvasSize = [800, 650],
                    projection = d3.geoMercator()
                                   .scale(Math.pow(2, 9.66 + 5.34))
                                   .center([-73.975,40.7])
                                   .translate([canvasSize[0]/2, canvasSize[1]/2]),
                    path = d3.geoPath()
                             .projection(projection);

                gMap.selectAll(".zipcode")
                    .data(zipcodes.features)
                    .enter().append("path")
                    .attr("class", "zipcode")
                    .attr("d", path)
                    .style("opacity", 1)
                    ;
  }

function myKey(d) {
  return (d[0]?d[0]:d.properties.zipcode);
}
