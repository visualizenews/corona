counter = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    
    console.log(data.italy.regions[data.italy.regions.length-1].data.lombardia.tested);

    const tested = data.italy.global[data.italy.global.length-1].tested;
    const ratio = population.italy / tested;
    const lombardy = data.italy.regions[data.italy.regions.length-1].data.lombardia.tested;

    let html = `<div class="counter">
        <h3 class="counter-title">So far in Italy have been tested</h3>
        <h2 class="counter-number">${d3.format('.2s')(tested)} <span class="counter-people">people</span></h2>
        <p class="counter-text">of which, <strong>${d3.format('.2s')(lombardy)}</strong> in Lombardy alone.</p>
        <p class="counter-text">This means 1 test every <strong>${d3.format('.2s')(ratio)}</strong> italians.</p>
    </div>`;

    let style = document.createElement('link');
    style.href = '/assets/css/counter/counter.css';
    style.rel = 'stylesheet';

    document.querySelector('head').appendChild(style);
    
    $container.innerHTML = html;
    $container.classList.remove('loading');
}