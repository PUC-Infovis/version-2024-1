const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");

// Dimensiones del contenedor de la visualización
const HEIGHTSVG1 = 500;
const WIDTHSVG1 = 900;
const MARGIN = { top: 20, right: 20, bottom: 30, left: 50 };
const MARGIN2 = { top: 20, right: 30, bottom: 30, left: 80 };

const HEIGHTSVG2 = 700;
const WIDTHSVG2 = 1000;

const HEIGHTVIS = HEIGHTSVG1 - MARGIN.top - MARGIN.bottom;
const WIDTHVIS = WIDTHSVG1 - MARGIN.right - MARGIN.left;

const HEIGHTVIS2 = HEIGHTSVG2 - MARGIN2.top - MARGIN2.bottom;
const WIDTHVIS2 = WIDTHSVG2 - MARGIN2.right - MARGIN2.left;

SVG1
    .attr("width", WIDTHSVG1)
    .attr("height", HEIGHTSVG1)

SVG2
    .attr("width", WIDTHSVG2)
    .attr("height", HEIGHTSVG2)
    
const contenedorEjeY1 = SVG1
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)

const contenedorEjeX1 = SVG1
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top + HEIGHTVIS})`)
  
const contenedorVis = SVG1
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)

const contenedorBrush1 = contenedorVis.append("g")
.attr("class", "brush")

const contenedorEjeY2 = SVG2.append("g")
    .attr("transform", `translate(${MARGIN2.left}, ${MARGIN2.top})`);

const contenedorEjeX2 = SVG2.append("g")
    .attr("transform", `translate(${MARGIN2.left}, ${MARGIN2.top + HEIGHTVIS2})`);

const contenedorVis2 = SVG2.append("g")
    .attr("transform", `translate(${MARGIN2.left}, ${MARGIN2.top})`);


const contenedorBrush2 = SVG2.append("g")
    .attr("class", "brush").attr("transform", `translate(${MARGIN2.left}, ${MARGIN2.top})`);

// Etiquetas de los ejes
SVG1.append("text")
.attr("transform", `translate(${WIDTHVIS + MARGIN.left}, ${HEIGHTVIS + MARGIN.top })`) // Ajusta la posición del texto
.style("text-anchor", "middle")
.text("Año");

SVG1.append("text")
.attr("transform", `translate(${MARGIN.left + 40}, ${MARGIN.top- 5})`) // Ajusta la posición del texto
.style("text-anchor", "middle")
.text("Ventas (millones)");

SVG2.append("text")
.attr("transform", `translate(${WIDTHVIS2 + MARGIN2.left +15}, ${HEIGHTVIS2 + MARGIN2.top +5 })`) // Ajusta la posición del texto
.style("text-anchor", "middle")
.text("Año");

SVG2.append("text")
.attr("transform", `translate(${MARGIN2.left }, ${MARGIN2.top- 5})`) // Ajusta la posición del texto
.style("text-anchor", "middle")
.text("Género");


/* -------- Filtros -------- */
// Checklist para filtrar géneros
function createGenreFilter() {
d3.csv('vgsales.csv').then(data => {
    const genres = [...new Set(data.map(d => d.Genre))];
    const filterContainer = d3.selectAll(".filtro");
    const checkboxGenero = filterContainer.append("div").attr("class", "checkbox");

    genres.forEach(genre => {
        const label = checkboxGenero.append("label").text(genre);
        label
        .style("text-shadow", "1px -1px 0px black")
        .style("color", colorScale(genre));

        const checkbox = label.append("input")
            .attr("type", "checkbox")
            .style("background-color", colorScale(genre))
            .attr("checked", true)
            .attr("value", genre)
            .on("change", function() {
                genreFilter[genre] = this.checked;
                vis1();
                vis2();
            });
    });
}).catch(error => {
    console.error(error);
});
}

// Filtro de años
// Código generado con ayuda de ChatGTP
function createYearFilter() {
    d3.csv('vgsales.csv').then(data => {
        const years = data.map(d => +d.Year).filter(year => !isNaN(year));
        const minYear = d3.min(years);
        const maxYear = d3.max(years);
        yearFilter.start = minYear;
        yearFilter.end = maxYear;

        const filterContainer = d3.selectAll(".filtro");
        const yearFilterDiv = filterContainer.append("div").attr("class", "year-filter").style("display", "flex").style("flex-direction", "column");

        const startYearContainer = yearFilterDiv.append("div").style("display", "flex").style("flex-direction", "column").style("margin-bottom", "10px");

        startYearContainer.append("label").text("Start Year: ");
        const inputStart = startYearContainer.append("input")
            .attr("type", "range")
            .attr("min", minYear)
            .attr("max", maxYear)
            .attr("value", minYear)
            .on("input", function() {
                const startValue = +this.value;
                if (startValue <= yearFilter.end) {
                    yearFilter.start = startValue;
                    startYearSpan.text(startValue);
                    vis1();
                    vis2();
                } else {
                    this.value = yearFilter.start;
                }
            });

        const startYearSpan = startYearContainer.append("span")
            .text(minYear)
            .style("margin-left", "10px");

        const endYearContainer = yearFilterDiv.append("div").style("display", "flex").style("flex-direction", "column");

        endYearContainer.append("label").text("End Year: ");
        const inputEnd = endYearContainer.append("input")
            .attr("type", "range")
            .attr("min", minYear)
            .attr("max", maxYear)
            .attr("value", maxYear)
            .on("input", function() {
                const endValue = +this.value;
                if (endValue >= yearFilter.start) {
                    yearFilter.end = endValue;
                    endYearSpan.text(endValue);
                    vis1();
                    vis2();
                } else {
                    this.value = yearFilter.end;
                }
            });

        const endYearSpan = endYearContainer.append("span")
            .text(maxYear)
            .style("margin-left", "10px");

    }).catch(error => {
        console.error(error);
    });
}


createGenreFilter();
createYearFilter();


// Filtro de ventas
var sales = "Global_Sales";
const filterContainer = d3.selectAll(".filtro");
const salesFilter = filterContainer.append("div").attr("class", "sales-filter");
salesFilter.append("label").text("Filtro de ventas: ");
const salesSelect = salesFilter.append("select")
    .on("change", function() {
        sales = this.value;
        vis1();
        vis2();
        wishlist(selectedPoints);
    });
salesSelect.selectAll("option")
    .data(["Global_Sales", "NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"])
    .join("option")
    .attr("value", d => d)
    .text(d => d.replace("_", " "));


// Botón para reiniciar filtro de género
d3.selectAll(".filtro").append("button")
.text("Reiniciar Filtro de Género")
.style("width", "100%")
.on("click", function() {
    const checkboxes = d3.selectAll(".checkbox input");
    //uso de each para el filtro
    checkboxes.each(function() {
        genreFilter[this.value] = true;
        d3.select(this).property("checked", true);
    });
    vis1();
    vis2();
});
d3.select(".filtro2").append("button")
.text("Reiniciar Filtro de Género")
.on("click", function() {
    const checkboxes = d3.selectAll(".checkbox input");
    //uso de each para el filtro
    checkboxes.each(function() {
        genreFilter[this.value] = true;
        d3.select(this).property("checked", true);
    });
    vis1();
    vis2();
});

// Reiniciar filtro de año
d3.select(".filtro").append("button")
.style("width", "100%")
.text("Reiniciar Filtro de Año")
.on("click", function() {
    d3.select(".year-filter").remove();
    createYearFilter();
    vis1();
    vis2();
});
d3.select(".filtro2").append("button")
.text("Reiniciar Filtro de Año")
.on("click", function() {
    d3.select(".year-filter").remove();
    createYearFilter();
    vis1();
    vis2();
});
let genreFilter = {
    "Action": true,
    "Adventure": true,
    "Fighting": true,
    "Misc": true,
    "Platform": true,
    "Puzzle": true,
    "Racing": true,
    "Role-Playing": true,
    "Shooter": true,
    "Simulation": true,
    "Sports": true,
    "Strategy": true
};
let yearFilter = { start: null, end: null };
let colorScale = d3.scaleOrdinal()
.domain(Object.keys(genreFilter))
.range(d3.schemePaired);


/* -------- Visualización Whishlist -------- */

const wishlistContainer = d3.select("#wishlist").attr("class", "rows");
const entriesContainer = wishlistContainer.append("div").attr("class", "row-item");
entriesContainer.append("h3").text("Seleccionado");
entriesContainer.style("overflow-y", "scroll")
                .style("height", "200px");
const entriesList = entriesContainer.append("ul");
const selectedEntriesContainer = wishlistContainer.append("div").attr("class", "row-item");
selectedEntriesContainer.append("h3").text("En Wishlist")
.append("button")
    .text("Copiar en portapapeles")
    .style("width", "auto")
    .on("click", function() {
        const values = wishlistedPoints.map(point =>"(" + point.Name + ","+ point.Year + ","+point.Genre+ ","+point.Platform+")" );
        const text = values.join("; ");
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log("Values copied to clipboard");
            })
            .catch(error => {
                console.error("Failed to copy values to clipboard:", error);
            });
    });
selectedEntriesContainer.style("overflow-y", "scroll")
    .style("height", "200px");
const selectedEntriesList = selectedEntriesContainer.append("ul");

var wishlistedPoints = [];
var selectedPoints = [];
wishlist(selectedPoints);
function wishlist(selectedPoints){
    // Elementos seleccionados
    const anEntry = entriesList.selectAll("li")
    .data(selectedPoints.sort((a, b) => +b[sales] - a[sales])  )
    .join("li")
    .text(d => d.Name);
    
    anEntry.append("button")
    .text("✔️").on("click", (event, d) => {
        selectedPoints = selectedPoints.filter(point => point !== d)
        if (!wishlistedPoints.includes(d)) {
            wishlistedPoints.push(d);
            wishlistedPoints = wishlistedPoints.sort((a, b) => +b[sales] - a[sales]);
        }
        wishlist(selectedPoints);
    })
    .style("width", "30px")
    .style("padding", "0");

    
    // Elementos de wishlist
    const aWishlistEntry = selectedEntriesList.selectAll("li")
    .data(wishlistedPoints.sort((a, b) => +b[sales] - a[sales]))
    .join("li")
    .text(d => d.Name)
    aWishlistEntry.append("button")
    .text("❌").on("click", (event, d) => {
        wishlistedPoints = wishlistedPoints.filter(point => point !== d).sort((a, b) => +b[sales] - a[sales])
        console.log(wishlistedPoints);
        wishlist(selectedPoints)
    })
    .style("width", "30px")
    .style("padding", "0");

    //tooltip
    anEntry.append("title").text(d=>`Nombre: ${d.Name}\nGénero: ${d.Genre}\nVentas: ${d[sales]} millones\nPlataforma: ${d.Platform}\nAño: ${d.Year}`);
    aWishlistEntry.append("title").text(d=>`Nombre: ${d.Name}\nGénero: ${d.Genre}\nVentas: ${d[sales]} millones\nPlataforma: ${d.Platform}\nAño: ${d.Year}`);

}

wishlist(selectedPoints)

/* -------- Visualización 1: Scatterplot -------- */
function circulosVis1(data, escalaX, escalaY) {
    // Puntos del scatterplot con data filtrado
    console.log("Generando Circulos");
    const puntos = contenedorVis.selectAll("circle")
    .data(data, d => d.Rank)
    .join(
        enter =>{
            const circles = enter.append("circle")
            .attr("cx", d => escalaX(d.Year))
            .attr("cy", HEIGHTVIS)
            .attr("r", 2)
            .style("stroke", "rgba(0, 0, 0, 0.3)")
            .style("stroke-width", 0.5)
            .style("fill", d => colorScale(d.Genre)) // Usar la escala de color
            .style("opacity", 0);
            circles.transition()
            .duration(500)
            .attr("cy", d => escalaY(+d[sales]))
            .style("opacity", 1)
            circles.append("title").text(d=>`Nombre: ${d.Name}\nGénero: ${d.Genre}\nVentas: ${d[sales]} millones\nPlataforma: ${d.Platform}\nAño: ${d.Year}`)

            },
        update => update.transition()
            .duration(500)
            .attr("cx", d => escalaX(d.Year))
            .attr("cy", d => escalaY(+d[sales])).selectAll("title").text(d=>`Nombre: ${d.Name}\nGénero: ${d.Genre}\nVentas: ${d[sales]} millones\nPlataforma: ${d.Platform}\nAño: ${d.Year}`)
            ,
        exit => exit.transition()
            .duration(500)
            .attr("cy", HEIGHTVIS)
            .style("opacity", 0)
            .remove()
    )
    return puntos;
}

function vis1() {
    d3.csv('vgsales.csv').then(rawdata => {
        // Filtrar los datos por género y año seleccionados
        const data = rawdata.filter(d => genreFilter[d.Genre] && (d.Year >= yearFilter.start && d.Year <= yearFilter.end) && (d.Year != "N/A"));

        console.log("Vis1: Generando Scatterplot");

        // Escala eje Y
        const escalaPrecios = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d[sales])])
            .range([HEIGHTVIS, 0]);

        // Escala eje X
        var valorFechas = Array.from(new Set(data.map(function(d) {
            if (d.Year == "N/A") {
                return 0;
            }
            return d.Year;
        }))).sort( function(a, b) { return a - b; });
        var posicionFecha = d3.range(valorFechas.length).map(function(d) { 
            return d *(WIDTHVIS/valorFechas.length); // Adjust spacing as needed
        });
        
        const escalaAnios = d3.scaleOrdinal()
            .domain(valorFechas)
            .range(posicionFecha);

        // Ejes
        const ejeX = d3.axisBottom(escalaAnios);
        const ejeY = d3.axisLeft(escalaPrecios);

        contenedorEjeX1
            .transition()
            .duration(500)
            .call(ejeX)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end");
        
        contenedorEjeY1
            .transition()
            .duration(500)
            .call(ejeY)
            .selectAll("text")
            .attr("font-size", 10);

        // Crear un brush
        const brush = d3.brush()
            .extent([[0, 0], [WIDTHVIS, HEIGHTVIS]])
            .on("end", brushed);

        contenedorBrush1.call(brush);

        // Función de callback para manejar el evento de brushing
        function brushed(event) {
            const selection = event.selection;
            if (selection) {
                const [[x0, y0], [x1, y1]] = selection;
                const selected = data.filter(d => escalaAnios(d.Year) >= x0 && escalaAnios(d.Year) <= x1 && escalaPrecios(+d[sales]) >= y0 && escalaPrecios(+d[sales]) <= y1);
                console.log(selected);
                selectedPoints = selected.sort((a, b) => +b[sales] - a[sales]);
                wishlist(selectedPoints);
            }
        }

        circulosVis1(data, escalaAnios, escalaPrecios);


        
    }).catch(error => {
        console.error(error);
    });
}
vis1();

/* -------- Visualización 2: Heatmap -------- */
let isSum = true;

// Botón para alternar entre mostrar suma o promedio
document.getElementById('toggle-button').addEventListener('click', function() {
    isSum = !isSum;
    this.textContent = isSum ? 'Mostrar Promedio' : 'Mostrar Suma';
    vis2();
});

function vis2() {
    d3.csv('vgsales.csv').then(rawdata => {
        // Filtrar los datos por género y año seleccionados
        const data = rawdata.filter(d => genreFilter[d.Genre] && (d.Year >= yearFilter.start && d.Year <= yearFilter.end) && (d.Year != "N/A"));

        console.log("Vis2: Generando Heatmap");

        // Agrupar y agregar los datos
        const aggregatedData = Array.from(
            d3.rollup(
                data,
                v => isSum ? d3.sum(v, d => +d[sales]) : d3.mean(v, d => +d[sales]), // Suma o Promedio de ventas
                d => d.Genre, // Primer nivel de agrupación: Género
                d => d.Year // Segundo nivel de agrupación: Año
            )
        ).map(([Genre, years]) => 
            Array.from(years, ([Year, Sales]) => ({Genre, Year, Sales}))
        ).flat();

        // Escalas
        const escalaX = d3.scaleBand()
            .domain(Array.from(new Set(aggregatedData.map(d => d.Year))).sort((a, b) => a - b)) // Ordenar años
            .range([0, WIDTHVIS2])
            .padding(0.01);

        const escalaY = d3.scaleBand()
            .domain(Array.from(new Set(aggregatedData.map(d => d.Genre))))
            .range([HEIGHTVIS2, 0])
            .padding(0.01);

        const escalaColor = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, d3.max(aggregatedData, d => +d.Sales)]);

        // Ejes
        const ejeX = d3.axisBottom(escalaX);
        const ejeY = d3.axisLeft(escalaY);

        contenedorEjeX2
            .transition()
            .duration(500)
            .call(ejeX)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end");
        
        contenedorEjeY2
            .transition()
            .duration(500)
            .call(ejeY)
            .selectAll("text")
            .attr("font-size", 10);

        // Crear un brush
        const brush2 = d3.brush()
            .extent([[0, 0], [WIDTHVIS2, HEIGHTVIS2]])
            .on("end", brushed2);
        contenedorBrush2.call(brush2);

        contenedorBrush2.selectAll(".overlay")
        .style("pointer-events", "all");
        contenedorBrush2.selectAll(".selection")
        .style("fill", "blue")
        .style("opacity", 0.3);


        // Función de callback para manejar el evento de brushing
        
        function brushed2(event) {
            const selection = event.selection;
            if (selection) {
                const [[x0, y0], [x1, y1]] = selection;
                const selectedYears = escalaX.domain().filter(year => {
                    const x = escalaX(year) + escalaX.bandwidth() / 2;
                    return x0 <= x && x <= x1;
                });
                const selectedGenres = escalaY.domain().filter(genre => {
                    const y = escalaY(genre) + escalaY.bandwidth() / 2;
                    return y0 <= y && y <= y1;
                });
                
                yearFilter.start = Math.min(...selectedYears);
                yearFilter.end = Math.max(...selectedYears);

                // El uso del loop forEach para filtrar, no significa que se cambie directamente la visualización
                Object.keys(genreFilter).forEach(genre => {
                    genreFilter[genre] = selectedGenres.includes(genre);
                });


                const checkboxes = d3.selectAll(".checkbox input");
                //uso de each para el filtro
                checkboxes.each(function() {
                    d3.select(this).property("checked", genreFilter[this.value]);
                });

                vis1();
                vis2(); 
                console.log(selectedYears);
                console.log(selectedGenres);
            }
        }

        // Rectángulos del heatmap
        const rects = contenedorVis2.selectAll("rect")
            .data(aggregatedData, d => `${d.Genre}:${d.Year}`)
            .join(
                enter => {const rectangulos = enter.append("rect")
                    .attr("x", d => escalaX(d.Year))
                    .attr("y", d => escalaY(d.Genre))
                    .attr("width", escalaX.bandwidth())
                    .attr("height", escalaY.bandwidth())
                    .attr("fill", d => escalaColor(+d.Sales))
                    .style("opacity", 0)
                    .call(enter => enter.transition().duration(500).style("opacity", 1))
                    rectangulos.append("title").text(d=>`Género: ${d.Genre}\nAño: ${d.Year}\nVentas: ${d.Sales}`)},
                update => {update
                    .transition()
                    .duration(500)
                    .attr("x", d => escalaX(d.Year))
                    .attr("y", d => escalaY(d.Genre))
                    .attr("width", escalaX.bandwidth())
                    .attr("height", escalaY.bandwidth())
                    .attr("fill", d => escalaColor(+d.Sales))
                    .selectAll("title").text(d=>`Género: ${d.Genre}\nAño: ${d.Year}\nVentas: ${d.Sales}`)
                },
                exit => exit.transition().duration(500).style("opacity", 0).remove()
            );
    }).catch(error => {
        console.error(error);
    });
}

vis2();
