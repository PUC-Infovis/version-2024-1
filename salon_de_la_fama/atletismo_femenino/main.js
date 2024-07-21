const WIDTH_1 = 1000;
const HEIGHT_1 = 700;
const MARGIN_1 = {
  top: 70,
  bottom: 30,
  right: 10,
  left: 50,
};

const HEIGHTVIS_1 = HEIGHT_1 - MARGIN_1.top - MARGIN_1.bottom;
const WIDTHVIS_1 = WIDTH_1 - MARGIN_1.right - MARGIN_1.left;

const WIDTH_2 = 1000;
const HEIGHT_2 = 700;
const MARGIN_2 = {
  top: 70,
  bottom: 60,
  right: 10,
  left: 80,
};

const HEIGHTVIS_2 = HEIGHT_2 - MARGIN_2.top - MARGIN_2.bottom;
const WIDTHVIS_2 = WIDTH_2 - MARGIN_2.right - MARGIN_2.left;

const SVG2 = d3.select("#vis-2")
  .append("svg")
  .attr("width", WIDTH_2)
  .attr("height", HEIGHT_2)
  .style("border", "1px solid black");

let tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("padding", "10px")
  .style("background", "white")
  .style("border", "1px solid #000")
  .style("border-radius", "5px")
  .style("pointer-events", "none");





const SVG1 = d3.select("#vis-1")
  .append("svg")
  .attr("width", WIDTH_1)
  .attr("height", HEIGHT_1)
  .style("border", "1px solid black");

const contenedor = SVG2
  .append("g")
  .attr("transform", `translate(${MARGIN_2.left}, ${MARGIN_2.top})`);












d3.csv("data.csv").then(data => {
  const pruebas = Array.from(new Set(data.map(d => d.prueba)));
  pruebas.unshift("Todas")
  const select = d3.select("#prueba-select");
  select.selectAll("option")
    .data(pruebas)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  let selectedPrueba = "Todas"
  crearMapa(selectedPrueba);

  select.on("change", function () {
    selectedPrueba = d3.select(this).property("value");
    crearPodios(selectedPrueba);
    crearMapa(selectedPrueba);
  });

});























function crearPodios(selectedPrueba) {
  d3.csv("data.csv").then(data => {
    const groupedData = d3.group(data, d => d.prueba, d => d.juegos);
    const data_podios = groupedData.get(selectedPrueba);

    const tiempos = [];
    const tiempos_parseados = [];

    function parseTime(time) {
      const [horas, minutos, segundos] = time.split(":");
      const [segundos2, milisegundos] = segundos.split(".");
      if (horas == 0) {
        return (parseInt(minutos) * 60000 + parseInt(segundos2) * 1000 + parseInt(milisegundos) * 10);
      } else {
        return (parseInt(horas) * 3600 + parseInt(minutos) * 60 + parseInt(segundos));
      }
    }

    function parseTimeInv(time) {
      if (selectedPrueba != "Maratón") {
        let minutos = Math.floor(time / 60000);
        let segundos = Math.floor((time - minutos * 60000) / 1000);
        let milisegundos = Math.floor((time - minutos * 60000 - segundos * 1000) / 10);
        if (segundos < 10) {
          segundos = "0" + segundos;
        }
        if (milisegundos == 0) {
          return (minutos + ":" + segundos);
        } else {
          milisegundos = milisegundos / 10;
          return (minutos + ":" + segundos + "." + milisegundos);
        }
      } else {
        let horas = Math.floor(time / 3600);
        let minutos = Math.floor((time - horas * 3600) / 60);
        let segundos = Math.floor((time - horas * 3600 - minutos * 60));
        if (segundos < 10) {
          segundos = "0" + segundos;
        }
        return (horas + ":" + minutos + ":" + segundos);
      }
    }


// ACÁ USO UN LOOP PARA RECORRER LOS DATOS Y HACER UNA TRANSFORMACIÓN DE LOS TIEMPOS!!!!
// no es para crear elementos en la visualización!!!!!!!

    data_podios.forEach(juego => {
      juego.forEach(podio => {
        tiempos.push(podio.tiempo);
        podio.tiempos_parseados = parseTime(podio.tiempo);
        tiempos_parseados.push(podio.tiempos_parseados);
      });
    });

    const minTiempo_parseado = d3.min(tiempos_parseados);
    const maxTiempo_parseado = d3.max(tiempos_parseados);

    const escalaTiempos = d3.scaleLinear()
      .domain([0.99 * minTiempo_parseado, 1.01 * maxTiempo_parseado])
      .range([0, HEIGHTVIS_2]);

    const escalaX = d3.scaleBand()
      .domain(Array.from(data_podios.keys()))
      .range([0, WIDTHVIS_2])
      .padding(0.2);

    const subEscalaX = d3.scaleBand()
      .domain([1, 2, 3])
      .range([0, escalaX.bandwidth()])
      .padding(0.05);

    const ejeY = d3.axisLeft(escalaTiempos).tickFormat(d => parseTimeInv(d));






    let title = SVG2.select(".title");
    if (title.empty()) {
      title = SVG2.append("text")
        .attr("class", "title")
        .attr("x", WIDTHVIS_2 / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold");
    }
    title.text("Podios por Juegos Olímpicos - " + selectedPrueba);

    let titleX = SVG2.select(".titleX");
    if (titleX.empty()) {
      titleX = SVG2.append("text")
        .attr("class", "titleX")
        .attr("x", WIDTHVIS_2 / 2 + 70)
        .attr("y", HEIGHTVIS_2 + 120)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
    }
    titleX.text("Juegos Olímpicos");

    let titleY = SVG2.select(".titleY");
    if (titleY.empty()) {
      titleY = SVG2.append("text")
        .attr("class", "titleY")
        .attr("x", -HEIGHTVIS_2 / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "18px")
    }
    titleY.text("Tiempo");

    contenedor.selectAll(".ejeY")
      .data([null])
      .join(
        enter => {
          const eje = enter.append("g")
            .attr("class", "ejeY")
            .attr("transform", `translate(0, ${HEIGHTVIS_2})`)
            .call(ejeY);

            eje.transition().duration(1000).attr("transform", "translate(0, 0)");
            return eje;
        },
        update => {
          update.transition().duration(1000).call(ejeY);
          return update;
        }
      );

    contenedor.selectAll(".ejeX")
      .data([null])
      .join(
        enter => enter.append("g")
          .attr("class", "ejeX")
          .attr("transform", `translate(0, ${HEIGHTVIS_2})`)
          .call(d3.axisBottom(escalaX)),
        update => update.call(d3.axisBottom(escalaX))
      );


      const color = d3.scaleOrdinal()
      .domain([1, 2, 3])
      .range(["gold", "silver", "brown"]);

    let legendContainer = contenedor.select(".legend-container");
    if (legendContainer.empty()) {
      legendContainer = contenedor.append("g")
      .attr("class", "legend-container")
      .attr("transform", `translate(${WIDTHVIS_2 - 120}, 10)`);
    }

    const legend = legendContainer.selectAll(".legend")
      .data(color.domain());

    legend.exit().remove();

    const legendEnter = legend.enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legendEnter.append("rect")
      .attr("x", 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legendEnter.append("text")
      .attr("x", 40)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .text(d => {
      if (d === 1) {
        return "Oro";
      } else if (d === 2) {
        return "Plata";
      } else if (d === 3) {
        return "Bronce";
      }
      });


    const podiosJoin = contenedor.selectAll(".podio")
      .data(Array.from(data_podios.entries()), d => d[0]);

    const podiosEnter = podiosJoin.enter()
      .append("g")
      .attr("class", "podio")
      .attr("transform", d => `translate(${escalaX(d[0])}, 0)`);

    const mergedPodios = podiosEnter.merge(podiosJoin);

    mergedPodios.selectAll("rect")
    .data(d => d[1], d => d.posición)
    .join(
      enter => {
        const rects = enter.append("rect")
          .attr("x", d => subEscalaX(d.posición))
          .attr("fill", d => color(d.posición))
          .attr("width", subEscalaX.bandwidth())
          .attr("y", d => HEIGHTVIS_2)
          .attr("height", d => 0)
          
        rects.transition().duration(1000)
          .attr("y", d => escalaTiempos(d.tiempos_parseados))
          .attr("height", d => HEIGHTVIS_2 - escalaTiempos(d.tiempos_parseados))
          .on("end", () => {
            rects.on("mouseover", function (event, d) {
              d3.selectAll("rect")
                .transition()
                .duration(200)
                .style("opacity", d2 => d2 === d ? 1 : 0.5);
              tooltip.transition()
                .duration(200)
                .style("opacity", .9);
              tooltip.html("Nombre: " + d.nombre + "<br/>" + "País: " + d.país + "<br/>" + "Edad: " + d.edad + "<br/>" + "Tiempo: " + d.tiempo)
                .style("opacity", 1)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
            })
            .on("mousemove", function (event) {
              tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function (event) {
              d3.selectAll("rect")
                .transition()
                .duration(200)
                .style("opacity", 1);
              tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            });
          });
  
        return rects;
      },
      update => update.transition().duration(1000)
        .attr("x", d => subEscalaX(d.posición))
        .attr("y", d => escalaTiempos(d.tiempos_parseados))
        .attr("width", subEscalaX.bandwidth())
        .attr("height", d => HEIGHTVIS_2 - escalaTiempos(d.tiempos_parseados))
        .attr("fill", d => color(d.posición)),
      exit => exit.transition().duration(1000)
        .attr("y", HEIGHTVIS_2)
        .attr("height", 0)
        .remove()
    );
  
    





  });
}





















































function crearMapa(selectedPrueba) {
  d3.json("paises_medium.json").then(data_países => {
    d3.csv("data.csv").then(data_atletas => {
      if (selectedPrueba != "Todas") {
        data_atletas = data_atletas.filter(d => d.prueba === selectedPrueba);
      }

      const groupedData = d3.group(data_atletas, d => d.país);
      const data_mapa = Array.from(groupedData.entries());
      const maxAtletas = d3.max(data_mapa, d => d[1].length);
      const color = d3.scaleSequential(d3.interpolateReds)
        .domain([0, maxAtletas]);

      const projection = d3.geoMercator()
        .fitSize([WIDTHVIS_2, HEIGHTVIS_2], data_países);

      const path = d3.geoPath()
        .projection(projection);

      let title = SVG1.select(".map-title");
      if (title.empty()) {
        title = SVG1.append("text")
          .attr("class", "map-title")
          .attr("x", WIDTHVIS_2 / 2)
          .attr("y", 30)
          .attr("text-anchor", "middle")
          .attr("font-size", "24px")
          .attr("font-weight", "bold");
      }
      title.text("Concentración de atletas por país");

      let mapGroup = SVG1.select(".map-group");
      if (mapGroup.empty()) {
        mapGroup = SVG1.append("g")
          .attr("class", "map-group")
          .attr("transform", "translate(0, 50)");
      }

      const paths = mapGroup.selectAll("path")
        .data(data_países.features, d => d.properties.name_spanish);

      paths.enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .transition()
        .duration(1000)
        .attr("fill", d => {
          const país = data_mapa.find(e => e[0] === d.properties.name_spanish);
          return país ? color(país[1].length) : "white";
        });

      paths.transition()
        .duration(1000)
        .attr("d", path)
        .attr("fill", d => {
          const país = data_mapa.find(e => e[0] === d.properties.name_spanish);
          return país ? color(país[1].length) : "white";
        });

      paths.exit()
        .transition()
        .duration(1000)
        .attr("fill", "white")
        .remove();

      mapGroup.selectAll("path")
        .on("mouseover", function (event, d) {
          const país = data_mapa.find(e => e[0] === d.properties.name_spanish);
          if (país) {
            const atletas = país[1];
            tooltip.transition()
              .duration(200)
              .style("opacity", .9);
            tooltip.html(país[0] + "<br/>" + atletas.map((a, i) => `${i + 1}. ${a.nombre} - ${a.juegos} - ${a.prueba} - ${a.posición}° lugar - ${a.edad} años`).join("<br/>"))
              .style("opacity", 1)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 150) + "px");

              const tooltipHeight = tooltip.node().getBoundingClientRect().height;
              tooltip.style("top", (event.pageY - tooltipHeight/2) + "px");
          }
        })
        .on("mousemove", function (event) {
          const tooltipHeight = tooltip.node().getBoundingClientRect().height;
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - tooltipHeight/2) + "px");
        })
        .on("mouseout", function () {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });

      let legend = SVG1.select(".map-legend");
      if (legend.empty()) {
        legend = SVG1.append("g")
          .attr("class", "map-legend")
          .attr("transform", `translate(30, ${HEIGHT_1 - 150})`);
        
        const legendHeight = 120;
        const gradient = legend.append("defs")
          .append("linearGradient")
          .attr("id", "gradient")
          .attr("x1", "0%")
          .attr("y1", "100%")
          .attr("x2", "0%")
          .attr("y2", "0%");

        gradient.selectAll("stop")
          .data(d3.range(0, 1.01, 0.01))
          .enter().append("stop")
          .attr("offset", d => `${d * 100}%`)
          .attr("stop-color", d => color(d * maxAtletas))
          .attr("stop-opacity", 1);

        legend.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 20)
          .attr("height", legendHeight)
          .style("fill", "url(#gradient)");

        legend.append("text")
          .attr("x", 30)
          .attr("y", 0)
          .attr("dy", "1em")
          .text(maxAtletas);

        legend.append("text")
          .attr("x", 30)
          .attr("y", legendHeight)
          .attr("dy", "-0.2em")
          .text("0");

        legend.append("text")
          .attr("x", 0)
          .attr("y", legendHeight - 150)
          .attr("dy", "1em")
          .text("Número de Atletas");
      } else {
        legend.select("rect")
          .style("fill", "url(#gradient)");

        legend.select("text").text(maxAtletas);
      }

          const zoom = d3.zoom()
          .scaleExtent([1, 8])
          .on("zoom", zoomed);
    
          SVG1.call(zoom);
    
          function zoomed(event) {
            mapGroup.attr("transform", event.transform);
          }
    });
  });
}
