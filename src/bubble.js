(() => {

    var margin = { top: 100, right: 140, bottom: 100, left: 85 },
        width = 960 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    var svg = d3.select("#bubble")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var data = []


    //Input file
    window.on_create_bubble = function (region) {

        console.log('Hello Bubble! - ' + region);

        // data['columns'] = Object.keys(data[0]);
        svg.selectAll('*').remove();
        state = region


        var data_filtered = data.filter(function (d) {
            return (state == d['country'])
        });

        var maxCount = d3.max(data.map((d) => { return d.count }));

        var lineScale = d3.scaleLinear()
            .domain([0, maxCount])
            .range([1, 2]);

        var color = bubble_color
        var circleOpacity = .5
        var circleBackground = "white"
        var arcOpacity = 1
        var nodes = [... new Set(data_filtered.map(a => a.linksym))];
        // var nodes = d3.map(data_filtered, function (d, i) { return d.linksym; }).keys();
        //var nodes = [... new Set(data.map(a => a.linksym))];
        var x = d3.scalePoint()
            .range([0, width])
            .domain(nodes);

        var labels = svg.append("g");

        var links = svg
            .selectAll('links')
            .data(data_filtered)
            .enter()
            .append('path')
            .attr('d', function (d) {
                var yCoord = (height / 2) - 100; //y coordinate where axis is positioned
                start = x(d.topsym)    // x position of pickup node
                end = x(d.linksym)      // x position of dropoff node
                var arc = ['M', start, yCoord, 'A', (start - end) / 2, (start - end) / 2, 0, 0, 0, end, yCoord].join(' ');
                return arc;
            })
            .style("fill", "none")
            //.attr("stroke", "grey")
            .attr("stroke", function (d) { return color[nodes.indexOf(d.topsym)]; })
            .attr("stroke-width", function (d) { return lineScale(d.count); })
            .attr("opacity", .4);

        var node = labels
            .selectAll("nodes")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return (x(d)) })
            .attr("cy", (height / 2) - 120)
            .attr("r", 35)
            .attr("fill", function (d) { return color[nodes.indexOf(d)]; })
            .attr("stroke", function (d) { return color[nodes.indexOf(d)]; })
            .attr("stroke-width", 7)
            .attr("opacity", 1);

        //.tickValues(x_scale.domain().filter(function (d, i) {
        ////   return !(i % 5)
        //}));
        firstThird = nodes.filter(function (d, i) {
            return !(i % 3)

        })
        secondThird = nodes.filter(function (d, i) {
            return !((i + 1) % 3)

        })
        thirdThird = nodes.filter(function (d, i) {
            return !((i + 2) % 3)

        })

        svg.selectAll("labels")
            .data(thirdThird)
            .enter()
            .append("text")
            .attr("x", function (d) { return (x(d)) })
            .attr("y", 330)
            .text(function (d) { var s = d.replace('', ''); return (s); })
            .attr("fill", "black")
            .attr("stroke", "black")
            .style("text-anchor", "middle")
            .style("font-size", 35);

        svg.selectAll("labels")
            .data(firstThird)
            .enter()
            .append("text")
            .attr("x", function (d) { return (x(d)) })
            .attr("y", 185)
            .text(function (d) { var s = d.replace('', ''); return (s); })
            .attr("fill", "black")
            .attr("stroke", "black")
            .style("text-anchor", "middle")
            .style("font-size", 35);
        svg.selectAll("labels")
            .data(secondThird)
            .enter()
            .append("text")
            .attr("x", function (d) { return (x(d)) })
            .attr("y", 250)
            .text(function (d) { var s = d.replace('', ''); return (s); })
            .attr("fill", "black")
            .attr("stroke", "black")
            .style("text-anchor", "middle")
            .style("font-size", 35);
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
            .text(region_title + " Top Symptom Linkage Frequencies")
            .style("font-size", 30)
            .style("font-weight", "bold")
            .style('fill', function (d) {
                if (region_title == 'Overall') { return 'black' } else {
                    for (let i = 0; i < colorDict.length; i++) {
                        if (colorDict[i].key == region_title) {
                            return colorDict[i].value
                        }
                    }
                }
            }).style("font-size", "30px")
            .attr("x", 130)
            .attr("y", -5);


        // node
        //     .on('mouseover', function (d) {
        //          d3.select(this).selectAll("text").enter().attr("font-size", 30);
        //                     })
        //     .on('mouseout', function (d) {
        //         node.style("font-size", 15)
        //      })


    }


    Promise.all([
        d3.csv("https://raw.githubusercontent.com/caroline0codes/CSEDataVis/main/disease_data.csv", (d) => data.push(d))
    ]).then(() => on_create_bubble("DEFAULT"));

})();