const margin = { top: 40, right: 150, bottom: 60, left: 160 };
let lastSelectedColumn = "TIPO"; // Opción por defecto
let previousBars = {}; // Para almacenar posiciones y anchos anteriores

// Crear tooltip vacío con clase "tooltip"
let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("width", 200)
    .style("pointer-events", "none")
    .style("border-radius", "8px")
    .style("padding", "4px")
    .style("position", "absolute");

// Función para extraer categorías y porcentajes
function extract(data, key) {
    // Contar las apariciones de cada categoría
    const counts = d3.rollup(data, v => v.length, d => d.properties[key]);

    // Calcular el total de todas las categorías
    const total = d3.sum(counts.values());

    // Calcular porcentajes usando Array.from y map
    const percentages = Array.from(counts, ([category, count]) => ({
        category: formatCategory(category),
        value: (count / total * 100).toFixed(2),
        count: count // Añadir conteo
    }));

    // Ordenar las categorías alfabéticamente
    percentages.sort((a, b) => d3.ascending(a.category, b.category));

    return percentages;
}

// Función para formatear las categorías largas
function formatCategory(category) {
    const words = category.split(" ");
    if (words.length > 3) {
        return `${words.slice(0, 3).join(" ")}\n${words.slice(3).join(" ")}`;
    }
    return category;
}

// Mapeo de valores a nombres descriptivos
const columnNames = {
    "TIPO": "Tipo de Accidente",
    "CAUSA": "Causa del Accidente",
    "CALZADA": "Tipo de Calzada",
    "TIPO_CALZ": "Material de la Calzada",
    "ESTADO_CAL": "Estado de la Calzada"
};

function createBarChart(data, comunaName) {
    // Limpiar el contenido anterior en el div
    const container = d3.select("#stackedBarChart");
    container.html("");

    // Si no hay datos, retornar
    if (!data || data.length === 0) {
        container.append("p").text("No hay datos de accidentes para la comuna seleccionada.");
        return;
    }

    // Filtrar datos usando la última columna seleccionada
    const dataGroup = {
        key: lastSelectedColumn,
        values: extract(data, lastSelectedColumn)
    };

    // Configurar dimensiones y márgenes
    const containerWidth = parseInt(d3.select("#stackedBarChart").style("width"));
    const containerHeight = parseInt(d3.select("#stackedBarChart").style("height"));
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Crear un contenedor SVG dentro del div container
    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Añadir título dinámico al gráfico de barras
    const columnName = columnNames[lastSelectedColumn] || lastSelectedColumn;
    const title = comunaName ? `Accidentes en ${comunaName} - ${columnName}` : `Accidentes - ${columnName}`;
    svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .text(title);

    // Crear una escala lineal para el eje X
    const x = d3.scaleLinear()
        .domain([0, d3.max(dataGroup.values, d => +d.value)])
        .range([0, width]);

    // Crear una escala para el eje Y
    const y = d3.scaleBand()
        .range([0, height])
        .domain(dataGroup.values.map(d => d.category))
        .padding(0.1);

    // Crear las barras usando join con transiciones
    const bars = svg.selectAll(".bar")
        .data(dataGroup.values, d => d.category)
        .join(
            enter => enter.append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("y", d => y(d.category))
                .attr("width", d => previousBars[d.category] ? previousBars[d.category].width : 0)
                .attr("height", y.bandwidth())
                .attr("fill", "#69b3a2")
                .on("mouseover", (event, d) => {
                    showTooltip(event, d);
                })
                .on("mouseout", () => {
                    hideTooltip();
                })
                .call(enter => enter.transition()
                    .duration(1000)
                    .attr("width", d => Math.max(x(+d.value), 1))),
            update => update.call(update => update.transition()
                .duration(1000)
                .attr("width", d => Math.max(x(+d.value), 1))
                .attr("y", d => y(d.category))),
            exit => exit.call(exit => exit.transition()
                .duration(1000)
                .attr("width", 0)
                .remove())
        );

    // Guardar las posiciones y anchos actuales
    bars.each(function(d) {
        previousBars[d.category] = {
            width: Math.max(x(+d.value), 1)
        };
    });

    // Añadir el eje X
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("fill", "black");

    // Añadir título al eje X
    svg.append("text")
        .attr("class", "title-x")
        .attr("text-anchor", "end")
        .attr("x", width / 3 + margin.left - 20)
        .attr("y", height + margin.bottom - 10)
        .attr("fill", "black")
        .text("Porcentaje (%)");

    // Añadir el eje Y
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("fill", "black")
        .style("white-space", "pre");

    // Añadir etiquetas de porcentaje al lado de cada barra usando join con transiciones
    svg.selectAll(".label")
        .data(dataGroup.values)
        .join(
            enter => enter.append("text")
                .attr("class", "label")
                .attr("x", d => previousBars[d.category] ? previousBars[d.category].width + 5 : 5)
                .attr("y", d => y(d.category) + y.bandwidth() / 2)
                .attr("dy", ".35em")
                .attr("fill", "black")
                .style("opacity", 0)
                .text(d => `${d.value}%`)
                .on("mouseover", (event, d) => {
                    showTooltip(event, d);
                })
                .on("mouseout", () => {
                    hideTooltip();
                })
                .call(enter => enter.transition()
                    .duration(2000)
                    .attr("x", d => Math.max(x(+d.value) + 5, 5))
                    .style("opacity", 1)),
            update => update.call(update => update.transition()
                .duration(2000)
                .attr("x", d => Math.max(x(+d.value) + 5, 5))
                .attr("y", d => y(d.category) + y.bandwidth() / 2)
                .style("opacity", 1)),
            exit => exit.call(exit => exit.transition()
                .duration(2000)
                .style("opacity", 0)
                .remove())
        );
}

// Función para mostrar tooltip
function showTooltip(event, d) {
    tooltip
        .html(`Categoría: ${d.category.replace(/\n/g, " ")}<br>Valor: ${d.value}%<br>Conteo: ${d.count}`)
        .style("opacity", 1)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
}

// Función para ocultar tooltip
function hideTooltip() {
    tooltip.style("opacity", 0);
}

// Evento del botón para filtrar datos
d3.select("#filter-button").on("click", filterData);

// Función para filtrar datos y actualizar el gráfico
function filterData() {
    // Actualizar la última columna seleccionada
    lastSelectedColumn = d3.select("#columnSelect").property("value");

    // Verificar si hay una comuna seleccionada
    if (selectedComuna) {
        const selectedComunaData = selectedComuna.data()[0];
        d3.json('data/accidentes_clusters.geojson').then(data => {
            const filteredAccidents = data.features.filter(accident => {
                const codCom = String(accident.properties.COD_COM);
                const cutCom = String(selectedComunaData.properties.CUT_COM);
                return codCom === cutCom;
            });
            createBarChart(filteredAccidents, selectedComunaData.properties.COMUNA);
        });
    } else {
        // Cargar datos y crear el gráfico con la columna seleccionada para todos los datos
        d3.json('data/accidentes_clusters.geojson').then(data => {
            createBarChart(data.features, "todas las comunas");
        });
    }
}

// Cargar datos iniciales y seleccionar la primera opción por defecto
d3.json('data/accidentes_clusters.geojson').then(data => {
    createBarChart(data.features, "todas las comunas");
});
