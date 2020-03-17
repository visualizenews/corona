tested = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    const drawCharts = () => {
        sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.tested }}), '#tested-line', 'tested');
        createGroup(data.italy.global[data.italy.global.length-1].tested, population.italy, '#tested-group', data.tested.kr.number, population.southkorea, show_kr);
    }

    const reset = () => {
        $container.classList.add('loading');
        document.querySelector('#tested-line').innerHTML = '';
        document.querySelector('#tested-group').innerHTML = '';
        drawCharts();
        $container.classList.remove('loading');
    }

    const createGroup = (tested, population, target, kr_tested, kr_population, show_kr) => {
        console.log('tested', tested);
        const width = document.querySelector(target).offsetWidth;
        const base = 100000;
        const unrounded_ratio = tested * base / population;
        const ratio = Math.round(unrounded_ratio);
        const area = width * width;
        const single_person_area = area / base;
        const single_person_side_width = Math.sqrt(single_person_area);
        const active_side = Math.round(Math.sqrt(single_person_side_width * single_person_side_width * ratio));
        const side_size = Math.floor(single_person_side_width);

        const kr_unrounded_ratio = kr_tested * base / kr_population;
        const kr_ratio = Math.round(kr_unrounded_ratio);
        const kr_active_side = Math.round(Math.sqrt(single_person_side_width * single_person_side_width * kr_ratio));

        let html = `<div class="tested-group-total" style="width: ${width}px; height: ${width}px; line-height: ${side_size}px">`;

        if (side_size >= 1) {
            if (show_kr) {
                const kr_cols = Math.ceil(Math.sqrt(kr_ratio));
                const kr_container_width = kr_cols * side_size + kr_cols;
                html += `<div class="tested-group-bullet-wrapper tested-group-bullet-wrapper-kr" style="width: ${kr_container_width}px">`;
                for (let i=0; i<kr_ratio; i++) {
                    html += `<div class="tested-group-bullet-active" style="width: ${side_size}px; height: ${side_size}px;"></div>`;
                }
                html += '</div>';
            }
            const cols = Math.ceil(Math.sqrt(ratio));
            const container_width = cols * side_size + cols;
            html += `<div class="tested-group-bullet-wrapper" style="width: ${container_width}px">`;
            for (let i=0; i<ratio; i++) {
                html += `<div class="tested-group-bullet-active" style="width: ${side_size}px; height: ${side_size}px;"></div>`;
            }
            html += '</div>';
        } else {
            if (show_kr) {
                html += `<div class="tested-group-active tested-group-active-kr" style="width: ${kr_active_side}px; height: ${kr_active_side}px"></div>`;
            }
            html += `<div class="tested-group-active" style="width: ${active_side}px; height: ${active_side}px"></div>`;
        }
        html += `<div class="tested-group-label" style="transform: translate3d(${active_side}px, ${active_side}px, 0);">
                Italy:<br />
                ${d3.format(',.2f')(unrounded_ratio)} <span class="tested-group-label-text">every</span><br />
                <span class="tested-group-label-total">${d3.format(',')(base)}</span> <span class="tested-group-label-text">people</span>
            </div>`;
        if (show_kr) {
            html += `<div class="tested-group-label-kr" style="transform: translate3d(-${kr_active_side}px, -${kr_active_side}px, 0);">
                South Korea:<br />
                ${d3.format(',.2f')(kr_unrounded_ratio)} <span class="tested-group-label-text">every</span><br />
                <span class="tested-group-label-total">${d3.format(',')(base)}</span> <span class="tested-group-label-text">people<sup>**</sup></span>
            </div>`;
        }
        html += `</div>`;

        document.querySelector(target).innerHTML = document.querySelector(target).innerHTML + html;
    }

    const test_update = (data.italy.global[data.italy.global.length-1].tested - data.italy.global[data.italy.global.length-2].tested) * 100 / data.italy.global[data.italy.global.length-1].tested;
    let show_kr = false;
    
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    const kr_updated = moment(data.tested.kr.date).format('dddd, MMMM Do YYYY, h:mm a');

    if (moment(data.italy.global[data.italy.global.length-1].datetime).format('YYYY-MM-DD') === moment(data.tested.kr.date).format('YYYY-MM-DD')) {
        show_kr = true;
    }

    let html = `<div class="tested">
        <div class="tested-wrapper">
            <h4 class="tested-title">So far have been tested</h4>
            <h3 class="tested-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].tested)} <span class="tested-increment">people (${d3.format('+.2f')(test_update)}%<sup>*</sup>)</span></h3>
        
            <div class="tested-column">
                <div class="tested-chart" id="tested-line"></div>
            </div>
            <div class="tested-group-wrapper">
                <div class="tested-group" id="tested-group"></div>
            </div>
        </div>
        <p class="tested-update last-update"><sup>*</sup> Compared to the previous day.<br />`;
    if (show_kr) {
        html += `<sup>**</sup> Latest South Korea data available: ${kr_updated}<br />`;
    }
    html += `Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    drawCharts();
    window.addEventListener('resize', reset.bind(this));

    $container.classList.remove('loading');
}