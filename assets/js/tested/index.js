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

    const createGroup = (ratio, target) => {
        let html = '';
        for (let i=0; i<ratio; i++) {
            html += `<svg
            class="tested-bullet ${i === 0 ? 'tested-bullet-active' : ''}" width="744.09448819" height="1052.3622047" preserveAspectRatio="xMidYMid meet" viewBox="0 0 44.09448819 1052.3622047">
            <path d="m 302.07468,1018.9879 c -15.81897,-5.1904 -28.34737,-16.8655 -31.92586,-29.75162 -1.42594,-5.13478 -2.10543,-110.17978 -2.11301,-326.65896 l -0.0112,-319.09031 h -8.01483 -8.01483 v 120.45053 c 0,118.07986 -0.0815,120.59391 -4.14303,127.73631 -5.26073,9.25131 -11.16854,13.58617 -22.73067,16.67855 -17.09376,4.5719 -35.7878,-4.15819 -42.50097,-19.84788 -4.3193,-10.09485 -4.038,-279.33842 0.30928,-296.02878 9.79916,-37.6215 41.53277,-68.44297 78.54331,-76.28567 19.49608,-4.1313 199.75046,-4.18226 219.18913,-0.062 19.80013,4.19692 36.80657,13.69012 51.85463,28.94588 15.47834,15.69199 22.70364,28.42132 28.09297,49.4934 3.75647,14.68761 3.96364,22.55346 3.96364,150.49169 0,116.94951 -0.41197,135.98001 -3.08199,142.37026 -4.15156,9.9361 -8.42366,14.40454 -17.95694,18.78224 -15.82006,7.2646 -35.92704,2.59108 -45.28163,-10.52495 l -4.81104,-6.74554 -0.54573,-122.72704 -0.54575,-122.72704 h -7.97001 -7.97002 v 320.65745 c 0,351.50048 0.79525,328.16116 -11.62761,341.25028 -9.81312,10.3393 -19.82011,14.2505 -36.46136,14.2505 -16.64124,0 -26.64824,-3.9112 -36.46135,-14.2505 -12.18104,-12.83433 -11.62761,-2.8865 -11.62761,-209.00564 V 607.97631 h -8.01483 -8.01483 V 796.3891 c 0,153.54409 -0.50003,189.60605 -2.70192,194.86049 -4.03669,9.63291 -12.81825,19.13041 -22.03661,23.83331 -8.88472,4.5326 -29.05582,6.6393 -37.38936,3.905 z" />
            <path d="m 449.72616,117.73496 a 77.844501,75.740591 0 1 1 -155.689,0 77.844501,75.740591 0 1 1 155.689,0 z" />
            </svg>`
        }
        document.querySelector(target).innerHTML = html;
    }

    const test_update = (data.italy.global[data.italy.global.length-1].tested - data.italy.global[data.italy.global.length-2].tested) * 100 / data.italy.global[data.italy.global.length-1].tested;
    
    
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    const ratio = Math.round(population.italy / data.italy.global[data.italy.global.length-1].tested);

    let html = `<div class="tested">
        <div class="tested-wrapper">
            <div class="tested-column">
                <h4 class="tested-title">So far have been tested</h4>
                <h3 class="tested-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].tested)} <span class="tested-increment">people (${d3.format('+.2f')(test_update)}%<sup>*</sup>)</span>
                <div class="tested-chart" id="tested-line"></div>
            </div>

            <div class="tested-column">
                <h4 class="tested-title">Which means</h4>
                <h3 class="tested-number">${d3.format('.2s')(1)} <span class="tested-increment">out of</span> <span class="tested-compare">${d3.format('.2s')(ratio)}</span>
            </div>
            <div class="tested-group" id="tested-group"></div>
        </div>
        <p class="tested-update last-update"><sup>*</sup> Compared to the previous day.<br />Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    createChart(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.tested }}), '#tested-line');
    createGroup(ratio, '#tested-group');
    $container.classList.remove('loading');
}