let selectedComuna = null;

// Función para cargar datos geográficos
function loadGeoData(geoDataUrl, callback) {
    d3.json(geoDataUrl).then(callback);
}

// Función para cargar datos de accidentes
function loadAccidentData(accidentDataUrl, callback) {
    d3.json(accidentDataUrl).then(callback);
}

// Función para crear el mapa
function createMap(geoData, accidentData) {
    const width = 600;
    const height = 600;

    const svg = d3.select("#map")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    const g = svg.append("g");

    d3.select("#comunaInfo").text("General").style("font-weight", "bold");

    const comunas = g.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "comuna")
        .attr("d", path)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("fill", "#ccc")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleComunaClick);

    // Función para manejar el evento mouseover en una comuna
    function handleMouseOver(event, d) {
        const comuna = d3.select(this);
        if (!comuna.classed("selected")) {
            comuna.attr("fill", "#63E8B4");
            if (!selectedComuna) {
                d3.select("#comunaInfo").text(d.properties.COMUNA);
            }
        }
    }

    // Función para manejar el evento mouseout en una comuna
    function handleMouseOut(event, d) {
        const comuna = d3.select(this);
        if (!comuna.classed("selected")) {
            comuna.attr("fill", "#ccc");
            if (!selectedComuna) {
                d3.select("#comunaInfo").text("General");
            }
        }
    }

    // Función para manejar el evento click en una comuna
    function handleComunaClick(event, d) {
        const comuna = d3.select(this);
        const selected = comuna.classed("selected");

        comunas.classed("selected", false).attr("fill", "#ccc");

        if (!selected) {
            comuna.classed("selected", true).attr("fill", "#63E8B4");
            d3.select("#comunaInfo").text(d.properties.COMUNA);
            selectedComuna = comuna;
            zoomToFeature(d);

            const filteredAccidents = accidentData.features.filter(accident => {
                const codCom = String(accident.properties.COD_COM);
                const cutCom = String(d.properties.CUT_COM);
                return codCom === cutCom;
            });

            createBarChart(filteredAccidents, d.properties.COMUNA);
        } else {
            selectedComuna = null;
            resetZoom();
            d3.select("#comunaInfo").text("General");

            createBarChart(accidentData.features, "todas las comunas");
        }
    }

    // Función para hacer zoom a una característica
    function zoomToFeature(d) {
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        const dx = x1 - x0;
        const dy = y1 - y0;
        const x = (x0 + x1) / 2;
        const y = (y0 + y1) / 2;
        const scale = Math.max(1, Math.min(20, 0.9 / Math.max(dx / width, dy / height)));
        const translate = [width / 2 - scale * x, height / 2 - scale * y];

        svg.transition()
            .duration(750)
            .call(
                zoom.transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
    }

    // Función para resetear el zoom
    function resetZoom() {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
    }

    // Crear tooltip vacío con clase "tooltip". En el CSS está todo lo necesario
    let tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("width", 200)
        .style("pointer-events", "none")
        .style("border-radius", "8px")
        .style("padding", "4px")
        .style("position", "absolute");

    // Filtrar los puntos de ruido (cluster_lbl == -1) y aquellos con menos de 10 accidentes
    const filteredAccidentData = accidentData.features.filter(d => d.properties.CLUSTER !== -1);

    // Calcular tamaños de los clusters y mapear a intervalos
    const clusterCounts = d3.rollup(filteredAccidentData, v => v.length, d => d.properties.CLUSTER);
    const intervalColors = {
        '10-20': 'blue',
        '20-30': 'orange',
        '30+': 'red'
    };
    const intervalSizes = {
        '10-20': 2.5,
        '20-30': 3.5,
        '30+': 5
    };

    const clusterData = Array.from(d3.group(filteredAccidentData, d => d.properties.CLUSTER), ([cluster_lbl, points]) => {
        const centroid = d3.geoCentroid({ type: "MultiPoint", coordinates: points.map(p => p.geometry.coordinates) });
        const clusterSize = clusterCounts.get(cluster_lbl);

        if (clusterSize < 10) return null;

        const sums = points.reduce((acc, point) => {
            acc.FALLECIDOS += +point.properties.FALLECIDOS || 0;
            acc.GRAVES += +point.properties.GRAVES || 0;
            acc.MENOS_GRAVES += +point.properties.MENOS_GRAVES || 0;
            acc.LEVES += +point.properties.LEVES || 0;
            acc.ILESOS += +point.properties.ILESOS || 0;
            return acc;
        }, { FALLECIDOS: 0, GRAVES: 0, MENOS_GRAVES: 0, LEVES: 0, ILESOS: 0 });

        let cluster_interval, color, radius;
        if (clusterSize <= 20) {
            cluster_interval = '10-20';
        } else if (clusterSize <= 30) {
            cluster_interval = '20-30';
        } else {
            cluster_interval = '30+';
        }
        color = intervalColors[cluster_interval];
        radius = intervalSizes[cluster_interval];
        return { centroid, clusterSize, color, radius, comuna: points[0].properties.COMUNA, ...sums };
    }).filter(d => d !== null);

    // Añadir puntos de clusters
    const points = g.selectAll("circle")
        .data(clusterData)
        .enter().append("circle")
        .attr("cx", d => projection(d.centroid)[0])
        .attr("cy", d => projection(d.centroid)[1])
        .attr("r", d => d.radius)
        .attr("fill", d => d.color)
        .attr("stroke", d => d.color)
        .attr("stroke-width", 0.1)
        .attr("fill-opacity", 0.5)
        .on("mouseover", (event, d) => {
            tooltip.html(`Comuna: ${d.comuna}<br>Accidentes: ${d.clusterSize}<br>Fallecidos: ${d.FALLECIDOS}<br>Graves: ${d.GRAVES}<br>Menos Graves: ${d.MENOS_GRAVES}<br>Leves: ${d.LEVES}<br>Ilesos: ${d.ILESOS}`)
                .style("opacity", 1)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    // Añadir funcionalidad de zoom con extensión limitada
    const zoom = d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([[0, 0], [width, height]])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
            g.attr("stroke-width", 1 / event.transform.k);
        });

    svg.call(zoom);

    // Añadir leyenda
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 180}, ${height - 90})`);

    legend.append("rect")
        .attr("width", 170)
        .attr("height", 85)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 0.25);

    legend.append("text")
        .attr("x", 7)
        .attr("y", 20)
        .attr("font-weight", "bold")
        .attr("font-size", 15)
        .text("Conteo de Accidentes");

    const legendData = [
        { color: "blue", label: "10-20", radius: intervalSizes['10-20'] },
        { color: "orange", label: "20-30", radius: intervalSizes['20-30'] },
        { color: "red", label: "30+", radius: intervalSizes['30+'] }
    ];

    legend.selectAll("circle")
        .data(legendData)
        .enter().append("circle")
        .attr("cx", 20)
        .attr("cy", (d, i) => 35 + i * 20)
        .attr("r", d => d.radius)
        .attr("fill", d => d.color);

    legend.selectAll("text.legend")
        .data(legendData)
        .enter().append("text")
        .attr("x", 40)
        .attr("y", (d, i) => 40 + i * 20)
        .attr("class", "legend")
        .attr("fill", "#000")
        .text(d => d.label);
}

// URLs de los datos geográficos y de accidentes
const geoDataUrl = 'data/stgo_urbano.geojson';
const accidentDataUrl = 'data/accidentes_clusters.geojson';

// Cargar datos y crear el mapa
loadGeoData(geoDataUrl, (geoData) => {
    loadAccidentData(accidentDataUrl, (accidentData) => {
        createMap(geoData, accidentData);
    });
});
