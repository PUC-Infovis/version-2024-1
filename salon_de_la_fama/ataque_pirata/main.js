
const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");

const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 700;

const WIDTH_VIS_2 = 1000;
const HEIGHT_VIS_2 = 500;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);

const MARGINS = {
  TOP: 20,
  RIGHT: 50,
  BOTTOM: 20,
  LEFT: 50
};

const contenedorMapa = SVG1
  .append("g")
  .attr("id", "contenedorMapa")
  .attr("transform", `translate(${MARGINS.LEFT} ${MARGINS.TOP})`);

const contenedorPuntos = SVG1
  .append("g")
  .attr("id", "contenedorPuntos")
  .attr("transform", `translate(${MARGINS.LEFT} ${MARGINS.TOP})`);

const height_vis_1 = HEIGHT_VIS_1 - MARGINS.TOP - MARGINS.BOTTOM;
const width_vis_1 = WIDTH_VIS_1 - MARGINS.LEFT - MARGINS.RIGHT;

const contenedorVis2 = SVG2
  .append("g")
  .attr("transform", `translate(${MARGINS.LEFT}, ${MARGINS.TOP})`);

const contenedorBarras = SVG2
  .append("g")
  .attr("id", "contenedorBarras")
  .attr("transform", `translate(${MARGINS.LEFT} ${MARGINS.TOP})`);

const height_vis_2 = HEIGHT_VIS_2 - MARGINS.TOP - MARGINS.BOTTOM;
const width_vis_2 = WIDTH_VIS_2 - MARGINS.LEFT - MARGINS.RIGHT;

const contenedorEjeX = contenedorVis2
  .append("g")
  .attr("id", "ejeX")
  .attr("transform", `translate(0, ${height_vis_2})`);

const contenedorEjeY = contenedorVis2
  .append("g")
  .attr("id", "ejeY")
  .attr("transform", `translate(-15, 0)`);

d3.json("data/countries.geojson").then((datosMapa) => {
  d3.csv("data/pirate_attacks_processed.csv", d3.autoType).then((datosAtaques) => {
    crearVis2(datosMapa, datosAtaques, "All Regions");
  });
});

d3.select("#region").on("change", (_) => {
  let region = document.getElementById("region").selectedOptions[0].value;
  d3.json("data/countries.geojson").then((datosMapa) => {
    d3.csv("data/pirate_attacks_processed.csv", d3.autoType).then((datosAtaques) => {
      crearVis2(datosMapa, datosAtaques, region);
    });
  });
});

function crearVis2(datosMapa, dataset, region) {

  let bar_tooltip = d3.select("body").append("div")
    .style("opacity", 0)
    .style("width", 300)
    .style("height", 100)
    .style("pointer-events", "none")
    .style("background", "#006994")
    .style("border-radius", "8px")
    .style("padding", "4px")
    .style("position", "absolute");
    
  let texto = `Región: ${region}`;
  d3.selectAll("#selected").text(texto);

  let añosIniciales = new Set();
  const formatDate = d3.timeFormat("%Y");
  dataset.forEach(d => d.year = new Set([formatDate(d.date)]));
  dataset.forEach(d => añosIniciales.add(formatDate(d.date)));

  let datos = dataset.filter(d => {

    if (region == "East Asia & Pacific") {
      return d.region == "East Asia & Pacific";
    }
    else if (region == "Europe & Central Asia") {
      return d.region == "Europe & Central Asia";
    }
    else if (region == "Latin America & Caribbean") {
      return d.region == "Latin America & Caribbean";
    }
    else if (region == "Middle East & North Africa") {
      return d.region == "Middle East & North Africa";
    }
    else if (region == "North America") {
      return d.region == "North America";
    }
    else if (region == "South Asia") {
      return d.region == "South Asia";
    }
    else if (region == "Sub-Saharan Africa") {
      return d.region == "Sub-Saharan Africa";
    }
    else if (region == "All Regions") {
      return true;
    }

  })

  // Creamos los datos para la Vis2 https://stackoverflow.com/questions/38296484/count-text-fields-from-csv-dataset-in-d3-js

  var countObj = {};

  datos.forEach(d => {
    var year = formatDate(d.date);
    if(countObj[year] === undefined) {
        countObj[year] = 1;
    } else {
        countObj[year] = countObj[year] + 1;
    }
  });

  var datosVis2 = Object.entries(countObj);
   
  datosVis2 = datosVis2.map(d => {
    return {"year": d[0], "frequency" : d[1], "selected": false};
  });

  let years = new Set();
  datosVis2.forEach(d => years.add(d.year));

  const maxY = 1.1 * d3.max(datosVis2, d => d.frequency);
  const minY = 0.9 * d3.min(datosVis2, d => d.frequency);

  const escalaY = d3
    .scaleLinear()
    .domain([minY, maxY])
    .range([0, height_vis_2]);

  const escalaX = d3
    .scaleBand()
    .domain(datosVis2.map(d => d.year))
    .range([0, width_vis_2])
    .paddingInner(0.3);

  const escalaYPos = d3
    .scaleLinear()
    .domain([minY, maxY])
    .range([height_vis_2, 0]);
    
  const ejeX = d3.axisBottom(escalaX);
  const ejeY = d3.axisLeft(escalaYPos);

  contenedorEjeX
    .transition("actualizar_eje_x")
    .duration(2000)
    .call(ejeX);

  contenedorEjeY
    .transition("actualizar_eje_y")
    .duration(2000)
    .call(ejeY);

  rectangulos = barrasVis2(datosVis2, escalaX, escalaY);

  const brush = d3.brushX()
    .extent([[0, 0], [width_vis_2, height_vis_2]])
    .on("start", getSelected)
    .on("brush", brushed)
    .on("end", clearBrush)

  let añosSeleccionados = new Set();
  function getSelected() {
    let seleccionados = datosVis2.filter(d => d.selected)
    añosSeleccionados = new Set(seleccionados.map(d => d.year));
    return
  }

  contenedorVis2.append("g").call(brush);

  const yearsPosition = datosVis2.map(d => [d.year, escalaX(d.year)]);

  function brushed(event) {
    
    selection = event.selection

    shiftKey = event.sourceEvent && event.sourceEvent.shiftKey

    if (!selection) return;

    const leftPos = selection[0];
    const rightPos = selection[1];

    filteredYears = yearsPosition.filter(d => {

      const position = d[1];

      if (position + escalaX.bandwidth() < leftPos) {
        return false;
      }

      if (position > rightPos) {
        return false;
      }

      return true;
    })

    selected_brush_years = new Set(filteredYears.map(d => d[0]));

    if (shiftKey) {
      datosVis2.map(d => {
      
        if (selected_brush_years.has(d.year)) {
          d.selected = !añosSeleccionados.has(d.year)
        }
        else {
          d.selected = añosSeleccionados.has(d.year)
        }
        return d.year;
      })
    }
    else {
      datosVis2.map(d => d.selected = selected_brush_years.has(d.year));
    }

    barrasVis2(datosVis2, escalaX, escalaY);
  }

  function clearBrush(event) {
    
    if (!event.sourceEvent) return;
    
    brush.clear(d3.select(this), null);
    crearMapa(datosMapa, datos, añosSeleccionados);
  }

  crearMapa(datosMapa, datos, añosIniciales);

  contenedorBarras.selectAll(".bar")
    .on("mousemove", (e, d) => {
    let [mx, my] = d3.pointer(e, contenedorBarras.node());
    bar_tooltip
      .html(`Número de ataques: ${d.frequency}`)
      .style("opacity", 1)
      .style("left", `${mx + WIDTH_VIS_2 / 5}px`)
      .style("top", `${my + 2 * HEIGHT_VIS_2 + HEIGHT_VIS_1 - 5 * MARGINS.TOP}px`);
  }).on("mouseout", () => {
    bar_tooltip.style("opacity", 0);
  });
}

function barrasVis2(datosVis2, escalaX, escalaY) {

  const rectangulos = contenedorBarras
    .selectAll(".bar")
    .data(datosVis2, d => d.year)
    .join(

      enter => 

        enter
          .append("rect")
          .attr("class", "bar")
          .transition("crear_barras")
          .duration(2000)
          .attr("width", escalaX.bandwidth())
          .attr("height", d => escalaY(d.frequency))
          .attr("x", d => escalaX(d.year))
          .attr("y", d => escalaY(escalaY.domain()[1] - d.frequency + escalaY.domain()[0]))
          .attr("fill", "#ff966b")
      ,

      update => {

        update
          .transition("actualizar_barras")
          .duration(2000)
          .attr("width", escalaX.bandwidth())
          .attr("height", d => escalaY(d.frequency))
          .attr("x", d => escalaX(d.year))
          .attr("y", d => escalaY(escalaY.domain()[1] - d.frequency + escalaY.domain()[0]))
          .attr("fill", d => d.selected ? 'red' : '#ff966b');

        return update;

    },
      
    exit => {

      exit
        .transition("eliminar_barras")
        .duration(2000)
        .attr("height", 0)
        .remove()

        return exit;
    }
  )

  return rectangulos;
}

function crearMapa(datosMapa, datosAtaques, añosIniciales) {

  let point_tooltip = d3.select("body").append("div")
    .style("opacity", 0)
    .style("width", 300)
    .style("height", 100)
    .style("pointer-events", "none")
    .style("background", "#006994")
    .style("border-radius", "8px")
    .style("padding", "4px")
    .style("position", "absolute");

  datos = datosAtaques.filter(d => !d.year.isDisjointFrom(añosIniciales));

  const proyeccion = d3.geoWinkel3()
    .fitSize([width_vis_1, height_vis_1], datosMapa);
  
  const caminosGeo = d3.geoPath().projection(proyeccion);
  
  contenedorMapa
    .selectAll("path")
    .data(datosMapa.features)
    .join("path")
    .attr("d", caminosGeo)
    .attr("fill", "#ff966b")

  crearPuntos(datos, proyeccion);

  const manejadorZoom = (evento) => {
    const transformacion = evento.transform;
    contenedorMapa.attr("transform", transformacion);
    contenedorPuntos.attr("transform", transformacion);
  };

  const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .extent([[0, 0], [WIDTH_VIS_1, HEIGHT_VIS_1]])
    .translateExtent([[0, 0], [WIDTH_VIS_1, HEIGHT_VIS_1]])
    .on("zoom", manejadorZoom)

  SVG1.call(zoom);

  contenedorPuntos.selectAll(".point")
    .on("mousemove", (e, d) => {
    let [mx, my] = d3.pointer(e, contenedorPuntos.node());
    point_tooltip
      .html(`Tipo de ataque: ${d.attack_type}<br>Nombre de la embarcación: ${d.vessel_name}<br>Estado de la embarcación: ${d.vessel_status}<br>`)
      .style("opacity", 1)
      .style("left", `${mx + WIDTH_VIS_1 / 8.5}px`)
      .style("top", `${my + HEIGHT_VIS_1 - 13 * MARGINS.TOP}px`);
  }).on("mouseout", () => {
    point_tooltip.style("opacity", 0);
  });
}

function crearPuntos(datosAtaques, proyeccion) {
    
  contenedorPuntos
    .selectAll(".point")
    .data(datosAtaques, d => d.id)
    .join(

      enter => {

        const puntos = enter.append("circle").attr("class", "point");

        puntos
          .transition("crear_puntos")
          .duration(2000)
          .attr("cx", d => proyeccion([d.longitude, d.latitude])[0])
          .attr("cy", d => proyeccion([d.longitude, d.latitude])[1])
          .attr("r", 0.5)
          .attr("fill", "red");
  
        return puntos;
      },

      update => {

        update
          .transition("actualizar_puntos")
          .duration(2000)
          .attr("cx", d => proyeccion([d.longitude, d.latitude])[0])
          .attr("cy", d => proyeccion([d.longitude, d.latitude])[1])

        return update;
      },
        
      exit => {

        exit
          .transition("eliminar_puntos")
          .duration(2000)
          .attr("r", 0)
          .remove()

        return exit;  
      }
    )
}

try {
    const audio = new Audio('seashanty2.mp3');
    audio.volume = 0.3;
    audio.loop = true;
    let playAudio = false;
    if (playAudio) {
        audio.play();
        d3.select("#sound").text("OFF Music 🎵");
    }
    d3.select("#sound").on("click", _ => {
        playAudio = !playAudio;
        if (playAudio) {
            audio.play();
            d3.select("#sound").text("OFF Music 🎵");
        }
        else {
            audio.pause();
            d3.select("#sound").text("ON Music 🎵");
        }
    })
} catch (error) { };
