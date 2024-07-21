const csvCanciones = './Surprise_Songs_Eras_Tour_2023.csv';

const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");

const WIDTH_VIS_1 = 800;
const HEIGHT_VIS_1 = 500;

const WIDTH_VIS_2 = 800;
const HEIGHT_VIS_2 = 600;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);


Slider();

function Slider(){

    d3.csv(csvCanciones, d3.autoType).then(fechas => {
    console.log(solofechas = fechas.map(d => d.Fecha_primera_presentacion))
    const fechasFiltradas = solofechas.filter(d => {
      return d !== "null";
    });
    fechasOrdenadas = d3.sort(fechasFiltradas)
    const fechasOrdenadasUnicas = Array.from(new Set(fechasOrdenadas)); 

    const slider = d3.select('#rangoFechas');
    const fecha = d3.select('#valorFecha');

    slider
    .attr("min", 0)
    .attr("max", fechasOrdenadasUnicas.length - 1)
    .property("value", 0);

    function actualizarValorFecha() {
      const indice = slider.property("value");
      fecha.text(fechasOrdenadasUnicas[indice]);
      crearAlbumes(fechasOrdenadasUnicas[indice]);
      preprocesarEstadios(false, fechasOrdenadasUnicas[indice]);
    }
    slider.on("input", actualizarValorFecha);
    actualizarValorFecha();

    })
  }

  function crearAlbumes(fecha) {
    d3.csv(csvCanciones, d3.autoType).then(datosSinFiltrar => {
        albumesSinFiltrar = d3.groups(datosSinFiltrar, (d) => d.Album);
        let diccionario = {};
        SVG1
        .selectAll('div')
        .data(albumesSinFiltrar, d => d.Album) 
        .join(
            enter => enter.append('div')
            .text(d => d[0])
            .each(d => {diccionario[d[0]] = d[1].length;})
        );
        diccionario['Taylor Swift'] = albumesSinFiltrar[0][1].length;

        datos = datosSinFiltrar.filter(d => {
          return d.Fecha_primera_presentacion === null || d.Fecha_primera_presentacion <= fecha;
        });
        albumes = d3.groups(datos, (d) => d.Album);

        datosCancionesNoCantadas = datosSinFiltrar.filter(d => {
          return d.Estatus === "Libre" || d.Fecha_primera_presentacion > fecha;
        });
        albumesConCancionesNoCantadas = d3.groups(datosCancionesNoCantadas, (d) => d.Album);
        let diccionarioCancionesNoCantadas = {};
        SVG1
        .selectAll('div')
        .data(albumesConCancionesNoCantadas, d => d.Album) 
        .join(
            enter => enter.append('div')
            .text(d => d[0])
            .each(d => {diccionarioCancionesNoCantadas[d[0]] = d[1].map(c => c.Titulo_cancion).join(', ');})
        );
        diccionarioCancionesNoCantadas['Taylor Swift'] = albumesConCancionesNoCantadas[0][1].map(c => c.Titulo_cancion).join(', ');

        const N = 5;

        // Escala colores
        const nombresAlbumes = datos.map(d => d.Album);
        const albumesUnicos = Array.from(new Set(nombresAlbumes));
        const colores = ['#BDCFB7', '#E8C490', '#BEA7C4', '#6D3D46', '#C2E2F4', '#000003', '#EAB4CC', '#D1CEC7', '#CC9D83', '#464D60', '#C0C0C0'];
        const coloresCortados = colores.slice(0, albumesUnicos.length);
        const colorScale = d3.scaleOrdinal()
            .domain(albumesUnicos)
            .range(coloresCortados);


        // Escala altura 
        const escalaAltura = d3.scaleLinear()
          .domain([0, 1])  
          .range([0, 100]); 

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "white")
            .style("border-radius", "8px")
            .style("padding", "4px");

        SVG1
        .selectAll("g.glifo")
        .data(albumes, d => d.Album)
        .join(
          enter => {
            const glifo = enter
              .append("g")
              .attr("class", "glifo")
              .style("opacity", 0)
              .attr("transform", (_, i) => {
                let x = (i % N) * 155;
                let y = Math.floor(i / N) * 155;
                return `translate(${x + 85}, ${y + 100})`;
              });

            glifo
                .append("text")
                .attr("class", "nombreAlbumes")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "top")
                .attr("x", 0)
                .attr("y", 70)
                .text(d => d[0]);

            glifo
              .append("rect")
              .attr("class", "barraNoCantadas")
              .attr("x", -40)
              .attr("y", -50)
              .attr("width", 80)
              .attr("height", d => {
                const cancionesAlbum = d[1];
                const cantidadStatusCantadas = cancionesAlbum.length;
                const cancionesTotalesAlbum = diccionario[d[0]];
                let porcentajeCancionesNoCantadas = 1 - (cantidadStatusCantadas / cancionesTotalesAlbum);

                return escalaAltura(porcentajeCancionesNoCantadas); 
              })
              .attr("fill", d => colorScale(d[0]))
              .attr("opacity", 0.3)
              .on("mouseenter", (evento, d) => {
                tooltip
                  .style("visibility", "visible")
                  .html(`Canciones no cantadas: ${diccionarioCancionesNoCantadas[d[0]]}`)
                  .style("left", (evento.pageX + 10) + "px")
                  .style("top", (evento.pageY - 28) + "px");
              })
              .on("mouseleave", () => {
                tooltip.style("visibility", "hidden");
              })
              .on("click", function(_, d) {
                preprocesarEstadios(d[0], fecha);
              });

            glifo
              .append("rect")
              .attr("class", "barraCantadas")
              .attr("x", -40)
              .attr("y", d => {
                const cancionesAlbum = d[1];
                const cantidadStatusCantadas = cancionesAlbum.length;
                const cancionesTotalesAlbum = diccionario[d[0]];
                let porcentajeCancionesNoCantadas = 1 - (cantidadStatusCantadas / cancionesTotalesAlbum);

                return -50 + escalaAltura(porcentajeCancionesNoCantadas); 
              })
              .attr("width", 80)
              .attr("height", d => {
                const cancionesAlbum = d[1];
                const cantidadStatusCantadas = cancionesAlbum.length;
                const cancionesTotalesAlbum = diccionario[d[0]];
                let porcentajeCancionesCantadas = cantidadStatusCantadas / cancionesTotalesAlbum;

                return escalaAltura(porcentajeCancionesCantadas);
              })
              .attr("fill", d => colorScale(d[0]))
              .on("mouseenter", (evento, d) => {
                const cancionesAlbum = d[1];
                tooltip
                  .style("visibility", "visible")
                  .html(`Canciones cantadas: ${cancionesAlbum.map(c => c.Titulo_cancion).join(', ')}`)
                  .style("left", (evento.pageX + 10) + "px")
                  .style("top", (evento.pageY - 28) + "px");
              })
              .on("mouseleave", () => {
                tooltip.style("visibility", "hidden");
              })
              .on("click", function(_, d) {
                preprocesarEstadios(d[0], fecha);
              });

              glifo
              .transition("enter-glifo")
              .duration(600)
              .style("opacity", 1);

            return glifo;
          },
          update => {
            update
            .select(".nombreAlbumes")
            .transition("actualizacion")
            .text(d => d[0]);

            update
            .select(".barraNoCantadas")
            .attr("height", d => {
              const cancionesAlbum = d[1];
              const cantidadStatusCantadas = cancionesAlbum.length;
              const cancionesTotalesAlbum = diccionario[d[0]];
              let porcentajeCancionesNoCantadas = 1 - (cantidadStatusCantadas / cancionesTotalesAlbum);

              return escalaAltura(porcentajeCancionesNoCantadas); 
            })
            .attr("y", -50)
            .attr("fill", d => colorScale(d[0]));

            update
              .select(".barraCantadas")
              .attr("height", d => {
                const cancionesAlbum = d[1];
                const cantidadStatusCantadas = cancionesAlbum.length;
                const cancionesTotalesAlbum = diccionario[d[0]];
                let porcentajeCancionesCantadas = cantidadStatusCantadas / cancionesTotalesAlbum;

                return escalaAltura(porcentajeCancionesCantadas); 
              })
              .attr("y", d => {
                const cancionesAlbum = d[1];
                const cantidadStatusCantadas = cancionesAlbum.length;
                const cancionesTotalesAlbum = diccionario[d[0]];
                let porcentajeCancionesNoCantadas = 1 - (cantidadStatusCantadas / cancionesTotalesAlbum);

                return -50 + escalaAltura(porcentajeCancionesNoCantadas); 
              })
              .attr("fill", d => colorScale(d[0]));

            update
              .transition("actualizacion")
              .duration(500)
              .attr("transform", (_, i) => {
                let x = (i % N) * 155;
                let y = Math.floor(i / N) * 155;
                return `translate(${x + 85}, ${y + 100})`;
              });

          },
          exit => {
            exit
              .attr("class", "delete")
              .transition("exit_glifo")
              .duration(500)
              .style("opacity", 0)
              .attr("transform", (_, i) => {
                let x = (i % N) * 155;
                let y = Math.floor(i / N) * 155;
                return `translate(${0}, ${0}) scale(5)`;
              });

            exit.selectAll(".barraCantadas").transition("exit_glifo").remove();
            exit.selectAll(".nombreAlbumes").transition("exit_glifo").remove();
            exit.selectAll(".barraNoCantadas").transition("exit_glifo").remove();

            exit
              .transition("eliminar")
              .delay(500)
              .remove();

            return exit;
          }
        );
    });
}


function crearMapa(estadios) {
  d3.json("custom.geo.json").then((datos) => {
    console.log(estadios);

    const proyeccion = d3.geoWinkel3()
      .fitSize([WIDTH_VIS_2, HEIGHT_VIS_2], datos);

    const caminosGeo = d3.geoPath().projection(proyeccion);

    const maximaCantidadCanciones = d3.max(estadios, (dato) => dato[1].length);
    const minimaCantidadCanciones = d3.min(estadios, (dato) => dato[1].length);
    const escalaRadioCirculo = d3.scaleLog().domain([minimaCantidadCanciones, maximaCantidadCanciones]).range([2, 6]);  


    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border-radius", "8px")
      .style("padding", "4px");
      
    let grupoMapas;
    let grupoCirculos;

    SVG2
    .selectAll("g.grupo-mapa")
    .data([null])
    .join(
      enter => {
        grupoMapas = enter.append("g")
        .attr("class", "grupo-mapa");
        return grupoMapas;
        },
      update => {
          grupoMapas = update;
        return update;
        },
      exit => {
          exit.remove();
        }
      );

    grupoMapas
      .selectAll("path")
      .data(datos.features, d => d.id)
      .join(
      enter => {
        const mapa = enter.append("path")
        .attr("d", caminosGeo)
        .attr("fill", "white")
        .attr("stroke", "#ccc");
      return mapa;
      },
    update => {
      update.transition()
        .duration(500)
        .attr("d", caminosGeo)
        .attr("fill", "white")
        .attr("stroke", "#ccc");
      return update;
    },
    exit => {
      exit.transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();
    }
    );


    SVG2
    .selectAll("g.grupo-circulos")
    .data([null])
    .join(
    enter => {
      grupoCirculos = enter.append("g")
        .attr("class", "grupo-circulos");
      return grupoCirculos;
    },
    update => {
      grupoCirculos = update;
      return update;
    },
    exit => {
      exit.remove();
    }
  );


  grupoCirculos
  .selectAll("circle")
  .data(estadios, d => d.Lugar_presentacion)
  .join(
    enter => {
      const circulos = enter.append("circle")
        .attr("cx", d => proyeccion([d[1][0].Latitud_presentacion, d[1][0].Longitud_presentacion])[0])
        .attr("cy", d => proyeccion([d[1][0].Latitud_presentacion, d[1][0].Longitud_presentacion])[1])
        .attr("r", 0)
        .attr("fill", "red")
        .on("mouseenter", (evento, d) => {
          tooltip.style("visibility", "visible")
            .html(`Canciones cantadas en ${d[0]}: ${d[1].map(c => c.Titulo_cancion).join(', ')}`)
            .style("left", (evento.pageX + 10) + "px")
            .style("top", (evento.pageY - 28) + "px");
        })
        .on("mouseleave", () => {
          tooltip.style("visibility", "hidden");
        })
        .transition()
        .duration(500)
        .attr("r", d => escalaRadioCirculo([d[1].length]));

      return circulos;
    },
    update => {
      update.transition()
        .duration(500)
        .attr("cx", d => proyeccion([d[1][0].Latitud_presentacion, d[1][0].Longitud_presentacion])[0])
        .attr("cy", d => proyeccion([d[1][0].Latitud_presentacion, d[1][0].Longitud_presentacion])[1])
        .attr("r", d => escalaRadioCirculo([d[1].length]));

      return update;
    },
    exit => {
      exit.transition()
        .duration(500)
        .attr("r", 0)
        .remove();

      return exit;
    }
  );

  const manejadorZoom = (evento) => {
    const transformacion = evento.transform;
        grupoMapas.attr("transform", transformacion);
        grupoCirculos.attr("transform", transformacion);
      };

      const zoom = d3.zoom()
          .scaleExtent([0.5, 2])
          .on("zoom", manejadorZoom);

      SVG2.call(zoom);
  });
}
