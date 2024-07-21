function championNameHandler(championName) {
    if (championName === 'FiddleSticks') {
        return 'Fiddlesticks';
    }
    else {
        return championName;
    }
}

//ownChampion: boolean que indica si usar championName o championName_opponent
function dataPreprocessing(data, ownChampion) {
    const championData = d3.rollups(data, 
        v => ({
            count: v.length,
            wins: d3.sum(v, d => d.win === 'True' ? 1 : 0),
            kills: d3.sum(v, d => d.kills),
            deaths: d3.sum(v, d => d.deaths),
            assists: d3.sum(v, d => d.assists),
        }),
        d => ownChampion ? d.championName : d.championName_opponent
    ).map(([champion, values]) => ({
        champion: champion,
        kda: (values.kills + values.assists) / Math.max(values.deaths, 1),
        count: values.count,
        win_percentage: values.wins / values.count * 100,
        role: values.role
    }));

    const totalGames = d3.sum(championData, d => d.count);
    championData.forEach(d => {
        d.proportion = (d.count / totalGames);
    });

    return championData;
}

//Crea y actualiza el gráfico de burbujas, que usa simulación de fuerza
function bubbleChart(data) {
    data = dataPreprocessing(data, false);

    const container = d3.select("#bubble-chart");
    const svgwidth = container.node().getBoundingClientRect().width;
    const svgheight = container.node().getBoundingClientRect().height;
    const svg = d3.select("#bubble-chart svg")
        .attr("width", svgwidth)
        .attr("height", svgheight);

    const width = svgwidth - 30;
    const height = svgheight - 30;

    const radiusScale = d3.scaleSqrt()
        .domain([0, 1])
        .range([0, Math.min(width, height) / 3]); 

    const colorScale = d3.scaleLinear()
        .domain([0, 40, 60, 100])
        .range(["red", "red", "green", "green"]);

    const legend = svg.select("#color-legend-bubble")
        .attr("transform", `translate(15, 15)`);
    
    const bubbles = svg.selectAll(".bubbles")
        .data([0])
        .join("g")
        .attr("class", "bubbles")
        .attr("transform", `translate(30, 30)`);


    //Código de la clase 20
    const brushed = (evento) => {
        const seleccion = evento.selection;
    
        // Seleccion nos dice la posición del cuadro del brush
        console.log(seleccion)
        // ES una matriz de la forma
        // [
        //  [esquina_superior_izquierda_X, esquina_superior_izquierda_Y],
        //  [esquina_inferior_derecha_X, esquina_inferior_derecha_Y],
        // ]
        if (!seleccion) {
            groups.attr("opacity", 1);
            barChart(globalData.filter(d => groups.data().map(e => e.champion).includes(d.championName_opponent)));
            return;
        }

        const [[x0, y0], [x1, y1]] = seleccion;
    
    
        const selectedChampions = groups.filter(d => {
            return d.x >= x0 && d.x <= x1 && d.y >= y0 && d.y <= y1;
        });

        groups.attr("opacity", 0.1);
        selectedChampions.attr("opacity", 1);
        barChart(globalData.filter(d => selectedChampions.data().map(e => e.champion).includes(d.championName_opponent)));
       
    };

    const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("end", brushed);

    bubbles.selectAll(".brush")
    .data([0])
    .join("g")
    .attr("class", "brush")
    .call(brush);


    //Acá usé copilot para hacer esta leyenda (qué es un gradiente?!?!?!?)
    const defs = svg.selectAll("defs")
        .data([0])
        .join("defs");

    const gradient = defs.selectAll("linearGradient")
        .data([0])
        .join("linearGradient")
        .attr("id", "gradient-legend")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "100%")
        .attr("y2", "0%");

    gradient.selectAll("stop")
        .data([0, 1])
        .join("stop")
        .attr("offset", d => d * 100 + "%")
        .attr("stop-color", d => d === 0 ? "red" : "green");

    const legendHeight = 200; 
    const legendWidth = 20;  

    legend.selectAll("rect")
        .data([0])
        .join("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", "url(#gradient-legend)");
    

    const labels = d3.range(60, 35, -5); 
    legend.selectAll("text")
        .data(labels)   
        .join(
            enter => enter.append("text")
                .attr("x", legendWidth + 5)
                .attr("y", (d, i) => i * legendHeight / (labels.length - 1))
                .attr("dy", "0.35em")
                .text(d => `${d}%`),
            update => update.text(d => `${d}%`)
        );      

    legend.selectAll(".winrate-title")
    .data([0]) 
    .join(
        enter => enter.append("text")
            .attr("class", "winrate-title") 
            .attr("x", legendWidth / 2)
            .attr("y", legendHeight + 30)
            .attr("text-anchor", "middle")
            .text("Winrate")
    );

    const groups = bubbles.selectAll(".group")
        .data(data, d => d.champion)
        .join(
            enter => enter.append("g").attr("class", "group")
            .call(enter => {
                enter.append("circle")
                    .attr("class", "circle")
                    .attr("r", 0)  
                    .attr("fill", "none")
                    .attr("stroke", d => colorScale(d.win_percentage))
                    .attr("stroke-width", 6)
                    .transition()  
                    .duration(1500)
                    .attr("r", d => radiusScale(d.proportion));

                enter.append("image")
                    .attr("xlink:href", d => `https://ddragon.leagueoflegends.com/cdn/14.11.1/img/champion/${championNameHandler(d.champion)}.png`)
                    .attr("width", 0)  
                    .attr("height", 0)  
                    .attr("x", 0)  
                    .attr("y", 0)  
                    .attr("clip-path", d => `circle(${radiusScale(d.proportion)}px)`)
                    .transition()  
                    .duration(1500)
                    .attr("width", d => radiusScale(d.proportion) * 2)
                    .attr("height", d => radiusScale(d.proportion) * 2)
                    .attr("x", d => -radiusScale(d.proportion))
                    .attr("y", d => -radiusScale(d.proportion));

                enter.on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9); 
                    tooltip.html(`Campeón: ${d.champion}<br>
                        Partidas: ${d.count}<br>
                        Winrate: ${d.win_percentage.toFixed(2)}% <br>
                        KDA: ${d.kda.toFixed(2)}`)
                        .style("left", (event.pageX+50) + "px")
                        .style("top", (event.pageY-50) + "px");
                })
                .on("mouseout", d => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
            }),
            update => update.call(update => {
                update.select("circle")
                    .transition()  
                    .duration(1500)
                    .attr("r", d => radiusScale(d.proportion))
                    .attr("stroke", d => colorScale(d.win_percentage));
                
                update.select("image")
                    .transition()  
                    .duration(1500)
                    .attr("xlink:href", d => `https://ddragon.leagueoflegends.com/cdn/14.11.1/img/champion/${championNameHandler(d.champion)}.png`)
                    .attr("width", d => radiusScale(d.proportion) * 2)
                    .attr("height", d => radiusScale(d.proportion) * 2)
                    .attr("x", d => -radiusScale(d.proportion))
                    .attr("y", d => -radiusScale(d.proportion))
                    .attr("clip-path", d => `circle(${radiusScale(d.proportion)}px)`);
            }),
            exit => exit.call(exit => {
                exit.select("circle")
                    .transition()  
                    .duration(750)
                    .attr("r", 0)

                exit.select("image")
                    .transition()  
                    .duration(750)
                    .attr("width", 0)
                    .attr("height", 0)
                    .attr("x", 0)
                    .attr("y", 0)
                // se prefiere no usar remove aquí para conservar las imágenes
            })
        );

    const tooltip = d3.select(".tooltip");

    const simulation = d3.forceSimulation(data)
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody().strength(d => -radiusScale(d.proportion) * 2)) 
        .force("collision", d3.forceCollide().radius(d => radiusScale(d.proportion) + 2))
        .force("x", d3.forceX(width / 2).strength(0.1)) 
        .force("y", d3.forceY(height / 2).strength(0.1))
        .on("tick", () => {
            groups.attr("transform", d => `translate(${d.x}, ${d.y})`)
            .attr("x", d => d.x)
            .attr("y", d => d.y);
        });

}

// Crea y actualiza el gráfico de barras
function barChart(data) {

    const config = {
        sort_by: "count",
        sort_order: "desc",
        limit: 10,
        min_games: 1
    }

    const copy = data;
    data = dataPreprocessing(data, true);
    const sort_by = config.sort_by;
    const sort_order = config.sort_order;
    const limit = config.limit;
    const min_games = config.min_games;

    data = data.filter(d => d.count >= min_games);

    data.sort((a, b) => {
        if (sort_order === "asc") {
            return a[sort_by] - b[sort_by];
        } else {
            return b[sort_by] - a[sort_by];
        }
    });

    data = data.slice(0, limit);

    const margin = { top: 70, right: 20, bottom: 30, left: 40 };
    const divContainer = d3.select("#bar-chart");
    const width = divContainer.node().getBoundingClientRect().width;
    const height = divContainer.node().getBoundingClientRect().height;
    const widthChart = width - margin.left - margin.right;
    const heightChart = height - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart").select("svg")
        .attr("width", width)
        .attr("height", height);

    const chart = svg.select("#chart")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.champion))
        .range([0, widthChart])
        .padding(0.2);

    const [mini, maxi] = d3.extent(data, d => d.win_percentage);

    const yScale = d3.scaleLinear()
        .domain([mini-5, Math.min(100, 1.1 * maxi)])
        .range([heightChart, 0]);

    const [miniKda, maxiKda] = d3.extent(data, d => d.kda);


    const colorScale = d3.scaleLinear()
        .domain([miniKda, maxiKda])
        .range(["red",  "green"]);

    const legend = svg.select("#color-legend-bar")
        .attr("transform", `translate(${width-230}, 25)`);

    const legendHeight = 20;
    const legendWidth = 200;

    const defs = svg.selectAll("defs")
        .data([0])
        .join("defs");
    const gradient = defs.selectAll("linearGradient")
        .data([0])
        .join("linearGradient")
        .attr("id", "kda-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    gradient.selectAll("stop")
        .data([0, 1])
        .join("stop")
        .attr("offset", d => d * 100 + "%")
        .attr("stop-color", d => d === 0 ? "red" : "green");

    
    legend.selectAll("rect")
        .data([0]) 
        .join("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", "url(#kda-gradient)");

    const numSteps = 6;
    const stepSize = (maxiKda - miniKda) / (numSteps - 1);
    const labels = d3.range(miniKda, maxiKda, stepSize);
    legend.selectAll(".bar-legend-label")
        .data(labels)
        .join(
            enter => enter.append("text")
                .attr("class", "bar-legend-label")
                .attr("x", (d, i) => i * legendWidth / (labels.length - 1))
                .attr("y", legendHeight + 10)   
                .attr("dy", "0.35em")
                .text(d => d.toFixed(2)),
            update => update.text(d => d.toFixed(2))
        );
    
    legend.selectAll(".kda-title")
        .data([0])
        .join(
            enter => enter.append("text")
                .attr("class", "kda-title")
                .attr("x", legendWidth / 2)
                .attr("y", legendHeight - 30)
                .attr("text-anchor", "middle")
                .text("KDA")
        );
        


    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    yAxis.tickFormat(d => `${d}%`);

    svg.select("#x-axis")
        .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        .call(xAxis);

    svg.select("#y-axis")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(yAxis);

    svg.selectAll("#axis-label")
        .data([0])
        .join(
            enter => enter.append("text")
                .attr("id", "axis-label")
                .attr("x", 10)
                .attr("y", 40)
                .text("Winrate (%)"),
            update => update.text("Winrate (%)")
        );

    
    const tooltip = d3.select(".tooltip");

    const bars = chart.selectAll("rect")
    .data(data, d => d.champion)
    .join(
        enter => enter.append("rect")
            .attr("x", d => xScale(d.champion))
            .attr("y", heightChart) 
            .attr("width", xScale.bandwidth())
            .attr("height", 0) 
            .attr("fill", d => colorScale(d.kda))
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(
                    `Campeón: ${d.champion}<br>
                    Partidas: ${d.count}<br>
                    Winrate: ${d.win_percentage.toFixed(2)}%<br>
                    KDA: ${d.kda.toFixed(2)}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
            })
            .on("mouseout", d => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", (event, d) => {
                bubbleChart(globalData.filter(e => e.championName === d.champion));
                d3.select("#selected-champion-name")
                .text(d.champion);
                d3.select(".brush").call(d3.brush().move, null);
                d3.selectAll(".group").attr("opacity", 1); 
            })
            .transition().duration(500)
            .attr("y", d => yScale(d.win_percentage)) 
            .attr("height", d => heightChart - yScale(d.win_percentage)), 
        update => update.call(update => update.transition().duration(500)
            .attr("x", d => xScale(d.champion))
            .attr("y", d => yScale(d.win_percentage))
            .attr("width", xScale.bandwidth())
            .attr("height", d => heightChart - yScale(d.win_percentage))
            .attr("fill", d => colorScale(d.kda))),
        exit => exit.transition().duration(500)
        .attr("height", 0)
        .attr("y", heightChart)
        .remove()
    );

}


const riotId = "Malygos#168";
const filename = `${riotId}.csv`;
let globalData = [];
let encodedFilename = encodeURIComponent(filename);
d3.csv(`${encodedFilename}`).then(data => {

    globalData = data;
    // datos por defecto
    bubbleChart(data);
    barChart(data);

    const button = d3.select("#role-button");
    button.on("click", () => {
        let role = d3.select("#role").property("value");

        let filteredData = data.filter(d => d.teamPosition === role);
        d3.select("#selected-champion-name").text(role);
        bubbleChart(filteredData);
        barChart(filteredData);
        d3.select(".brush").call(d3.brush().move, null);
        d3.selectAll(".group").attr("opacity", 1); 
    });

    const resetButton = d3.select("#reset-button");
    resetButton.on("click", () => {
        d3.select("#selected-champion-name").text("Todos");
        bubbleChart(data);
        barChart(data);
        d3.select(".brush").call(d3.brush().move, null);
        d3.selectAll(".group").attr("opacity", 1);
    });
});
