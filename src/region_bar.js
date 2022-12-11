(() => {

    // define chart parameters
    const band_padding = 0.3;
    const chart_padding = 110;

    const min_y_value = 0;
    const max_y_value = 450;

    const min_x_value = 0;
    const max_x_value = 810;

    const min_count = 0;
    const max_count = 8e6;

    const hex_codes = region_bar_color;

    // select svg and load csv data
    let svg = d3.select('#region_bar');
    let data = [];

    // define tooltip
    let tooltip = d3
        .select('#tooltip_region_target')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '5px')
        .style('width', '175px')
        .style('position', 'absolute');


    window.on_create_region_bar = function (region,dateLine) {

        console.log('Hello Region Bar! - ' + region);
        svg.selectAll('*').remove();

        // select unique regions and outcomes
        let regions = Array.from(new Set(data.map((d) => d['REGION'])))
        let outcomes = Array.from(new Set(data.map((d) => d['SURVIVED'])))

        // create X axis
        let x_scale = d3.scaleBand()
            .domain(regions)
            .range([min_x_value, max_x_value])
            .padding(band_padding);

        let x_axis = d3.axisBottom()
            .scale(x_scale)
            .ticks();

        var myColor2 = d3.scaleOrdinal()
            .range(geo_color2)
            .domain(["Columbia", "Iran", "Lebanon", "Saudi Arabia", "Thailand", "Turkey", "Venezuela", "Yemen", "Karachi", "Allepo", "Nairobi"])

        svg.append('g').
            attr('transform', `translate(${chart_padding}, ${chart_padding + max_y_value})`)
            .call(x_axis)
            .selectAll("text")
            .attr("transform", "translate(-10,10)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", 25)
            .style('fill', function (d) { if (d == 'Overall') { return 'black' } else { for (let i = 0; i < colorDict.length; i++){
                if (colorDict[i].key == d) { 
                  return colorDict[i].value }}}});

        // create Y axis
        let y_scale = d3.scaleLinear()
            .domain([min_count, max_count])
            .range([max_y_value, min_y_value]);

        let y_axis = d3.axisLeft()
            .scale(y_scale)
            .ticks(8);

        svg.append('g')
            .attr('transform', `translate(${chart_padding}, ${chart_padding})`)
            .call(y_axis)
            .style("font-size", 25);

        // create color scale
        let colors = d3.scaleOrdinal()
            .domain(outcomes)
            .range(hex_codes);

        // define mouseover mouse leave and mousemove function
        let mouse_over = function (d) {
            tooltip
                .style('opacity', 1)
                .style('visibility', 'visible');
        }

        let mouse_leave = function (d) {
            tooltip.style('visibility', 'hidden');
        }

        let mouse_move = function (d) {

            let region = d3.select(this).datum().data['REGION'];
            let survived = d3.select(this).datum().data['True'];
            let died = d3.select(this).datum().data['False'];

            tooltip
                .html(region + '<br>' + 'Survived: ' + survived + '<br>' + 'Died: ' + died)
                .style('left', d.clientX + window.scrollX + 20 + 'px')
                .style('top', d.clientY + window.scrollY - 20 + 'px');
        }

        // create mouse click listener
        let selection = null;
        let mouse_click = function (d) {

            let region = d3.select(this).datum().data['REGION'];

            d3
                .selectAll('rect')
                .style('stroke', 'red')
                .style('stroke-width', '0px');

            if (selection != region) {
                d3
                    .selectAll(`.${region.replace(' ', '.')}`)
                    .style('stroke', 'black')
                    .style('stroke-width', '3px');
                window.on_create_region_bar(region,dateLine);
                window.on_create_syndrome_bar(region);
                window.on_create_age_bar(region);
                window.on_create_bubble(region);
                window.on_create_timeline(region, dateLine);
                selection = region;




            } else {
                d3
                    .selectAll(`.${region.replace(' ', '.')}`)
                    .style('stroke', 'red')
                    .style('stroke-width', '0px');
                window.on_create_region_bar('DEFAULT',dateLine);
                window.on_create_syndrome_bar('DEFAULT');
                window.on_create_age_bar('DEFAULT');
                window.on_create_bubble("DEFAULT");
                window.on_create_timeline('DEFAULT', dateLine);
                selection = null;
            }
        }

        // stack data
        let grouped_data = [];

        for (const region of regions) {
            let region_dict = {};
            region_dict['REGION'] = region;

            for (const row of data) {
                if (row['REGION'] == region) {
                    region_dict[row['SURVIVED']] = row['COUNT'];
                }
            }

            grouped_data.push(region_dict);
        }

        let stacks = d3.stack()
            .order(d3.stackOrderReverse)
            .keys(outcomes)
            (grouped_data);

        // create bars
        svg
            .append('g')
            .selectAll('.g')
            .data(stacks)
            .enter()
            .append('g')
            .attr('fill', (d) => colors(d.key))
            .selectAll('.rect')
            .data((d) => d)
            .enter()
            .append('rect')
            .attr('class', (d) => d.data['REGION'])
            .attr('x', (d) => chart_padding + x_scale(d.data['REGION']))
            .attr('y', (d) => chart_padding + y_scale(d[1]))
            .attr('width', x_scale.bandwidth())
            .attr('height', (d) => y_scale(d[0]) - y_scale(d[1]))
            .on('click', mouse_click)
            .on('mousemove', mouse_move)
            .on('mouseover', mouse_over)
            .on('mouseleave', mouse_leave);

        svg
            .append('text')
            .attr('x', chart_padding + 405)
            .attr('y', chart_padding)
            .text('Death Toll by Region')
            .style("font-size", 35)
            .style("font-weight", "bold")
            .style('fill', 'black')
            .style('text-anchor', 'middle');

        // init
        if (region != 'DEFAULT') {
            d3
                .selectAll(`.${region.replace(' ', '.')}`)
                .style('stroke', 'black')
                .style('stroke-width', '3px');
            selection = region;
        }

    }

    Promise.all([
        d3.csv('output/region_count.csv', (d) => data.push(d)),
    ]).then(() => on_create_region_bar('DEFAULT', d3.timeParse("%Y-%m-%d")("2009-06-28")));

})();