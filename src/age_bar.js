(() => {

    var margin = { top: 100, right: 60, bottom: 70, left: 120 },
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    // select svg and load csv data
    let bar_data = [];

    var svg = d3.select("#age_bar")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Input file
    window.on_create_age_bar = function (region) {

        console.log('Hello Age Bar! - ' + region);
        svg.selectAll('*').remove();


        // X axis
        var x = d3.scaleBand()
            .range([0, width])
            .domain(bar_data.map(function (d) { return d['age']; }))
            .padding(0.6);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", 30)
            .attr("transform", "translate(3.4,0)")
            .style("text-anchor", "end")
            .append("text")
            .attr("x", 100)
            .attr("y", -20)
            .text("TITLE")
            .style("font-size", "16px");

        //get modified dataset
        state = region
        array = []
        var data_filtered = bar_data.filter(function (d) {
            return (state == d['country'])
        });

        var max_temp = d3.max(data_filtered, function (d) { return +d["countM"]; })
        var colors = age_bar_color

        var y = d3.scaleLinear()
            .domain([0, max_temp])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y))
            .style("font-size", 25)
            .attr("stroke-width", "0.5");

        svg.selectAll("mybar")
            .data(data_filtered)
            .enter()
            .append("rect")
            .attr("class", "bars")
            .attr("x", function (d) {
                return x(d["age"]) - 18;
            })
            .attr("y", function (d) {
                return y(d["countM"]);
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d["countM"]); })
            .style("opacity", 1)
            .style("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", "#D5CDCC");
        //.style("fill", "#4966AD");

        svg.selectAll("mybar")
            .data(data_filtered)
            .enter()
            .append("rect")
            .attr("class", "bars")
            .attr("x", function (d) {
                return x(d["age"]) + 18;
            })
            .attr("y", function (d) {
                return y(d["countF"]);
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d["countF"]); })
            .style("opacity", 1)
            .style("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", 'white');
        //.style("fill", "#B49FBB");


        let region_title = null;
        if (region == 'DEFAULT') {
            region_title = 'Overall';
        } else {
            region_title = region;
        }
        var myColor2 = d3.scaleOrdinal()
            .range(geo_color2)
            .domain(["Columbia", "Iran", "Lebanon", "Saudi Arabia", "Thailand", "Turkey", "Venezuela", "Yemen", "Karachi", "Allepo", "Nairobi"])


            svg.append("text")
            .text(region_title + " Patient Population by Age Range and Total Infected")
            .style("font-size", "18px")
            .attr('font-family', 'Helvetica Neue, Arial')
            .style("font-weight", "bold")
            .attr("x", -45)
            .attr("y", -30)
            .style('fill', function (d) {
                if (region_title == 'Overall') { return 'black' } else {
                    for (let i = 0; i < colorDict.length; i++) {
                        if (colorDict[i].key == region_title) {
                            return colorDict[i].value
                        }
                    }
                }
            })
            .style("font-size", 30)



        //svg.append("circle").attr("cx", 600).attr("cy", 59).attr("r", 10).style("fill", "#4966AD")
        // svg.append("circle").attr("cx", 600).attr("cy", 100).attr("r", 10).style("fill", "#B49FBB")
        svg.append("circle").attr("cx", 600).attr("cy", 59).attr("r", 10)
            .style("fill", "#D5CDCC").style("stroke", "black").attr("stroke-width", 1);
        svg.append("circle").attr("cx", 600).attr("cy", 100).attr("r", 10)
            .style("fill", 'white').style("stroke", "black").attr("stroke-width", 1);

        svg.append("text").attr("x", 620).attr("y", 60).text("Male").style("font-size", "15px").style("font-size", 45).attr("alignment-baseline", "middle")
        svg.append("text").attr("x", 620).attr("y", 100).text("Female").style("font-size", "15px").style("font-size", 45).attr("alignment-baseline", "middle")

    }

    Promise.all([
        d3.csv("https://raw.githubusercontent.com/caroline0codes/CSEDataVis/main/population_a_g.csv", (d) => bar_data.push(d))
    ]).then(() => on_create_age_bar("DEFAULT"));

})();