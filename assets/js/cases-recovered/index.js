casesRecovered = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    const chartHeight = 200;

    const createChart = (serie1, serie2, maxYScale, target) => {

        const container = d3.selectAll(target);
        const width = document.querySelector(target).offsetWidth;

        const x = d3.scaleLinear()
            .domain([d3.min(serie1, a => a.x), d3.max(serie1, a => a.x)])
            .range([10, width - 10]);

        const y = d3.scaleLinear()
            .domain([maxYScale, 0])
            .range([20, chartHeight - 40]);

        const barWidth = Math.min(((Math.round(width - 20) / serie1.length) - 2), 20);

        const svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', chartHeight)

        const tooltip = container
            .append('div')
            .attr('class', 'cases-recovered-tooltip')
            .attr('id', `${id}-tooltip`)
        
        const group = svg.append('g');
        
        const axis = svg.append('g')
                .attr('class', 'axis');
        
        const annotations = svg.append('g')
                .attr('class', 'annotations');
        
        const maxCases = d3.max(serie1, d => d.y);

        const pixelMatrix = {};

        axis.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', chartHeight - 38)
            .attr('y2', chartHeight - 38)
            .attr('class', 'cases-recovered-axis');

        serie1.forEach( (item, index) => {
            const barX = x(item.x);
            const barY = y(item.y);
            const gapY = y(serie2[index].y);

            pixelMatrix[item.x] = {
                x: barX,
                y: barY - 5,
                position: (() => {
                    if (barX - 90 < 0) {
                        return 'left';
                    }
                    if (barX + 90 > width) {
                        return 'right';
                    }
                    return 'normal';
                })(),
                date: moment(item.x).format('MMM, Do'),
                cases: item.y,
                recovered: serie2[index].y
            };

            group
                .append('rect')
                .attr('width', barWidth)
                .attr('rx', barWidth / 4)
                .attr('x', () => barX)
                .attr('y', () => barY)
                .attr('height', () => gapY - barY)
                .attr('class', `cases-recovered-rect ${maxCases === item.y ? 'cases-recovered-rect-max' : ''}`)
                .attr('transform', `translate(-${barWidth/2} 0)`)
                .on('mouseover', () => {
                    tooltip
                        .html(`<div class="cases-recovered-tooltip-inner">
                            <span class="cases-recovered-tooltip-date">${pixelMatrix[item.x].date}</span><br />
                            <span class="cases-recovered-tooltip-data">Active cases: <strong>${d3.format(',')(pixelMatrix[item.x].cases)}</strong></span>
                            <span class="cases-recovered-tooltip-data">Recovered: <strong>${d3.format(',')(pixelMatrix[item.x].recovered)}</strong></span>
                        </div>`)
                        .attr('style', `left: ${pixelMatrix[item.x].x}px; top: ${pixelMatrix[item.x].y}px`)
                        .attr('class', `cases-recovered-tooltip cases-recovered-tooltip-visible ${pixelMatrix[item.x].position}`)
                })
                .on('mouseout', () => {
                    tooltip
                        .attr('class', 'cases-recovered-tooltip')
                        .attr('style', null)
                        .html('')
                });
            axis
                .append('line')
                .attr('x1', () => x(item.x))
                .attr('x2', () => x(item.x))
                .attr('y1', chartHeight - 38)
                .attr('y2', chartHeight - 33)
                .attr('class', 'cases-recovered-tick');

            if (index === 0) {
                axis
                    .append('text')
                    .attr('x', () => x(item.x))
                    .attr('y', chartHeight - 15)
                    .text( moment(item.x).format('MMM, Do') )
                    .attr('text-anchor', 'start')
                    .attr('alignment-baseline', 'middle')
                    .attr('class', 'cases-recovered-tick-label');
            }

            if (index === serie1.length - 1) {
                axis
                    .append('text')
                    .attr('x', () => x(item.x))
                    .attr('y', chartHeight - 15)
                    .text( moment(item.x).format('MMM, Do') )
                    .attr('text-anchor', 'end')
                    .attr('alignment-baseline', 'middle')
                    .attr('class', 'cases-recovered-tick-label');
            }
        });

        annotations
            .append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', y(maxCases))
            .attr('y2', y(maxCases))
            .attr('class', 'cases-recovered-top-line');

        annotations
            .append('text')
            .text('Maximum daily active')
            .attr('x', 10)
            .attr('y', y(maxCases) - 8)
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'middle')
            .attr('class', 'cases-recovered-top-label');

        annotations
            .append('text')
            .text(` cases: ${d3.format(',')(maxCases)}`)
            .attr('x', 10)
            .attr('y', y(maxCases) + 10)
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'middle')
            .attr('class', 'cases-recovered-top-label');
        


        console.log('pixelMatrix', pixelMatrix);
    };
    
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');

    let html = `<div class="cases-recovered">
        <div class="cases-recovered-wrapper">
            <div class="cases-recovered-column">
                <h3 class="cases-recovered-title">Italy</h3>
                <div class="cases-recovered-chart" id="cases-recovered-chart-italy"></div>
            </div>
            <div class="cases-recovered-column">
                <h3 class="cases-recovered-title">Lombardy</h3>
                <div class="cases-recovered-chart" id="cases-recovered-chart-lombardy"></div>
            </div>            
        </div>
        <p class="cases-recovered-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    const casesItaly = data.italy.global.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.cases - day.deaths }});
    const recoveredItaly = data.italy.global.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.recovered }});
    const casesLombardy = data.italy.regions.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.data.lombardia.cases - day.data.lombardia.deaths }})
    const recoveredLombardy = data.italy.regions.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.data.lombardia.recovered }});
    
    const maxYScale = Math.max(d3.max(casesItaly, a => a.y), d3.max(recoveredItaly, a => a.y), d3.max(casesLombardy, a => a.y), d3.max(recoveredLombardy, a => a.y))

    createChart(
        casesItaly,
        recoveredItaly,
        maxYScale,
        '#cases-recovered-chart-italy'
    );
    createChart(
        casesLombardy,
        recoveredLombardy,
        maxYScale,
        '#cases-recovered-chart-lombardy'
    );
    /*
    createChart(data.italy.regions.map(day => { return { x: moment(day.datetime).unix(), y: day.lombardy.cases }}), data.italy.regions.map(day => { return { x: moment(day.datetime).unix(), y: day.lombardy.recovered }}),'#counter-chart-deaths');
    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.hospital }}), '#counter-chart-hospital');
    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.recovered }}), '#counter-chart-recovered');
    */
    $container.classList.remove('loading');
}