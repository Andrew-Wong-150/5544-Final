(() => {

// define chart parameters
const band_padding = 0.4;
const chart_padding = 110;

const min_y_value = 0;
const max_y_value = 450;

const min_x_value = 0;
const max_x_value = 810;

const hex_codes = syndrome_bar_color;

// select svg and load csv data
let svg = d3.select('#syndrome_bar');
let data = [];

window.on_create_syndrome_bar = function(region) {

    console.log('Hello Syndrome Bar! - ' + region);
    svg.selectAll('*').remove();

    // filter data
    target_data = data.filter(d => d['REGION'] == region);

    // calculate y-axis limits
    let count = Array.from(
        target_data.reduce(
            (m, {SYNDROME, COUNT}) => m.set(SYNDROME, (m.get(SYNDROME) || 0) + Number(COUNT)), new Map),
        ([SYNDROME, COUNT]) => ({SYNDROME, COUNT}))
        .map((d) => d['COUNT']);

    let magnitude = Math.pow(10, Math.round(Math.log10(Math.max.apply(Math, count))) - 1);
    let min_count = 0;
    let max_count = Math.ceil(Math.max.apply(Math, count) / magnitude) * magnitude;

    // select unique syndromes and outcomes
    let syndromes = Array.from(new Set(target_data.map((d) => d['SYNDROME'])))
    let outcomes = Array.from(new Set(target_data.map((d) => d['SURVIVED'])))

    // create X axis
    let x_scale = d3.scaleBand()
        .domain(syndromes)
        .range([min_x_value, max_x_value])
        .padding(band_padding);
    

    let x_axis = d3.axisBottom().scale(x_scale).ticks();
    svg
        .append('g')
        .attr('transform', `translate(${chart_padding}, ${chart_padding + min_y_value + max_y_value})`)
        .call(x_axis)
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .style("font-size",20)
        .attr("transform", "rotate(-45)");

    // create Y axis
    let y_scale = d3.scaleLinear()
        .domain([min_count, max_count])
        .range([max_y_value, min_y_value]);

    let y_axis = d3.axisLeft()
    .scale(y_scale)
    .ticks(8);
    svg
        .append('g')
        .attr('transform', `translate(${chart_padding}, ${chart_padding})`)
        .call(y_axis)
        .style("font-size",25);

    // create color scale
    let colors = d3.scaleOrdinal()
        .domain(outcomes)
        .range(hex_codes);

    // define tooltip
    let tooltip = d3
        .select('#tooltip_syndrome_target')
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

    // define mouseover mouse leave and mousemove function
    let mouse_over = function(d) {
        tooltip
            .style('opacity', 1)
            .style('visibility', 'visible');
    }

    let mouse_leave = function(d) {
        tooltip.style('visibility', 'hidden');
    }

    let mouse_move = function(d) {

        let syndrome = d3.select(this).datum().data['SYNDROME'];
        let survived = d3.select(this).datum().data['True'];
        let died = d3.select(this).datum().data['False'];

        tooltip
            .html(syndrome + '<br>' + 'Survived: ' + survived + '<br>' + 'Died: ' + died)
            .style('left',  d.clientX + window.scrollX + 20 + 'px')
            .style('top', d.clientY + window.scrollY - 20 + 'px');
    }

    // stack data
    let grouped_data = [];

    for(const syndrome of syndromes) {
        let syndrome_dict = {};
        syndrome_dict['SYNDROME'] = syndrome;

        for(const row of target_data) {
            if(row['SYNDROME'] == syndrome) {
                syndrome_dict[row['SURVIVED']] = row['COUNT'];
            } 
        }

        grouped_data.push(syndrome_dict);
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
                .attr('x', (d) => chart_padding + x_scale(d.data['SYNDROME']))
                .attr('y', (d) => chart_padding + y_scale(d[1]))
                .attr('width', x_scale.bandwidth())
                .attr('height', (d) => y_scale(d[0]) - y_scale(d[1]))
        .on('mousemove', mouse_move)
        .on('mouseover', mouse_over)
        .on('mouseleave', mouse_leave);


    let region_title = null;
    if(region == 'DEFAULT') {
        region_title = 'Overall';
    } else {
        region_title = region;
    }
    var myColor2 = d3.scaleOrdinal()
            .range(geo_color2)
            .domain(["Columbia", "Iran", "Lebanon", "Saudi Arabia", "Thailand", "Turkey", "Venezuala", "Yemen", "Karachi", "Allepo", "Nairobi"])

    svg
        .append('text')
        .attr('x', chart_padding + 405)
        .attr('y', chart_padding)
        .text(region_title + ' Top 10 Symptoms')
        .style("font-size", 35)
       .style("font-weight", "bold")
        .style('fill', function (d) { if (region_title == 'Overall') { return 'black' } else { for (let i = 0; i < colorDict.length; i++){
            if (colorDict[i].key == region_title) { 
              return colorDict[i].value }}}})
              .style('text-anchor', 'middle');
        

}

Promise.all([
    d3.csv('output/region_syndromes.csv', (d) => data.push(d)),
]).then(() => on_create_syndrome_bar('DEFAULT'));

})();