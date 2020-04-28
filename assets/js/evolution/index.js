evolution = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartData = [];
    
    const prepareData = () => {
        data.italy.global.forEach((d, i) => {
            chartData.push({
                x: moment(d.datetime).valueOf(),
                y: d.cases - d.deaths - d.recovered,
            });
        });
    }

    const reset = () => {
        const chartContainer = document.querySelector('#evolution-chart-container');
        const width = chartContainer.offsetWidth;
        const height = chartContainer.offsetHeight;

        chartContainer.innerHTML = '';

        const firstDay = d3.min(chartData, d => d.x);
        const lasttDay = d3.max(chartData, d => d.x);
        const minVal = d3.min(chartData, d => d.y);
        const maxVal = d3.max(chartData, d => d.y);

        const y = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range([0, height]);
        
        const x = d3.scaleLinear()
            .domain([firstDay, lasttDay])
            .range([0, width]);

        const container = d3.select('#evolution-chart-container');
        const svg = container
            .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewbox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

        const curve = d3.curveCatmullRom.alpha(.5);
        
        const path = d3.area()
            .curve(curve)
            .x(d => x(d.x))
            .y0(0)
            .y1(d => y(d.y));

        svg
            .append('path')
            .datum(chartData)
            .attr('class', 'evolution-chart-area')
            .attr('d', path);

        container
            .append('div')
            .attr('class', 'evolution-chart-label')
            .html(`${d3LocaleFormat.format(numberFormat.decimals)(chartData[chartData.length - 1].y)} active cases<br />in Italy on <span>${moment(chartData[chartData.length - 1].x).format('MMM DD')}</span>`)
    }

    if ($container) {
        const html = `<div class="evolution-chart-container" id="evolution-chart-container"></div>`;
        prepareData();
        $container.innerHTML = html;
        reset();
        window.addEventListener('resize', reset.bind(this));
    }
}
