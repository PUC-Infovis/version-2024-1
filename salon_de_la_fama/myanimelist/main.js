const DATASET_PATH = "myanimelist.csv";

const SVG1 = d3.select("#circular-packing-chart").append("svg");
const SVG2 = d3.select("#scatter-plot").append("svg");

d3.select("#start-year-selector").on("change", (_) => createOrUpdateYearDependentCharts());
d3.select("#end-year-selector").on("change", (_) => createOrUpdateYearDependentCharts());

let currentSelectedGenre = null;
let currentSelectedType = null;
let currentSelectedRating = null;

const WIDTH_VIS_1 = 925;
const HEIGHT_VIS_1 = WIDTH_VIS_1;

const WIDTH_VIS_2 = 1400;
const HEIGHT_VIS_2 = 600;

const MARGIN_VIS_2 = {
  top: 10,
  bottom: 110,
  right: 15,
  left: 100,
};

// =============================================
// Creamos los elementos principales de la vis 1
// =============================================

SVG1.attr("viewBox", `-${WIDTH_VIS_1 / 2} -${HEIGHT_VIS_1 / 2} ${WIDTH_VIS_1} ${HEIGHT_VIS_1}`)
  .attr("width", WIDTH_VIS_1)
  .attr("height", HEIGHT_VIS_1)

// =============================================
// Creamos los elementos principales de la vis 2
// =============================================
// Leyenda de la primera visualización
const vis2Legend = d3.select("#scatter-plot-title");

SVG2.attr("width", WIDTH_VIS_2 + MARGIN_VIS_2.left + MARGIN_VIS_2.right)
  .attr("height", HEIGHT_VIS_2 + MARGIN_VIS_2.top + MARGIN_VIS_2.bottom)

// Creamos los títulos de cada eje
const YAxisTitleVis2 = SVG2
  .append("text")
  .text("Puntuación en MyAnimeList")
  .style("font", "bold 28px sans-serif")
  .attr("dominant-baseline", "text-before-edge")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(270)")
  .attr("font-weight", "bold")
  .attr('x', -HEIGHT_VIS_2 / 2)
  .attr("opacity", 0)

const XAxisTitleVis2 = SVG2
  .append("text")
  .text("Año de lanzamiento")
  .style("font", "bold 28px sans-serif")
  .attr('y', HEIGHT_VIS_2 + MARGIN_VIS_2.bottom)
  .attr('x', WIDTH_VIS_2 / 2)
  .attr("font-weight", "bold")
  .attr("dominant-baseline", "text-after-edge")
  .attr("opacity", 0)

// Se agregan los contenedores para los ejes
const YAxisContainerVis2 = SVG2
  .append("g")
  .attr("transform", `translate(${MARGIN_VIS_2.left}, ${MARGIN_VIS_2.top})`)

const XAxisContainerVis2 = SVG2
  .append("g")
  .attr("transform", `translate(${MARGIN_VIS_2.left}, ${HEIGHT_VIS_2 + MARGIN_VIS_2.top})`)

const pointsContainer = SVG2
  .append("g")
  .attr("transform", `translate(${MARGIN_VIS_2.left} ${MARGIN_VIS_2.top})`)
  .attr("clip-path", "url(#clip)");

// Definimos el clipPath de la segunda visualización
SVG2
  .append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", WIDTH_VIS_2)
  .attr("height", HEIGHT_VIS_2);

////////////////////////////////////////////
////    FUNCIÓN PRINCIPAL A EJECUTAR    ////
////////////////////////////////////////////
createCircularPacking();

// La siguiente función se encarga de crear el circle packing chart
function createCircularPacking() {
  // Se carga y transforma el dataset para luego crear el circle packing chart
  d3.csv(DATASET_PATH).then(data => {
    // Se carga el archivo genres.csv para obtener los géneros
    d3.csv("genres.csv").then(genres => {
      const hierarchicalData = buildHierarchy(data, genres.columns);
      return { hierarchicalData, data };
    }).then(({ hierarchicalData, data }) => {
      const maxScore = d3.max(data, d => d.MAL_Score);
      const quantile = d3.quantile(data.map(d => d.MAL_Score).sort(d3.ascending), 0.35);

      // Escala para definir el color de los nodos
      const color = d3.scaleSequentialLog(d3.interpolateYlOrRd)
        .domain([quantile, maxScore]);

      // Función para crear el pack layout
      const pack = data => d3.pack()
          .size([WIDTH_VIS_1, HEIGHT_VIS_1])
          .padding(3)
        (d3.hierarchy(data)
          .sum(d => d.anime_count)
          .sort((a, b) => b.anime_count - a.anime_count));
      
      const root = pack(hierarchicalData);

      const node = SVG1.append("g")
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .join("circle")
        .attr("fill", d => color(d.data.avg_score))
        .attr("stroke", "grey")
        .attr("stroke-width", 0.5)
        .on("mouseover", function () { 
          d3.select(this).attr("stroke-width", 1.5);
        })
        .on("mouseout", function () { 
          d3.select(this).attr("stroke-width", 0.5);
        })
        .on("click", (event, d) => {
          currentSelectedGenre = d.data.genre;
          currentSelectedType = d.data.type;
          currentSelectedRating = d.data.rating;
          updateYearSelectors();
          createOrUpdateYearDependentCharts();
          // Consideración: Se resetea el zoom cuando se selecciona un nodo de máxima profundidad
          if (!d.data.rating)
            zoom(event, d), event.stopPropagation();
        });

      const label = SVG1.append("g")
        .style("font", "bold 26px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => d.data.name);

      SVG1.on("click", (event) => zoom(event, root));
      let focus = root;
      let view;
      zoomTo([focus.x, focus.y, focus.r * 2]);

      function zoomTo(v) {
        const k = WIDTH_VIS_1 / v[2];

        view = v;

        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
      }

      function zoom(event, d) {
        const focus0 = focus;

        focus = d;

        const transition = SVG1.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", d => {
              const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
              return t => zoomTo(i(t));
            });

        label
          .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
          .transition(transition)
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }

      return SVG1.node();
    });
  });
}

// La siguiente función se encarga de transformar el dataset en una jerarquía compatible con d3.pack
// Esto solo es un proceso de transformación de datos, no se encarga de la visualización, por lo que
// el uso de loops es válido según el enunciado
function buildHierarchy(dataset, genres) {
  let hierarchy = { name: "root", children: [] };

  dataset.forEach(item => {
    if (parseFloat(item.MAL_Score) > 0) {
      let currentLevel = hierarchy;
      
      genres.forEach(genre => {
        if (item[genre] === "1") {
          let genreNode = currentLevel.children.find(child => child.name === genre);
          if (!genreNode) {
            genreNode = { name: genre, genre: genre, children: [] };
            currentLevel.children.push(genreNode);
          }
          currentLevel = genreNode;

          let typeNode = currentLevel.children.find(child => child.name === item.Type);
          if (!typeNode) {
            typeNode = { name: item.Type, genre: genreNode.name, type: item.Type, children: [] };
            currentLevel.children.push(typeNode);
          }
          currentLevel = typeNode;

          let ratingNode = typeNode.children.find(child => child.name === item.Rating);
          if (!ratingNode) {
            ratingNode = { name: item.Rating, genre: genreNode.name, type: typeNode.name, rating: item.Rating, anime_count: 0, total_score: 0 };
            typeNode.children.push(ratingNode);
          }
          ratingNode.anime_count += 1; // Se incrementa la cantidad de animes en la categoría
          ratingNode.total_score += parseFloat(item.MAL_Score); // Se suma el MAL_Score para luego calcular el promedio

          currentLevel = hierarchy;
        }
      });
    }
  });

  // La siguiente función se encarga de calcular el promedio de MAL_Score para cada nodo
  function calculateAverage(node) {
    if (node.children) {
      node.children.forEach(calculateAverage);
      node.anime_count = d3.sum(node.children, d => d.anime_count);
      node.total_score = d3.sum(node.children, d => d.total_score);
      node.avg_score = node.anime_count === 0 ? 0 : node.total_score / node.anime_count;
    } else {
      node.avg_score = node.anime_count === 0 ? 0 : node.total_score / node.anime_count;
    }
  }

  calculateAverage(hierarchy);

  return (hierarchy);
}

function updateYearSelectors() {
  d3.csv(DATASET_PATH).then(data => {
    // Se eliminan todas las opciones existentes en los selectores
    const yearSelectors = d3.selectAll('.year-selector');
    yearSelectors.selectAll('option').remove();
    // Filtrar los datos según la (sub)categoría seleccionada
    const filteredData = filterDataByCategory(data);
    // Se obtiene el rango de años
    const [minYear, maxYear] = d3.extent(filteredData, d => +d.Year);
    const years = d3.range(minYear, maxYear + 1);
    // Añadir nuevas opciones a los selectores
    d3.select('#start-year-selector').selectAll('option')
      .data(years)
      .enter()
      .append('option')
      .attr('value', year => parseInt(year))
      .text(year => year);
    d3.select('#end-year-selector').selectAll('option')
      .data(years.slice().reverse())
      .enter()
      .append('option')
      .attr('value', year => parseInt(year))
      .text(year => year);
  });
}

async function createOrUpdateYearDependentCharts() {
  // Timer para esperar a que los selectores de año se actualicen
  await new Promise(resolve => { setTimeout(resolve, 500) });

  const startYear = parseInt(d3.select('#start-year-selector').property('value'));
  const endYear = parseInt(d3.select('#end-year-selector').property('value'));
  if (endYear >= startYear) {
    createOrUpdateScatterPlot(startYear, endYear);
  }
}

// La siguiente función se encarga de crear un gráfico de dispersión
function createOrUpdateScatterPlot(startYear, endYear) {
  // Se actualiza el título de la visualización
  vis2Legend.text("(Sub)Categoría seleccionada: ");
  if (currentSelectedGenre) vis2Legend.text(vis2Legend.text() + currentSelectedGenre);
  if (currentSelectedType) vis2Legend.text(vis2Legend.text() + " 🠖 " + currentSelectedType);
  if (currentSelectedRating) vis2Legend.text(vis2Legend.text() + " 🠖 " + currentSelectedRating);

  // Crear tooltip vacío con clase "tooltip"
  let tooltip = d3.select("body").append("div")
    .style("opacity", 0)
    .style("width", 200)
    .style("height", 50)
    .style("pointer-events", "none")
    .style("background", "rgb(117, 168, 234)")
    .style("border-radius", "8px")
    .style("padding", "4px")
    .style("position", "absolute");

  d3.csv(DATASET_PATH).then(data => {
    // Filtrar los datos según la (sub)categoría seleccionada y luego por los años seleccionados
    let filteredData = filterDataByCategory(data);
    filteredData = filteredData.filter(item => parseInt(item.Year) >= startYear && parseInt(item.Year) <= endYear);

    // Se obtiene el rango de años
    const years = d3.range(startYear, endYear + 1, 1);

    // Como los valores estadísticos de los MAL_Score siempre van de 0 a 10 se pueden hardcodear
    const minValueY = 0
    const maxValueY = 10
    
    // Creamos las escalas
    const XScale = d3.scaleBand()
      .domain(years.map(String))
      .range([0, WIDTH_VIS_2])
      .padding(0.5);
    
    const YScale = d3.scaleLinear()
      .domain([minValueY, maxValueY])
      .range([HEIGHT_VIS_2, 0]);

      const pointsColorScale = d3.scaleOrdinal([ "#006d77", "green", "red"])
      .domain(["default", "enter", "exit"])


    // Crear los ejes que usan las escalas definidas anteriormente
    const YAxis = d3.axisLeft(YScale);
    const XAxis = d3.axisBottom(XScale);

    XAxisTitleVis2.transition().duration(500).attr("opacity", 1);
    YAxisTitleVis2.transition().duration(500).attr("opacity", 1);

    XAxisContainerVis2.transition().duration(500).call(XAxis);
    YAxisContainerVis2.transition().duration(500).call(YAxis);

    // Rotar las etiquetas del eje X para que estén en vertical
    XAxisContainerVis2.selectAll("text")
      .style("font", "bold 16px sans-serif")
      .style("letter-spacing", "2px")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "-0.5em");

    YAxisContainerVis2.selectAll("text")
      .style("font", "bold 22px sans-serif")

    // Se agregan los puntos al gráfico
    const points = pointsContainer
      .selectAll("circle")
      .attr("class", "character")
      .data(filteredData)
      .join(
        enter => {
          const circle = enter
            .append("circle")
            .attr("class", "displayed")
            .attr("cx", (d) => XScale(d.Year) + XScale.bandwidth() / 2)
            .attr("cy", (d) => YScale(d.MAL_Score))
            .attr("r", 0)
            .attr("fill", pointsColorScale("enter"))
          
          circle
            .transition()
            .duration(500)
            .attr("r", 6)

          circle
            .transition()
            .delay(750)
            .duration(500)
            .attr("fill", pointsColorScale("default"))

          // Se agregan los eventos de mouse para mostrar un tooltip
          circle.on("mouseenter", (_, data) => {
            tooltip
              .html(`MAL ID: ${data.MAL_ID}<br>Nombre: ${data.Name}<br>Puntuación en MyAnimeList: ${data.MAL_Score}<br>Año: ${data.Year}<br>
                    Tipo: ${data.Type}<br>N° de capítulos: ${data.Episodes}<br>`)
              .style("left", (_.pageX + 10) + "px")
              .style("top", (_.pageY - 28) + "px")
              .style("opacity", 1);
          })
          .on("mouseleave", (_, data) => {
              // cuando el mouse sale del círculo desaparece tooltip
              tooltip.style("opacity", 0);
          })

          return circle
        },
        update => {
          update
            .transition()
            .duration(500)
            .attr("cx", (d) => XScale(d.Year) + XScale.bandwidth() / 2)
            .attr("cy", (d) => YScale(d.MAL_Score))
            .attr("fill", pointsColorScale("default"))

          return update
        },
        exit => {
          // Se cambia la clase para que luego el selectAll("circle) no seleccione los puntos eliminados
          exit.attr("class", "delete")
          exit
            .transition()
            .duration(500)
            .attr("fill", pointsColorScale("exit"))
            .attr("r", 0)
          exit.transition("delete").delay(500).remove()
          
          return exit
        }
      );

    // Crear la función que se encarga cuando se llama el zoom
    const zoomHandler = ({ transform }) => {
      // Crear nuevas escalas según la transformación
      const YScale_V2 = transform.rescaleY(YScale);

      // Actualizar posición de los elementos reubicándolos con la escala
      points.attr("cy", d => YScale_V2(d.MAL_Score));

      // Actualizar las escalas a los ejes visualizados
      YAxisContainerVis2.call(YAxis.scale(YScale_V2));
      YAxisContainerVis2.selectAll("text")
      .style("font", "bold 22px sans-serif")
    };

    // Crear objeto zoom
    const zoom = d3.zoom()
      .scaleExtent([1, 50])
      .extent([[0, 0], [WIDTH_VIS_2, HEIGHT_VIS_2]])
      .translateExtent([[0, 0], [WIDTH_VIS_2, HEIGHT_VIS_2]])
      .on("zoom", zoomHandler);

    // Conectar el objeto zoom con el SVG
    SVG2.call(zoom);
  });
}

// La siguiente función se encarga de filtrar los datos según la categoría seleccionada en el circle packing chart
function filterDataByCategory(data) {
  // Primero se filtran los datos que tengan MAL_Score mayor a 0
  let filteredData = data.filter(item => parseFloat(item.MAL_Score) > 0);

  if (currentSelectedGenre)
    filteredData = filteredData.filter(item => item[currentSelectedGenre] === "1");
  if (currentSelectedType)
    filteredData = filteredData.filter(item => item.Type === currentSelectedType);
  if (currentSelectedRating)
    filteredData = filteredData.filter(item => item.Rating === currentSelectedRating);

  return filteredData;
}
