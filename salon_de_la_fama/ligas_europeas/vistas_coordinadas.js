let vis1CallingVis2 = false;
let vis2CallingVis3 = false;

const activeConnectionVis1toVis2 = (leagueName) => {
    // Si no se ha activado el click, entonces retorna
    if (!vis1CallingVis2) return;
    // En el otro caso, realizamos los cambios
    console.log("Visualizacion 1 llamando Visualizacion 2")
    loadTeams(leagueName);

}

const activeConnectionVis2toVis3 = (teamName) => {
    // Si no se ha activado el click, entonces retorna
    if (!vis2CallingVis3) return;
    // En el otro caso, realizamos los cambios
    console.log("Visualizacion 2 llamando Visualizacion 3")
    console.log(teamName)
    loadTeamAttributes(teamName);
}

const connectionBetVis = () => {

}



