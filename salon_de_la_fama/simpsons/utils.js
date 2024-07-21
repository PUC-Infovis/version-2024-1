const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("box-shadow", "0 4px 8px rgba(0,0,0,0.1)")
    .style("pointer-events", "none")
    .style("opacity", 0);


// utilice como referencia la ayudantia 7 en esta parte
function createCircles(svg, data, xScale, yScale, yValueAccessor, showAverages = false) {
    const circles = svg.selectAll("circle")
        .data(data)
        .attr("episode", d => d.number_in_series)
        .attr("r", 3);

    circles.enter()
        .append("circle")
        .attr("cx", d => xScale(d.season))
        .attr("cy", d => yScale(yValueAccessor(d)))
        .attr("episode", d => d.number_in_series)
        .attr("selected", false)
        .attr("episode_name", d => d.title)
        .attr("r", 3)
        .attr("fill", "blue")
        .on("mouseover", function(event, d) {
            if (!showAverages) {
                tooltip.transition().duration(200).style("opacity", 0.9);
            
                let seasonNumber = d.number_in_season !== undefined ? d.number_in_season : "X";
                let title = d.title !== undefined ? d.title : "Season " + d.season;

                let formatNumber = (num) => {
                    if (num === undefined || num === null) {
                        return "N/A";
                    }
                    let truncated = num.toFixed(2);
                    return truncated.endsWith(".000") ? parseInt(truncated) : truncated;
                };

                let imdbRating = formatNumber(d.imdb_rating);
                let tmdbRating = formatNumber(d.tmdb_rating);
                let usViewers = formatNumber(d.us_viewers_in_millions) + "M";
            
                tooltip.html(`
                    <div style="margin-bottom: 5px;">S${d.season}E${seasonNumber} - ${title}</div>
                    <div>IMDb: ${imdbRating}</div>
                    <div>TMDb: ${tmdbRating}</div>
                    <div>US Viewers: ${usViewers}</div>
                `)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("max-width", "250px");
            }
            
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .on("click", function(event, d) {
            circles.attr("episode", d => d.number_in_series);
            if (!showAverages) {
                const isSelected = d3.selectAll(`circle[episode="${d.number_in_series}"]`).attr("selected") === "true";
                d3.selectAll("circle").attr("opacity", 0.05).attr("fill", "blue").attr("selected", false);

                if (!isSelected) {
                    d3.selectAll(`circle[episode="${d.number_in_series}"]`)
                        .attr("opacity", 1)
                        .attr("selected", true)
                        .attr("r", 5);
                    
                    document.getElementById("episode-name").innerText = d.title;
                    document.getElementById("episode-season").innerText = d.season;
                    document.getElementById("episode-episode").innerText = d.number_in_season;
                    document.getElementById("episode-date").innerText = d.original_air_date;
                    document.getElementById("episode-writers").innerText = d.written_by;
                    document.getElementById("episode-director").innerText = d.directed_by;
                    document.getElementById("episode-imdb").innerText = d.imdb_rating;
                    document.getElementById("episode-tmdb").innerText = d.tmdb_rating;
                    document.getElementById("episode-views").innerText = d.us_viewers_in_millions;
                    document.getElementById("episode-description").innerText = d.description;
                } else {
                    d3.selectAll("circle")
                        .attr("opacity", 1)
                        .attr("fill", "blue")
                        .attr("selected", false)
                        .attr("r", 3);
                    document.getElementById("episode-name").innerText = "";
                    document.getElementById("episode-season").innerText = "";
                    document.getElementById("episode-episode").innerText = "";
                    document.getElementById("episode-date").innerText = "";
                    document.getElementById("episode-writers").innerText = "";
                    document.getElementById("episode-director").innerText = "";
                    document.getElementById("episode-imdb").innerText = "";
                    document.getElementById("episode-tmdb").innerText = "";
                    document.getElementById("episode-views").innerText = "";
                    document.getElementById("episode-description").innerText = "";
                }
            }
        })
        .merge(circles)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1)
        .attr("cx", d => xScale(d.season))
        .attr("cy", d => yScale(yValueAccessor(d)));

    circles.exit()
        .transition()
        .duration(1000)
        .attr("r", 0)
        .attr("episode", null)
        .attr("opacity", 0)
        .remove();

    return circles;
}

export { createCircles };