const mangaCanonArcs = [
    "Romance Dawn Arc", "Orange Town Arc", "Syrup Village Arc", "Baratie Arc", "Arlong Park Arc",
    "Loguetown Arc", "Reverse Mountain Arc", "Whisky Peak Arc", "Little Garden Arc", "Drum Island Arc",
    "Arabasta Arc", "Jaya Arc", "Skypiea Arc", "Long Ring Long Land Arc", "Water 7 Arc", "Enies Lobby Arc",
    "Post-Enies Lobby Arc", "Thriller Bark Arc", "Sabaody Archipelago Arc", "Amazon Lily Arc",
    "Impel Down Arc Part 1", "Impel Down Arc Part 2", "Marineford Arc", "Post-War Arc", "Return to Sabaody Arc",
    "Fish-Man Island Arc", "Punk Hazard Arc", "Dressrosa Arc", "Zou Arc", "Whole Cake Island Arc",
    "Levely Arc", "Wano Country Arc Part 1", "Wano Country Arc Part 2", "Wano Country Arc Part 3", "Egghead Arc"
  ];
  
  const nodos = [
    'Beasts Pirates', 'Orochi Oniwabanshu (former)', 'Mokomo Dukedom', 'Foxy Pirates', 'Tontatta Kingdom', 
    'Straw Hat Grand Fleet', 'Red Hair Pirates', 'Baroque Works (former)', 'Ally of the Whitebeard Pirates', 
    'Whitebeard Pirates', 'Straw Hat Pirates', 'Beasts Pirates (Numbers)', 'Roger Pirates', 'Shandia', 
    'Ninja-Pirate-Mink-Samurai Alliance', 'Marines', 'Ninja-Pirate-Mink-Samurai Alliance (disbanded)', 
    'Kid Pirates', 'CP9 (former)', 'Levely', 'Thriller Bark Pirates', 'Blackbeard Pirates', 
    'Impel Down (former)', 'Donquixote Pirates', 'Revolutionary Army', 'Kozuki Family', 'Big Mom Pirates', 
    'Sun Pirates (former)', 'Kuja', 'CP0', 'World Government', 'Impel Down', 'Baroque Works', 'Charlotte Family'
  ];
  
  const coloresOrgs =[
    "#db4329", "#69d253", "#7b4ad4", "#c7d847", "#cf4ebf", "#95d69a", "#553183", "#ceac4e",
    "#7986c9", "#c57138", "#70cdd3", "#d54965", "#5d823a", "#bd689a", "#454327", "#cdbccb",
    "#7c3230", "#507e79", "#42304b", "#bd957c"
  ];

const escalaColorOrgs = d3.scaleOrdinal()
  .domain(nodos)
  .range(coloresOrgs);
  
// fn que nos sirve para resaltar los caps con el brush 
function resaltarCapitulos(selectedOrgs) {
    if (selectedOrgs.length === 0){
        console.log('Estoy mandando una lista vacia');
        d3.selectAll("#heatmap rect").each(function() {
        const rect = d3.select(this);
        console.log(rect)
        rect.attr("stroke", "#373837")
            .attr("stroke-width", 1)
            .style("opacity", 1);
        })
        return
      };

    d3.csv('./data/onepiece.csv', d3.autoType).then(data => {
      // Filtrar personajes que pertenecen a las organizaciones seleccionadas
      const personajesFiltrados = data.filter(d => {
        return selectedOrgs.some(org => {
          if (d.Affiliations) {
            return d.Affiliations.split(';').map(d => d.trim()).includes(org);
          }
          return false;
      });
      });

      
  
      // Obtener los episodios de debut de estos personajes
      const episodiosDebut = personajesFiltrados.map(d => {
        if (d.Debut) {
          const debutInfo = d.Debut.split(';');
          const episodeInfo = debutInfo.find(info => info.includes('Episode'));
          if (episodeInfo) {
            const episodeNumber = episodeInfo.split(' ').pop().trim();
            return parseInt(episodeNumber);
          }
        }
        return null;
      }).filter(d => d !== null);
  
      // Resaltar los episodios correspondientes en el heatmap
      d3.selectAll("#heatmap rect")
      .each(function() {
        const rect = d3.select(this);
        const epNum = parseInt(rect.attr('id'));
        if (episodiosDebut.includes(epNum)) {
          rect.attr("stroke", "magenta")
              .attr("stroke-width", 3)
              .style("opacity", 1);
        } else {
          rect.attr("stroke", "#373837")
              .attr("stroke-width", 1)
              .style("opacity", 0.3);
        }
      });
    });
}
  
  // Función para crear el heatmap
function crearHeatmap() {
    const margin = { top: 80, right: 25, bottom: 30, left: 130 },
      width = 1200 - margin.left - margin.right,
      height = 750 - margin.top - margin.bottom;
  
    const svg = d3.select("#heatmap")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    let episodiosCanon = [];
    let episodiosMixed = [];
  
    d3.csv('./data/complete_data_v01.csv', d3.autoType).then(episodio => {
      episodiosCanon = episodio.filter(d => (d.type === 'Manga Canon' || d.type === 'Anime Canon') && mangaCanonArcs.includes(d.arc));
      episodiosMixed = episodio.filter(d => d.type === 'Mixed Canon/Filler' && mangaCanonArcs.includes(d.arc));
  
      actualizarHeatmap(episodiosCanon); // Inicialmente muestra los episodios canónicos
  
      d3.select("#tipo-episodio").on("change", function () {
        const tipoSeleccionado = d3.select(this).property("value");
        if (tipoSeleccionado === "canon") {
          actualizarHeatmap(episodiosCanon);
        } else if (tipoSeleccionado === "mixed") {
          actualizarHeatmap(episodiosMixed);
        } else if (tipoSeleccionado === "both") {
          actualizarHeatmap(episodiosCanon.concat(episodiosMixed));
        }
      });
    });
  
    function actualizarHeatmap(data) {
      const ejeX = d3.scaleLinear()
        .domain([0, 133])
        .range([0, width]);
  
      const ejeY = d3.scaleBand()
        .range([0, height])
        .domain(mangaCanonArcs)
        .padding(0.1);
  
      svg.selectAll("g.axis-left").remove(); // Remove previous axis
      svg.append("g")
        .attr("class", "axis-left")
        .style("font-size", 14)
        .call(d3.axisLeft(ejeY).tickSize(0))
        .select(".domain").remove();
  
      const escalaHeatmap = d3.scaleSequential(d3.interpolateRgbBasis(["red", "orange", "yellow", "green"]))
        .domain([5.5, 10]);
  
      svg.selectAll("rect")
        .data(data, d => d.ep_num)
        .join(
        enter => {
            const ep= enter.append("g")
                .attr("class", "episode");

            ep.append("title")
                .text(d => `Episodio n° ${d.ep_num}\nNombre Japones: ${d.episode_japan_title}\nNombre Inglés: ${d.episode_english_title}\nFecha Emision: ${d.air_date}\nRating IMBd: ${d.rating}\nSinopsis: ${d.synopsis}`);
              

            ep.append('rect')
                .attr('id', d => d.ep_num)
                .attr('fill', d => escalaHeatmap(d.rating))
                .attr('y', d => ejeY(d.arc))
                .attr('x', (d, i) => {
                const arcEpisodes = data.filter(ep => ep.arc === d.arc);
                const arcIndex = arcEpisodes.findIndex(ep => ep.ep_num === d.ep_num);
                return 3 + ejeX(arcIndex);
                })   
                .attr("width", 8)
                .attr("height", ejeY.bandwidth())
                .attr('stroke', '#373837')
                .style("opacity", 0)
                .transition()
                .duration(500)
                .style("opacity", 1);
        },
        update => {
          update.transition()
            .duration(500)
            .attr('fill', d => escalaHeatmap(d.rating))
            .attr('y', d => ejeY(d.arc))
            .attr('x', (d, i) => {
              const arcEpisodes = data.filter(ep => ep.arc === d.arc);
              const arcIndex = arcEpisodes.findIndex(ep => ep.ep_num === d.ep_num);
              return 3 + ejeX(arcIndex);
            })
            .attr("width", 10)
            .attr("height", ejeY.bandwidth())
            .attr('stroke', '#373837');
        },
        exit => {
          exit.transition()
            .duration(500)
            .style("opacity", 0)
            .remove();
        }
      );
    }
  }
  
  // Función para crear la red
  function crearNetwork(relations){

    const nodos = relations.nodes;
    const enlaces = relations.links;
    
    const margin = { top: 80, right: 25, bottom: 30, left: 130 },
      width = 800 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;
  
    const HEIGHTLEYENDA = 590
    const WIDTHLEYENDA = 250
    
    const svg = d3.select("#network")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    SVGLEYENDA = d3
      .select("#leyenda")
      .attr("width", WIDTHLEYENDA)
      .attr("height", HEIGHTLEYENDA)
    
  
    const escalaColorLinks = d3.scaleOrdinal()
      .domain([1, 2, 3])
      .range(['green', 'blue', 'red', 'grey']);
  
    const escalaTamanoOrgs = d3.scaleLinear()
        .domain([0,85])
        .range([10 , 37])
  
    const brush = d3.brush()
        .extent([[-300,-300], [800,800]])
        .on("end", brushEnded);
    
    svg.append("g")
        .call(brush);
    
    function brushEnded(event) {
        if (!event.selection) return;
    
    const [[x0, y0], [x1, y1]] = event.selection;
    
    const selectedNodes = nodos.filter(d => 
          x0 <= d.x && d.x < x1 && y0 <= d.y && d.y < y1
        );
    
    const selectedOrgs = selectedNodes.map(d => d.id);
        console.log(selectedOrgs)
        resaltarCapitulos(selectedOrgs)
      } 
      
    // Definimos la fuerza del enlace
  
    const fuerzaEnlace = d3.forceLink(enlaces)
        .id(d => d.id)
  
    const simulacion = d3
          .forceSimulation(nodos)
          .force("enlaces", fuerzaEnlace)
          .force("centro", d3.forceCenter(width / 3.2, height / 2))
          .force("colision", d3.forceCollide(80))
          .force("carga", d3.forceManyBody().strength(-10));
  
    const lineas = svg
        .append('g')
        .selectAll('line')
        .data(enlaces)
        .join('line')
        .attr('stroke', (d, i) => {
          return escalaColorLinks(d.value)
        })
        .attr('stroke-width', 1.5);
        
    const circulos = svg
        .append('g')
        .selectAll('circle')
        .data(nodos)
        .join('circle')
        .attr('r', (d, i) => {
          return escalaTamanoOrgs(d.count)
        })
        .attr('stroke', '#fff')
        .attr('fill', d => escalaColorOrgs(d.id))
        .on("mouseover", (_, d) => cambiarInfo(d))
        .call(drag(simulacion));
  
        
      
    simulacion.on('tick',()=> {
        circulos
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
  
        lineas
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
  
      })
  
    // rect colores
    SVGLEYENDA
      .selectAll("rect")
      .data(escalaColorOrgs.range())
      .join("rect")
      .attr("x", WIDTHLEYENDA / 3 - 70)
      .attr("y", (d, i) => i * 27.3 + 46)
      .attr("height", 15)
      .attr("width", 15)
      .attr("fill", d => d)
  
    SVGLEYENDA
        .selectAll("text")
        .data(nodos)
        .join("text")
        .attr("x", WIDTHLEYENDA / 3 - 50)
        .attr("y", (d, i) => i * 27.3 + 57)
        .text(d =>  d.id)
  
    texto = SVGLEYENDA
        .append("text")
        .attr("id", "informacion")
        .attr("x", WIDTHLEYENDA / 2) 
        .attr("text-anchor", "middle")
        .attr("y", 25)
        .text("Nodo actual:")
  
    function cambiarInfo(d) {
        texto.text(`Nodo actual: ${d.id}`)
    }
  
    SVGLEYENDA
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", HEIGHTLEYENDA)
        .attr("width", WIDTHLEYENDA)
        .attr("fill", "transparent")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
  }     
  
  
  function drag(simulacion) {    
    function inicioDrag(evento) {
        if (evento.active === 0) {
            simulacion.alphaTarget(0.3).restart();
        }
        evento.subject.fx = evento.subject.x;
        evento.subject.fy = evento.subject.y;
    }
    
    function draggeando(evento) {
        evento.subject.fx = evento.x;
        evento.subject.fy = evento.y;
    }
    
    function finDrag(evento) {
        if (evento.active === 0) {
            simulacion.alphaTarget(0);
        }
        evento.subject.fx = null;
        evento.subject.fy = null;
    }
    
    return d3.drag()
        .on("start", inicioDrag)
        .on("drag", draggeando)
        .on("end", finDrag);
  }
  
  d3.json('./data/relations.json').then(data => crearNetwork(data));
  
  // Inicializar el heatmap
  crearHeatmap();