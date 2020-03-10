counter = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    console.log(data.italy.global[data.italy.global.length-1]);

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
                <h3 class="counter-title">Sick</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].cases)} <span class="counter-increment">${d3.format('+.2f')(cases_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Previously: ${d3.format('+.2f')(cases_previous)}%</p>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Deaths</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].deaths)} <span class="counter-increment">${d3.format('+.2f')(deaths_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Previously: ${d3.format('+.2f')(deaths_previous)}%</p>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Hospitalized</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].hospital)} <span class="counter-increment">${d3.format('+.2f')(hospital_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Previously: ${d3.format('+.2f')(hospital_previous)}%</p>
            </div>
            <div class="counter-column">
                <h3 class="counter-title">Recovered</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].recovered)} <span class="counter-increment">${d3.format('+.2f')(recovered_update)}%<sup>*</sup></span></h2>
                <p class="counter-text">Previously: ${d3.format('+.2f')(recovered_previous)}%</p>
            </div>
        </div>
        <p class="counter-update"><sup>*</sup> Compared to the previous day.<br />Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;
    $container.classList.remove('loading');
}