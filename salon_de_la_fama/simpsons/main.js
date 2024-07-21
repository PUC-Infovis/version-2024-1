import { createCircles } from './utils.js';
const EPISODES = "simpsons_episodes.csv";

/* Datos Visualización 1 */
const WIDTH_VIS = 300;
const HEIGHT_VIS = 350;
const MARGIN = { top: 10, right: 10, bottom: 30, left: 30 };
const WIDTH = WIDTH_VIS - MARGIN.left - MARGIN.right;
const HEIGHT = HEIGHT_VIS - MARGIN.top - MARGIN.bottom;


/* Datos Visualización 2 */
const WIDTH_VIS4 = 1400;
const HEIGHT_VIS4 = 600;
const MARGIN4 = { top: 20, right: 30, bottom: 100, left: 30 };
const WIDTH4 = WIDTH_VIS4 - MARGIN4.left - MARGIN4.right;
const HEIGHT4 = HEIGHT_VIS4 - MARGIN4.top - MARGIN4.bottom;

const SVG1 = d3.select("#vis-1").append("svg")
    .attr("viewBox", [0, 0, WIDTH_VIS, HEIGHT_VIS])
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

const SVG2 = d3.select("#vis-2").append("svg")
    .attr("viewBox", [0, 0, WIDTH_VIS, HEIGHT_VIS])
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

const SVG3 = d3.select("#vis-3").append("svg")
    .attr("viewBox", [0, 0, WIDTH_VIS, HEIGHT_VIS])
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

const SVG4 = d3.select("#vis-4").append("svg")
    .attr("viewBox", [0, 0, WIDTH_VIS4, HEIGHT_VIS4])
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", `translate(${MARGIN4.left},${MARGIN4.top})`);

// Datos filtros

let minSeason = 1;
let maxSeason = 999_999_999;
let showAverages = false;
let sort = "byName";
let rating = "imdb";
let min_contributions = 1;
let directed_by_filter = "";    
let selectedDirectors = [];

d3.select("#min-season").on("input", function() {
    minSeason = +this.value;
    if (minSeason > maxSeason) {
        minSeason = maxSeason;
        this.value = minSeason;
    }
    d3.select("#min-season-value").text(minSeason);
    updateVisualizations();
});

d3.select("#max-season").on("input", function() {
    maxSeason = +this.value;
    if (maxSeason < minSeason) {
        maxSeason = minSeason;
        this.value = maxSeason;
    }
    d3.select("#max-season-value").text(maxSeason);
    updateVisualizations();
});

d3.select("#toggle-view").on("click", function() {
    showAverages = !showAverages;
    updateVisualizations();
});

d3.select("#filter-button").on("click", function() {
    if (d3.select("#sort-select").node().value) {
        sort = d3.select("#sort-select").node().value;
    } 
    if (d3.select("#rating-select").node().value) {
        rating = d3.select("#rating-select").node().value;
    }
    if (d3.select("#min-contributions").node().value) {
        min_contributions = +d3.select("#min-contributions").node().value;
    }
        
    updateVisualizations();
});
/* 
no alcance a implementar el brush

const brush = d3.brushX()
    .extent([[0, 0], [WIDTH, HEIGHT]])
    .on("end", brushed);


function brushed(event) {
    if (event.selection) {
        const [x0, x1] = event.selection.map(xScale.invert);
        minSeason = Math.floor(x0);
        maxSeason = Math.ceil(x1);
        updateVisualizations();
    }
}
*/

crearVis();
/* 

#############################################
###############VISUALIZACIÓN 1###############
#############################################

*/

function crearVis() {
    d3.csv(EPISODES, d3.autoType).then(function(data) {
        createScatterPlot(SVG1, data, d => d.us_viewers_in_millions, "US Viewers (in millions)");
        createScatterPlot(SVG2, data, d => d.imdb_rating, "IMDb Rating");
        createScatterPlot(SVG3, data, d => d.tmdb_rating, "TMDb Rating");

        createBarrasGraph(SVG4, data);
    });
}

function updateVisualizations(barras = true) {
    d3.csv(EPISODES, d3.autoType).then(function(data) {
        data = data.filter(d => d.season >= minSeason && d.season <= maxSeason && d.directed_by.includes(directed_by_filter));
        let data_scatter = data;
        if (!barras && selectedDirectors.length > 0) {
            data_scatter = data.filter(d => {
                const directors = d.directed_by.split(' & ');
                return directors.some(director => selectedDirectors.includes(director.trim()));
            });
        }
        if (showAverages) {
            const seasonData = d3.groups(data_scatter, d => d.season).map(([season, episodes]) => ({
                season,
                us_viewers_in_millions: d3.mean(episodes, d => d.us_viewers_in_millions),
                imdb_rating: d3.mean(episodes, d => d.imdb_rating),
                tmdb_rating: d3.mean(episodes, d => d.tmdb_rating)
            }));
            updateScatterPlot(SVG1, seasonData, d => d.us_viewers_in_millions, true);
            updateScatterPlot(SVG2, seasonData, d => d.imdb_rating, true);
            updateScatterPlot(SVG3, seasonData, d => d.tmdb_rating, true);
        } else {
            updateScatterPlot(SVG1, data_scatter, d => d.us_viewers_in_millions);
            updateScatterPlot(SVG2, data_scatter, d => d.imdb_rating);
            updateScatterPlot(SVG3, data_scatter, d => d.tmdb_rating);
        }
        // básicamente esto no se gatilla cuando clickeamos en las barras, para evitar loops infinitos. Además para evitar bugs, reseteamos selectedDirectors
        if (barras) {
            selectedDirectors = [];
            updateBarrasGraph(SVG4, data, sort, rating, min_contributions);
        }

        
    });
}

function createScatterPlot(svg, data, yValueAccessor, yLabel) {
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.season), d3.max(data, d => d.season)])
        .range([5, WIDTH]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, yValueAccessor)])
        .range([HEIGHT, 0]);

    const xAxis = d3.axisBottom(xScale)
        .tickValues(d3.range(Math.floor(d3.min(data, d => d.season)), Math.ceil(d3.max(data, d => d.season)) + 1))
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0);

    const yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append("g")
        .attr("class", "A")
        .attr("transform", `translate(0, ${HEIGHT})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "7px")
        .attr("transform", function(d) {
            return `translate(0, ${d % 2 === 0 ? 3 : 0})`;
        });

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "10px");

    createCircles(svg, data, xScale, yScale, yValueAccessor);

    svg.append("text")
        .attr("x", WIDTH / 2)
        .attr("y", HEIGHT + 30)
        .attr("text-anchor", "middle")
        .text("Season")
        .style("font-size", "10px");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", -HEIGHT / 2)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text(yLabel)
        .style("font-size", "10px");

    
}

function updateScatterPlot(svg, data, yValueAccessor, showAverages = false) {
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.season), d3.max(data, d => d.season)])
        .range([5, WIDTH]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, yValueAccessor)])
        .range([HEIGHT, 0]);

    svg.select(".x-axis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(xScale)
            .tickValues(d3.range(Math.floor(d3.min(data, d => d.season)), Math.ceil(d3.max(data, d => d.season)) + 1))
            .tickFormat(d3.format("d"))
            .tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", "7px")
        .attr("transform", function(d) {
            return `translate(0, ${d % 2 === 0 ? 3 : 0})`;
        });

    svg.selectAll("circle").attr("opacity", 1);

    const circles = createCircles(svg, data, xScale, yScale, yValueAccessor, showAverages);

    if (showAverages) {
        const line = d3.line()
            .x(d => xScale(d.season))
            .y(d => yScale(yValueAccessor(d)));
    
        const lines = svg.selectAll(".line")
            .data([data]);
    
        lines.enter()
            .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .merge(lines)
            .attr("opacity", 0)
            .transition()
            .duration(1250)
            .attr("opacity", 1)
            .attr("d", line);
    
        lines.exit()
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();
    } else {
        svg.selectAll(".line")
            .data([])
            .exit()
            .transition()
            .attr("opacity", 0)
            .duration(500)
            .remove();
    }
    
}

/* 

#############################################
###############VISUALIZACIÓN 2###############
#############################################

*/

function parseDirectors(data, rating = "imdb", min_contributions = 1) {
    const directorStats = {};

    // Aqui se utiliza forEach debido a que directed_by (string) puede tener más de un director por episodio, por lo que se debe separar y atribuir
    // cada contribución a cada director. Básicamente se utiliza debido a que estamos calculando información agregada y que no es posible
    // parsear usando d3, map o filter.

    data.forEach(d => {
        const directors = d.directed_by.split('&').map(s => s.trim());
        directors.forEach(director => {
            if (!directorStats[director]) {
                directorStats[director] = { imdb_ratings: [], us_viewers: [], contributions: 0, tmdb_ratings: [] };
            }
            directorStats[director].imdb_ratings.push(d.imdb_rating);
            directorStats[director].us_viewers.push(d.us_viewers_in_millions);
            directorStats[director].contributions++;
            directorStats[director].tmdb_ratings.push(d.tmdb_rating);
        });
    });

    Object.keys(directorStats).forEach(director => {
        if (directorStats[director].contributions < min_contributions) {
            delete directorStats[director];
        }
    });

    // Luego con directorStats se calcula el rating promedio de cada director
    const directorAvgRatings = Object.keys(directorStats).map(director => ({
        director: director,
        avg_us_viewers: d3.mean(directorStats[director].us_viewers),
        avg_rating: rating === "imdb" ? d3.mean(directorStats[director].imdb_ratings) : d3.mean(directorStats[director].tmdb_ratings),
        director_contributions: directorStats[director].contributions
    }));
    return directorAvgRatings;
}

function createBarras(svg, data, xScale, x1Scale, yScaleLeft, yScaleRight) {
    const HEIGHT_VIS4 = 600;
    const MARGIN4 = { top: 20, right: 30, bottom: 100, left: 30 };
    const HEIGHT4 = HEIGHT_VIS4 - MARGIN4.top - MARGIN4.bottom;

    xScale.paddingInner(0.1).paddingOuter(0.05);
    x1Scale.padding(0.05);

    const bars = svg.selectAll(".bar-group")
        .data(data, d => d.director);

    bars.exit().remove();

    const barGroups = bars.enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(${xScale(d.director)},0)`)
        .on("click", (event, d) => {
            const index = selectedDirectors.indexOf(d.director);
            if (index > -1) {
                selectedDirectors.splice(index, 1); 
            } else {
                selectedDirectors.push(d.director); 
            }
            updateHighlight(); 
            updateVisualizations(false);
        });

    barGroups.append("rect")
        .attr("class", "bar imdb-bar")
        .attr("x", d => x1Scale("avg_imdb_rating"))
        .attr("width", x1Scale.bandwidth())
        .attr("y", d => yScaleLeft(d.avg_rating))
        .attr("height", d => HEIGHT4 - yScaleLeft(d.avg_rating))
        .attr("fill", "steelblue");

    barGroups.append("rect")
        .attr("class", "bar viewers-bar")
        .attr("x", d => x1Scale("avg_us_viewers"))
        .attr("width", x1Scale.bandwidth())
        .attr("y", d => yScaleRight(d.avg_us_viewers))
        .attr("height", d => HEIGHT4 - yScaleRight(d.avg_us_viewers))
        .attr("fill", "orange");

    const mergedBars = bars.merge(barGroups);

    mergedBars.attr("transform", d => `translate(${xScale(d.director)},0)`)
        .selectAll(".imdb-bar")
        .transition()
        .duration(500)
        .attr("x", () => x1Scale("avg_imdb_rating"))
        .attr("y", d => yScaleLeft(d.avg_rating))
        .attr("width", x1Scale.bandwidth())
        .attr("height", d => HEIGHT4 - yScaleLeft(d.avg_rating))
        .attr("opacity", 1);

    mergedBars.selectAll(".viewers-bar")
        .transition()
        .duration(500)
        .attr("x", () => x1Scale("avg_us_viewers"))
        .attr("y", d => yScaleRight(d.avg_us_viewers))
        .attr("width", x1Scale.bandwidth())
        .attr("height", d => HEIGHT4 - yScaleRight(d.avg_us_viewers))
        .attr("opacity", 1);

    updateHighlight();

    function updateHighlight() {
        if (selectedDirectors.length === 0) {
            svg.selectAll(".bar-group")
                .selectAll(".imdb-bar, .viewers-bar")
                .attr("opacity", 1);
        } else {
            svg.selectAll(".bar-group")
                .selectAll(".imdb-bar, .viewers-bar")
                .attr("opacity", d => selectedDirectors.includes(d.director) ? 1 : 0.2);
        }
    }
}


function createBarrasGraph(svg, data, sort = "byName", rating = "imdb", min_contributions = 1) {
    const directorAvgRatings = parseDirectors(data, rating, min_contributions);

    if (sort === "byRating") {
        directorAvgRatings.sort((a, b) => d3.descending(a.avg_rating, b.avg_rating));
    } else if (sort === "byViews") {
        directorAvgRatings.sort((a, b) => d3.descending(a.avg_us_viewers, b.avg_us_viewers));
    } else {
        directorAvgRatings.sort((a, b) => d3.ascending(a.director, b.director));
    }

    const xScale = d3.scaleBand()
        .domain(directorAvgRatings.map(d => d.director))
        .range([0, WIDTH4])
        .padding(0.1);

    const x1Scale = d3.scaleBand()
        .domain(["avg_imdb_rating", "avg_us_viewers"])
        .range([0, xScale.bandwidth()])
        .padding(0.05);

    const yScaleLeft = d3.scaleLinear()
        .domain([0, d3.max(directorAvgRatings, d => d.avg_rating)])
        .nice()
        .range([HEIGHT4, 0]);

    const yScaleRight = d3.scaleLinear()
        .domain([0, d3.max(directorAvgRatings, d => d.avg_us_viewers)])
        .nice()
        .range([HEIGHT4, 0]);

    svg.selectAll(".x-axis").data([0])
        .join("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${HEIGHT4})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");


    svg.selectAll(".y-axis-left").data([0])
        .join("g")
        .attr("class", "y-axis-left")
        .call(d3.axisLeft(yScaleLeft));

    svg.selectAll(".y-axis-right").data([0])
        .join("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${WIDTH4},0)`)
        .call(d3.axisRight(yScaleRight));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -HEIGHT4 / 2)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Calificación Promedio")
        .style("font-size", "20px");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", WIDTH4 + 20)
        .attr("x", -HEIGHT4 / 2)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Vistas Promedio (En Millones)")
        .style("font-size", "20px");

    svg.append("text")
        .attr("x", WIDTH4 / 2)
        .attr("y", HEIGHT4 + 90)
        .attr("text-anchor", "middle")
        .text("Directores")
        .style("font-size", "20px");



    createBarras(svg, directorAvgRatings, xScale, x1Scale, yScaleLeft, yScaleRight);
}



function updateBarrasGraph(svg, data, sort = "byName", rating = "imdb", min_contributions = 1) {
    const directorAvgRatings = parseDirectors(data, rating, min_contributions);

    // ngl im at a point where i dont know what to do anymore TwT
    
    if (sort === "byRating") {
        directorAvgRatings.sort((a, b) => d3.descending(a.avg_rating, b.avg_rating));
    } else if (sort === "byViews") {
        directorAvgRatings.sort((a, b) => d3.descending(a.avg_us_viewers, b.avg_us_viewers));
    } else {
        directorAvgRatings.sort((a, b) => d3.ascending(a.director, b.director));
    }

    const xScale = d3.scaleBand()
        .domain(directorAvgRatings.map(d => d.director))
        .range([0, WIDTH4])
        .padding(0.1);

    const x1Scale = d3.scaleBand()
        .domain(["avg_imdb_rating", "avg_us_viewers"])
        .range([0, xScale.bandwidth()])
        .padding(0.05);

    const maxRating = d3.max(directorAvgRatings, d => d.avg_rating);
    const maxViews = d3.max(directorAvgRatings, d => d.avg_us_viewers);

    const yScaleLeft = d3.scaleLinear()
        .domain([0, maxRating])
        .nice()
        .range([HEIGHT4, 0]);

    const yScaleRight = d3.scaleLinear()
        .domain([0, maxViews])
        .nice()
        .range([HEIGHT4, 0]);

    svg.selectAll(".x-axis").data([0])
        .join("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${HEIGHT4})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

    svg.selectAll(".y-axis-left").data([0])
        .join("g")
        .attr("class", "y-axis-left")
        .call(d3.axisLeft(yScaleLeft));

    svg.selectAll(".y-axis-right").data([0])
        .join("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${WIDTH4},0)`)
        .call(d3.axisRight(yScaleRight));

    const bars = createBarras(svg, directorAvgRatings, xScale, x1Scale, yScaleLeft, yScaleRight, rating);
}
