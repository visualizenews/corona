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
        
        const group = svg.append('g')
               .attr('id', `${id}-group`);
        
        const axis = svg.append('g')
                .attr('class', 'axis');
        
        serie1.forEach( (item, index) => {
            group
                .append('rect')
                .attr('width', barWidth)
                .attr('rx', barWidth / 4)
                .attr('x', () => x(item.x))
                .attr('y', () => y(item.y))
                .attr('height', () => y(serie2[index].y) - y(item.y))
                .attr('class', 'cases-recovered-rect')
                .attr('transform', `translate(-${barWidth/2} 0)`);
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

        axis.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', chartHeight - 38)
            .attr('y2', chartHeight - 38)
            .attr('class', 'cases-recovered-axis');


        
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

    const casesItaly = data.italy.global.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.cases }});
    const recoveredItaly = data.italy.global.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.recovered }});
    const casesLombardy = data.italy.regions.map(day => { return { x: moment(day.datetime).startOf('day').valueOf(), y: day.data.lombardia.cases }})
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