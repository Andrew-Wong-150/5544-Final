(() => {

    // define chart parameters
    const band_padding = 0.4;
    const chart_padding = 75;

    const min_y_value = 0;
    const max_y_value = 500;

    const min_x_value = 0;
    const max_x_value = 950;

    const hex_codes = line_color;

    // select svg and load csv data
    let svg = d3.select('#line');
    let data = [];

    window.on_create_timeline = function (region, date) {

        console.log('Hello Line! - ' + region);
        svg.selectAll('*').remove();

        if(region == 'Columbia') {
            region = 'Colombia';
        }

        target_data = data.filter(function (d) {
            if (((d3.timeParse("%Y-%m-%d")(d["DATE"])) < date) && (d['REGION'] == region)) {
                return d;
            }

        })
        let count = Array.from(
            target_data.reduce(
                (m, { INFECTED, DIED }) => m.set(INFECTED, (m.get(INFECTED) || 0) + Number(DIED)), new Map),
            ([INFECTED, DIED]) => ({ INFECTED, DIED }))
            .map((d) => d['INFECTED']);

        let magnitude = Math.pow(10, Math.round(Math.log10(Math.max.apply(Math, count))) - 1);
        let min_count = 0;
        let max_count = Math.ceil(Math.max.apply(Math, count) / magnitude) * magnitude;

        let tick_spacing = parseInt(max_x_value / target_data.map((d) => d['DATE']).length);

        // create X axis
        let x_scale = d3.scaleOrdinal()
            .domain(target_data.map((d) => d['DATE']))
            .range(target_data.map((d, i) => i * tick_spacing));
        
        let x_axis = d3.axisBottom().scale(x_scale).ticks();
        svg.append("g").attr("transform", `translate(${chart_padding}, ${chart_padding + max_y_value})`)
            .call(x_axis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .style("font-size", 15)
            .attr("transform", "rotate(-90)");

        // create Y axis
        let y_scale = d3.scaleLinear()
            .domain([max_count, min_count])
            .range([min_y_value, max_y_value]);

        let y_axis = d3.axisLeft().scale(y_scale).ticks();
        svg.append("g")
            .attr("transform", `translate(${chart_padding}, ${chart_padding})`)
            .call(y_axis)
            .style("font-size", 25);


        // draw lines
        svg
            .append("path")
            .datum(target_data)
            .attr("fill", "none")
            .attr("stroke", hex_codes[1])
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x((d) => chart_padding + x_scale(d["DATE"]))
                .y((d) => chart_padding + y_scale(d["INFECTED"]))
            )

        // draw lines
        svg
            .append("path")
            .datum(target_data)
            .attr("fill", "none")
            .attr("stroke", hex_codes[0])
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x((d) => chart_padding + x_scale(d["DATE"]))
                .y((d) => chart_padding + y_scale(d["DIED"]))
            )

        // draw legend
        svg
            .selectAll(".dots")
            .data(['DIED', 'INFECTED'])
            .enter()
            .append("circle")
            .attr("cx", chart_padding + 700)
            .attr("cy", (d, i) => chart_padding + 370 + i * 50)
            .attr("r", 15)
            .style("fill", (d, i) => hex_codes[i]);

        svg
            .selectAll(".labels")
            .data(['DIED', 'INFECTED'])
            .enter()
            .append("text")
            .attr("x", chart_padding + 720)
            .attr("y", (d, i) => chart_padding + 385 + i * 50)
            .text((d) => d)
            .style("fill", "black")
            .style("font-size", 40);

        let region_title = null;
        if (region == 'DEFAULT') {
            region_title = 'Overall';
        } else {
            region_title = region;
        }
        var myColor2 = d3.scaleOrdinal()
            .range(geo_color2)
            .domain(["Columbia", "Iran", "Lebanon", "Saudi Arabia", "Thailand", "Turkey", "Venezuela", "Yemen", "Karachi", "Allepo", "Nairobi"])

        svg
            .append('text')
            .attr('x', chart_padding + 450)
            .attr('y', chart_padding)
            .text(region_title + ' Infection / Death Over Time')
            .style('fill', function (d) {
                if (region_title == 'Overall') { return 'black' } else {
                    for (let i = 0; i < colorDict.length; i++) {
                        if (colorDict[i].key == region_title) {
                            return colorDict[i].value
                        }
                    }
                }
            })
            .style("font-size", 40)
            .style("font-weight", "bold")
            .style('text-anchor', 'middle');
        
    }

    Promise.all([
        d3.csv('output/time_lapse.csv', (d) => data.push(d)),
    ]).then(() => on_create_timeline('DEFAULT', d3.timeParse("%Y-%m-%d")("2009-06-28")));

})();