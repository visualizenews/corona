counter = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    const drawCharts = () => {
        sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.cases }}), '#counter-chart-cases', 'counter');
        sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.deaths }}), '#counter-chart-deaths', 'counter');
        sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.hospital }}), '#counter-chart-hospital', 'counter');
        sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.recovered }}), '#counter-chart-recovered', 'counter');
        sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.icu }}), '#counter-chart-icu', 'counter');
    }

    const reset = () => {
        $container.classList.add('loading');
        const $containers = document.querySelectorAll('.counter-chart');
        $containers.forEach( $container => $container.innerHTML = '' );
        drawCharts();
        $container.classList.remove('loading');
    }

    const active_cases_update = ((data.italy.global[data.italy.global.length-1].cases - data.italy.global[data.italy.global.length-1].deaths - data.italy.global[data.italy.global.length-1].recovered) - (data.italy.global[data.italy.global.length-2].cases - data.italy.global[data.italy.global.length-2].deaths - data.italy.global[data.italy.global.length-2].recovered)) * 100 / (data.italy.global[data.italy.global.length-2].cases - data.italy.global[data.italy.global.length-2].deaths - data.italy.global[data.italy.global.length-2].recovered);
    const active_cases_previous = ((data.italy.global[data.italy.global.length-2].cases - data.italy.global[data.italy.global.length-1].deaths - data.italy.global[data.italy.global.length-2].recovered) - (data.italy.global[data.italy.global.length-3].cases - data.italy.global[data.italy.global.length-3].deaths - data.italy.global[data.italy.global.length-3].recovered)) * 100 / (data.italy.global[data.italy.global.length-3].cases - data.italy.global[data.italy.global.length-3].deaths - data.italy.global[data.italy.global.length-3].recovered);

    const new_tested_positive_update = (data.italy.global[data.italy.global.length-1].new_tested_positive - data.italy.global[data.italy.global.length-2].new_tested_positive) * 100 / data.italy.global[data.italy.global.length-2].new_tested_positive;
    const new_tested_positive_previous = (data.italy.global[data.italy.global.length-2].new_tested_positive - data.italy.global[data.italy.global.length-3].new_tested_positive) * 100 / data.italy.global[data.italy.global.length-3].new_tested_positive;
    
    const quarantined_update = (data.italy.global[data.italy.global.length-1].quarantinized - data.italy.global[data.italy.global.length-2].recovered) * 100 / data.italy.global[data.italy.global.length-2].quarantinized;
    const quarantined_previous = (data.italy.global[data.italy.global.length-2].quarantinized - data.italy.global[data.italy.global.length-3].quarantinized) * 100 / data.italy.global[data.italy.global.length-3].quarantinized;

    const recovered_update = (data.italy.global[data.italy.global.length-1].recovered - data.italy.global[data.italy.global.length-2].recovered) * 100 / data.italy.global[data.italy.global.length-2].recovered;
    const recovered_previous = (data.italy.global[data.italy.global.length-2].recovered - data.italy.global[data.italy.global.length-3].recovered) * 100 / data.italy.global[data.italy.global.length-3].recovered;
    const icu_update = (data.italy.global[data.italy.global.length-1].icu - data.italy.global[data.italy.global.length-2].icu) * 100 / data.italy.global[data.italy.global.length-2].icu;
    const icu_previous = (data.italy.global[data.italy.global.length-2].icu - data.italy.global[data.italy.global.length-3].icu) * 100 / data.italy.global[data.italy.global.length-3].icu;
    const cases_update = (data.italy.global[data.italy.global.length-1].cases - data.italy.global[data.italy.global.length-2].cases) * 100 / data.italy.global[data.italy.global.length-2].cases;
    const cases_previous = (data.italy.global[data.italy.global.length-2].cases - data.italy.global[data.italy.global.length-3].cases) * 100 / data.italy.global[data.italy.global.length-3].cases;
    const hospital_update = (data.italy.global[data.italy.global.length-1].hospital - data.italy.global[data.italy.global.length-2].hospital) * 100 / data.italy.global[data.italy.global.length-2].hospital;
    const hospital_previous = (data.italy.global[data.italy.global.length-2].hospital - data.italy.global[data.italy.global.length-3].hospital) * 100 / data.italy.global[data.italy.global.length-3].hospital;
    const deaths_update = (data.italy.global[data.italy.global.length-1].deaths - data.italy.global[data.italy.global.length-2].deaths) * 100 / data.italy.global[data.italy.global.length-2].deaths;
    const deaths_previous = (data.italy.global[data.italy.global.length-2].deaths - data.italy.global[data.italy.global.length-3].deaths) * 100 / data.italy.global[data.italy.global.length-3].deaths;
    const updated = moment(data.generated).format(dateFormat.completeDateTime);

    let html = `<div class="counter">
        <div class="counter-wrapper">
            <div class="counter-column">
                <h3 class="counter-title">Total cases</h3>
                <h2 class="counter-number">${d3.format('.3s')(data.italy.global[data.italy.global.length-1].cases)} <span class="counter-increment">${d3.format('+.2f')(cases_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(cases_previous)}%</p>
                <div class="counter-chart" id="counter-chart-cases"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">New cases</h3>
                <h2 class="counter-number">${d3.format('.3s')(data.italy.global[data.italy.global.length-1].new_tested_positive)} <span class="counter-increment">${d3.format('+.2f')(new_tested_positive_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(new_tested_positive_previous)}%</p>
                <div class="counter-chart" id="counter-chart-cases"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Active cases</h3>
                <h2 class="counter-number">${d3.format('.3s')(data.italy.global[data.italy.global.length-1].cases - data.italy.global[data.italy.global.length-1].deaths - data.italy.global[data.italy.global.length-1].recovered)} <span class="counter-increment">${d3.format('+.2f')(active_cases_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(active_cases_previous)}%</p>
                <div class="counter-chart" id="counter-chart-cases"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Recovered</h3>
                <h2 class="counter-number">${d3.format('.3s')(data.italy.global[data.italy.global.length-1].recovered)} <span class="counter-increment">${d3.format('+.2f')(recovered_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(recovered_previous)}%</p>
                <div class="counter-chart" id="counter-chart-recovered"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Fatalities</h3>
                <h2 class="counter-number">${d3.format('.3s')(data.italy.global[data.italy.global.length-1].deaths)} <span class="counter-increment">${d3.format('+.2f')(deaths_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(deaths_previous)}%</p>
                <div class="counter-chart" id="counter-chart-deaths"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Hospitalized</h3>
                <h2 class="counter-number">${d3.format('.3s')(data.italy.global[data.italy.global.length-1].hospital)} <span class="counter-increment">${d3.format('+.2f')(hospital_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(hospital_previous)}%</p>
                <div class="counter-chart" id="counter-chart-hospital"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">In ICU</h3>
                <h2 class="counter-number">${d3.format('.3s')(data.italy.global[data.italy.global.length-1].icu)} <span class="counter-increment">${d3.format('+.2f')(icu_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(icu_previous)}%</p>
                <div class="counter-chart" id="counter-chart-icu"></div>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Quarantined</h3>
                <h2 class="counter-number">${d3.format('.3s')(data.italy.global[data.italy.global.length-1].quarantinized)} <span class="counter-increment">${d3.format('+.2f')(quarantined_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Day before: ${d3.format('+.2f')(quarantined_previous)}%</p>
                <div class="counter-chart" id="counter-chart-recovered"></div>
            </div>
        </div>
        <p class="counter-update last-update"><sup>*</sup> Compared to the previous day.<br />Last update: ${updated}.</p>
    </div>`;
    console.log(data);
    $container.innerHTML = html;
    drawCharts();
    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}
