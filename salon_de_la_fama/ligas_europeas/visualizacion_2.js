

const TABLE_MATCHS = "table_match.csv"
const WIDTH2 = 800;
const HEIGHT2 = 700;
const MARGIN2 = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 20
};
const HEIGHTVIS = HEIGHT2 - MARGIN2.top - MARGIN2.bottom;
const WIDTHVIS = WIDTH2 - MARGIN2.left - MARGIN2.right;



const SVG = d3.select("#vis-2")
    .append("svg")
    .attr("width", WIDTH2)
    .attr("height", HEIGHT2)
    .attr("viewBox", "-230 -250 450 450")
    .attr("position", "absolute")

let INNER_RADIUS = Math.min(WIDTHVIS, HEIGHTVIS) * 0.25 - 20;
let OUTER_RADIUS = INNER_RADIUS + 10;


let clickIsActive = false;


const SVGInfo = d3.select("#vis-2")
    .append("svg")
    .attr("width", WIDTH2 * 0.5)
    .attr("height", 100)
    .attr("position", "absolute")
    .attr("viewBox", "-220 -220 100 100")
    .attr("transform", "translate(-350, -690)")

// Rect para mostrar la informacion del equipo al hacer zoom semantico 
let teamVictoriesInfo = d3.select("#vis-2")
    .append("div")
    .attr('class', 'team-victories')
    .style("width", "300px") 
    .style("height", "500px")
    .style("position", "absolute") 
    .style("opacity", 0)

function createAdjacencyMatrix(data) {
    /*
    Funcion que preprocesa los datos y retorna una matriz de adyancencia donde 
    cada celda M[i][j] corresponde a la cantidad de veces que le ha ganado
    el equipo i al equipo j
    */
    // Obtenemos los equipos para la temporada preseleccionada
    const teams = [... new Set(data.map(d => d.home_team_name))];
    const teamsNames = { ...teams };
    const matrix = Array(teams.length).fill(0).map(() => Array(teams.length).fill(0));
    data.forEach(d => {
        let i = teams.indexOf(d.home_team_name);
        let j = teams.indexOf(d.away_team_name);
        // Si el equipo local le gana al visitante
        // if (d.home_team_goal > d.away_team_goal) {
            // matrix[i][j] = d.home_team_goal; // equipo i (local) con respecto al equipo j (visitante)
        matrix[i][j] = d.home_team_goal; // equipo i (local) con respecto al equipo j (visitante)
        // } else if (d.home_team_goal < d.away_team_goal) {
            // matrix[j][i] = d.away_team_goal; // equipo j (visitante) con respecto al equipo i (local)
        matrix[j][i] = d.away_team_goal; // equipo j (visitante) con respecto al equipo i (local)
        // }
    });
    return { 
        matrix, 
        teamsNames 
    };
}


function createChord(data, season, league) {
    // Filtramos los datos por temporada y liga    
    let filteredData = data.filter(d => d.season == season && d.league == league);
    
    const { matrix, teamsNames } = createAdjacencyMatrix(filteredData);
    const chord = d3.chordDirected()
        .padAngle(1000 / INNER_RADIUS)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const ribbon = d3.ribbonArrow()
        .radius(INNER_RADIUS - 1)
        .padAngle(1 / INNER_RADIUS);
    
    let chords = chord(matrix);

    const victoriesColor = d3.schemeSet1;
    

    const legendWinner = document.getElementById("legend-winner");
    const legendLoser = document.getElementById("legend-loser");

    legendWinner.style.color = victoriesColor[2];
    legendLoser.style.color = victoriesColor[0];


    let countTeams;
    let angleBetweenTeams;

    // Definimos los vectores para el texto de cada equipo ... 
    const teamsContainer = SVG.selectAll("g.team")
        .data(chords.groups, d => d.index)
        .join(enter => {
                countTeams = chords.groups.length;
                const angleBetweenTeams = 2 * Math.PI / countTeams;
                // Definimos la posicion de cada equipo alrededor del circulo
                const gTeam = enter.append("g")
                    .attr("class", "team")
                    .attr("transform", (_, i) => `
                        rotate(${i * angleBetweenTeams * 180 / Math.PI - 90}) 
                        translate(${INNER_RADIUS + 5})`)
                    .style("opacity", 0)
                // Transicion de entrada
                gTeam.transition('enter-teams')
                    .duration(500)
                    .delay(100)
                    .style("opacity", 1)
                // Para cada equipo rotamos el label de su nombre
                gTeam.append("text")
                    .attr("class", "team-name")
                    .attr("transform", (_, i) => i * angleBetweenTeams * 180 / Math.PI > 180 
                        ? "rotate(180) translate(0, 0)"
                        : "rotate(0)")
                    .attr("text-anchor", (_, i) => i * angleBetweenTeams * 180 / Math.PI > 180 
                        ? "end"
                        : "start"
                    )
                    .attr("alignment-baseline", "middle")
                    .attr("font-size", 7)
                    .text(d => teamsNames[d.index])
                    
                return gTeam;
        }, update => { 
                countTeams = chords.groups.length;
                
                angleBetweenTeams = 2 * Math.PI / countTeams;
                update.transition('update-teams')
                    .duration(500)
                    .delay(50)
                    .attr("transform", (_, i) => `
                        rotate(${i * angleBetweenTeams * 180 / Math.PI - 90}) 
                        translate(${INNER_RADIUS + 5})`)
                    
                update.select("text")
                    .attr("transform", (_, i) => i * angleBetweenTeams * 180 / Math.PI > 180 
                        ? "rotate(180) translate(0, 0)"
                        : "rotate(0)")
                    .attr("text-anchor", (_, i) => i * angleBetweenTeams * 180 / Math.PI > 180 
                        ? "end"
                        : "start"
                    )
                    .text(d => teamsNames[d.index])
                    .attr("alignment-baseline", "middle")
                    .attr("font-size", 7)
                    .transition('bounce-in')
                    .duration(300)
                    
                return update;
        }, exit => {
                exit.transition('exit-teams')
                    .style("opacity", 0)
                    .duration(500)
                    .remove();
                return exit;
        }
    );
    
    // Definimos los vectores para las cuerdas entre equipos ... 
    const victoriesContainer = SVG.selectAll("g.chord")
        .data(chords, d => d.index)
        .join(enter => {
            const gChord = enter
                .append("g")
                .attr("class", "chord")
                .style("opacity", 0 )
            
            gChord.transition('enter-chords')
                .duration(1000)
                .ease(d3.easeBackOut)
                .style("opacity", 0.7)

            gChord.append("path")
                .attr("class", "ribbon")
                .attr("d",ribbon)
                .attr("stroke", victoriesColor[8])
                .attr("stroke-width", 0.1)
                .attr("fill", victoriesColor[8])
                .attr("fill-opacity", 0.7)
            
            
            return gChord ;    
        }, update => {
            update.transition('update-chords')
                .ease(d3.easeCircleInOut)
                .duration(300)
                .style("opacity", 0.7)

            update.select("path")
                .attr("d", ribbon)
                .attr("stroke", victoriesColor[1])
                .attr("stroke-width", 0.1)
                .attr("fill", victoriesColor[1])
                .attr("fill-opacity", 0.7)
            return update;
        }, exit => {
            exit.transition('exit-chords')
                .ease(d3.easeCircleInOut)
                .style("opacity", 0)
                .duration(300)
                .remove();
            return exit;
        }
        );

    // LEYENDAS
    const createLegend = () => {

    const legendContainer = SVGInfo
        .append("g")
        .attr("class", "legend")
        .attr("width", 100)
        .attr("height", 100)

    legendContainer.append("text")
        .attr("x", -200)
        .attr("y", -180)
        .text("Equipo ganador")
        .style("font-size", '15px')
        .style("fill", victoriesColor[2]);

    legendContainer.append("text")
        .attr("x", -200)
        .attr("y", -160)
        .text("Equipo perdedor")
        .style("font-size", '15px')
        .style("fill", victoriesColor[0]);

    legendContainer.append("circle")
        .attr("cx", -210)
        .attr("cy", -186)
        .attr("r", 3)
        .style("fill", victoriesColor[2]);

    legendContainer.append("circle")
        .attr("cx", -210)
        .attr("cy", -166)
        .attr("r", 3)
        .style("fill", victoriesColor[0]);
    }
    createLegend();

    // EVENTOS
    const highlightTeam = (currTeam) => {
        if (clickIsActive) return;
        // Resaltamos el equipo seleccionado, de color verde
        teamsContainer.filter(d => d.index === currTeam.index)
            .style("opacity", 1)
            .select("text")
            .style("fill", victoriesColor[2])
            .style("font-weight", "bolder")
        // Resaltamos a los equipos derrotados por el equipo seleccionado
        teamsContainer.filter(d => matrix[currTeam.index][d.index] > matrix[d.index][currTeam.index])
        // teamsContainer.filter(d => d.index !== currTeam.index && matrix[currTeam.index][d.index] !== 0)
            .select("text")
            .style("fill", victoriesColor[0])
            .style("font-weight", "bolder")
        
        // Ocultamos todas las cuerdas que tengan como origen un equipo 
        // diferente al seleccionado y que no haya sido derrotado por este
        // Opcion 1: que no tenga el origen del team seleccionado 
        // Opcion 2: que tenga el origen del team seleccionado y que le haya ganado este team al seleccionado
        victoriesContainer.filter(d => (d.source.index !== currTeam.index )
            || (d.source.index === currTeam.index 
                && matrix[d.target.index][currTeam.index] >= matrix[currTeam.index][d.target.index]))
            .select("path")
            .attr("stroke", victoriesColor[8])
            .style("opacity", 0.1)
            .attr("stroke-width", 0.5)    

        // Resaltamos las cuerdas que tienen como origen el equipo seleccionado
        // y que sea derrotado por este ...
        victoriesContainer.filter(d => d.source.index === currTeam.index 
            && matrix[d.source.index][d.target.index] > matrix[d.target.index][d.source.index])
            .select("path")
            .attr("stroke", victoriesColor[1])
            .attr("stroke-width", 2)
            .style("opacity", 1)   
        
            
    }
    // Mouse Hover: Mouse Enter and Mouse Leave
    teamsContainer.on("mouseenter", (_, team) => {
        if (clickIsActive) return;
        highlightTeam(team);
    })
    teamsContainer.on("mouseleave", () => {  
        if (clickIsActive) return;
        teamsContainer
            .style("opacity", 1)
            .select("text")
            .style("fill", "black")
            .style("font-weight", "normal")
        
        victoriesContainer
            .select("path")
            .style("opacity", 0.5)   
            .attr("stroke", victoriesColor[8])
            .attr("stroke-width", 0.3)  
    });
    // Mouse Click
    teamsContainer.on("click", (_, team) => {
        if (!clickIsActive) {
            clickIsActive = true;
            let defeatedTeams = chords.filter(d => d.source.index === team.index 
                    && matrix[d.source.index][d.target.index] > matrix[d.target.index][d.source.index])
                                        .map(d => d.target.index);
            defeatedTeams.push(team.index);
            countTeams = defeatedTeams.length;
            angleBetweenTeams = 2 * Math.PI / countTeams;

            SVG.transition('zoom-out')
                .duration(500)
                .attr("viewBox", "-480 -420 700 700")

            teamsContainer.filter(d => !defeatedTeams.includes(d.index))
                .style("opacity", 0)
                .select("text")
                .style("opacity", 0);
            teamsContainer.filter(d => defeatedTeams.includes(d.index))
                .select("text")
                .transition('show-vis')
                .attr("font-size", 10);
            // Ocultamos las cuerdas que no tienen como origen el equipo seleccionado
            victoriesContainer.filter(d => (d.source.index !== team.index )
            || (d.source.index === team.index && matrix[d.target.index][team.index] >= matrix[team.index][d.target.index]))
            // victoriesContainer.filter(d => d.source.index !== team.index)
                .style("opacity", 0)
                .select("path")
                .style("opacity", 0);
            // Mostramos solo las cuerdas que relacionan equipo ganador -[derrotado]-> equipo perdedor
            console.log(victoriesContainer.filter(d => d.source.index === team.index       ))
            victoriesContainer.filter(d => d.source.index === team.index 
                && matrix[d.source.index][d.target.index] > matrix[d.target.index][d.source.index])
                .select("path")
                .transition('show-vis')
                .duration(500)
                .attr("stroke-width", 7);

            teamVictoriesInfo
                .style("transform", "translate(60px, -43rem)")
                .transition('show-vis')
                .duration(200)
                .style("opacity", 1)

            // Informacion del equipo con respecto a los equipos derrotados por este
            defeatedTeams = defeatedTeams.filter(d => d !== team.index);            
            htmlTeamInfo = `
                <h1>Resumen del partido del equipo</h1>
                <h3 style="color: ${victoriesColor[2]}">${teamsNames[team.index]}</h3>
                <div class="hline"></div>
                <p>Cantidad de victorias: ${chords.filter(d => d.source.index === team.index).length}</p>
                <div class="hline"></div>
                <h3 style="color: ${victoriesColor[0]};">Equipos derrotados</h3>
                <ul> 
                    <li>
                        <span><p style="text-decoration: underline;">Equipo</p></span>
                        <span><p style="text-decoration: underline;">Goles</p></span>
                    </li>
                    ${defeatedTeams.map(d => `
                    <li>
                        <span>${teamsNames[d]}</span>
                        <span>
                            <span style="color:${victoriesColor[2]}">${matrix[team.index][d]}</span>
                            -
                            <span style="color:${victoriesColor[0]}">${matrix[d][team.index]}</span>
                        </span>
                    </li>`).join("")}
                </ul>                
            `
            console.log(defeatedTeams.map(d => `${matrix[team.index][d]} | ${matrix[d][team.index]}`));
            teamVictoriesInfo.html(htmlTeamInfo);

            const teamName = teamsNames[team.index];
            vis2CallingVis3 = true;
            activeConnectionVis2toVis3(teamName);
            
        } else {
            resetVis();
        }});

    const resetVis = () => {    
        clickIsActive = false;
        teamsContainer
            .select("text")
            .transition('hide-vis')
            .duration(500)  
            .style("opacity", 1)
            .style("fill", "black")
            .style("font-weight", "normal")
            .attr("font-size", 7);

        victoriesContainer.style("opacity", 0.5)
            .select("path")
            .attr("stroke-width", 0.1);

        teamVictoriesInfo
            .style("transform", "translate(-100px, -100px)")
            .style("opacity", 0)

        SVG.transition('zoom-in')
            .duration(250)
            .attr("viewBox", "-230 -250 450 450")
        

    }
}

function loadTeams(leagueName) {
    const parseData = (data) => ({
        id: +data.match_id,
        season: +data.season,
        league: data.league_name,
        home_team_name: data.home_team_name,
        home_team_goal: +data.home_team_goal,
        away_team_name: data.away_team_name,
        away_team_goal: +data.away_team_goal,
    })

    d3.csv(TABLE_MATCHS, parseData).then((data) => {
        // Inicializacion
        const leagueSelected = leagueName;

        d3.select("#title-vis-2").text(`Liga: ${leagueSelected}`);


        let seasonSelected = document.getElementById("select-season").selectedOptions[0].value;
        createChord(data, seasonSelected, leagueSelected);

        d3.select("#select-season").on("change", (_) => {
            let seasonSelected = document.getElementById("select-season").selectedOptions[0].value;
            createChord(data, seasonSelected, leagueSelected);
        });
        
        
    });
}

