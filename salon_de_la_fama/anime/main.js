d3.select("#vis-1")
  .append("h2")
  .text("Puntaje de animes según año de emisión");

d3.select("#vis-2")
  .append("h2")
  .text("Cantidad de animes por género");

const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");

const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 800;

const WIDTH_VIS_2 = 1200;
const HEIGHT_VIS_2 = 600;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);

SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);
    
const MARGIN = {
    top: 10,
    bottom: 40,
    right: 150,
    left: 80,
};

const WIDTH_1 = WIDTH_VIS_1 - MARGIN.right - MARGIN.left;
const HEIGHT_1 = HEIGHT_VIS_1 - MARGIN.top - MARGIN.bottom;

const WIDTH_2 = WIDTH_VIS_2 - MARGIN.right - MARGIN.left;
const HEIGHT_2 = HEIGHT_VIS_2 - MARGIN.top - MARGIN.bottom;

SVG1
    .append("text")
    .text("Año de emisión")
    .attr("dominant-baseline", "text-before-edge")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(270)")
    .attr("font-weight", "bold")
    .attr('x', -HEIGHT_VIS_1/2)
    .attr('y', 5)

SVG1
    .append("text")
    .text("Puntaje")
    .attr('y', HEIGHT_VIS_1 - 5)
    .attr('x', WIDTH_1/2)
    .attr("font-weight", "bold")
    .attr("dominant-baseline", "text-after-edge")

SVG2
    .append("text")
    .text("Género")
    .attr('y', HEIGHT_VIS_2 - 5)
    .attr('x', WIDTH_2/2)
    .attr("font-weight", "bold")
    .attr("dominant-baseline", "text-after-edge");

SVG2
    .append("text")
    .text("Cantidad de animes")
    .attr("dominant-baseline", "text-before-edge")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(270)")
    .attr("font-weight", "bold")
    .attr('x', -HEIGHT_VIS_2/2)
    .attr('y', 5);

const contenedorEjeY1 = SVG1.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
  
const contenedorEjeX1 = SVG1.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${HEIGHT_1 + MARGIN.top})`)

const contenedorPuntos = SVG1.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
    .attr("clip-path", "url(#clip)");

SVG1
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", WIDTH_1)
    .attr("height", HEIGHT_1);

const contenedorEjeY2 = SVG2
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
  
const contenedorEjeX2 = SVG2
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top + HEIGHT_2})`)

const visContainer2 = SVG2.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

function crearVis1(datos) {
    const xScale = d3.scaleLinear()
        .domain(d3.extent(datos, d => d.score))
        .range([0, WIDTH_1]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(datos, d => d.year))
        .range([HEIGHT_1, 10]);


    contenedorEjeX1.call(d3.axisBottom(xScale));
    contenedorEjeY1.call(d3.axisLeft(yScale));

 
    contenedorPuntos.selectAll("g.punto")
        .data(datos, d => d.id)
        .join(
            enter => {
                console.log("Entrando puntos (muestra):", enter.data().slice(0, 10));
                const punto = enter.append("g")
                    .attr("class", "punto")
                    .attr("opacity", 0)

                punto
                    .transition("enter-punto")
                    .duration(500)
                    .style("opacity", 1);
                
                punto.append("circle")
                    .attr("class", "circulo")
                    .attr("cx", d => xScale(d.score))
                    .attr("cy", d => yScale(d.year))
                    .attr("r", 5)
                    .attr("fill", d => colorScale(d.genres[0]));
                return punto;
            },
            update => {
                update
                    .transition(500);
                return update;
            },
            exit => {
                exit.attr("class", "delete")
                exit
                    .transition("exit_punto")
                    .duration(500)
                    .style("opacity", 0);
                exit.transition("eliminar").delay(500).remove();
                return exit;
            }
        );

    const brush = d3.brush()
        .extent([[0, 0], [WIDTH_1, HEIGHT_1]])
        .on("brush end", brushed);

    contenedorPuntos.call(brush);

    function brushed({ selection }) {
        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
            const selected = datos.filter(d => 
                xScale(d.score) >= x0 && xScale(d.score) <= x1 &&
                yScale(d.year) >= y0 && yScale(d.year) <= y1
            );
            barrasVis2(selected);
        }
    }
}

function barrasVis2(datos) {
    const genreData = d3.rollup(
        datos, 
        v => v.length, 
        d => d.genres[0], 
        d => {
            if (d.score < 5) return "Baja";
            if (d.score < 7.5) return "Media";
            return "Alta";
        }
    );

    const genres = Array.from(genreData.keys());
    const scoreRanges = ["Baja", "Media", "Alta"];

    const xScale2 = d3.scaleBand()
        .domain(genres)
        .range([0, WIDTH_2])
        .padding(0.1);

    const yScale2 = d3.scaleLinear()
        .domain([0, d3.max(genres, genre => d3.sum(scoreRanges, range => genreData.get(genre)?.get(range) || 0))])
        .nice()
        .range([HEIGHT_2, 0]);

    const colorScale2 = d3.scaleOrdinal()
        .domain(scoreRanges)
        .range(["red", "yellow", "green"]);

    contenedorEjeX2.call(d3.axisBottom(xScale2));
    contenedorEjeY2.call(d3.axisLeft(yScale2));

    let tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const bars = visContainer2.selectAll(".bar")
        .data(genres.flatMap(genre => 
            scoreRanges.map(range => ({
                genre,
                range,
                value: genreData.get(genre)?.get(range) || 0
            }))
        ));

    bars.join(
        enter => enter.append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale2(d.genre) + scoreRanges.indexOf(d.range) * (xScale2.bandwidth() / scoreRanges.length))
            .attr("y", d => yScale2(d.value))
            .attr("width", xScale2.bandwidth() / scoreRanges.length)
            .attr("height", d => HEIGHT_2 - yScale2(d.value))
            .attr("fill", d => colorScale2(d.range))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Género: ${d.genre}<br>Rango: ${d.range}<br>Valor: ${d.value}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            }),
        update => update
            .transition()
            .duration(750)
            .attr("x", d => xScale2(d.genre) + scoreRanges.indexOf(d.range) * (xScale2.bandwidth() / scoreRanges.length))
            .attr("y", d => yScale2(d.value))
            .attr("width", xScale2.bandwidth() / scoreRanges.length)
            .attr("height", d => HEIGHT_2 - yScale2(d.value))
            .attr("fill", d => colorScale2(d.range)),
        exit => exit
            .transition()
            .duration(750)
            .attr("height", 0)
            .remove()
    );
}


// Función para parsear la información (chatgpt)
function parseoCaracteristicas(d) {
    return {
        id: +d.MAL_ID,
        name: d.Name,
        score: +d['MAL Score'],
        year: +d.Year,
        genres: Object.keys(d).filter(key => d[key] === '1' && !['MAL_ID', 'Name', 'MAL Score', 'Year', 'Episodes'].includes(key))
    };
}

// leyenda grafico vis 1
const legend1 = SVG1.append("g")
    .attr("transform", `translate(${WIDTH_VIS_1 - MARGIN.right + 10}, ${MARGIN.top + 20})`)
    .attr("class", "legend");

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", 
    "Historical", "Kids", "Magic", "Music", "Parody", "School", "Shoujo", "Shoujo Ai", "Shounen", "Shounen Ai"];

legend1.append("rect")
    .attr("width", 150)
    .attr("height", genres.length * 20 + 10)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("opacity", 0.8);

legend1.selectAll("legend-item")
    .data(genres)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`)
    .each(function(d) {
        d3.select(this).append("rect")
            .attr("x", 10)
            .attr("y", 5)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", colorScale(d));

        d3.select(this).append("text")
            .attr("x", 30)
            .attr("y", 14)
            .attr("dy", "0.1em")
            .text(d);
    });

const legend2 = SVG2.append("g")
    .attr("transform", `translate(${WIDTH_VIS_2 - 300}, ${MARGIN.top})`)
    .attr("class", "legend");

const scoreRanges = ["Baja (puntación < 5)", "Media (5 <= puntación < 7.5)", "Alta (puntación >= 7.5)"];
const colorScale2 = d3.scaleOrdinal()
    .domain(scoreRanges)
    .range(["red", "yellow", "green"]);

legend2.append("rect")
    .attr("width", 270)
    .attr("height", scoreRanges.length * 20 + 10)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("opacity", 0.8);

legend2.selectAll("legend-item")
    .data(scoreRanges)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`)
    .each(function(d) {
        d3.select(this).append("rect")
            .attr("x", 10)
            .attr("y", 5)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", colorScale2(d));

        d3.select(this).append("text")
            .attr("x", 34)
            .attr("y", 14)
            .attr("dy", "0.35em")
            .text(d);
    });

d3.csv("anime.csv", parseoCaracteristicas).then(data => {
    crearVis1(data);
    barrasVis2(data);
});