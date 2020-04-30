casesRecovered = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    let allRegionsVisible = false;
    const hMargin = 10;
    const vMargin = 50;
    const reset = () => {
        $container.classList.add('loading');
        const $containers = document.querySelectorAll('.cases-recovered-chart');
        $containers.forEach( $container => $container.innerHTML = '' );
        drawCharts();
        $container.classList.remove('loading');
    }

    const drawCharts = () => {
        createChart(
            casesItaly,
            recoveredItaly,
            maxYScale,
            '#cases-recovered-chart-italy',
            -1,
            ''
        );
    
        regions.forEach( (region, i) => {
            createChart(
                region.data.cases,
                region.data.recovered,
                maxYScale,
                `#cases-recovered-chart-${region.id}`,
                i,
                region.label
            );
        });
    }

    const createChart = (serie1, serie2, maxYScale, target, position, label) => {

        const container = d3.selectAll(target);
        const width = document.querySelector(target).offsetWidth;
        const chartHeight = document.querySelector(target).offsetHeight;

        const x = d3.scaleLinear()
            .domain([d3.min(serie1, a => a.x), d3.max(serie1, a => a.x)])
            .range([hMargin, width - hMargin]);

        const y = d3.scaleLinear()
            .domain([maxYScale, 0])
            .range([vMargin, chartHeight - vMargin]);

        const barWidth = Math.min(((Math.round(width - 20) / serie1.length) - 2), 20);

        const svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', chartHeight);

        const tooltip = Tooltip(container.node(), id);
        
        const group = svg.append('g');
        
        const axis = svg.append('g')
                .attr('class', 'axis');
        
        const annotations = svg.append('g')
                .attr('class', 'annotations');
        
        const maxCases = d3.greatest(serie1, d => d.y);
        const maxRecovered = d3.greatest(serie2, a => a.y);

        const pixelMatrix = {};

        axis.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', chartHeight - vMargin + 2)
            .attr('y2', chartHeight - vMargin + 2)
            .attr('class', 'cases-recovered-axis');

        serie1.forEach( (item, index) => {
            const barX = x(item.x);
            const barY = y(item.y + serie2[index].y);
            const gapY = y(serie2[index].y);

            pixelMatrix[item.x] = {
                x: barX,
                y: barY - 5,
                position: (() => {
                    if (barX - 90 < 0) {
                        return 'top-left';
                    }
                    if (barX + 90 > width) {
                        return 'top-right';
                    }
                    return 'top';
                })(),
                date: moment(item.x).format(dateFormat.monthDay),
                cases: item.y,
                recovered: serie2[index].y
            };

            const bars = group.append('g')
                .attr('class', 'cases-recovered-group')
                .attr('id', `cases-recovered-group-${index}`)
                .on('mouseover', (t) => {
                    tooltip.show(`<div class="cases-recovered-tooltip-inner">
                    <span class="cases-recovered-tooltip-date">${pixelMatrix[item.x].date}</span><br />
                    <span class="cases-recovered-tooltip-data">Active cases: <strong>${d3LocaleFormat.format(numberFormat.thousands)(pixelMatrix[item.x].cases)}</strong></span><br />
                    <span class="cases-recovered-tooltip-data">Recovered: <strong>${d3LocaleFormat.format(numberFormat.thousands)(pixelMatrix[item.x].recovered)}</strong></span>
                </div>`, pixelMatrix[item.x].x, pixelMatrix[item.x].y, pixelMatrix[item.x].position, 'bottom-center');
                })
                .on('mouseout', () => {
                    tooltip.hide();
                });

            bars.append('rect')
                .attr('width', barWidth + 2)
                .attr('rx', barWidth / 4)
                .attr('x', () => barX)
                .attr('y', 0)
                .attr('height', chartHeight)
                .attr('class', 'cases-recovered-ghost')
                .attr('transform', `translate(-${(barWidth + 2)/2} 0)`);

            bars.append('rect')
                .attr('width', barWidth)
                .attr('rx', barWidth / 4)
                .attr('x', () => barX)
                .attr('y', () => barY)
                .attr('height', () => gapY - barY)
                .attr('class', `cases-recovered-rect ${maxCases.y === item.y ? 'cases-recovered-rect-max' : ''}`)
                .attr('transform', `translate(-${barWidth/2} 0)`);
            axis
                .append('line')
                .attr('x1', () => x(item.x))
                .attr('x2', () => x(item.x))
                .attr('y1', chartHeight - 38)
                .attr('y2', (index === 0 || index === serie1.length - 1) ? chartHeight - 28 : chartHeight - 33)
                .attr('class', 'cases-recovered-tick');

            if (index === 0) {
                axis
                    .append('text')
                    .attr('x', () => x(item.x))
                    .attr('y', chartHeight - 15)
                    .text( moment(item.x).format(dateFormat.monthDay) )
                    .attr('text-anchor', 'start')
                    .attr('alignment-baseline', 'middle')
                    .attr('class', 'cases-recovered-tick-label');
            }

            if (index === serie1.length - 1) {
                axis
                    .append('text')
                    .attr('x', () => x(item.x))
                    .attr('y', chartHeight - 15)
                    .text( moment(item.x).format(dateFormat.monthDay) )
                    .attr('text-anchor', 'end')
                    .attr('alignment-baseline', 'middle')
                    .attr('class', 'cases-recovered-tick-label');
            }
        });

        if (position === -1) {
            annotations
                .append('text')
                .text(`${d3LocaleFormat.format(numberFormat.thousands)(maxCases.y)} active cases`)
                .attr('x', x(maxCases.x) + (barWidth / 2))
                .attr('y', y(maxCases.y) - 50)
                .attr('text-anchor', 'end')
                .attr('alignment-baseline', 'top')
                .attr('class', 'cases-recovered-top-label');
            annotations
                .append('text')
                .text(`So far ${d3LocaleFormat.format(numberFormat.thousands)(maxRecovered.y)} people`)
                .attr('x', 10)
                .attr('y', y(maxRecovered.y) - 27)
                .attr('text-anchor', 'start')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'cases-recovered-recovered-label');
            annotations
                .append('text')
                .text('have recovered')
                .attr('x', 10)
                .attr('y', y(maxRecovered.y) - 9)
                .attr('text-anchor', 'start')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'cases-recovered-recovered-label');
        } else {
            annotations
                .append('text')
                .text(`${d3LocaleFormat.format(numberFormat.thousands)(maxCases.y)}`)
                .attr('x', x(maxCases.x) + (barWidth / 2))
                .attr('y', y(maxCases.y) - 20)
                .attr('text-anchor', 'end')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'cases-recovered-top-label');
            annotations
                .append('text')
                .text(`${d3LocaleFormat.format(numberFormat.thousands)(maxRecovered.y)}`)
                .attr('x', 10)
                .attr('y', y(maxRecovered.y) - 9)
                .attr('text-anchor', 'start')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'cases-recovered-recovered-label');
        }

        annotations
            .append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', y(maxRecovered.y))
            .attr('y2', y(maxRecovered.y))
            .attr('class', 'cases-recovered-recovered-line');
    };
    
    const updated = moment(data.generated).format(dateFormat.completeDateTime);

    const keys = Object.keys(data.italy.regions[0].data);
    const regions = keys.map( region => {
        return {
            id: region,
            label: regionsLabels[region],
            data: {
                cases: data.italy.regions.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.data[region].cases - day.data[region].deaths - day.data[region].recovered }}),
                recovered: data.italy.regions.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.data[region].recovered }})
            }
        }
    });

    const iTrento = regions.findIndex(d => d.id === 'trento');
    const trento = regions[iTrento];
    regions.splice(iTrento,1);
    const iBolzano = regions.findIndex(d => d.id === 'bolzano');
    const bolzano = regions[iBolzano];
    regions.splice(iBolzano,1);
    regions.push({
        id: 'trentino-alto-adige',
        label: regionsLabels['trentino-alto-adige'],
        data: {
            cases: (() => {
                return trento.data.cases.map((t, i) => {
                    return {
                        x: t.x,
                        y: t.y + bolzano.data.cases[i].y,
                    }
                });
            })(),
            recovered: (() => {
                return trento.data.recovered.map((t, i) => {
                    return {
                        x: t.x,
                        y: t.y + bolzano.data.recovered[i].y,
                    }
                });
            })(),
        }
    });

    regions.sort( (a,b) => d3.max(b.data.cases, d => d.y) - d3.max(a.data.cases, d => d.y));

    let html = `<div class="cases-recovered">
        <div class="cases-recovered-wrapper">
            <div class="cases-recovered-column cases-recovered-column-first">
                <h3 class="cases-recovered-title">${regionsLabels['italy']}</h3>
                <div class="cases-recovered-chart" id="cases-recovered-chart-italy"></div>
            </div>`;
    regions.forEach( (region, i) => {
        if (i === 6) {
            html += '</div><div class="cases-recovered-wrapper not-visible" id="cases-recovered-all-regions">';
        }
        html += `<div class="cases-recovered-column">
            <h3 class="cases-recovered-title">${region.label}</h3>
            <div class="cases-recovered-chart cases-recovered-chart-small" id="cases-recovered-chart-${region.id}"></div>
        </div>`;
    });
    html +=`</div>
        <p class="cases-recovered-show-more"><button id="cases-recovered-show-more" class="button">Show all regions</button></p>
        <p class="cases-recovered-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    const casesItaly = data.italy.global.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.cases - day.deaths - day.recovered }});
    const recoveredItaly = data.italy.global.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.recovered }});
    const maxYScale = Math.max(d3.max(casesItaly, a => a.y) + d3.max(recoveredItaly, a => a.y));
    const $button = document.querySelector('#cases-recovered-show-more');
    const $allRegions = document.querySelector('#cases-recovered-all-regions');

    drawCharts();

    window.addEventListener('resize', reset.bind(this));

    $button.addEventListener('click', e => {
        e.preventDefault();
        allRegionsVisible = !allRegionsVisible;
        if (allRegionsVisible) {
            $button.innerHTML = 'Show top 6 regions'
            $allRegions.classList.remove('not-visible');
        } else {
            $button.innerHTML = 'Show all regions'
            $allRegions.classList.add('not-visible');
            window.location.href = `#${id}`;
        }
    });
    $container.classList.remove('loading');
}