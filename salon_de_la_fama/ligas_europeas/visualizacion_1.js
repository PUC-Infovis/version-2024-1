

//Referencias: ayudantía 6, clase 22
// Constantes
const WIDTH = 1000;
const HEIGHT = 700;
const margin = {
  top: 20,
  right: 50,
  bottom: 20,
  left: 50
};

const width = WIDTH - margin.left - margin.right;
const height = HEIGHT - margin.top - margin.bottom;

// svg
const svg = d3
    .select("#vis-1")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT - 280)
    .attr("viewBox", `0 150 ${WIDTH} 500`)

// Zoom
const manejadorZoom = (evento) => {
  const transformacion = evento.transform;
  Mapcontainer.attr("transform", transformacion);
  Circlescontainer.attr("transform", transformacion);
};

const zoom = d3.zoom()
  .scaleExtent([0.5, 3])
  .on("start", () => console.log("Empecé"))
  .on("zoom", manejadorZoom)
  .on("end", () => console.log("Terminé"));

svg.call(zoom);

// g Mapcontainer
const Mapcontainer = svg
  .append("g")
  .attr("id", "Mapcontainer")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const Legendcontainer = svg
  .append("g")
  .attr("id", "legend")
  .attr("transform", `translate(${-80}, ${150})`);
  
// g Circlescontainer
const Circlescontainer = svg
  .append("g")
  .attr("id", "Circlescontainer")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "rgba(255, 255, 255, 0.8)")
  .style("border", "1px solid #000")
  .style("pointer-events", "none")
  .style("visibility", "hidden");

// Crear mapa
function createMap(datosMapa, datosPartidos, filtrar_dataset = false) {
  // Proyección
  const projection = d3.geoMercator()
    .center([5, 50])
    .scale(840)
    .translate([width / 2, height / 2]);

  if (filtrar_dataset) {
    const grouped = d3.group(datosPartidos, d => d.country_name);    
    const totalMatchesByCountry = Array.from(grouped, ([key, value]) => (
      { country: key, matches: value.length }
    )); 
    const totalGoalsByCountry = Array.from(grouped, ([key, value]) => (
      { country: key, goals: d3.sum(value, d => +d.goal_difference) }
    ));
    const goalsRatioByCountry = totalMatchesByCountry.map(d => {
      const goals = totalGoalsByCountry.find(e => e.country === d.country);
      return { country: d.country, ratio: goals.goals / d.matches }
    });
    const top5Countries = goalsRatioByCountry
      .sort((a, b) => d3.descending(a.ratio, b.ratio))
      .slice(0, 5)
      .map(d => d.country);

    datosPartidosFiltrados = datosPartidos.filter(d =>
      top5Countries.includes(d.country_name)
    );
  } else {
    datosPartidosFiltrados = datosPartidos;
  }

  // Nombre de ligas asociados a país
  const leagueByCountry = new Map(datosPartidosFiltrados.map(d => [d.country_name, d.league_name]));

  // Generador de paths
  const Geopaths = d3.geoPath().projection(projection);

  // Cantidad de partidos por país
  const matchesByCountry = d3.rollup(datosPartidosFiltrados, v => v.length, d => d.country_name);

  // Suma de diferencias de goles por país
  const goalsByCountry = d3.rollup(datosPartidosFiltrados, v => d3.sum(v, d => d.goal_difference), d => d.country_name);

  // Proporción de goles por partido por país
  const proportionByCountry = new Map([...matchesByCountry].map(([country, matches]) => [country,
    (goalsByCountry.get(country) || 0) / matches]));

  const proportions = Array.from(proportionByCountry.values());
  const minProportion = d3.min(proportions);
  const maxProportion = d3.max(proportions);
  const midProportion = (minProportion + maxProportion) / 2;

  // Escalas
  const MagnitudeScale = d3.scaleLog()
    .domain([minProportion, maxProportion])
    .range([12, 30]);

  const ColorScale = d3.scaleDiverging()
    .domain([minProportion, midProportion, maxProportion])
    .interpolator(d3.interpolateRdBu);

  // Dibujar el mapa
  Mapcontainer
    .selectAll("path")
    .data(datosMapa.features)
    .join("path")
    .attr("d", Geopaths)
    .attr("fill", "lightgrey")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  // Dibujar leyenda
  Legendcontainer
    .selectAll("rect")
    .data([minProportion, midProportion, maxProportion])
    .join("rect")
    .attr("x", (d, i) => i * 100)
    .attr("y", 20)
    .attr("width", 100)
    .attr("height", 20)
    .attr("fill", d => ColorScale(d));

  Legendcontainer
    .selectAll("text")
    .data(["Baja", "Media", "Alta"])
    .join("text")
    .attr("x", (d, i) => i * 100)
    .attr("y", 60)
    .text(d => d);  

  Legendcontainer
    .append("text")
    .attr("x", 0)
    .attr("y", 15)
    .text("Proporción de goles por partido")
    .style("font-weight", "bold");

  // Dibujar los círculos
  Circlescontainer
    .selectAll("circle")
    .data(datosMapa.features.filter(d => proportionByCountry.has(d.properties.name_en)), d => d.properties.name_en)
    .join(
      enter => {
        const circles = enter.append("circle");
        circles
          .attr("cx", d => d.properties.centerx + 480)
          .attr("cy", d => d.properties.centery + 290)
          .attr("r", d => {
            const country = d.properties.name_en;
            const proportion = proportionByCountry.get(country) || 0;
            return MagnitudeScale(proportion);
          })
          .attr("fill", d => {
            const country = d.properties.name_en;
            const proportion = proportionByCountry.get(country) || 0;
            return ColorScale(proportion);
          })
          .attr("stroke", "black")
          .attr("stroke-width", 0.5)
          .style("opacity", 0)
          .transition()
          .delay((d, i) => i * 10)
          .duration(1000)
          .style("opacity", 0.7)
          // Tooltip
          .on("end", function(d) {
            d3.select(this)
              .on("mouseover", (event, d) => {
                const country = d.properties.name_en;
                const matches = matchesByCountry.get(country) || 0;
                const goals = goalsByCountry.get(country) || 0;
                tooltip.style("visibility", "visible")
                  .html(`
                    <strong>Country:</strong> ${country}<br>
                    <strong>League:</strong> ${leagueByCountry.get(country)}<br>
                    <strong>Matches:</strong> ${matches}<br>
                    <strong>Goal Difference:</strong> ${goals}
                  `);
              })
              .on("mousemove", (event) => {
                tooltip.style("top", (event.pageY - 10) + "px")
                  .style("left", (event.pageX + 10) + "px");
              })
              .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
              })
              .on("click", (event, d) => { // Realizamos la conexion a vistas coordinadas
                const leagueName = leagueByCountry.get(d.properties.name_en);
                vis1CallingVis2 = true;
                activeConnectionVis1toVis2(leagueName);                  

              })
          });
      },
      update => {
        update
          .transition()
          .duration(1000)
          .attr("cx", d => d.properties.centerx + 480)
          .attr("cy", d => d.properties.centery + 290)
          .attr("r", d => {
            const country = d.properties.name_en;
            const proportion = proportionByCountry.get(country) || 0;
            return MagnitudeScale(proportion);
          })
          .attr("fill", d => {
            const country = d.properties.name_en;
            const proportion = proportionByCountry.get(country) || 0;
            return ColorScale(proportion);
          });
        return update;
      },
      exit => {
        exit.transition()
          .duration(1000)
          .attr("r", 0)
          .remove();
      }
    );
}

d3.json("custom.geo (2).json", d3.autoType).then((mapData) => {
  datosMapa = mapData;
  d3.csv("table_match.csv").then((matchData) => {
    datosPartidos = matchData;
    createMap(datosMapa, datosPartidos);
  });
}).catch(function(error) {
  console.log("Error al cargar el archivo GeoJSON: ", error);
});

// Botón filtro
d3.select("#filter-button").on("click", (event) => {
  createMap(datosMapa, datosPartidos, true);
});

// Botón reset
d3.select("#filter-reset").on("click", (event) => {
  createMap(datosMapa, datosPartidos, false);
});
