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
        const sides = [];
        const width = document.querySelector(target).offsetWidth;
        const base = 100000;
        const unrounded_ratio = tested * base / population;
        const ratio = Math.round(unrounded_ratio);
        const area = width * width;
        const single_person_area = area / base;
        const single_person_side_width = Math.sqrt(single_person_area);
        const active_side = Math.round(Math.sqrt(single_person_side_width * single_person_side_width * ratio));
        const side_size = Math.floor(single_person_side_width);
        
        sides.push({
            active_side,
            id: 'it',
            label: 'Italy',
            ratio,
            style: {
                height: '0',
                left: '0',
                top: '0',
                width: '0',
            },
            unrounded_ratio,
        });

        const kr_unrounded_ratio = kr_tested * base / kr_population;
        const kr_ratio = Math.round(kr_unrounded_ratio);
        const kr_active_side = Math.round(Math.sqrt(single_person_side_width * single_person_side_width * kr_ratio));

        sides.push({
            active_side: kr_active_side,
            id: 'kr',
            label: 'South Korea',
            ratio: kr_ratio,
            style: {
                height: '0',
                left: '0',
                top: '0',
                width: '0',
            },
            unrounded_ratio: kr_unrounded_ratio,
        });

        const de_unrounded_ratio = de_tested * base / de_population;
        const de_ratio = Math.round(de_unrounded_ratio);
        const de_active_side = Math.round(Math.sqrt(single_person_side_width * single_person_side_width * de_ratio));

        sides.push({
            active_side: de_active_side,
            id: 'de',
            label: 'Germany',
            ratio: de_ratio,
            style: {
                height: '0',
                left: '0',
                top: '0',
                width: '0',
            },
            unrounded_ratio: de_unrounded_ratio,
        });
        let html = `<div class="tested-group-total" style="width: ${width}px; height: ${width}px; line-height: ${side_size}px">`;

        sides.sort((a, b) => a.active_side - b.active_side);

        sides.forEach((s,i) => {
            const cols = Math.ceil(Math.sqrt(s.ratio));
            s.style.width = `${cols * side_size + cols}px`;
            s.style.height = `${cols * side_size + cols}px`;
            if (i > 0) {
                s.style.top = `${parseInt(sides[i - 1].style.top.replace(/px/ig, '')) + parseInt(sides[i - 1].style.height.replace(/px/ig, ''))}px`;
                s.style.left = `${parseInt(sides[i - 1].style.left.replace(/px/ig, '')) + parseInt(sides[i - 1].style.width.replace(/px/ig, ''))}px`;
            }
            const keys = Object.keys(s.style);
            let style = '';
            keys.forEach(k => {style += `${k}: ${s.style[k]}; `});
            html += `<div class="tested-group-bullet-wrapper tested-group-bullet-wrapper-${s.id}" style="${style}">`;
            if (side_size >= 1) {
                for (let x=0; x < s.ratio; x++) {
                    html += `<div class="tested-group-bullet-active" style="width: ${side_size}px; height: ${side_size}px;"></div>`;
                }
            } else {
                html += '<div class="tested-group-active"></div>';
            }
            const labelStyle = `top: ${Math.round(parseInt(s.style.top.replace(/px/ig, '')) + parseInt(s.style.height.replace(/px/ig, '')) / 2)}px; left: ${Math.round(parseInt(s.style.left.replace(/px/ig, '')) + parseInt(s.style.width.replace(/px/ig, '')) + 20)}px`;
            html += `</div>`
            html += `<div class="tested-group-label tested-group-label-${s.id}" style="${labelStyle}">So far,
                <span class="tested-group-label-highlight">${s.label}</span> performed <span class="tested-group-label-highlight">${d3LocaleFormat.format(numberFormat.decimals)(s.unrounded_ratio)}</span> tests every
                <span class="tested-group-label-highlight">${d3LocaleFormat.format(numberFormat.thousands)(base)}</span> people
            </div>`;
        });
        html += `<div class="tested-group-legend">The white square represents 100.000 people ↘︎</div>`;
        html += `</div>`;

        document.querySelector(target).innerHTML = document.querySelector(target).innerHTML + html;
    }

    const test_update = (data.italy.global[data.italy.global.length-1].tested - data.italy.global[data.italy.global.length-2].tested)/ data.italy.global[data.italy.global.length-1].tested;
    
    const updated = moment(data.generated).format(dateFormat.completeDateTime);
    const kr_updated = moment(data.tested.kr.date).format(dateFormat.completeDate);
    const de_updated = moment(data.tested.de.date).format(dateFormat.completeDate);

    let html = `<div class="tested">
        <div class="tested-wrapper">
            <h4 class="tested-title">So far have been performed</h4>
            <h3 class="tested-number">${d3LocaleFormat.format(numberFormat.abbreviated)(data.italy.global[data.italy.global.length-1].tested)} <span class="tested-increment">tests (${d3LocaleFormat.format(numberFormat.percent_decimals)(test_update)}<sup>*</sup>)</span></h3>
        
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