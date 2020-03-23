timeline = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const dayHeight = 16;
    const margins = { top: 100, right: 30, bottom: 20, left: 15 };
    const columnsHeaders = [
        {id: 'timeline-totalcases', title: 'Total Cases', index: 'cases', data: [], invertColors: false},
        {id: 'timeline-deaths', title: 'Deaths', index: 'deaths', data: [], invertColors: false},
        {id: 'timeline-recovered', title: 'Recovered', index: 'recovered', data: [], invertColors: true},
        {id: 'timeline-activecases', title: 'Active Cases', index: d => d.cases - d.deaths - d.recovered, data: [], invertColors: false},
        {id: 'timeline-hospitalized', title: 'Hospitalized', index: 'hospital_total', data: [], invertColors: false},
        {id: 'timeline-quarantined', title: 'Quarantined', index: 'quarantinized', data: [], invertColors: false},
    ];
    let columns = [];
    let tooltip = {};

    let timeout = null;
    const timeoutDuration = 5000;
    
    const reset = () => {
        $container.classList.add('loading');
        columns = [];
        const $chart = document.querySelector('#timeline-chart-italy-9');
        $chart.innerHTML = ' ';
        createChart('#timeline-chart-italy-9');
        showDetails(data.italy.global.length - 1);
        $container.classList.remove('loading');
    }

    const prepareData = () => {
        columnsHeaders.forEach((column, index) => {
            columnsHeaders[index].data = data.italy.global.map((d, i) => ({
                y: moment(d.datetime).valueOf(),
                x: (typeof column.index === 'function') ? column.index(d) : d[column.index],
            })
        )});
    }

    const updateLabels = (index) => {
        columns.forEach(column => {
            const label = document.querySelector(`#timeline-chart-column-detail-${column.id}`);
            const perc = document.querySelector(`#timeline-chart-column-perc-${column.id}`);
            label.innerHTML = d3.format(',')(column.data[index].x);
            if (index === 0) {
                perc.innerHTML = '';
            } else {
                const val = (column.data[index].x - column.data[index - 1].x) / column.data[index - 1].x;
                perc.innerHTML = d3.format('+.2%')(val);
            }
        })
    }

    const resetSelection = () => {
        const active = document.querySelectorAll(`.timeline-hover-active`);
        active.forEach( item => item.classList.remove('timeline-hover-active'));
    }

    const showDetails = index => {
        clearTimeout(timeout);
        hideDetails(true);
        const selected = document.querySelectorAll(`.timeline-day-${index}`);
        selected.forEach( item => item.classList.add('timeline-hover-active'));
        updateLabels(index);
    }

    const hideDetails = (hasIndex) => {
        if (!hasIndex) {
            timeout = setTimeout( () => {
                clearTimeout(timeout);
                showDetails(data.italy.global.length - 1);
            }, timeoutDuration);
        } else {
            resetSelection();
        }
    }

    const drawColumn = (column, svg, y, boundaries, htmlContainer) => {
        const g = svg
            .append('g')
            .attr('id', column.id)
            .attr('class', 'timeline-column');

        // Scales
        const x = d3.scaleLinear()
            .domain([boundaries.min, boundaries.max])
            .range([column.x1, column.x2]);

        // Bars
        column.data.forEach( (d, index) => {
            const yPos = y(d.y);
            const xZero = x(0);
            const xPos = x(d.x);
            const xPosSvg = Math.min(x(d.x), xZero);
            const bWidth = Math.abs(xPos - xZero);

            const event = mainEvents.find(e => y(moment(e.day).valueOf()) === yPos);

            g
                .append('rect')
                .attr('y', yPos)
                .attr('x', xPosSvg)
                .attr('height', dayHeight - 2)
                .attr('width', bWidth)
                .attr('class', `timeline-chart-column-bar ${column.class} timeline-day-${index}`)
                .attr('transform', `translate(-${(bWidth) / 2} -${(dayHeight - 2) / 2})`)
                .attr('rx', (dayHeight - 2) / 4)
                .on('mouseover', () => {
                    showDetails(index);
                    if (event) {
                        tooltip.show(
                            `<div class="tooltip-text">${event.event}</div>`,
                            6,
                            yPos + dayHeight / 2,
                            'bottom-left');
                    }
                })
                .on('mouseout', () => {
                    hideDetails(false);
                    if (event) {
                        tooltip.hide();
                    }
                })
            
            if (event) {
                g
                    .append('circle')
                    .attr('cy', yPos - 1)
                    .attr('cx', 6)
                    .attr('r', 2)
                    .attr('class', `timeline-chart-timeline-bullet timeline-day-${index}`)
            }
        });

        // Titles
        htmlContainer
            .append('div')
            .text(column.title)
            .attr('style', `left: ${x(0)}px;`)
            .attr('class', 'timeline-chart-column-title');

        // Details
        htmlContainer
            .append('div')
            .attr('id', `timeline-chart-column-detail-${column.id}`)
            .text('')
            .attr('style', `left: ${x(0)}px;`)
            .attr('class', `timeline-chart-column-detail ${column.class}`);

        // Perc
        htmlContainer
            .append('div')
            .attr('id', `timeline-chart-column-perc-${column.id}`)
            .text('')
            .attr('style', `left: ${x(0)}px;`)
            .attr('class', `timeline-chart-column-perc ${column.class}`);

    }

    const createChart = (target) => {
        const container = d3.selectAll(target);
        const width = document.querySelector(target).offsetWidth;
        const height = (days * dayHeight) + margins.top + margins.bottom;

        container.style('height', `${height}px`);
        tooltip = Tooltip(container.node(), id);

        const y = d3.scaleLinear()
            .domain([firstDay, lastDay])
            .range([margins.top, height - margins.bottom]);

        const svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewbox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const timeline = svg
            .append('g')
            .attr('class', 'timeline')

        // Grid
        data.italy.global.forEach((day, index) => {
            const yPos = y(moment(day.datetime).valueOf());
            container
                .append('div')
                    .attr('id', `day-${index}`)
                    .attr('style', `left: ${margins.left}px; top: ${yPos - 2}px`)
                    .attr('class', `timeline-chart-timeline-label timeline-day-${index} ${(index === 0 || index === data.italy.global.length - 1) ? 'visible' : ''}`)
                    .text(moment(day.datetime).format('dd DD/MM'));
            timeline
                .append('line')
                .attr('x1', 80)
                .attr('x2', width)
                .attr('y1', yPos)
                .attr('y2', yPos)
                .attr('class', `timeline-chart-timeline-grid timeline-day-${index}`);
        });

        // Columns
        const columnWidth = Math.round(width - margins.left - margins.right - 50) / (columnsHeaders.length);
        for (let i=0; i<columnsHeaders.length; i++) {
            columns.push({
                center: (margins.left + 50) + columnWidth * (i) + (columnWidth / 2),
                class: columnsHeaders[i].invertColors ? 'inverted' : 'normal',
                data: columnsHeaders[i].data,
                id: columnsHeaders[i].id,
                index: columnsHeaders[i].index,
                title: columnsHeaders[i].title,
                width: columnWidth,
                x1: (margins.left + 50) + columnWidth * (i),
                x2: (margins.left + 50) + columnWidth * (i) + columnWidth,
                y1: margins.top,
                y2: height - margins.bottom
            })
        }

        const max = d3.max(columns, c => {
            return d3.max(c.data, d => d.x)
        });

        const boundaries = {
            min: -max,
            max: max,
        };

        // Draw columns
        columns.forEach(column => {
            drawColumn(column, svg, y, boundaries, container);
        })
    };
    
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    const firstDay = d3.max(data.italy.global, d => moment(d.datetime).valueOf());
    const lastDay = d3.min(data.italy.global, d => moment(d.datetime).valueOf());
    const days = data.italy.global.length;

    const html = `<div class="timeline">
        <div class="timeline-wrapper">
            <div class="timeline-chart" id="timeline-chart-italy-9"></div>
        </div>
        <p class="cases-recovered-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    prepareData();
    reset();

    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}