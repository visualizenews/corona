columns = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    const dayHeight = 20;
    const chartMargins = {
        s: [ 80, 20, 20, 30 ],
        m: [ 80, 20, 20, 30 ],
        l: [ 80, 10, 20, 50 ]
    };
    let chartData = {};

    const reset = () => {
        const chartContainer = document.querySelector('#columns-wrapper');
        chartContainer.innerHTML = '';
        drawLines();
        $container.classList.remove('loading');
    }

    const prepareData = () => {
        const indexesTemplate = {
            cases: {
                hundreds: false,
                thousands: false,
                tenthousands: false,
            },
            activeCases: {
                decrement: false,
            },
            newCases: {
                decrement: false,
            },
            deaths: {
                hundreds: false,
                thousands: false,
                tenthousands: false,
                decrement: false,
            },
            icu: {
                hundreds: false,
                thousands: false,
                tenthousands: false,
                decrement: false,
            }
        };
        let indexes = {
            italy: JSON.parse(JSON.stringify(indexesTemplate)),
        };
        const regions = Object.keys(data.italy.regions[0].data);
        regions.forEach( r => indexes[r] = JSON.parse(JSON.stringify(indexesTemplate)) );

        // Italy
        data.italy.global.forEach((d, i) => {
            chartData[d.datetime] = {
                datetime: d.datetime,
                data: {
                    italy: (() => {
                        const result = [];
                        // Cases
                        if (!indexes.italy.cases.hundreds && d.cases >= 100 ) {
                            indexes.italy.cases.hundreds = true;
                            result.push({ domain: 'cases', index: 'hundreds', datetime: d.datetime, data: d, });
                        }
                        if (!indexes.italy.cases.thousands && d.cases >= 1000 ) {
                            indexes.italy.cases.thousands = true;
                            result.push({ domain: 'cases', index: 'thousands', datetime: d.datetime, data: d, });
                        }
                        if (!indexes.italy.cases.tenthousands && d.cases >= 10000 ) {
                            indexes.italy.cases.tenthousands = true;
                            result.push({ domain: 'cases', index: 'tenthousands', datetime: d.datetime, data: d, });
                        }
                        // ActiveCases
                        if (!indexes.italy.activeCases.decrement) {
                            if (i > 0 && (d.cases - d.deaths - d.recovered) < (data.italy.global[i-1].cases - data.italy.global[i-1].deaths - data.italy.global[i-1].recovered)) {
                                indexes.italy.activeCases.decrement = true;
                                result.push({ domain: 'activeCases', index: 'decrement', datetime: d.datetime, data: d, });
                            }
                        }
                        // NewCases
                        if (!indexes.italy.newCases.decrement) {
                            if (i > 0 && (d.new_tested_positive) < (data.italy.global[i-1].new_tested_positive)) {
                                indexes.italy.newCases.decrement = true;
                                result.push({ domain: 'newCases', index: 'decrement', datetime: d.datetime, data: d, });
                            }
                        }
                        // Deaths
                        if (!indexes.italy.deaths.hundreds && d.deaths >= 100 ) {
                            indexes.italy.deaths.hundreds = true;
                            result.push({ domain: 'deaths', index: 'hundreds', datetime: d.datetime, data: d, });
                        }
                        if (!indexes.italy.deaths.thousands && d.deaths >= 1000 ) {
                            indexes.italy.deaths.thousands = true;
                            result.push({ domain: 'deaths', index: 'thousands', datetime: d.datetime, data: d, });
                        }
                        if (!indexes.italy.deaths.tenthousands && d.deaths >= 10000 ) {
                            indexes.italy.deaths.tenthousands = true;
                            result.push({ domain: 'deaths', index: 'tenthousands', datetime: d.datetime, data: d, });
                        }
                        // ICU
                        if (!indexes.italy.icu.hundreds && d.icu >= 100 ) {
                            indexes.italy.icu.hundreds = true;
                            result.push({ domain: 'icu', index: 'hundreds', datetime: d.datetime, data: d, });
                        }
                        if (!indexes.italy.icu.thousands && d.icu >= 1000 ) {
                            indexes.italy.icu.thousands = true;
                            result.push({ domain: 'icu', index: 'thousands', datetime: d.datetime, data: d, });
                        }
                        if (!indexes.italy.icu.tenthousands && d.icu >= 10000 ) {
                            indexes.italy.icu.tenthousands = true;
                            result.push({ domain: 'icu', index: 'tenthousands', datetime: d.datetime, data: d, });
                        }
                        /*
                        if (!indexes.italy.icu.decrement) {
                            if (i > 0 && (d.icu < data.italy.global[i-1].icu)) {
                                indexes.italy.icu.decrement = true;
                                result.push({ domain: 'icu', index: 'decrement', datetime: d.datetime, data: d, });
                            }
                        }
                        */
                        return result;
                    })(),
                }
            }
        });
        // Regions
        data.italy.regions.forEach((d,i) => {
            regions.forEach(r => {
                chartData[d.datetime].data[r] = (() => {
                    const result = [];
                    // Cases
                    if (!indexes[r].cases.hundreds && d.data[r].cases >= 100 ) {
                        indexes[r].cases.hundreds = true;
                        result.push({ domain: 'cases', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                    }
                    if (!indexes[r].cases.thousands && d.data[r].cases >= 1000 ) {
                        indexes[r].cases.thousands = true;
                        result.push({ domain: 'cases', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                    }
                    if (!indexes[r].cases.tenthousands && d.data[r].cases >= 10000 ) {
                        indexes[r].cases.tenthousands = true;
                        result.push({ domain: 'cases', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                    }
                    // ActiveCases
                    if (!indexes[r].activeCases.decrement) {
                        if (i > 0 && (d.data[r].cases - d.data[r].deaths - d.data[r].recovered) < (data.italy.regions[i-1].data[r].cases - data.italy.regions[i-1].data[r].deaths - data.italy.regions[i-1].data[r].recovered)) {
                            indexes[r].activeCases.decrement = true;
                            result.push({ domain: 'activeCases', index: 'decrement', datetime: d.datetime, data: d.data[r], });
                        }
                    }
                    // NewCases
                    if (!indexes[r].newCases.decrement) {
                        if (i > 0 && (d.data[r].new_tested_positive) < (data.italy.regions[i-1].data[r].new_tested_positive)) {
                            indexes[r].newCases.decrement = true;
                            result.push({ domain: 'newCases', index: 'decrement', datetime: d.datetime, data: d.data[r], });
                        }
                    }
                    // Deaths
                    if (!indexes[r].deaths.hundreds && d.data[r].deaths >= 100 ) {
                        indexes[r].deaths.hundreds = true;
                        result.push({ domain: 'deaths', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                    }
                    if (!indexes[r].deaths.thousands && d.data[r].deaths >= 1000 ) {
                        indexes[r].deaths.thousands = true;
                        result.push({ domain: 'deaths', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                    }
                    if (!indexes[r].deaths.tenthousands && d.data[r].deaths >= 10000 ) {
                        indexes[r].deaths.tenthousands = true;
                        result.push({ domain: 'deaths', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                    }
                    // ICU
                    if (!indexes[r].icu.hundreds && d.data[r].icu >= 100 ) {
                        indexes[r].icu.hundreds = true;
                        result.push({ domain: 'icu', index: 'hundreds', datetime: d.datetime, data: d.data[r], });
                    }
                    if (!indexes[r].icu.thousands && d.data[r].icu >= 1000 ) {
                        indexes[r].icu.thousands = true;
                        result.push({ domain: 'icu', index: 'thousands', datetime: d.datetime, data: d.data[r], });
                    }
                    if (!indexes[r].icu.tenthousands && d.data[r].icu >= 10000 ) {
                        indexes[r].icu.tenthousands = true;
                        result.push({ domain: 'icu', index: 'tenthousands', datetime: d.datetime, data: d.data[r], });
                    }
                    /*
                    if (!indexes[r].icu.decrement) {
                        if (i > 0 && (d.data[r].icu < data.italy.global[i-1].icu)) {
                            indexes[r].icu.decrement = true;
                            result.push({ domain: 'icu', index: 'decrement', datetime: d.datetime, data: d.data[r], });
                        }
                    }
                    */
                    return result;
                })()
            });
        });
    }

    const showDomainIndex = (domain, index) => {
        console.log(domain, index);
        const active = document.querySelector('.columns-data-connector-active');
        if (active) active.classList.remove('columns-data-connector-active');
        document.querySelector(`.columns-data-connector-${domain}-${index}`).classList.add('columns-data-connector-active');
    }

    const drawLines = () => {
        const keys = Object.keys(chartData);
        const regions = Object.keys(chartData[keys[0]].data);
        const width = $container.offsetWidth;
        let margins = chartMargins.s;
        if (window.matchMedia('(min-width: 1280px)').matches) {
            margins = chartMargins.l;
        } else if (window.matchMedia('(min-width: 768px)').matches) {
            margins = chartMargins.m;
        }
        const height = dayHeight * keys.length + margins[0] + margins[2];
        const colWidth = Math.floor((width - margins[1] - margins[3]) / regions.length);
        const hDistance = colWidth / 2;
        const vDistance = dayHeight / 2;
        const radius = Math.max( 2, colWidth / 20, dayHeight / 5);
        const linePoints = {};

        const $chartWrapper = d3.select('#columns-wrapper');
        const $svg = $chartWrapper
            .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewbox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');
        // Grid
        const $grid = $svg.append('g');
        const $connectors = $svg.append('g');
        const $regions = $svg.append('g');

        // Hgrid
        keys.forEach((d, i) => {
            const y = margins[0] + i * dayHeight + vDistance;
            $grid
                .append('line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', y)
                .attr('y2', y)
                .attr('class', `columns-grid-day columns-grid-day-${i}`)
        });
        // Vgrid
        regions.forEach((r, i) => {
            const x = margins[3] + (i * colWidth + hDistance);
            $grid
                .append('line')
                .attr('x1', x)
                .attr('x2', x)
                .attr('y1', margins[0])
                .attr('y2', height - margins[2] - vDistance)
                .attr('class', `columns-grid-region columns-grid-region-${i}`)

        });

        // Points & Lines
        regions.forEach((r, i) => {
            const $region = $regions.append('g')
                .attr('class', `columns-data-region columns-data-region-${i} columns-data-region-${r}`);
            $region.append('rect')
                .attr('x', margins[3] + i * colWidth)
                .attr('y', margins[0])
                .attr('width', colWidth)
                .attr('height', height - margins[0] - margins[2])
                .attr('class', `columns-data-region-ghost columns-data-region-ghost-${i} columns-data-region-ghost-${r}`);
            keys.forEach((d, j) => {
                // Lines
                if (chartData[d].data[r].length > 0) {
                    chartData[d].data[r].forEach((c, k) => {
                        if (!linePoints[c.domain]) {
                            linePoints[c.domain] = {};
                        }
                        if (!linePoints[c.domain][c.index]) {
                            linePoints[c.domain][c.index] = [];
                        }
                        linePoints[c.domain][c.index].push( { x: (margins[3] + (i * colWidth + hDistance)), y: ((j * dayHeight) + vDistance + margins[0]) } );
                    });
                }
                // Points
                if (chartData[d].data[r].length > 0) {
                    const positions = [];
                    if (chartData[d].data[r].length > 2) {
                        chartData[d].data[r].forEach((c, k) => {
                            positions.push({
                                cx: (margins[3] + (i * colWidth + hDistance) + (k === 1 ? -radius : ((k === 2) ? radius : 0))),
                                cy: ((j * dayHeight) + vDistance + margins[0]) + (k === 0 ? -radius : radius),
                                domain: c.domain,
                                index: c.index,
                                k,
                            });
                        })
                    } else if (chartData[d].data[r].length > 1) {
                        chartData[d].data[r].forEach((c, k) => {
                            positions.push({
                                cx: (margins[3] + (i * colWidth + hDistance) + (k === 1 ? -radius : radius)),
                                cy: ((j * dayHeight) + vDistance + margins[0]),
                                domain: c.domain,
                                index: c.index,
                                k,
                            });
                        });
                    } else {
                        chartData[d].data[r].forEach((c, k) => {
                            positions.push({
                                cx: margins[3] + (i * colWidth + hDistance),
                                cy: j * dayHeight + vDistance + margins[0],
                                domain: c.domain,
                                index: c.index,
                                k,
                            });
                        });
                    }
                    positions.forEach(p => {
                        $region.append('circle')
                            .attr('cx', p.cx)
                            .attr('cy', p.cy)
                            .attr('r', radius)
                            .attr('class', `columns-data-region-point columns-data-region-point-${i}-${j} columns-data-region-point-${i}-${j}-${p.k} columns-data-region-point-${p.domain} columns-data-region-point-${p.domain}-${p.index}`)
                            .on('click', () => showDomainIndex(p.domain, p.index));

                    })
                }
            });
        });

        const domains = Object.keys(linePoints);
        domains.forEach((d, i) => {
            const $connector = $connectors.append('g')
                .attr('class', `columns-data-connectors-${d}`);
            const indexes = Object.keys(linePoints[d]);
            indexes.forEach((idx, j) => {
                if (linePoints[d][idx].length > 1) {
                    $connector.append('path')
                        .datum(linePoints[d][idx])
                        .attr('class', dt => `columns-data-connector columns-data-connector-${d} columns-data-connector-${d}-${idx}`)
                        .attr('fill', 'none')
                        .attr('d', d3.line()
                            .x(dt => dt.x)
                            .y(dt => dt.y));
                }
            });
        });

        // Labels
        regions.forEach((r, i) => {
            $chartWrapper
                .append('div')
                .html(regionsShortLabels[r])
                .attr('style', `left: ${margins[3] + (i * colWidth + hDistance)}px; top: ${margins[0] - margins[0] / 2}px;`)
                .attr('class', 'columns-data-top-label');
        })

    }

    let html = `<div class="columns">
        <div class="columns-wrapper" id="columns-wrapper">
            
        </div>
        <p class="counter-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;
    prepareData();
    window.addEventListener('resize', reset.bind(this));
    reset();
}
