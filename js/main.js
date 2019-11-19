/*
Horizontal bar chart
*/

var svgHeight = 500,
    svgWidth = 960;

var margin = {
    left:100,
    right:50,
    top:50,
    bottom:100 
};

var height = svgHeight - margin["top"] - margin["bottom"],
    width = svgWidth - margin["right"] - margin["left"];

var svg = d3.select("#horizontal-bar-chart")
    .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

//Create the main chart group
var g = svg.append("g")
        .attr("transform", `translate(${margin["left"]}, ${margin["top"]})`);


// Add a group for the x and y axes
var xAxisGroup = g.append("g")
    .attr("transform", `translate(0, ${height})`);

var yAxisGroup = g.append("g");

// Define scales
var x = d3.scaleLinear()
    .range([0,width]);

var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.2);

var colorScale = d3.scaleOrdinal(d3.schemePaired);

//Add x label
var xLabelGroup = g.append("g");
xLabelGroup.append("text")
    .attr("x", width/2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("Energía (kWh)"); //CAMBIAR ESTA LÍNEA PARA HACERLO DINÁMICO

// Add y label
var yLabelGroup = g.append("g");
yLabelGroup.append("text")
    .attr("x", -(height/2))
    .attr("y", -70)
    .attr("transform", "rotate(-90)")
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Unidad");

// Add time label
var timeLabel = g.append("text")
    .attr("y", height -10)
    .attr("x", width - 40)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text(":v");
