// Referencias https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart

// Constantes
const TABLE_TEAM = 'table_team.csv';
const WIDTH3 = 700;
const HEIGHT3 = 700;
const MARGIN3 = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 20
};
const HEIGHTVIS3 = HEIGHT3 - MARGIN3.top - MARGIN3.bottom;
const WIDTHVIS3 = WIDTH3 - MARGIN3.left - MARGIN3.right;

// svg
const svg3 = d3.select("#vis-3")
    .append("svg")
    .attr("width", WIDTH3)
    .attr("height", HEIGHT3)
    .attr("viewBox", `-20 80 ${WIDTH3} ${HEIGHT3}`);

//Título
const Title = svg3.append("text")
    .attr("id", "title")
    .attr("x", WIDTHVIS3 / 2)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")

// g RadarChartcontainer
const RadarChartcontainer = svg3
    .append("g")
    .attr("id", "RadarChartcontainer")
    .attr("transform", `translate(${WIDTHVIS3 / 2}, ${HEIGHTVIS3 / 2})`);

// Escalas
const radialScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, 150]);
const ticks = [20, 40, 60, 80, 100];

// Ejes circulares
RadarChartcontainer.selectAll("circle")
    .data(ticks)
    .join(
        enter => enter.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", d => radialScale(d))
    );

// Etiquetas de los ejes radiales
RadarChartcontainer.selectAll(".ticklabel")
    .data(ticks)
    .join(
        enter => enter.append("text")
            .attr("class", "ticklabel")
            .attr("x", 5)
            .attr("y", d => -radialScale(d))
            .text(d => d.toString())
            
    );

// Tooltip
const tooltip3 = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(255, 255, 255, 0.8)")
    .style("border", "1px solid #000")
    .style("pointer-events", "none")
    .style("visibility", "hidden");

// Dibujar el radar chart
function createRadarChart(data) {
    console.log(data);
    const keys = ["PlaySpeed", "PlayPassing", "chanceCreationShooting", "defencePressure", "defenceAggression"];
    const maxValue = 100; 

    // Título
    Title.text(`Estadísticas promedio de las temporadas de ${data.team_name}`);

    // Función para obtener las coordenadas de los puntos
    function angleToCoordinate(angle, value) {
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return {"x": x, "y": -y};
    }

    // Datos de los atributos
    let featureData = keys.map((key, i) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / keys.length);
        return {
            "name": ["Rapidez de juego", "Pases", "Creación de oportunidades", "Presión defensiva", "Agresividad defensiva"][i],
            "angle": angle,
            "line_coord": angleToCoordinate(angle, maxValue),
            "label_coord": angleToCoordinate(angle, maxValue + 10)
        };
    });

    // Mapeo de los nombres de los atributos
    const keyToDisplayNameMap = {
        PlaySpeed: "Rapidez de juego",
        PlayPassing: "Pases",
        chanceCreationShooting: "Creación de oportunidades",
        defencePressure: "Presión defensiva",
        defenceAggression: "Agresividad defensiva"
    };

    // Líneas hacia atributos
    RadarChartcontainer.selectAll("line")
        .data(featureData)
        .join(
            enter => enter.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", d => d.line_coord.x)
                .attr("y2", d => d.line_coord.y)
                .attr("stroke", "black")
        );

    // Labels de los atributos
    RadarChartcontainer.selectAll(".axislabel")
        .data(featureData)
        .join(
            enter => {
                enter.append("text")
                    .attr("x", d => d.label_coord.x)
                    .attr("y", d => d.label_coord.y)
                    .text(d => d.name)
                    .attr("text-anchor", d => {
                        const index = keys.indexOf(d.name);
                        if (d.name === "Rapidez de juego" ){
                            return "middle";
                        } else {
                            if (d.label_coord.x < 0) {
                                return "end";
                            } else  {
                                return "start";
                            }
                        }
                    })
                
            }
        );

    // Función para obtener las coordenadas de los puntos
    function getPathCoordinates(data_point) {
        let coordinates = keys.map((key, i) => {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / keys.length);
            return angleToCoordinate(angle, data_point[key]);
        });
        coordinates.push(coordinates[0]); // cerrar figura
        return coordinates;
    }
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    let colors = ["darkorange", "red"];

    // Área del radar chart
    RadarChartcontainer.selectAll("path.radarArea")
        .data([data])
        .join(
            enter => {
                const paths = enter.append("path")
                    .attr("class", "radarArea")
                    .attr("d", d => line(getPathCoordinates(d)))
                    .attr("stroke-width", 2)
                    .attr("stroke", colors[0])
                    .attr("fill", colors[0])
                    .attr("fill-opacity", 0)
                    .transition()
                    .duration(1000)
                    .attr("fill-opacity", 0.5);
                return paths;
            },
            update => {
                update
                    .transition()
                    .duration(1000)
                    .attr("d", d => line(getPathCoordinates(d)))
                    .attr("stroke", colors[0])
                    .attr("fill", colors[0])
                    .attr("fill-opacity", 0.5);
                return update;
            },
            exit => {
                exit.transition()
                    .duration(1000)
                    .attr("fill-opacity", 0)
                    .remove();
            }
        );

    // Puntos de los datos
    const pointsGroup = RadarChartcontainer.selectAll('.data-points-group')
        .data([0])
        .join(
            enter => enter.append('g').attr('class', 'data-points-group'),
            update => update,
            exit => exit.remove()
        );

    const dataPoints = keys.flatMap((key, i) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / keys.length);
        let coord = angleToCoordinate(angle, data[key]);
        return {
            ...coord,
            key: key,
            index: i,
        };
    });

    pointsGroup.selectAll("circle.data-point")
        .data(dataPoints)
        .join(
            enter => {
                enter.append("circle")
                    .attr("class", "data-point")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 5)
                    .attr("fill", colors[0])
                    .attr("fill-opacity", 0)
                    .transition()
                    .duration(1000)
                    .attr("fill-opacity", 1);
            },
            update => {
                update
                    .transition()
                    .duration(1000)
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            },
            exit => {
                exit
                    .transition()
                    .duration(1000)
                    .attr("fill-opacity", 0)
                    .remove();
            }
        );

    // Líneas de los datos
    RadarChartcontainer.selectAll("line.data-line")
        .data(dataPoints)
        .join(
            enter => {
                enter.append("line")
                    .attr("class", "data-line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", d => d.x)
                    .attr("y2", d => d.y)
                    .attr("stroke", colors[0])
                    .attr("stroke-width", 1);
            });

    // Función Resaltar
    function highlightElement(d) {
        RadarChartcontainer.selectAll(".data-line")
            .filter(line => line.key === d.key)
            .attr("stroke", colors[1])
            .attr("stroke-width", 2);

        RadarChartcontainer.selectAll(".data-point")
            .filter(point => point.key === d.key)
            .attr("r", 7)
            .attr("fill", colors[1]);
    }

    function resetHighlight() {
        RadarChartcontainer.selectAll(".data-line")
            .attr("stroke", colors[0])
            .attr("stroke-width", 1);

        RadarChartcontainer.selectAll(".data-point")
            .attr("r", 5)
            .attr("fill", colors[0]);
    }

    // Eventos
    pointsGroup.selectAll("circle.data-point")
        .on("mouseover", function(event, d) {
            highlightElement(d);
            tooltip3.style("visibility", "visible")
                .html(`
                    <strong>${keyToDisplayNameMap[d.key]}</strong><br>
                    Valor: ${data[d.key]}%
                `);
        })
        .on("mousemove", function(event) {
            tooltip3.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            resetHighlight();
            tooltip3.style("visibility", "hidden");
        });

    RadarChartcontainer.selectAll("line.data-line")
        .on("mouseover", function(event, d) {
            highlightElement(d);
            tooltip3.style("visibility", "visible")
                .html(`
                    <strong>${keyToDisplayNameMap[d.key]}</strong><br>
                    Valor: ${data[d.key]}%
                `);
        })
        .on("mousemove", function(event) {
            tooltip3.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            resetHighlight();
            tooltip3.style("visibility", "hidden");
        });
}

// Load de datos
function loadTeamAttributes(teamName) {
    const parseData = (data) => ({
        team_name: data.team_name,
        PlaySpeed: +data.buildUpPlaySpeed,
        PlayPassing: +data.buildUpPlayPassing,
        chanceCreationShooting: +data.chanceCreationShooting,
        defencePressure: +data.defencePressure,
        defenceAggression: +data.defenceAggression,
    });

    d3.csv(TABLE_TEAM, parseData).then((data) => {
        const teamData = data.filter(d => d.team_name === teamName);
        if (teamData.length > 0) {
            const avgData = {
                team_name: teamName,
                PlaySpeed: Math.round(d3.mean(teamData, d => d.PlaySpeed)),
                PlayPassing: Math.round(d3.mean(teamData, d => d.PlayPassing)),
                chanceCreationShooting: Math.round(d3.mean(teamData, d => d.chanceCreationShooting)),
                defencePressure: Math.round(d3.mean(teamData, d => d.defencePressure)),
                defenceAggression: Math.round(d3.mean(teamData, d => d.defenceAggression)),
            };
            createRadarChart(avgData);
        } else {
            console.error(`No data found for team: ${teamName}`);
        }
    });
}
