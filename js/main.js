/*
Horizontal bar chart
*/

var svgHeight = 500,
    svgWidth = 960;

var margin = {
    left:150,
    right:10,
    top:50,
    bottom:100 
};

// Define width and height of the cahrt
var height = svgHeight - margin["top"] - margin["bottom"],
    width = svgWidth - margin["right"] - margin["left"];

var svg = d3.select("#horizontal-bar-chart")
    .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

// Define a time parsing function and set global currentDate function
var parseTime = d3.timeParse("%d/%m/%Y");
var currentDate;
var initialDate;
var lastDate;
var currentDateStr;

var selectedRegion,
    selectedKPI;

//Define interval global variable and cleanData
var interval;
var cleanData;

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
var xLabelGroup = g.append("text")
    .attr("x", width/2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("Energía (kWh)"); //CAMBIAR ESTA LÍNEA PARA HACERLO DINÁMICO

// Add y label
var yLabelGroup = g.append("g");
yLabelGroup.append("text")
    .attr("x", -(height/2))
    .attr("y", -130)
    .attr("transform", "rotate(-90)")
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Unidad");

// Add time label
var timeLabel = g.append("text")
    .attr("y", 0)
    .attr("x", width - 90)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text("31/07/2019");

// Add title
var title = g.append("text")
    .attr("y", 0)
    .attr("x", width/2)
    .attr("font-size", "40px")
    .attr("text-anchor", "middle")
    .text("Indicadores CMR")


//--------------------------------------------------------------------------------
// Read the data :v
//--------------------------------------------------------------------------------
//var loadDsv = d3.dsv(",", "utf-8")
//var loadDsv = d3.dsv(",", "iso-8859-1");
d3.csv("data/data.csv").then(cemerreData=>{
    //console.log(cemerreData);
    //cemerreData  = cemerreData.filter( d => d["Fecha"] === "31/07/2019");
    
   cemerreData.forEach(d =>{
        d["Fecha_str"] = d["Fecha"]
        d["Fecha"] = parseTime(d["Fecha"]);
        d["energy_main(kWh)"] = +d["energy_main(kWh)"];
        d["Ventas"] = +d["Ventas"];
        d["intensidad_kWh_invitado"] = +d["intensidad_kWh_invitado"];
        d["ticket_promedio_MXN_invitado"] = +d["ticket_promedio_MXN_invitado"];
        d["Invitados"] = +d["Invitados"];
    });
    
    cleanData = cemerreData;
    currentDate = cleanData[0]["Fecha"];
    currentDateStr = cleanData[0]["Fecha_str"]
    initialDate = cleanData[0]["Fecha"];
    lastDate = cleanData.slice(-1)[0]["Fecha"];
    
    // Filter the data so that only the first date in the data is passed to updateData
    // This assumes that the data is ordered by date.
    updateData(cleanData.filter( d => d["Fecha"].getTime() === currentDate.getTime()));
    
});

//Handle the play button
$("#play-button")
    .on("click", function(){
        var button = $(this);
        if (button.text() == "Reproducir"){
            button.text("Pausar");
            interval = setInterval(step, 500)
        }else{
            button.text("Reproducir");
            clearInterval(interval);
        }
});


// Handle the rest button
$("#reset-button")
    .on("click", function(){
        currentDate = new Date(initialDate.setDate(initialDate.getDate()));
        updateData(cleanData.filter( d => d["Fecha"].getTime() === currentDate.getTime()))
});


//Change the displayed region when the region is changed
$("#region-select")
    .on("change", function(){
        updateData(cleanData.filter( d => d["Fecha"].getTime() === currentDate.getTime())); 
});

// Change the displayed KPI when it is changed
$("#kpi-select")
    .on("change", function(){
        updateData(cleanData.filter( d => d["Fecha"].getTime() === currentDate.getTime()));
    //Change the x Axis Label based on the new selection in the kpi selector
    switch(selectedKPI){
        case "energy_main(kWh)": xLabelGroup.text("Energía (kWh)");
            break;
        case "Ventas": xLabelGroup.text("Ventas");
            break;
        case "Invitados": xLabelGroup.text("Invitados");
            break;
        case "intensidad_kWh_invitado": xLabelGroup.text("Intensidad (kWh/Invitado)");
            break;
        case "ticket_promedio_MXN_invitado": xLabelGroup.text("Ticket promedio (MXN/Invitado)");
            break;
        default: console.log("pls");
    }
})

//-------------------------------------------------------------------
// Function to be called when the user presses "play"
//-------------------------------------------------------------------
function step(){
        //At the end of our data, loop :v
        //currentDate =  (currentDate < lastDate && currentDate >= initialDate) ? new Date(currentDate.setDate(currentDate.getDate() + 1)) : initialDate;
        currentDate =  (currentDate < lastDate && currentDate >= initialDate) ? new Date(currentDate.setDate(currentDate.getDate() + 1)) : new Date(initialDate.setDate(initialDate.getDate()));
        updateData(cleanData.filter( d => d["Fecha"].getTime() === currentDate.getTime()))
};


//--------------------------------------------------------------------------------
// Define the function that will update the data
//--------------------------------------------------------------------------------
function updateData(cleanData2){
    //Define the transition function
    var t = d3.transition().duration(500);
    // These two variables below are defined by the two dropboxes
    
    selectedRegion = $("#region-select").val();
    selectedKPI = $("#kpi-select").val();

    // Filter the selected Region
    cleanData2 = cleanData2.filter(d=>{
        if (selectedRegion == "all"){
            return true
        }else{
            return d["Zona_CMR"] == selectedRegion;
        }
    });
    
    
    // Sort cleanData by selected KPI
    cleanData2.sort((a, b) => (a[selectedKPI] < b[selectedKPI]) ? 1 : -1 );
    //Select top 10 units by KPI
    cleanData2 = cleanData2.slice(0,10);
    //Sort them the other way so they are ordered in the graph with the highest number on top
    cleanData2.sort((a, b) => (a[selectedKPI] > b[selectedKPI]) ? 1 : -1 );

    // Define the domain of the axes
    x.domain([0, d3.max(cleanData2, d => d[selectedKPI])]);
    y.domain(cleanData2.map(d => d["Nombre"]));
    
    
    // Call the Axes
    var xAxisCall = d3.axisBottom(x);
    xAxisGroup.transition(t).call(xAxisCall);
    
    var yAxisCall = d3.axisLeft(y);
    yAxisGroup.transition(t).call(yAxisCall);
    
    //Start generating the rectangles
    var rects = g.selectAll("rect")
        .data(cleanData2, d => d["Nombre"])
    
    // EXIT old elements not present in new data
    rects.exit()
        .attr("class", "exit")
        .remove()

    rects.enter()
        .append("rect")
            .attr("x", d => x(0))
            .attr("y", d => y(d["Nombre"]))
            .attr("width", d => x(d[selectedKPI]))
            .attr("height", y.bandwidth())
            //AND UPDATE old elements present in new data
        .merge(rects)
        .transition(t)
            .attr("x", x(0))
            .attr("y", d => y(d["Nombre"]))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d[selectedKPI]))
            .attr("fill",  d =>  colorScale(d["Nombre"]) )
    //Obtain the string for the date
    currentDateStr = cleanData2[0]["Fecha_str"];
    timeLabel.text(currentDateStr);

};