counter = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    
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

    sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.cases }}), '#counter-chart-cases', 'counter');
    sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.deaths }}), '#counter-chart-deaths', 'counter');
    sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.hospital }}), '#counter-chart-hospital', 'counter');
    sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.recovered }}), '#counter-chart-recovered', 'counter');
    $container.classList.remove('loading');
}