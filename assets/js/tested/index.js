tested = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    const createGroup = (tested, population, target) => {
        const width = document.querySelector(target).offsetWidth;
        const ratio = population / tested;
        const base = 100000;
        const new_ratio = base / ratio;        
        const side = Math.round(Math.sqrt(width * width));
        const active_side = Math.round(Math.sqrt(width * width / new_ratio));


        const html = `<div class="tested-group-total" style="width: ${side}px; height: ${side}px">
            <div class="tested-group-active" style="width: ${active_side}px; height: ${active_side}px"></div>
            <div class="tested-group-label">
                ${d3.format('.2f')(new_ratio)} <span class="tested-group-label-text">every</span> <span class="tested-group-label-total">${d3.format(',')(base)}<span><span class="tested-group-label-text">**</span>
            </div>
        </div>`

        
        document.querySelector(target).innerHTML = html;
    }

    const test_update = (data.italy.global[data.italy.global.length-1].tested - data.italy.global[data.italy.global.length-2].tested) * 100 / data.italy.global[data.italy.global.length-1].tested;
    
    
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    
    let html = `<div class="tested">
        <div class="tested-wrapper">
            <div class="tested-column">
                <h4 class="tested-title">So far have been tested</h4>
                <h3 class="tested-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].tested)} <span class="tested-increment">people (${d3.format('+.2f')(test_update)}%<sup>*</sup>)</span>
                <div class="tested-chart" id="tested-line"></div>
            </div>
            <div class="tested-group" id="tested-group"></div>
        </div>
        <p class="tested-update last-update"><sup>*</sup> Compared to the previous day.<br /><sup>**</sup> Total italian population: ${d3.format(',')(population.italy)}<br />Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.tested }}), '#tested-line', 'tested');
    createGroup(data.italy.global[data.italy.global.length-1].tested, population.italy, '#tested-group');
    $container.classList.remove('loading');
}