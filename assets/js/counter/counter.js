counter = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    let style = document.createElement('link');
    style.href = '/assets/css/counter/counter.css';
    style.rel = 'stylesheet';
    document.querySelector('head').appendChild(style);


    console.log(data.italy.global[data.italy.global.length-1]);

    const recovered_update = data.italy.global[data.italy.global.length-1].recovered - data.italy.global[data.italy.global.length-2].recovered;
    const cases_update = data.italy.global[data.italy.global.length-1].cases - data.italy.global[data.italy.global.length-2].cases;
    const hospital_update = data.italy.global[data.italy.global.length-1].hospital - data.italy.global[data.italy.global.length-2].hospital;
    const deaths_update = data.italy.global[data.italy.global.length-1].deaths - data.italy.global[data.italy.global.length-2].deaths;
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');

    let html = `<div class="counter">
        <h2 class="counter-title">A quick overview</h2>
        <div class="counter-wrapper">
            <div class="counter-column">
                <h3 class="counter-subtitle">Sick</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].cases)} <span class="counter-people">${(cases_update > 0 ? '+' : '')}${d3.format('.2s')(cases_update)}<sup>*</sup></span></h2>
                <p class="counter-text"><strong>${d3.format('.2s')(data.italy.regions[data.italy.regions.length-1].data.lombardia.cases)}</strong> in Lombardy</p>
            </div>
            <div class="counter-column">
                <h3 class="counter-subtitle">Hospitalized</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].hospital)} <span class="counter-people">${(hospital_update > 0 ? '+' : '')}${d3.format('.2s')(hospital_update)}<sup>*</sup></span></h2>
                <p class="counter-text"><strong>${d3.format('.2s')(data.italy.global[data.italy.global.length-1].icu)}</strong> in ICU</p>
            </div>
            <div class="counter-column">
                <h3 class="counter-subtitle">Deaths</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].deaths)} <span class="counter-people">${(deaths_update > 0 ? '+' : '')}${d3.format('.2s')(deaths_update)}<sup>*</sup></span></h2>
                <p class="counter-text"><strong>${d3.format('.2s')(recovered_update)}</strong> in Lombardy</p>
            </div>
            <div class="counter-column">
                <h3 class="counter-subtitle">Recovered</h3>
                <h2 class="counter-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].recovered)} <span class="counter-people">${(recovered_update > 0 ? '+' : '')}${d3.format('.2s')(recovered_update)}<sup>*</sup></span></h2>
                <p class="counter-text"><strong>${d3.format('.2s')(data.italy.regions[data.italy.regions.length-1].data.lombardia.recovered)}</strong> in Lombardy</p>
            </div>
        </div>
        <p class="counter-update"><sup>*</sup> Compared to the previous day. Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;
    $container.classList.remove('loading');
}