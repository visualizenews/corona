counter = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    const chartHeight = 40;

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
    
    const recovered_update = (data.italy.global[data.italy.global.length-1].recovered - data.italy.global[data.italy.global.length-2].recovered) * 100 / data.italy.global[data.italy.global.length-1].recovered;
    const recovered_previous = (data.italy.global[data.italy.global.length-2].recovered - data.italy.global[data.italy.global.length-3].recovered) * 100 / data.italy.global[data.italy.global.length-2].recovered;
    const cases_update = (data.italy.global[data.italy.global.length-1].cases - data.italy.global[data.italy.global.length-2].cases) * 100 / data.italy.global[data.italy.global.length-1].cases;
    const cases_previous = (data.italy.global[data.italy.global.length-2].cases - data.italy.global[data.italy.global.length-3].cases) * 100 / data.italy.global[data.italy.global.length-2].cases;
    const hospital_update = (data.italy.global[data.italy.global.length-1].hospital - data.italy.global[data.italy.global.length-2].hospital) * 100 / data.italy.global[data.italy.global.length-1].hospital;
    const hospital_previous = (data.italy.global[data.italy.global.length-2].hospital - data.italy.global[data.italy.global.length-3].hospital) * 100 / data.italy.global[data.italy.global.length-2].hospital;
    const deaths_update = (data.italy.global[data.italy.global.length-1].deaths - data.italy.global[data.italy.global.length-2].deaths) * 100 / data.italy.global[data.italy.global.length-1].deaths;
    const deaths_previous = (data.italy.global[data.italy.global.length-2].deaths - data.italy.global[data.italy.global.length-3].deaths) * 100 / data.italy.global[data.italy.global.length-2].deaths;
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');

    let html = `<div class="counter">
        <div class="counter-wrapper">
            <div class="counter-column">
                <h3 class="counter-title">Total cases</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].cases)} <span class="counter-increment">${d3.format('+.2f')(cases_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(cases_previous)}%</p>
                <div class="counter-chart" id="counter-chart-cases"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Deaths</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].deaths)} <span class="counter-increment">${d3.format('+.2f')(deaths_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(deaths_previous)}%</p>
                <div class="counter-chart" id="counter-chart-deaths"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Hospitalized</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].hospital)} <span class="counter-increment">${d3.format('+.2f')(hospital_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(hospital_previous)}%</p>
                <div class="counter-chart" id="counter-chart-hospital"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Recovered</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].recovered)} <span class="counter-increment">${d3.format('+.2f')(recovered_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(recovered_previous)}%</p>
                <div class="counter-chart" id="counter-chart-recovered"></div>
            </div>
        </div>
        <p class="counter-update last-update"><sup>*</sup> Compared to the previous day.<br />Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.cases }}), '#counter-chart-cases');
    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.deaths }}), '#counter-chart-deaths');
    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.hospital }}), '#counter-chart-hospital');
    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.recovered }}), '#counter-chart-recovered');
    $container.classList.remove('loading');
}