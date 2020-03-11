casesRecovered = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    const chartHeight = 200;

    const createChart = (serie, target) => {

        const container = d3.selectAll(target);
        const width = document.querySelector(target).offsetWidth;

        var x = d3.scaleLinear()
            .domain([d3.min(serie, a => a.x), d3.max(serie, a => a.x)])
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain([d3.max(serie, a => a.y), d3.min(serie, a => a.y)])
            .range([0, chartHeight]);

        container
            .append('svg')
            .attr('width', width)
            .attr('height', chartHeight)
            .append('path')
                .datum(serie)
                .attr('class', 'counter-line')
                .attr('fill', 'none')
                .attr('d', d3.line()
                    .x(d => x(d.x))
                    .y(d => y(d.y))
                );
    };
    
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');

    let html = `<div class="cases-recovered">
        <div class="cases-recovered-wrapper">
            
        </div>
        <p class="cases-recovered-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;
    /*
    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.cases }}), '#counter-chart-cases');
    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.deaths }}), '#counter-chart-deaths');
    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.hospital }}), '#counter-chart-hospital');
    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.recovered }}), '#counter-chart-recovered');
    $container.classList.remove('loading');
    */
}