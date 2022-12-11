(() => {

    let first_init = true;

    window.geo_map = function (region) {

        d3.queue()
            .defer(d3.csv, "output/Data_For_Bubble_Plot.csv")
            .defer(d3.json, "output/worldgeo.json")
            .defer(d3.json, "output/treemap.json")
            .await(LoadData);



        function updateTypeMap(country, map, region, params, lineRegion, type) {
            d3.select("#choropleth_map").select("svg").remove();
            d3.select("#choropleth_map").select('select').remove();
            params['DATA'] = type
            console.log("WHAT IS THIS:", lineRegion)
            DrawMap(country, map, region, params, lineRegion)
            window.on_create_timeline(setRegion, lineRegion)
        }

        function LoadData(error, country, map, region) {
            let params = {}
            params['DATE'] = d3.timeParse("%Y-%m-%d")("2009-06-28")
            params['SYNDROME'] = "Total"
            params['DATA'] = 'Percents'
            let lineRegion = 'DEFAULT'
            DrawMap(country, map, region, params, lineRegion);

            if(first_init) {
                DrawTree(region);
            }
        }

        function updateDateMap(country, map, region, params, lineRegion, date) {
            d3.select("#choropleth_map").select("svg").remove();
            d3.select("#choropleth_map").select('select').remove();
            params['DATE'] = date
            DrawMap(country, map, region, params, lineRegion)
        }

        function updateTypeMap(country, map, region, params, lineRegion, type) {
            d3.select("#choropleth_map").select("svg").remove();
            d3.select("#choropleth_map").select('select').remove();
            params['DATA'] = type
            DrawMap(country, map, region, params, lineRegion)
        }

        function DrawMap(country, map, region, params, lineRegion) {
            document.getElementById("Counts").addEventListener("click", function () {
                updateTypeMap(country, map, region, params, lineRegion, 'Counts');
                window.on_create_timeline(lineRegion, params['DATE'])
            })
            document.getElementById("Percents").addEventListener("click", function () {
                updateTypeMap(country, map, region, params, lineRegion, 'Percents');
                window.on_create_timeline(lineRegion, params['DATE'])
            })
            let setRegion = lineRegion
            // console.log(params)
            syndromes = []
            country.map(function (d) {
                if (syndromes.indexOf(d.SYNDROME) === -1) {
                    syndromes.push(d.SYNDROME);
                }

                return syndromes
            })
            syndrome_counts = []
            syndromes.forEach(function (item, index) {
                total = 0
                country.map(function (d) {
                    if (d.SYNDROME === item) {
                        total += 1
                    }
                })
                if (total > 200) {
                    syndrome_counts.push({
                        syndrome: item,
                        count: total
                    })
                }


            })

            var width = 500;
            var height = 600;
            var svg = d3.select("#choropleth_map")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(d3.zoom().scaleExtent([1, 5]).on("zoom", function () {
                    svg.selectAll(".map")
                        .attr("transform", d3.event.transform)
                }))
                .append("g")
            //.attr("transform", "translate(" + 100 + "," + 100 + ")");
            const parseTime = d3.timeParse("%Y-%m-%d");

            dates = country.map(function (d) {
                if (d.DATE != 'Total') {
                    return d.DATE
                }
            })
            let uniqueDates = [];
            dates.forEach((c) => {
                if (!uniqueDates.includes(c)) {
                    uniqueDates.push(c)
                }

            });
            temp = uniqueDates.map(function (d) {
                if (d != undefined) {
                    return parseTime(d)
                }
            })

            temp.sort(function (a, b) {
                return a - b;
            });

            var filteredData = country.filter(function (d) {
                if ((parseTime(d["DATE"])) > params['DATE']) {
                    return d;
                }
            })
            var tooltip = d3.select("#tooltip_map_target")
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

            var mouseover = function (d) {
                tooltip
                    .style("opacity", 1)
                    .style('visibility', 'visible');
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
            }



            var mousemove = function (d) {
                if (params['DATA'] == 'Counts') {
                    tooltip
                        .html("Region: " + regionGetter(d.country) + "<br>Died:  " + d.size + ' people')
                        .style('left', d3.event.clientX + window.scrollX + 20 + 'px')
                        .style('top', d3.event.clientY + window.scrollY - 20 + 'px');
                }
                else {
                    tooltip
                        .html("Region: " + regionGetter(d.country) + "<br>Population Died:  " + d.size.toFixed(2) + '%')
                        .style('left', d3.event.clientX + window.scrollX + 20 + 'px')
                        .style('top', d3.event.clientY + window.scrollY - 20 + 'px');
                }

            }

            let selection = null;
            let mouseclick = function (d) {
                let region = regionGetter(d.country);
                setRegion = region
                if (region == "Columbia") {
                    region = "Colombia";
                }
                if (selection != region) {
                    window.on_create_region_bar(region, params['DATE']);
                    window.on_create_syndrome_bar(region);
                    window.on_create_age_bar(region);
                    window.on_create_bubble(region);
                    window.on_create_timeline(region, params['DATE']);
                    selection = region;

                } else {
                    window.on_create_region_bar('DEFAULT', params['DATE']);
                    window.on_create_syndrome_bar('DEFAULT');
                    window.on_create_age_bar('DEFAULT');
                    window.on_create_bubble("DEFAULT");
                    window.on_create_timeline('DEFAULT', d3.timeParse("%Y-%m-%d")("2009-06-28"));
                    selection = null;
                }

                d3.selectAll('.bubble')
                    .style('stroke', 'red')
                    .style('stroke-width', '0px');

                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", "2px")
                    .style("opacity", 0.8)
            }

            d3.select("#date").on("change", function (d) {
                selectedValue = temp[parseInt(toRange(this.value))]
                updateDateMap(country, map, region, params, setRegion, selectedValue)
                window.on_create_timeline(setRegion, selectedValue)

            })

            var mouseleave = function (d) {
                tooltip.style('visibility', 'hidden');
                if (regionGetter(d.country) != selection) {
                    d3.select(this)
                        .style("stroke", "none")
                        .style("opacity", 0.8)
                }
            }

            countries = country.map(function (d) { return d.Country })
            //turkey is stored differently so dealing with it different;y
            var markers = []
            for (let i = 0; i < 177; i++) {
                if (countries.includes(map.features[i].properties.name)) {
                    if (map.features[i].properties.name == 'Turkey') {
                        markers.push({
                            country: map.features[i].properties.name,
                            long: map.features[i].geometry.coordinates[0][0][0][0],
                            lat: map.features[i].geometry.coordinates[0][0][0][1],
                            size: 0
                        })
                    }
                    else {
                        markers.push({
                            country: map.features[i].properties.name,
                            long: map.features[i].geometry.coordinates[0][0][0],
                            lat: map.features[i].geometry.coordinates[0][0][1],
                            size: 0
                        })
                    }
                }
            }
            if (params['DATA'] == 'Counts') {
                var size = d3.scaleLinear()
                    .domain(d3.extent(filteredData.map(function (d) { return parseFloat(d.PATIENT_ID) })))  // What's in the data
                    .range([5, 35])  // Size in pixel
                for (i = 0; i < filteredData.length; i++) {
                    for (j = 0; j < markers.length; j++) {
                        if (markers[j].country == filteredData[i].Country) {
                            markers[j].size = parseInt(filteredData[i].PATIENT_ID)
                        }
                    }

                }

            }

            else {
                var size = d3.scaleLinear()
                    .domain(d3.extent(filteredData.map(function (d) { return parseFloat(d.DeadPerPop) })))  // What's in the data
                    .range([5, 35])  // Size in pixel
                for (i = 0; i < filteredData.length; i++) {
                    for (j = 0; j < markers.length; j++) {
                        if (markers[j].country == filteredData[i].Country) {
                            markers[j].size = parseFloat(filteredData[i].DeadPerPop)
                        }
                    }
                }
            }

            var toRange = d3.scaleLinear()
                .range([1, 73])
                .domain([0, 100])


            var path = d3.geoPath();
            var data = d3.map();
            //create a map that takes in the state and returns the gernation number
            var projection = d3.geoAitoff()
                .scale(width / 1.3 / Math.PI)
                .translate([width / 2, height / 2])

            svg.append("g")
                .selectAll("path")
                .data(map.features)
                .enter().append("path")
                .attr("fill", "lightgrey")
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "#fff")

            var regionGetter = d3.scaleOrdinal()
                .range(region.children.map(function (child) { return child.name }))
                .domain(["Columbia", "Iran", "Lebanon", "Saudi Arabia", "Thailand", "Turkey", "Venezuela", "Yemen", "Pakistan", "Syria", "Kenya"])
            var myColor2 = d3.scaleOrdinal()
                .range(geo_color)
                .domain(region.children.map(function (child) { return child.name }))
            //console.log(region.children.map(function (child) { return child.name }))

            svg
                .selectAll("myCircles")
                .data(markers)
                .enter()
                .append("circle")
                .attr('class', (d) => 'bubble ' + regionGetter(d.country))
                .attr("cx", function (d) { return projection([d.long, d.lat])[0] })
                .attr("cy", function (d) { return projection([d.long, d.lat])[1] })
                .attr("r", function (d) { return Math.abs(size(Math.abs(d.size))) })
                .style("fill", function (d) {
                    return myColor2(regionGetter(d.country))
                })
                .attr("fill-opacity", .6)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
                .on("click", mouseclick)
            if (params['DATA'] == 'Counts') {
                var min = d3.min(filteredData.map(function (d) { return parseFloat(d.PATIENT_ID) }))
                var max = d3.max(filteredData.map(function (d) { return parseFloat(d.PATIENT_ID) }))

            }
            else {
                var min = d3.min(filteredData.map(function (d) { return parseFloat(d.DeadPerPop) }))
                var max = d3.max(filteredData.map(function (d) { return parseFloat(d.DeadPerPop) }))
            }

            var mid = min + max / 2
            var valuesToShow = [min, mid, max]
            var xCircle = 80
            var xLabel = 160
            var yCircle = 440

            svg
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("circle")
                .attr("cx", xCircle)
                .attr("cy", function (d) { return yCircle - size(d) })
                .attr("r", function (d) { return size(d) })
                .style("fill", "none")
                .attr("stroke", "black")

            svg
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("line")
                .attr('x1', function (d) { return xCircle + size(d) })
                .attr('x2', xLabel)
                .attr('y1', function (d) { return yCircle - size(d) })
                .attr('y2', function (d) { return yCircle - size(d) })
                .attr('stroke', 'black')
                .style('stroke-dasharray', ('2,2'))
            if (params['DATA'] == 'Counts') {
                svg
                    .selectAll("legend")
                    .data(valuesToShow)
                    .enter()
                    .append("text")
                    .attr('x', xLabel)
                    .attr('y', function (d) { return yCircle - size(d) })
                    .text(function (d) { return d + " deaths" })
                    .attr('alignment-baseline', 'middle')
            }
            else {
                svg
                    .selectAll("legend")
                    .data(valuesToShow)
                    .enter()
                    .append("text")
                    .attr('x', xLabel)
                    .attr('y', function (d) { return yCircle - size(d) })
                    .text(function (d) { return d.toFixed(2) + '%' })
                    .attr('alignment-baseline', 'middle')
            }

            const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var date2 = new Date(params['DATE'])
            svg.append("text")
                .attr('class', 'title')
                .attr('x', 270)
                .attr('y', 100)
                .style("font-size", 20)
                .style("font-weight", "bold")
                .attr('text-anchor', 'middle')
                .text(`2009 Infection Per Region Through ${month[date2.getMonth()]} ${date2.getDate()}`)



            var allGroup = ["Total", "vomiting", "diarrhia", "back pain", "back strain", "cough", "fever", "nausea", "neck pain", "nose bleed", "rash", 'abd pain', "vomitting blood"]

        }

        function DrawTree(region) {

            first_init = false;
            console.log('HI')

            var width1 = 1000;
            var height1 = 800;
            var svg1 = d3.select("#tree_map")
                .append("svg")
                .attr("width", width1)
                .attr("height", height1)
                .append("g")
                .attr("transform", "translate(" + 100 + "," + -100 + ")");
            var root = d3.hierarchy(region).sum(function (d) { return d.value })

            var colorDict = [
                {
                    key: 'Columbia',
                    value: '#f94144'
                },
                {
                    key: 'Iran',
                    value: "#f3722c"
                },
                {
                    key: 'Lebanon',
                    value: "#f8961e"
                },
                {
                    key: 'Saudi Arabia',
                    value: "#f9844a"
                },
                {
                    key: 'Thailand',
                    value: "#f9c74f"
                }
                ,
                {
                    key: 'Turkey',
                    value: "#90be6d"
                },
                {
                    key: 'Venezuela',
                    value: "#43aa8b"
                },
                {
                    key: 'Yemen',
                    value: "#4d908e"
                },
                {
                    key: 'Karachi',
                    value: "#577590"
                },
                {
                    key: 'Aleppo',
                    value: "#277da1"
                },
                {
                    key: 'Nairobi',
                    value: "#9b2226"
                }




            ]

            var myColor2 = d3.scaleOrdinal()
                .range(geo_color)
                .domain(region.children.map(function (child) { return child.name }))
            d3.treemap()
                .size([width1 / 1.5, height1 / 1.5])
                .padding(3)
                .paddingOuter(7)
                (root)
            // Build color scale
            var regions = d3.map();
            root.descendants().map(function (d) { if (d.depth == 1) { regions.set(d.data.name, { name: d.data.name, x0: d.x0, y0: d.y0, y1: d.y1, x1: d.x1 }) } })
            var temp = Object.values(regions);
          var tooltip1 = d3
                .select('#tooltip_tree_map_target')
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

            var mouseover = function (d) {
                tooltip1
                    .style("opacity", 1)
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
            }
            var mouseleave = function (d) {
                tooltip1
                    .style("opacity", 0)
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
            }
            var mousemove = function (d) {
                tooltip1
                    .html("Syndrome: " + d.data.name + "<br>Number:  " + d.data.value)
                    .style('left', d3.event.clientX + window.scrollX + 20 + 'px')
                    .style('top', d3.event.clientY + window.scrollY - 20 + 'px');
            }

            svg1
                .selectAll("rect")
                .data(root.leaves())
                .enter()
                .append("rect")
                .attr('x', function (d) { return d.x0; })
                .attr('y', function (d) { return d.y0 + 150; })
                .attr('width', function (d) { return d.x1 - d.x0; })
                .attr('height', function (d) { return d.y1 - d.y0; })
                .style("stroke", "black")
                .style("fill", function (d) {
                    for (let i = 0; i < colorDict.length; i++) {
                        if (colorDict[i].key == d.parent.data.name) {
                            return colorDict[i].value
                        }
                    }
                })

                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

            svg1
                .selectAll("text2")
                .data(temp)
                .enter()
                .append("text")
                .attr("x", function (d) { return d.x0 + 5 })    // +10 to adjust position (more right)
                .attr("y", function (d) { return d.y0 + 155 })    // +20 to adjust position (lower)
                .text(function (d) { return d.name })
                .attr("font-size", "15px")
                .attr("fill", function (d) {
                    return myColor2(d.name)
                })





                svg1.append("text")
                .text("Tree Map of Top 10 Syndromes in Each Region")
                .style("font-size", 30)
                .style("font-weight", "bold")
                .style('fill', "black").style("font-size", "30px")
                .attr("x", 15)
                .attr("y", 140);
        }





    }


    Promise.all([
    ]).then(() => geo_map());

})();