const width = 1000;
const height = 600;
const histHeight = 400;
const margin = { top: 20, right: 30, bottom: 40, left: 40 };



d3.select("#base_color").style("background-color", "steelblue");
d3.select("#brush_color").style("background-color", "orange");








const reduceDataLabel = d3.select("body").select("#btn").append("label").text("Reducir datos:").style("font-weight", "bold");
const br4 = d3.select("body").select("#btn").append("br");
const reduceData = d3.select("body").select("#btn").append("select").attr("id", "reduceData");    
reduceData.selectAll("option")
    .data(["-", 0, 1, 2, 3, 4, 5, 6, 7])
    .enter().append("option")
    .attr("value", d => d)
    .text(d => d);
reduceData.property("value", "0");
const br5 = d3.select("body").select("#btn").append("br");

const resetBrushLabel = d3.select("body").select("#btn").append("label").text("Reiniciar selección:").style("font-weight", "bold");
const br3 = d3.select("body").select("#btn").append("br");
const resetBrush = d3.select("body").select("#btn").append("button").text("Reiniciar Selección").attr("id", "resetBrush");



const map = d3.select("body").append("div").attr("id", "map");
const hist = d3.select("body").append("div").attr("id", "histogram");

// SVG for map
const svgMap = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);
    
// SVG for histogram
const svgHist = d3.select("#histogram").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", histHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);



// Scales and axes for histogram
const xHist = d3.scaleLinear()
    .domain([0, 7])
    .range([0, width - margin.left - margin.right]);

const yHist = d3.scaleLinear()
    .range([histHeight, 0]);

const xAxis = d3.axisBottom(xHist);
const yAxis = d3.axisLeft(yHist);

// Append labels for histogram axes
svgHist.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width / 2)
    .attr("y", histHeight + margin.top + 10)
    .text("Magnitude");

svgHist.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -margin.left)
    .attr("x", -histHeight / 2)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Count");

// Projection setup for map
const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);

// Path generator for map
const path = d3.geoPath().projection(projection);

// Load earthquake data
d3.json("terremotos.json")
    .then(quakeData => {
        let quakes = quakeData.features.map(d => ({
            id: d.id,
            coordinates: d.geometry.coordinates,
            mag: d.properties.mag,
            brushed: false // Track brushed state
        }));


        

        // Load world map data
        d3.json("world-110m.json").then(worldData => {
            const countries = topojson.feature(worldData, worldData.objects.countries).features;

            // Draw world map
            svgMap.selectAll(".country")
                .data(countries)
                .join("path")
                .attr("class", "country")
                .attr("d", path)
                .attr("fill", "lightgray")
                .attr("stroke", "white")
                .attr("stroke-width", 0.1);
            
            

            // Function to update map based on brushed data
            function updateMap(selectedQuakes) {
                // Update all circles based on brushed state using join with transition
                const circles = svgMap.selectAll(".quake-circle")
                    .data(quakes, d => d.id)
                    .join(
                        enter => enter.append("circle")
                            .attr("class", "quake-circle")
                            .attr("cx", d => projection(d.coordinates)[0])
                            .attr("cy", d => projection(d.coordinates)[1])
                            .attr("r", 0) // Start with radius 0 for enter transition
                            .attr("fill", d => d.brushed ? "orange" : "steelblue")
                            .attr("opacity", 0.35)
                            .call(enter => enter.transition()
                                .duration(300)
                                .attr("r", d => Math.pow(d.mag, 2))
                                .attr("opacity", d => d.brushed ? 0.7 : 0.35))
                                .append("title") // Add tooltip
                                .text(d => `Magnitude: ${Math.round(d.mag * 100) / 100}`),
                        update => update
                            .call(update => update.transition()
                                .duration(300)
                                .attr("cx", d => projection(d.coordinates)[0])
                                .attr("cy", d => projection(d.coordinates)[1])
                                .attr("r", d => Math.pow(d.mag, 2))
                                .attr("fill", d => d.brushed ? "orange" : "steelblue")
                                .attr("opacity", d => d.brushed ? 0.7 : 0.35)),
                        exit => exit.call(exit => exit.transition()
                                .duration(300)
                                .attr("r", 0)
                                .remove())
                    );
            }

            // Setup histogram scales and bins
            const histogram = d3.histogram()
                .value(d => d.mag)
                .domain(xHist.domain())
                .thresholds(xHist.ticks(14));

            // Initial bins calculation
            const bins = histogram(quakes);

            // Update y scale based on data
            yHist.domain([0, d3.max(bins, d => d.length)]);

            // Append axes to histogram
            svgHist.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0,${histHeight})`)
                .call(xAxis);

            svgHist.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            // Draw original histogram bars with transitions
            // Draw original histogram bars
            svgHist.selectAll(".bar")
                .data(bins)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => xHist(d.x0))
                .attr("width", d => Math.max(0, xHist(d.x1) - xHist(d.x0) - 1))
                .attr("y", d => yHist(d.length))
                .attr("height", d => histHeight - yHist(d.length))
                .attr("fill", "steelblue")
                .append("title") // Add tooltip
                .text(d => `Original Data\nMagnitude Range: [${d.x0}-${d.x1})\nCount: ${d.length}`);
                


                
            // Brush setup for map based on earthquake locations
            const brush = d3.brush()
                .extent([[0, 0], [width, height]])
                .on("brush", brushed);

            svgMap.append("g")
                .attr("class", "brush")
                .call(brush);

            // Function to update based on brush selection
            function brushed(event) {
                if (!event.selection) {
                    // Reset all to original state if no selection
                    quakes = quakes.map(d => ({ ...d, brushed: false }));
                    updateMap(quakes);
                    updateHistogram(quakes);
                    return;
                }

                const [[x0, y0], [x1, y1]] = event.selection;
                const selectedQuakes = quakes.filter(d => {
                    const [x, y] = projection(d.coordinates);
                    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
                }).map(d => ({ ...d, brushed: true }));

                // Update quakes array with brushed state
                quakes = quakes.map(d => ({
                    ...d,
                    brushed: selectedQuakes.some(sq => sq.id === d.id)
                }));

                // Update map with selected quakes
                updateMap(selectedQuakes);

                // Update histogram with brushed data
                updateHistogram(selectedQuakes);
            }


            updateMap(quakes);
            updateHistogram(quakes, true);

            // Function to reset brush selection
            resetBrush.on("click", () => {
                d3.select(".brush").call(brush.move, null);
                quakes = quakes.map(d => ({ ...d, brushed: false }));
                updateMap(quakes);
                updateHistogram(quakes, true);
            });

            // Function to update histogram based on filtered data
            
     // Function to update histogram based on filtered data
     function updateHistogram(filteredData, reset = false) {
        // const reduceValue = +reduceData.node().value;
        // const filteredQuakes = reduceValue === "-" ? filteredData : filteredData.filter(d => d.mag >= reduceValue);
        // const bins = histogram(filteredQuakes);
        const bins = histogram(filteredData);


        // Update y scale only for new histogram bars
        const newMaxY = d3.max(bins, d => d.length);
        if (newMaxY > yHist.domain()[1]) {
            yHist.domain([0, newMaxY]);
        }

        // Append new histogram bars for filtered data
        svgHist.selectAll(".filtered-bar").remove();

        // const delfilteredBars = svgHist.selectAll(".filtered-bar")
            // .data(bins, d => `[${d.x0}-${d.x1})`)
            
        // delfilteredBars.exit()
        //     .transition()
        //     .duration(300)
        //     .attr("height", 0)
        //     .attr("y", histHeight)
        //     .remove();



        // if (!reset){
        //     svgHist.selectAll(".filtered-bar")
        //         .data(bins)
        //         .enter().append("rect")
        //         .attr("class", "filtered-bar")
        //         .attr("x", d => xHist(d.x0))
        //         .attr("width", d => Math.max(0, xHist(d.x1) - xHist(d.x0) - 1))
        //         .attr("y", d => yHist(d.length))
        //         .attr("height", d => histHeight - yHist(d.length))
        //         .attr("fill", "orange")
        //         .attr("opacity", 0.7)
        //         .append("title") // Add tooltip
        //         .text(d => `Brushed Data\nMagnitude Range: [${d.x0}-${d.x1})\nCount: ${d.length}`);
        // }

        // const delfilteredBars = svgHist.selectAll(".filtered-bar")
        //     .data(bins, d => `[${d.x0}-${d.x1})`)
        
        // delfilteredBars.exit()
        //     .transition()
        //     .duration(300)
        //     .attr("height", 0)
        //     .attr("y", histHeight)
        //     .remove();
        

        if (!reset) {
            const filteredBars = svgHist.selectAll(".filtered-bar")
                .data(bins, d => `[${d.x0}-${d.x1})`)
                .join(
                    enter => enter.append("rect")
                        .attr("class", "filtered-bar")
                        .attr("x", d => xHist(d.x0))
                        .attr("y", histHeight) // Start from the bottom for enter transition
                        .attr("width", d => Math.max(0, xHist(d.x1) - xHist(d.x0) - 1))
                        .attr("height", 0) // Start with zero height for enter transition
                        .attr("fill", "orange")
                        .attr("opacity", 0.7)
                        .call(enter => enter.transition()
                            .duration(300)
                            .attr("y", d => yHist(d.length))
                            .attr("height", d => histHeight - yHist(d.length)))
                        .append("title") // Add tooltip
                        .text(d => `Brushed Data\nMagnitude Range: [${d.x0}-${d.x1})\nCount: ${d.length}`),
                    update => update
                        .call(update => update.transition()
                            .duration(300)
                            .attr("x", d => xHist(d.x0))
                            .attr("width", d => Math.max(0, xHist(d.x1) - xHist(d.x0) - 1))
                            .attr("y", d => yHist(d.length))
                            .attr("height", d => histHeight - yHist(d.length))
                            .attr("fill", "orange")
                            .attr("opacity", 0.7)),
                    exit => exit.call(exit => exit.transition()
                            .duration(300)
                            .attr("height", 0)
                            .attr("y", histHeight)
                            .remove())
                );
        }
        

        // Update axes for new data
        svgHist.select(".y.axis").transition().duration(200).call(yAxis);
    }



            // Event handler for data reduction
            reduceData.on("change", function () {
                const reduceValue = +this.value;
                quakes = reduceValue === "-" ? quakeData.features.map(d => ({
                    id: d.id,
                    coordinates: d.geometry.coordinates,
                    mag: d.properties.mag,
                    brushed: false
                })) : quakeData.features.filter(d => d.properties.mag >= reduceValue).map(d => ({
                    id: d.id,
                    coordinates: d.geometry.coordinates,
                    mag: d.properties.mag,
                    brushed: false
                }));
                
                d3.select(".brush").call(brush.move, null);
                quakes = quakes.map(d => ({ ...d, brushed: false }));
                updateMap(quakes);
                updateHistogram(quakes, true);

                // Calculate histogram bins for the quake data
                const bins = histogram(quakes);

                const bars = svgHist.selectAll(".bar")
                    .data(bins, d => `[${d.x0}-${d.x1})`)
                    .join(
                        enter => enter.append("rect")
                            .attr("class", "bar")
                            .attr("x", d => xHist(d.x0))
                            .attr("y", histHeight) // Start from the bottom for enter transition
                            .attr("width", d => Math.max(0, xHist(d.x1) - xHist(d.x0) - 1))
                            .attr("height", 0) // Start with zero height for enter transition
                            .attr("fill", "steelblue")
                            .call(enter => enter.transition()
                                .duration(300)
                                .attr("y", d => yHist(d.length))
                                .attr("height", d => histHeight - yHist(d.length)))
                            .append("title") // Add tooltip
                            .text(d => `Original Data\nMagnitude Range: [${d.x0}-${d.x1})\nCount: ${d.length}`),
                        update => update
                            .call(update => update.transition()
                                .duration(300)
                                .attr("x", d => xHist(d.x0))
                                .attr("width", d => Math.max(0, xHist(d.x1) - xHist(d.x0) - 1))
                                .attr("y", d => yHist(d.length))
                                .attr("height", d => histHeight - yHist(d.length))
                                .attr("fill", "steelblue")),
                        exit => exit.call(exit => exit.transition()
                                .duration(300)
                                .attr("height", 0)
                                .attr("y", histHeight)
                                .remove())
                    );



                // svgHist.selectAll(".bar").remove();
                // const bins = histogram(quakes);

                // svgHist.selectAll(".bar")
                //     .data(bins)
                //     .enter().append("rect")
                //     .attr("class", "bar")
                //     .attr("x", d => xHist(d.x0))
                //     .attr("width", d => Math.max(0, xHist(d.x1) - xHist(d.x0) - 1))
                //     .attr("y", d => yHist(d.length))
                //     .attr("height", d => histHeight - yHist(d.length))
                //     .attr("fill", "steelblue")
                //     .append("title") // Add tooltip
                //     .text(d => `Original Data\nMagnitude Range: [${d.x0}-${d.x1})\nCount: ${d.length}`);
                

                // const Bars = svgHist.selectAll(".bar")
                //     .data(quakes, d => `[${d.x0}-${d.x1})`);
                // // Exit selection for original bars
                // Bars.exit()
                //     .transition()
                //     .duration(750)
                //     .attr("height", 0)
                //     .attr("y", histHeight)
                //     .remove();

                // // Enter selection for original bars
                // Bars.enter().append("rect")
                //     .attr("class", ".bar")
                //     .attr("x", d => xHist(d.x0))
                //     .attr("width", d => Math.max(0, xHist(d.x1) - xHist(d.x0) - 1))
                //     .attr("y", histHeight)
                //     .attr("height", 0)
                //     .attr("fill", "steelblue")
                //     .append("title") // Add tooltip
                //     .text(d => `Original Data\nMagnitude Range: [${d.x0}-${d.x1})\nCount: ${d.length}`)
                //     .merge(Bars) // Merge enter and update selections
                //     .transition()
                //     .duration(750)
                //     .attr("x", d => xHist(d.x0))
                //     .attr("width", d => Math.max(0, xHist(d.x1) - xHist(d.x0) - 1))
                //     .attr("y", d => yHist(d.length))
                //     .attr("height", d => histHeight - yHist(d.length));

            });
        });
    })
    
.catch(error => console.error(error));
