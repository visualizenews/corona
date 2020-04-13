tested = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    const drawCharts = () => {
        sparkline(data.italy.global.map(day => { return { x: moment(day.datetime).unix(), y: day.tested }}), '#tested-line', 'tested');
        createGroup(data.italy.global[data.italy.global.length-1].tested, population.italy, '#tested-group', data.tested.kr.number, population.southkorea, data.tested.de.number, population.germany);
    }

    const reset = () => {
        $container.classList.add('loading');
        document.querySelector('#tested-line').innerHTML = '';
        document.querySelector('#tested-group').innerHTML = '';
        drawCharts();
        $container.classList.remove('loading');
    }

    const createGroup = (tested, population, target, kr_tested, kr_population, de_tested, de_population) => {
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

        const de_unrounded_ratio = de_tested * base / de_population;
        const de_ratio = Math.round(de_unrounded_ratio);
        const de_active_side = Math.round(Math.sqrt(single_person_side_width * single_person_side_width * de_ratio));

        let html = `<div class="tested-group-total" style="width: ${width}px; height: ${width}px; line-height: ${side_size}px">`;

        const translate = Math.max(active_side, kr_active_side);
        let it = 1;
        let kr = 1;
        let de = 1;
        
        if (active_side >= kr_active_side && active_side >= de_active_side) {
            it = 1;
            if (kr_active_side > de_active_side) {
                kr = 2;
                de = 3;
            } else {
                kr = 3;
                de = 2;
            }
        } else if (kr_active_side >= active_side && kr_active_side >= de_active_side) {
            kr = 1;                
            if (active_side > de_active_side) {
                it = 2;
                de = 3;
            } else {
                it = 3;
                de = 2;
            }
        } else if (de_active_side >= active_side && de_active_side >= kr_active_side) {
            de = 1;
            if (active_side > kr_active_side) {
                it = 2;
                kr = 3;
            } else {
                it = 3;
                kr = 2;
            }
        }
        
        if (side_size >= 1) {
            const cols = Math.ceil(Math.sqrt(ratio));
            const container_width = cols * side_size + cols;
            html += `<div class="tested-group-bullet-wrapper" style="width: ${container_width}px; z-index: ${it};">`;
            for (let i=0; i<ratio; i++) {
                html += `<div class="tested-group-bullet-active" style="width: ${side_size}px; height: ${side_size}px;"></div>`;
            }
            html += '</div>';

            const kr_cols = Math.ceil(Math.sqrt(kr_ratio));
            const kr_container_width = kr_cols * side_size + kr_cols;
            html += `<div class="tested-group-bullet-wrapper tested-group-bullet-wrapper-kr" style="width: ${kr_container_width}px; z-index: ${kr};">`;
            for (let i=0; i<kr_ratio; i++) {
                html += `<div class="tested-group-bullet-active" style="width: ${side_size}px; height: ${side_size}px;"></div>`;
            }
            html += '</div>';
            
            const de_cols = Math.ceil(Math.sqrt(de_ratio));
            const de_container_width = de_cols * side_size + de_cols;
            html += `<div class="tested-group-bullet-wrapper tested-group-bullet-wrapper-de" style="width: ${de_container_width}px; z-index: ${de};">`;
            for (let i=0; i<de_ratio; i++) {
                html += `<div class="tested-group-bullet-active" style="width: ${side_size}px; height: ${side_size}px;"></div>`;
            }
            html += '</div>';
        } else {
            html += `<div class="tested-group-active" style="width: ${active_side}px; height: ${active_side}px; z-index: ${it};"></div>`;
            html += `<div class="tested-group-active tested-group-active-kr" style="width: ${kr_active_side}px; height: ${kr_active_side}px; z-index: ${kr};"></div>`;
            html += `<div class="tested-group-active tested-group-active-de" style="width: ${de_active_side}px; height: ${de_active_side}px; z-index: ${de};"></div>`;
        }


        html += `<div class="tested-group-label" style="transform: translate3d(${translate}px, ${translate}px, 0);">
            <span class="tested-group-label-highlight">Italy</span> tested so far <span class="tested-group-label-highlight">${d3.format(',.2f')(unrounded_ratio)}</span> every
            <span class="tested-group-label-highlight">${d3.format(',')(base)}</span> people
        </div>`;

        html += `<div class="tested-group-label-kr" style="transform: translate3d(-${translate}px, -${translate}px, 0);">
            <span class="tested-group-label-highlight">South Korea</span> tested so far
            <span class="tested-group-label-highlight">${d3.format(',.2f')(kr_unrounded_ratio)}</span> every
            <span class="tested-group-label-highlight">${d3.format(',')(base)}</span> people<sup>**</sup>
        </div>`;

        html += `<div class="tested-group-label-de" style="transform: translate3d(${translate}px, 0, 0);">
            <span class="tested-group-label-highlight">Germany</span> tested so far
            <span class="tested-group-label-highlight">${d3.format(',.2f')(de_unrounded_ratio)}</span> every
            <span class="tested-group-label-highlight">${d3.format(',')(base)}</span> people<sup>***</sup>
        </div>`;
        html += `<div class="tested-group-legend">↖︎ The white square represents 100.000 people</div>`;
        html += `</div>`;

        document.querySelector(target).innerHTML = document.querySelector(target).innerHTML + html;
    }

    const test_update = (data.italy.global[data.italy.global.length-1].tested - data.italy.global[data.italy.global.length-2].tested) * 100 / data.italy.global[data.italy.global.length-1].tested;
    
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    const kr_updated = moment(data.tested.kr.date).format('dddd, MMMM Do YYYY');
    const de_updated = moment(data.tested.de.date).format('dddd, MMMM Do YYYY');

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
        <p class="tested-update last-update"><sup>*</sup> Compared to the previous day.<br />
        <sup>**</sup> Latest South Korea data available: ${kr_updated}.<br />
        <sup>***</sup> Latest Germany data available: ${de_updated}.<br />
        Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    drawCharts();
    window.addEventListener('resize', reset.bind(this));

    $container.classList.remove('loading');
}