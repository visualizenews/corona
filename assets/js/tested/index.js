tested = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartHeight = 40;

    const createChart = (serie, target) => {
        const container = d3.selectAll(target);
        const width = document.querySelector(target).offsetWidth;

        const x = d3.scaleLinear()
            .domain([d3.min(serie, a => a.x), d3.max(serie, a => a.x)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([d3.max(serie, a => a.y), d3.min(serie, a => a.y)])
            .range([0, chartHeight]);

        container
            .append('svg')
            .attr('width', width)
            .attr('height', chartHeight)
            .append('path')
                .datum(serie)
                .attr('class', 'tested-line')
                .attr('fill', 'none')
                .attr('d', d3.line()
                    .x(d => x(d.x))
                    .y(d => y(d.y))
                );
    };

    const createGroup = (tested, population, target) => {
        const width = document.querySelector(target).offsetWidth;
        const ratio = population / tested;
        
        const side = Math.round(Math.sqrt(width * width));
        const active_side = Math.round(Math.sqrt(width * width / ratio));

        console.log(ratio);

        const html = `<div class="tested-group-total" style="width: ${side}px; height: ${side}px">
            <div class="tested-group-active" style="width: ${active_side}px; height: ${active_side}px"></div>
            <div class="tested-group-label">
                1 <span class="tested-group-label-text">every</span> ${d3.format('.2f')(ratio)}<span class="tested-group-label-text">**</span>
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

    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.tested }}), '#tested-line');
    createGroup(data.italy.global[data.italy.global.length-1].tested, population.italy, '#tested-group');
    $container.classList.remove('loading');
}