
const dinoFile = "assets/processed_dinosaur_data.csv"

const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");



const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 1000;

const WIDTH_VIS_2 = 1200;
const HEIGHT_VIS_2 = 1000;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);

const coloresS = d3.scaleOrdinal(["Ornithischia", "Saurischia"], ["#9e00ab", "#ff9300"]);

const presenceScale = d3.scaleLinear().domain([1, 100]).range(["#ffda67", "#332100"])
const taxonCategories = ["SuperOrder", "order", "suborder", "clade"];
const dinosaurTypes = ['sauropod', 'large theropod', 'ceratopsian', 'euornithopod', 'small theropod', 'armoured dinosaur'];

// Define the corresponding array of strings you want to map to each type
const dinoIMG = ["assets/sauropod.png", 'assets/theropod.png', 'assets/ceratopsian.png', 'assets/euornithopod.png', 'assets/theropodsmall.png', 'assets/armored.svg'];

// Create the ordinal scale
const dinoScale = d3.scaleOrdinal()
    .domain(dinosaurTypes)
    .range(dinoIMG);

const dinoFilter = {"country": "all", "era": "all", "taxonomyLVL": "all", "taxoname": "all"};


const sizeY = d3.scaleOrdinal()
    .domain(taxonCategories)
    .range([400, 200, 200, 200]);

const posY = d3.scaleOrdinal()
    .domain(taxonCategories)
    .range([0, 400, 600, 800]);

const colorTaxonomy = d3.scaleOrdinal()
    .domain(taxonCategories)
    .range(["#1f3b15", "#2d4d06", "#225009", "#375e06"]);



function createTaxonomyTree(filtered, era ) {


    const categories = SVG1.selectAll(".category")
        .data(taxonCategories)
        .enter()
        .append("g")
        .attr("class", "category")
        .attr("transform", d => `translate(0, ${posY(d)})`);


    categories.append("rect")
        .attr("width", WIDTH_VIS_1)
        .attr("height", d => sizeY(d))
        .attr("stroke", "black")
        .attr("fill", d => colorTaxonomy(d))
        .attr("category", d => d);


    categories.append("text")
        .attr("x", 10)
        .attr("y", d => sizeY(d) / 2)
        .text(d => d)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "white");

    d3.csv(dinoFile, d3.autoType).then(dino => {
        let amount = {};
        dino.map(d => {
            if (filtered){
                if (era == d.era){
                    if (d.superorder == "Dinosauria") {
                        if (amount[d.superorder]) {
                            amount[d.superorder]["amount"] += 1;
                        } else {
                            amount[d.superorder] = { "name": d.superorder, "class": "SuperOrder", "amount": 1, "father": "", "kid": 1 };
                        }
                    }

                    if (d.order) {
                        if (amount[d.order]) {
                            amount[d.order]["amount"] += 1;
                        } else {
                            amount[d.order] = { "name": d.order, "class": "order", "amount": 1, "father": "Dinosauria", "kid": 1, "id": amount[d.superorder]["kid"] };
                            amount[d.superorder]["kid"] += 1;
                        }
                    }
                    if (amount[d.suborder]) {
                        amount[d.suborder]["amount"] += 1;
                    } else {
                        amount[d.suborder] = { "name": d.suborder, "class": "suborder", "amount": 1, "father": d.order , "kid": 1, "id": amount[d.order]["kid"]}
                        amount[d.order]["kid"] += 1;
                    }

                    if (amount[d.clade]) {
                        amount[d.clade]["amount"] += 1;
                    } else {
                        amount[d.clade] = { "name": d.clade, "class": "clade", "amount": 1, "father": d.suborder, "id": amount[d.suborder]["kid"], "kid":0, "grandpa": d.order }
                        amount[d.suborder]["kid"] += 1;
                    }
                }
            } else {

                    if (d.superorder == "Dinosauria") {
                        if (amount[d.superorder]) {
                            amount[d.superorder]["amount"] += 1;
                        } else {
                            amount[d.superorder] = { "name": d.superorder, "class": "SuperOrder", "amount": 1, "father": "", "kid": 1 };
                        }
                    }

                    if (d.order) {
                        if (amount[d.order]) {
                            amount[d.order]["amount"] += 1;
                        } else {
                            amount[d.order] = { "name": d.order, "class": "order", "amount": 1, "father": "Dinosauria", "kid": 1, "id": amount[d.superorder]["kid"] };
                            amount[d.superorder]["kid"] += 1;
                        }
                    }
                    if (amount[d.suborder]) {
                        amount[d.suborder]["amount"] += 1;
                    } else {
                        amount[d.suborder] = { "name": d.suborder, "class": "suborder", "amount": 1, "father": d.order , "kid": 1, "id": amount[d.order]["kid"]}
                        amount[d.order]["kid"] += 1;
                    }

                    if (amount[d.clade]) {
                        amount[d.clade]["amount"] += 1;
                    } else {
                        amount[d.clade] = { "name": d.clade, "class": "clade", "amount": 1, "father": d.suborder, "id": amount[d.suborder]["kid"], "kid":0, "grandpa": d.order }
                        amount[d.suborder]["kid"] += 1;
                    }


        }});
        console.log(amount)
        const data = Object.values(amount);
        const lines = SVG1
        const position = {};

        const circles = SVG1
            .selectAll("circle")
            .data(data, d=>d.name)
            .join((enter) =>{

                const taxoNodes =enter
                .append("circle").raise()
                .attr("cx", (d, i) => {
                    if (d.class == "SuperOrder") {
                        position[d.name] = {"y": 0, "x": WIDTH_VIS_1 / 2}
                        return WIDTH_VIS_1 / 2;
                    }
                    if (d.class == "order") {
                        if (d.name == "Saurischia") {
                            position[d.name] = {"y": 0, "x": 3 * WIDTH_VIS_1 / 4}
                            return 3 * WIDTH_VIS_1 / 4;
                        } else {
                            position[d.name] = {"y": 0, "x": WIDTH_VIS_1 / 4 }
                            return WIDTH_VIS_1 / 4;
                        }
                    }
                    if (d.class == "suborder") {
                        if (d.father == "Saurischia") {
                            position[d.name] = {"y": 0, "x": (2 * WIDTH_VIS_1 / 4) + (d.id) * (WIDTH_VIS_1 / (2 * amount[d.father]["kid"]))}
                            return (2 * WIDTH_VIS_1 / 4) + (d.id) * (WIDTH_VIS_1 / (2 * amount[d.father]["kid"]));
                        } else {
                            position[d.name] = {"y": 0, "x": d.id * (WIDTH_VIS_1 / (2 * amount[d.father]["kid"]))}
                            return d.id * (WIDTH_VIS_1 / (2 * amount[d.father]["kid"]));
                        }
                    }
                    if (d.class == "clade") {
                        if (amount[d.father].father == "Saurischia") {
                            position[d.name] = {"y": 0, "x": 50 + (2 * WIDTH_VIS_1 / 4) + d.id * (amount[d.father]["id"] * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"] + 1)))) / amount[d.father]["kid"] + (amount[d.father]["id"] - 1) * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"])))}
                            return 50 + (2 * WIDTH_VIS_1 / 4) + d.id * (amount[d.father]["id"] * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"] + 1)))) / amount[d.father]["kid"] + (amount[d.father]["id"] - 1) * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"])));
                        } else {
                            position[d.name] = {"y": 0, "x": 50 + d.id * (amount[d.father]["id"] * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"] + 1)))) / amount[d.father]["kid"] + (amount[d.father]["id"] - 1) * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"])))}
                            return 50 + d.id * (amount[d.father]["id"] * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"] + 1)))) / amount[d.father]["kid"] + (amount[d.father]["id"] - 1) * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"])));
                        }
                    }
                }) // Adjust the positioning as needed
                .attr("cy", (d, i) => {
                    if (d.class == "clade"){
                        position[d.name]["y"] = posY(d.class) +  d.id * (sizeY(d.class) / amount[d.father]["kid"])
                        return posY(d.class) +  d.id * (sizeY(d.class) / amount[d.father]["kid"]);
                    } else {
                        position[d.name]["y"] = posY(d.class) + sizeY(d.class) / 2;
                        return posY(d.class) + sizeY(d.class) / 2;
                    }
                })
                .attr("r", d => 10 + d.amount / 4)
                .style("stroke", "#000000")
                .style("stroke-width", "1px")
                .attr("taxonNode", d => d.name)
                .attr("fill", d => {
                    if (d.class == "SuperOrder") {
                        return "steelblue";
                    }
                    if (d.class == "order") {
                        return coloresS(d.name);
                    }
                    if (d.class == "suborder") {
                        return coloresS(d.father);
                    }
                    if (d.class == "clade") {
                        return coloresS(amount[d.father].father);
                    }
                })
                .style("opacity", 1)
                .on("mouseenter", function (event, d) {
                    d3.select(this).style("stroke-width", "10px");
                    const cx = +d3.select(this).attr("cx");
                    const cy = +d3.select(this).attr("cy");
                    d3.select(this.parentNode).append("text")
                        .attr("text-anchor", "middle")
                        .attr("class", "circle-label")
                        .attr("dy", ".35em")
                        .attr("x", cx)
                        .attr("y", cy)
                        .text(`${d.name} (${d.amount})`)
                        .style("font-size", "20px")
                        .style("fill", "white")
                        .style("pointer-events", "none");
                })
                .on("mouseleave", function (event, d) {
                    d3.select(this).style("stroke-width", "1px");
                    d3.select(this.parentNode).select("text.circle-label").remove();
                }).on("click", function(event, d) {
                        dinoFilter["taxonomyLVL"] = d.class
                        dinoFilter["taxoname"] = d.name

                        document.getElementById("filterValues").textContent = `Valores seleccionados:
                             Pais: ${dinoFilter["country"]}
                             Era: ${dinoFilter["era"]}
                             Taxonomia: ${dinoFilter["taxoname"]}`;
                    })
            return taxoNodes},
                (update)=>{
                Object.assign(position, {});
                update.transition("Scale").duration(600).attr("r", d => 10 + d.amount / 4)
                    update.transition("Move").duration(800)
                    .attr("cx", (d, i) => {
                        if (d.class == "SuperOrder") {
                            position[d.name] = {"y": 0, "x": WIDTH_VIS_1 / 2}
                            return WIDTH_VIS_1 / 2;
                        }
                        if (d.class == "order") {
                            if (d.name == "Saurischia") {
                                position[d.name] = {"y": 0, "x": 3 * WIDTH_VIS_1 / 4}
                                return 3 * WIDTH_VIS_1 / 4;
                            } else {
                                position[d.name] = {"y": 0, "x": WIDTH_VIS_1 / 4 }
                                return WIDTH_VIS_1 / 4;
                            }
                        }
                        if (d.class == "suborder") {
                            if (d.father == "Saurischia") {
                                position[d.name] = {"y": 0, "x": (2 * WIDTH_VIS_1 / 4) + (d.id) * (WIDTH_VIS_1 / (2 * amount[d.father]["kid"]))}
                                return (2 * WIDTH_VIS_1 / 4) + (d.id) * (WIDTH_VIS_1 / (2 * amount[d.father]["kid"]));
                            } else {
                                position[d.name] = {"y": 0, "x": d.id * (WIDTH_VIS_1 / (2 * amount[d.father]["kid"]))}
                                return d.id * (WIDTH_VIS_1 / (2 * amount[d.father]["kid"]));
                            }
                        }
                        if (d.class == "clade") {
                            if (amount[d.father].father == "Saurischia") {
                                position[d.name] = {"y": 0, "x": 50 + (2 * WIDTH_VIS_1 / 4) + d.id * (amount[d.father]["id"] * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"] + 1)))) / amount[d.father]["kid"] + (amount[d.father]["id"] - 1) * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"])))}
                                return 50 + (2 * WIDTH_VIS_1 / 4) + d.id * (amount[d.father]["id"] * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"] + 1)))) / amount[d.father]["kid"] + (amount[d.father]["id"] - 1) * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"])));
                            } else {
                                position[d.name] = {"y": 0, "x": 50 + d.id * (amount[d.father]["id"] * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"] + 1)))) / amount[d.father]["kid"] + (amount[d.father]["id"] - 1) * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"])))}
                                return 50 + d.id * (amount[d.father]["id"] * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"] + 1)))) / amount[d.father]["kid"] + (amount[d.father]["id"] - 1) * (WIDTH_VIS_1 / (2 * (amount[d.grandpa]["kid"])));
                            }
                        }
                    })
                    .attr("cy", (d, i) => {
                        if (d.class == "clade"){
                            position[d.name]["y"] = posY(d.class) +  d.id * (sizeY(d.class) / amount[d.father]["kid"])
                            return posY(d.class) +  d.id * (sizeY(d.class) / amount[d.father]["kid"]);
                        } else {
                            position[d.name]["y"] = posY(d.class) + sizeY(d.class) / 2;
                            return posY(d.class) + sizeY(d.class) / 2;
                        }
                    })
                    .attr("taxonNode", d => d.name)
                        .attr("fill", d => {
                            if (d.class == "SuperOrder") {
                                return "steelblue";
                            }
                            if (d.class == "order") {
                                return coloresS(d.name);
                            }
                            if (d.class == "suborder") {
                                return coloresS(d.father);
                            }
                            if (d.class == "clade") {
                                return coloresS(amount[d.father].father);
                            }
                        })
                    return update},
                (exit)=>{exit.transition("Fade")
                    .duration(600)
                    .style("opacity", 0).remove();
            return exit});


        lines.selectAll("line")
            .data(data.filter(d => d.father))
            .join(
                (enter) =>{enter.append("line")
                    .attr("x1", d => position[d.father]["x"])
                    .attr("y1", d => position[d.father]["y"])
                    .attr("x2", d => position[d.name]["x"])
                    .attr("y2", d => position[d.name]["y"])
                    .attr("stroke", "black")
                    .attr("stroke-width", 2)} ,
                (update) => {
                    update
                    .attr("x1", d => position[d.father]["x"])
                    .attr("y1", d => position[d.father]["y"])
                    .attr("x2", d => position[d.name]["x"])
                    .attr("y2", d => position[d.name]["y"])
                },
                (exit) => {exit.remove()}
            );

        SVG1
            .selectAll("circle").raise()

    })}

SVG2.append("g")
    .attr('class', 'mapa_pais');
const path = d3.geoPath();
const projection = d3.geoMercator()
    .scale(100)
    .center([-70,70]);

function createMap(geo, data, filtered, era){
    const map = SVG2.append("g");


        map.selectAll("path")
        .data(geo.features).join((enter)=>{
            enter.append("rect")
                .attr("width", 4*WIDTH_VIS_2)
                .attr("height", 4*HEIGHT_VIS_2)
                .attr("stroke", "black")
                .attr("fill", "#444444")
                .attr("transform", `translate(${-WIDTH_VIS_2}, ${-HEIGHT_VIS_2})`);
            enter.append("path")
                // draw each country
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .attr("fill", function(d) {
                    d.total =  0;
                    data.map(dino => {
                        if (filtered){
                            if (dino.era == era){
                                if (dino.country== d.properties.name){
                                    d.total += 1
                                }
                            }
                        }else{
                            if (dino.country== d.properties.name){
                                d.total += 1
                            }
                        }
                    })

                    if (d.total == 0) {
                        return "#6c6c6c"
                    }
                    else{
                        return presenceScale(d.total);
                    }
                }).attr("class", "Country")
                .on("mouseenter", function (){d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "black");})
                .on("mouseleave", function (){d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "transparent");})
                .on("click", function(event, d) {


                    dinoFilter["country"] = d.properties.name
                    document.getElementById("filterValues").textContent = `Valores seleccionados:
                     Pais: ${dinoFilter["country"]}
                     Era: ${dinoFilter["era"]}
                     Taxonomia: ${dinoFilter["taxoname"]}`;
                });
        }, (exit)=>{exit.remove()})




    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
            map.attr("transform", event.transform);
        });

    SVG2.call(zoom);

    return SVG2.node();

}

async function getDino(){
    document.getElementById("filterValues").textContent = `Valores seleccionados:
     Pais: ${dinoFilter["country"]}
     Era: ${dinoFilter["era"]}
     Taxonomia: ${dinoFilter["taxoname"]}`;
    const dinos = await d3.csv(dinoFile);
    let counter = 0;
    let ids = []
    dinos.map((d, i)=>{
        let valid = true;
        if (dinoFilter["country"] != "all"){
            if (d.country != dinoFilter["country"]){
                valid = false;
            }
        }
        if (dinoFilter["era"] != "all"){
            if (d.era != dinoFilter["era"]){
                valid = false
            }
        }
        if (dinoFilter["taxonomyLVL"] == "clade"){
            if (d.clade != dinoFilter["taxoname"]){
                valid = false
            }
        }
        if (dinoFilter["taxonomyLVL"] == "order"){
            if (d.order != dinoFilter["taxoname"]){
                valid = false
            }
        }
        if (dinoFilter["taxonomyLVL"] == "suborder"){
            if (d.suborder != dinoFilter["taxoname"]){
                valid = false
            }
        }
        if (valid){
            ids.push(i);
        }
    }
    );

    if (ids.length > 0) {
        const randomIndex = ids[Math.floor(Math.random() * ids.length)];
        dinos.forEach((d, i) => {
            if (i === randomIndex) {
                document.getElementById("detailName").textContent = `${d.name} ${d.especie}`;
                document.getElementById("detailEra").textContent = `${d.era}`;
                document.getElementById("detailCountry").textContent = `${d.country}`;
                document.getElementById("detailDiet").textContent = `${d.diet}`;
                document.getElementById("detailTaxonomy").textContent = `${d.superorder} ${d.order} ${d.suborder} ${d.clade}`;
                document.getElementById("detailType").textContent = `${d.type}`;
                document.getElementById("dinotype").src = dinoScale(d.type);
            }
        });
    } else {
        document.getElementById("detailName").textContent = 'NO ENCONTRADO';
        document.getElementById("detailEra").textContent = 'NO ENCONTRADO';
        document.getElementById("detailCountry").textContent = 'NO ENCONTRADO';
        document.getElementById("detailDiet").textContent = 'NO ENCONTRADO';
        document.getElementById("detailTaxonomy").textContent = 'NO ENCONTRADO NO ENCONTRADO NO ENCONTRADO NO ENCONTRADO';
        document.getElementById("detailType").textContent = 'NO ENCONTRADO';
        document.getElementById("dinotype").src = dinoScale("NOTFOUND");

    }
}
async function load(filtered, era){
    dinoFilter["era"] = era;
    const paises = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
    const dinos = await d3.csv(dinoFile);
    createMap(paises, dinos, filtered, era)
    createTaxonomyTree(filtered, era)
    getDino()
}
load(false, "all")
d3.select("#AllEra").on("click", () => load(false, "all"));
d3.select("#Cretaceous").on("click", () => load(true, "Cretaceous"));
d3.select("#Jurassic").on("click", () => load(true, "Jurassic"));
d3.select("#Triassic").on("click", () => load(true, "Triassic"));
