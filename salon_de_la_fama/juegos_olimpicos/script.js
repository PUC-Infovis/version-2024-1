// Mapeo de códigos NOC a códigos ISO 3166-1 alpha-3
const nocToIso = {
    "AFG": "AFG",
    "ALB": "ALB",
    "ALG": "DZA",
    "AND": "AND",
    "ANG": "AGO",
    "ANT": "ATG",
    "ARG": "ARG",
    "ARM": "ARM",
    "ARU": "ABW",
    "ASA": "ASM",
    "AUS": "AUS",
    "AUT": "AUT",
    "AZE": "AZE",
    "BAH": "BHS",
    "BAN": "BGD",
    "BAR": "BRB",
    "BDI": "BDI",
    "BEL": "BEL",
    "BEN": "BEN",
    "BER": "BMU",
    "BHU": "BTN",
    "BIH": "BIH",
    "BIZ": "BLZ",
    "BLR": "BLR",
    "BOL": "BOL",
    "BOT": "BWA",
    "BRA": "BRA",
    "BRN": "BRN",
    "BRU": "BRN",
    "BUL": "BGR",
    "BUR": "BFA",
    "CAF": "CAF",
    "CAM": "KHM",
    "CAN": "CAN",
    "CAY": "CYM",
    "CGO": "COG",
    "CHA": "TCD",
    "CHI": "CHL",
    "CHN": "CHN",
    "CIV": "CIV",
    "CMR": "CMR",
    "COD": "COD",
    "COK": "COK",
    "COL": "COL",
    "COM": "COM",
    "CPV": "CPV",
    "CRC": "CRI",
    "CRO": "HRV",
    "CUB": "CUB",
    "CYP": "CYP",
    "CZE": "CZE",
    "DEN": "DNK",
    "DJI": "DJI",
    "DMA": "DMA",
    "DOM": "DOM",
    "ECU": "ECU",
    "EGY": "EGY",
    "ERI": "ERI",
    "ESA": "SLV",
    "ESP": "ESP",
    "EST": "EST",
    "ETH": "ETH",
    "FIJ": "FJI",
    "FIN": "FIN",
    "FRA": "FRA",
    "GAB": "GAB",
    "GAM": "GMB",
    "GBR": "GBR",
    "GBS": "GNB",
    "GEO": "GEO",
    "GEQ": "GNQ",
    "GER": "DEU",
    "GHA": "GHA",
    "GRE": "GRC",
    "GRN": "GRD",
    "GUA": "GTM",
    "GUI": "GIN",
    "GUM": "GUM",
    "GUY": "GUY",
    "HAI": "HTI",
    "HKG": "HKG",
    "HON": "HND",
    "HUN": "HUN",
    "INA": "IDN",
    "IND": "IND",
    "IRI": "IRN",
    "IRL": "IRL",
    "IRQ": "IRQ",
    "ISL": "ISL",
    "ISR": "ISR",
    "ISV": "VIR",
    "ITA": "ITA",
    "IVB": "VGB",
    "JAM": "JAM",
    "JOR": "JOR",
    "JPN": "JPN",
    "KAZ": "KAZ",
    "KEN": "KEN",
    "KGZ": "KGZ",
    "KIR": "KIR",
    "KOR": "KOR",
    "KOS": "XKX",
    "KSA": "SAU",
    "KUW": "KWT",
    "LAO": "LAO",
    "LAT": "LVA",
    "LBA": "LBY",
    "LBR": "LBR",
    "LCA": "LCA",
    "LES": "LSO",
    "LIE": "LIE",
    "LTU": "LTU",
    "LUX": "LUX",
    "MAD": "MDG",
    "MAL": "MYS",
    "MAR": "MAR",
    "MAS": "MYS",
    "MAW": "MWI",
    "MDA": "MDA",
    "MDV": "MDV",
    "MEX": "MEX",
    "MGL": "MNG",
    "MHL": "MHL",
    "MKD": "MKD",
    "MLI": "MLI",
    "MLT": "MLT",
    "MNE": "MNE",
    "MON": "MCO",
    "MOZ": "MOZ",
    "MRI": "MUS",
    "MTN": "MRT",
    "MYA": "MMR",
    "NAM": "NAM",
    "NCA": "NIC",
    "NED": "NLD",
    "NEP": "NPL",
    "NGR": "NGA",
    "NIG": "NER",
    "NOR": "NOR",
    "NRU": "NRU",
    "NZL": "NZL",
    "OMA": "OMN",
    "PAK": "PAK",
    "PAN": "PAN",
    "PAR": "PRY",
    "PER": "PER",
    "PHI": "PHL",
    "PLE": "PSE",
    "PLW": "PLW",
    "PNG": "PNG",
    "POL": "POL",
    "POR": "PRT",
    "PRK": "PRK",
    "PUR": "PRI",
    "QAT": "QAT",
    "ROU": "ROU",
    "RSA": "ZAF",
    "RUS": "RUS",
    "RWA": "RWA",
    "SAM": "WSM",
    "SEN": "SEN",
    "SEY": "SYC",
    "SIN": "SGP",
    "SKN": "KNA",
    "SLE": "SLE",
    "SLO": "SVN",
    "SMR": "SMR",
    "SOL": "SLB",
    "SOM": "SOM",
    "SRB": "SRB",
    "SRI": "LKA",
    "STP": "STP",
    "SUD": "SDN",
    "SSD": "SDS",
    "SUI": "CHE",
    "SUR": "SUR",
    "SVK": "SVK",
    "SWE": "SWE",
    "SWZ": "SWZ",
    "SYR": "SYR",
    "TAN": "TZA",
    "TGA": "TON",
    "THA": "THA",
    "TJK": "TJK",
    "TKM": "TKM",
    "TLS": "TLS",
    "TOG": "TGO",
    "TPE": "TWN",
    "TTO": "TTO",
    "TUN": "TUN",
    "TUR": "TUR",
    "TUV": "TUV",
    "UAE": "ARE",
    "UGA": "UGA",
    "UKR": "UKR",
    "URU": "URY",
    "USA": "USA",
    "UZB": "UZB",
    "VAN": "VUT",
    "VEN": "VEN",
    "VIE": "VNM",
    "VIN": "VCT",
    "YEM": "YEM",
    "ZAM": "ZMB",
    "ZIM": "ZWE",
};

// Variable para almacenar el país seleccionado
let selectedCountry = null;
let selectedSeason = null;

// Años de verano e invierno para luego usarlos en la filtración por temporada
const summerYears = [2020, 2016, 2012, 2008, 2004, 2000, 1996, 1992, 1988, 1984, 1980, 1976, 1972, 1968, 1964, 1960, 1956, 1952, 1948, 1936, 1932, 1928, 1924, 1920, 1912, 1908, 1904, 1900, 1896];
const winterYears = [2018, 2014, 2010, 2006, 2002, 1998, 1994, 1992, 1988, 1984, 1980, 1976, 1972, 1968, 1964, 1960, 1956, 1952, 1948, 1936, 1932, 1928, 1924];

// Configurar zoom y panning
const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Ajustar los límites de zoom
    .on("zoom", zoomed);

// Definir la función de zoom
function zoomed(event) {
    g.attr("transform", event.transform);
}

// Crear un contenedor para el tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.5)");

// Crear el mapa del mundo
const svgMap = d3.select("#map-container").append("svg")
    .attr("width", "100%")
    .attr("height", 600)
    .call(zoom);

const g = svgMap.append("g");
const projection = d3.geoNaturalEarth1().scale(150).translate([450, 300]);
const path = d3.geoPath().projection(projection);

// Crear el mapa y cargar los datos
d3.csv("athlete_events.csv").then(data => {
    // Filtrar los datos hasta el año 2016 y excluir los años 2018 y 2020, porque la base de datos no tiene esa info correcta
    data = data.filter(d => d.Year <= 2016);

    // Procesar los datos para obtener el número de medallas por país
    const medalsByCountry = d3.rollup(data, v => ({
        Gold: d3.sum(v, d => d.Medal === "Gold" ? 1 : 0),
        Silver: d3.sum(v, d => d.Medal === "Silver" ? 1 : 0),
        Bronze: d3.sum(v, d => d.Medal === "Bronze" ? 1 : 0),
        Total: d3.sum(v, d => (d.Medal === "Gold" || d.Medal === "Silver" || d.Medal === "Bronze") ? 1 : 0)
    }), d => nocToIso[d.NOC] || d.NOC);

    // Extraer coordenadas para hacer el mapa por medio de la siguiente página
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(world => {
        // Crear una escala de colores ajustada para mejor diferenciación
        const maxMedals = d3.max([...medalsByCountry.values()], d => d.Total);
        const colorScale = d3.scaleThreshold()
            .domain([1, 10, 50, 100, 200, 500, 1000, maxMedals])
            .range(d3.schemeBlues[9]);  // Usar una escala de colores 

        const countries = g.selectAll("path")
            .data(world.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                const countryCode = d.id;
                const country = medalsByCountry.get(countryCode);
                return country ? colorScale(country.Total) : "#ccc";
            })
            .attr("stroke", "#333")
            .on("mouseover", function(event, d) {
                const countryCode = d.id;
                const country = medalsByCountry.get(countryCode);
                d3.select(this).attr("stroke", "black");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`<strong>${d.properties.name}</strong><br>Total Medallas: ${country ? country.Total : 0}<br>Oro: ${country ? country.Gold : 0}<br>Plata: ${country ? country.Silver : 0}<br>Bronce: ${country ? country.Bronze : 0}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("stroke", "#333");
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .on("click", function(event, d) {
                const countryCode = d.id;
                const countryData = medalsByCountry.get(countryCode);
            
                if (selectedCountry === countryCode) {
                    selectedCountry = null; // Deseleccionar si ya estaba seleccionado
                    hideFilters();
                    hideSeasonButtons();
                    
                    // Usar data join para eliminar las barras
                    const bars = gBarChart.selectAll(".bar").data([]);
                    bars.exit().remove();
            
                    d3.select("#selected-country-name").text("");
                    // Ocultar el contenedor del gráfico de barras
                    d3.select("#bar-chart-container").style("display", "none");
                    d3.select("#no-data-message").style("display", "none"); // Ocultar mensaje de "sin información"
                } else {
                    selectedCountry = countryCode; // Seleccionar el nuevo país
                    selectedSeason = "all"; // Restablecer la temporada a "all"
                    resetFilters(); // Restablecer los filtros
            
                    if (countryData) {
                        if (countryData.Total > 0) {
                            showSeasonButtons();
                            initializeBarChart(countryCode, countryData);
                            d3.select("#selected-country-name").text(d.properties.name);
                            // Mostrar el contenedor del gráfico de barras
                            d3.select("#bar-chart-container").style("display", "block");
                            d3.select("#no-data-message").style("display", "none"); // Ocultar mensaje de "sin información"
                        } else {
                            hideFilters();
                            hideSeasonButtons();
                            
                            // Usar data join para eliminar las barras
                            const bars = gBarChart.selectAll(".bar").data([]);
                            bars.exit().remove();
            
                            d3.select("#selected-country-name").text(d.properties.name);
                            // Ocultar el contenedor del gráfico de barras
                            d3.select("#bar-chart-container").style("display", "none");
                            d3.select("#no-data-message").text(`${d.properties.name} no tiene medallas`).style("display", "block"); // Mostrar mensaje de "no tiene medallas"
                        }
                    } else {
                        hideFilters();
                        hideSeasonButtons();
                        
                        // Usar data join para eliminar las barras
                        const bars = gBarChart.selectAll(".bar").data([]);
                        bars.exit().remove();
            
                        d3.select("#selected-country-name").text(d.properties.name);
                        // Ocultar el contenedor del gráfico de barras
                        d3.select("#bar-chart-container").style("display", "none");
                        d3.select("#no-data-message").text(`No hay información para ${d.properties.name}`).style("display", "block"); // Mostrar mensaje de "sin información"
                    }
                }
                updateMap();
            });
            
        function updateMap() {
            countries.transition().duration(500)
                .attr("fill", d => {
                    const countryCode = d.id;
                    const country = medalsByCountry.get(countryCode);
                    return country ? colorScale(country.Total) : "#ccc";
                })
                .attr("opacity", d => selectedCountry ? (d.id === selectedCountry ? 1 : 0.3) : 1)
                .attr("stroke", d => selectedCountry ? (d.id === selectedCountry ? "black" : "#aaa") : "#333");
        }

        // Agregar funcionalidad al botón de reinicio
        d3.select("#reset-button").on("click", () => {
            selectedCountry = null;
            selectedSeason = null;
            updateMap();
            hideFilters();
            hideSeasonButtons();
            gBarChart.selectAll(".bar").data([]).join(enter => enter.append("rect").attr("class", "bar"));
            d3.select("#selected-country-name").text("");
            resetFilters(); // Restablecer los filtros
            // Ocultar el contenedor del gráfico de barras
            d3.select("#bar-chart-container").style("display", "none");
        });
         
        // Crear leyenda del mapa
        function createLegend() {
            const legendContainer = d3.select("#legend-container");
            
        
            const legendScale = d3.scaleQuantize()
                .domain([1, d3.max([...medalsByCountry.values()], d => d.Total)])
                .range(d3.schemeBlues[9]);
        
            const legendData = legendScale.range().map(color => {
                const d = legendScale.invertExtent(color);
                return { color, range: d };
            });
        
            const legend = legendContainer.append("div")
                .attr("class", "legend");
        
            // Crear elementos de la leyenda para los rangos de colores
            const legendItems = legend.selectAll(".legend-item")
                .data(legendData)
                .join("div")
                .attr("class", "legend-item");
        
            legendItems.append("div")
                .attr("class", "legend-color")
                .style("background-color", d => d.color)
                .style("border", "1px solid black");  // Añadir borde negro
        
            legendItems.append("span")
                .text(d => `${Math.round(d.range[0])} - ${Math.round(d.range[1])} Medallas`);
        
            // Añadir entradas adicionales para países sin medallas y países sin info
            const additionalLegendData = [
                { color: "#fff", label: "Sin medallas" },
                { color: "#ccc", label: "No hay información" }
            ];

            const additionalLegendItems = legend.selectAll(".additional-legend-item")
                .data(additionalLegendData)
                .join("div")
                .attr("class", "legend-item additional-legend-item");
        
            additionalLegendItems.append("div")
                .attr("class", "legend-color")
                .style("background-color", d => d.color)
                .style("border", "1px solid black");  
        
            additionalLegendItems.append("span")
                .text(d => d.label);
        }

        // Llama a la función createLegend después de cargar los datos y crear el mapa
        createLegend(); 
    });

    // Crear gráfico de barras 
    const svgBarChart = d3.select("#bar-chart-container").append("svg")
        .attr("width", "100%")
        .attr("height", 500);

    const margin = { top: 20, right: 30, bottom: 150, left: 90 }; // Ajustar el margen inferior
    const width = svgBarChart.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = svgBarChart.node().getBoundingClientRect().height - margin.top - margin.bottom;
    const gBarChart = svgBarChart.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    gBarChart.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`);

    gBarChart.append("g")
        .attr("class", "axis axis--y");

    // Contenedor para el título del eje x de los gráficos de barras (son distintos)
    const xAxisLabel = gBarChart.append("text")
        .attr("class", "x-axis-label")
        .style("text-anchor", "middle");

    function initializeBarChart(countryCode, country) {
        const medals = [
            { medal: "Gold", display: "Oro" },
            { medal: "Silver", display: "Plata" },
            { medal: "Bronze", display: "Bronce" }
        ];
        const medalCounts = medals.map(m => ({ medal: m.medal, display: m.display, count: country[m.medal] }));
    
        x.domain(medalCounts.map(d => d.display));
        y.domain([0, d3.max(medalCounts, d => d.count)]);
    
        gBarChart.select(".axis--x").call(d3.axisBottom(x));
        gBarChart.select(".axis--y").call(d3.axisLeft(y).ticks(10));
    
        const bars = gBarChart.selectAll(".bar").data(medalCounts);
    
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.display))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.count))
            .attr("fill", d => {
                if (d.count === 0) return "none"; // No mostrar barras si el conteo es 0
                return d.medal === "Gold" ? "gold" : d.medal === "Silver" ? "silver" : "brown";
            })
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`${d.display}: ${d.count}`)
                    .style("left", `${event.pageX + 5}px`)
                    .style("top", `${event.pageY - 28}px`)
                    .style("transform", "translateX(-50%)")
                    .style("background", "white")
                    .style("border", "1px solid black")
                    .style("padding", "5px")
                    .style("border-radius", "5px")
                    .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.5)");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    
        bars.transition()
            .duration(500)
            .attr("x", d => x(d.display))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.count))
            .attr("fill", d => {
                if (d.count === 0) return "none"; // No mostrar barras si el conteo es 0
                return d.medal === "Gold" ? "gold" : d.medal === "Silver" ? "silver" : "brown";
            })
    
        bars.exit().remove();
        
        // Etiqueta del eje Y
        gBarChart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Cantidad de Medallas");   

        // Actualizar la etiqueta del eje x
        xAxisLabel
            .text("Tipo de Medalla")
            .attr("transform", `translate(${width / 2},${height + margin.bottom - 90})`); // Ajustar la posición para el gráfico inicial
    }

    // Crear gráfico de barras con deportes cuando se filtran los datos 
    function updateBarChart() {
        if (!selectedCountry || !selectedSeason) {
            const bars = gBarChart.selectAll(".bar").data([]);
            bars.exit().remove();
            return;
        }
    
        const year = d3.select("#year-filter").property("value");
        const gender = d3.select("#gender-filter").property("value");
        const medalType = d3.select("#medal-filter").property("value");
    
        let filteredData = data.filter(d => nocToIso[d.NOC] === selectedCountry && (selectedSeason === "all" || d.Season === selectedSeason));
        if (year !== "all") {
            filteredData = filteredData.filter(d => d.Year == year);
        }
        if (gender !== "all") {
            filteredData = filteredData.filter(d => d.Gender === gender);
        }
        if (medalType !== "all") {
            filteredData = filteredData.filter(d => d.Medal === medalType);
        }
    
        const medalsBySport = d3.rollup(filteredData, v => ({
            Gold: d3.sum(v, d => d.Medal === "Gold" ? 1 : 0),
            Silver: d3.sum(v, d => d.Medal === "Silver" ? 1 : 0),
            Bronze: d3.sum(v, d => d.Medal === "Bronze" ? 1 : 0),
            Total: d3.sum(v, d => (d.Medal === "Gold" || d.Medal === "Silver" || d.Medal === "Bronze") ? 1 : 0)
        }), d => d.Sport);
    
        const sports = Array.from(medalsBySport.keys());
        const medalCounts = sports.map(sport => ({
            sport: sport,
            ...medalsBySport.get(sport)
        }));
    
        x.domain(medalCounts.map(d => d.sport));
        y.domain([0, d3.max(medalCounts, d => d.Total)]);
    
        gBarChart.select(".axis--x")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
    
        gBarChart.select(".axis--y").call(d3.axisLeft(y).ticks(10));
    
        const bars = gBarChart.selectAll(".bar")
            .data(medalCounts, d => d.sport); // Usar una función clave para asegurar la correspondencia correcta
    
        // Crear las barras iniciales
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.sport))
            .attr("y", d => y(d.Total))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.Total))
            .attr("fill", d => {
                if (d.Total === 0) return "none"; // No mostrar la barra si el total es 0
                if (d.Gold) return "gold";
                if (d.Silver) return "silver";
                if (d.Bronze) return "brown";
            })
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`${d.sport}: ${d.Total}`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    
        // Actualizar las barras existentes
        bars.transition()
            .duration(500)
            .attr("x", d => x(d.sport))
            .attr("y", d => y(d.Total))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.Total))
            .attr("fill", d => {
                if (d.Total === 0) return "none"; // No mostrar la barra si el total es 0
                if (d.Gold) return "gold";
                if (d.Silver) return "silver";
                if (d.Bronze) return "brown";
            });
    
        // Eliminar las barras que ya no están presentes en los datos
        bars.exit().transition()
            .duration(500)
            .attr("y", y(0))
            .attr("height", 0)
            .remove();
        // Actualizar la etiqueta del eje x
        xAxisLabel.text("Deportes")
        .attr("transform", `translate(${width / 2},${height + margin.bottom - 40})`); // Ajustar la posición para el gráfico inicial
    }

    function resetFilters() {
        d3.select("#season-filter").property("value", "all");
        d3.select("#year-filter").property("value", "all");
        d3.select("#gender-filter").property("value", "all");
        d3.select("#medal-filter").property("value", "all");
    }

    function showSeasonButtons() {
        d3.select("#filters-container").style("display", "block");
    }

    function hideSeasonButtons() {
        d3.select("#filters-container").style("display", "none");
    }
     
    function updateYearFilter(season) {
        const yearFilter = d3.select("#year-filter");
    
        let years = [];
        if (season === "Summer") {
            years = summerYears.filter(year => year <= 2016);
        } else if (season === "Winter") {
            years = winterYears.filter(year => year <= 2016);
        } else {
            years = summerYears.concat(winterYears).filter(year => year <= 2016).sort((a, b) => b - a);
        }
    
        // Usar d3 para crear opciones sin loops y evitar duplicados
        const options = yearFilter.selectAll("option")
            .data([{ value: "all", text: "Todos los años" }, ...[...new Set(years)].map(year => ({ value: year, text: year }))]);
    
        options.join(
            enter => enter.append("option")
                .attr("class", "year-option")
                .attr("value", d => d.value)
                .text(d => d.text),
            update => update
                .attr("class", "year-option")
                .attr("value", d => d.value)
                .text(d => d.text),
            exit => exit.remove()
        );
    }
    
    // Llamar a la función updateYearFilter al inicio para cargar todos los años
    updateYearFilter("all");
    
    // Mostrar el gráfico inicial y los filtros cuando se selecciona un país
    function showFilters() {
        d3.select("#filters-container").style("display", "block");
    }
    
    function hideFilters() {
        d3.select("#filters-container").style("display", "none");
    }
    
    // Agregar funcionalidad a los botones de temporada
    d3.select("#season-filter").on("change", function() {
        selectedSeason = this.value;
        updateYearFilter(selectedSeason);
        updateBarChart();
    });
    
    // Agregar funcionalidad al botón de reinicio
    d3.select("#reset-button").on("click", () => {
        selectedCountry = null;
        selectedSeason = null;
        updateMap();
        hideFilters();
        hideSeasonButtons();
        resetFilters(); // Restablecer los filtros
    
        // Actualizar el gráfico de barras de manera correcta
        const bars = gBarChart.selectAll(".bar").data([]); // Vincular a un conjunto de datos vacío
        bars.exit().transition().duration(500).attr("y", y(0)).attr("height", 0).remove(); // Eliminar las barras
    
        // Ocultar el contenedor del gráfico de barras
        d3.select("#bar-chart-container").style("display", "none");
    
        // Usar join para eliminar las barras existentes
        gBarChart.selectAll(".bar")
            .data([])
            .join(
                enter => enter,
                update => update,
                exit => exit.remove()
            );
    });
    
    // Actualizar el gráfico de barras cuando se cambien los filtros
    d3.select("#year-filter").on("change", updateBarChart);
    d3.select("#gender-filter").on("change", updateBarChart);
    d3.select("#medal-filter").on("change", updateBarChart);

    });  
    
// Redimensionar el mapa y el gráfico de barras al tamaño de la ventana
window.addEventListener('resize', function() {
    d3.select("#map-container svg")
        .attr("width", document.getElementById('map-container').clientWidth)
        .attr("height", document.getElementById('map-container').clientHeight);

    d3.select("#bar-chart-container svg")
        .attr("width", document.getElementById('bar-chart-container').clientWidth)
        .attr("height", document.getElementById('bar-chart-container').clientHeight);
});

//Referencias:
//Coordenadas del mapa extraídas de: https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson\
//Para la creación de la leyenda del mapa y el tooltip se le pidió ayuda a chatGPT
//Datos extraídos de: https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-and-results
