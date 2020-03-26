timeline = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const dayHeight = 16;
    const margins = { top: 100, right: 5, bottom: 20, left: 10 };
    const columnsHeaders = [
        {id: 'timeline-newcases', title: 'New Cases', index: (d, i) => { if (i === 0) { return 0; } return d.cases - data.italy.global[i-1].cases; }, data: [], invertColors: false},
        {id: 'timeline-totalcases', title: 'Total Cases', index: 'cases', data: [], invertColors: false},
        {id: 'timeline-deaths', title: 'Deaths', index: 'deaths', data: [], invertColors: false},
        {id: 'timeline-recovered', title: 'Recovered', index: 'recovered', data: [], invertColors: true},
        {id: 'timeline-activecases', title: 'Active Cases', index: (d, i) => d.cases - d.deaths - d.recovered, data: [], invertColors: false},
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
                x: (typeof column.index === 'function') ? column.index(d, i) : d[column.index],
            })
        )});
    }

    const updateLabels = (index) => {
        let percentFormat = '+.1%';
        if (window.matchMedia('(min-width:769px)').matches) {
            percentFormat = '+.2%';
        }
        columns.forEach(column => {
            const label = document.querySelector(`#timeline-chart-column-detail-${column.id}`);
            const perc = document.querySelector(`#timeline-chart-column-perc-${column.id}`);
            label.innerHTML = d3.format(',')(column.data[index].x);
            if (index === 0) {
                perc.innerHTML = '';
            } else {
                const val = (column.data[index].x - column.data[index - 1].x) / column.data[index - 1].x;
                perc.innerHTML = d3.format(percentFormat)(val);
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
        console.log(column, boundaries)
        // Scales
        const x = d3.scaleLinear()
            .domain([boundaries.min, boundaries.max])
            .range([column.x1, column.x2]);

        const w = d3.scaleLinear()
            .domain([0, boundaries.max])
            .range([0, column.width]);

        // Bars
        column.data.forEach( (d, index) => {
            const yPos = y(d.y);
            const xZero = x(0);
            const xPos = x(d.x);
            const xPosSvg = Math.min(xPos, xZero);
            const bWidth = Math.abs(xPos - xZero);
            const barWidth = w(d.x);
            // console.log(index, d, column)
            const event = mainEvents.find(e => y(moment(e.day).valueOf()) === yPos);

            const bar = g
              .append('g')
              .attr('transform',`translate(${column.center},${yPos})`)
              .on('mouseover', () => {
                  showDetails(index);
                  if (event) {
                      tooltip.show(
                          `<div class="tooltip-text">${event.event}</div>`,
                          6,
                          yPos + dayHeight / 2,
                          'bottom-left',
                          'light');
                  }
              })
              .on('mouseout', () => {
                  hideDetails(false);
                  if (event) {
                      tooltip.hide();
                  }
              });

            bar
              .append('rect')
              .attr('y', - dayHeight / 2)
              .attr('x', -column.width)
              .attr('height', dayHeight)
              .attr('width', column.width * 2)
              .attr('fill-opacity', 0)
              .attr('class', `timeline-chart-column-bar-ix`)

            bar
                .append('rect')
                .attr('y', - (dayHeight - 2) / 2)
                .attr('x', -barWidth/2)
                .attr('height', dayHeight - 2)
                .attr('width', barWidth)
                .attr('class', `timeline-chart-column-bar ${column.class} timeline-day-${index}`)
                //.attr('transform', `translate(-${(bWidth) / 2} -${(dayHeight - 2) / 2})`)
                .attr('rx', (dayHeight - 2) / 4)


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
        let dateFormat = 'DD/MM';
        let gridDistance = 50;
        let columnsDistance = 30;
        if (window.matchMedia('(min-width:769px)').matches) {
            dateFormat = 'dd DD/MM';
            gridDistance = 80;
            columnsDistance = 50;
        }
        if (data.italy && data.italy.global) {
            data.italy.global.forEach((day, index) => {
                const yPos = y(moment(day.datetime).valueOf());
                container
                    .append('div')
                        .attr('id', `day-${index}`)
                        .attr('style', `left: ${margins.left}px; top: ${yPos - 2}px`)
                        .attr('class', `timeline-chart-timeline-label timeline-day-${index} ${(index === 0 || index === data.italy.global.length - 1) ? 'visible' : ''}`)
                        .text(moment(day.datetime).format(dateFormat));
                timeline
                    .append('line')
                    .attr('x1', gridDistance)
                    .attr('x2', width)
                    .attr('y1', yPos)
                    .attr('y2', yPos)
                    .attr('xCenter', (width - gridDistance) / 2)
                    .attr('class', `timeline-chart-timeline-grid timeline-day-${index}`);
            });
        }

        // Columns
        const columnWidth = Math.round(width - margins.left - margins.right - 50) / (columnsHeaders.length);
        for (let i=0; i<columnsHeaders.length; i++) {
            columns.push({
                center: (margins.left + columnsDistance) + columnWidth * (i) + (columnWidth / 2),
                class: columnsHeaders[i].invertColors ? 'inverted' : 'normal',
                data: columnsHeaders[i].data,
                id: columnsHeaders[i].id,
                index: columnsHeaders[i].index,
                title: columnsHeaders[i].title,
                width: columnWidth,
                x1: (margins.left + columnsDistance) + columnWidth * (i),
                x2: (margins.left + columnsDistance) + columnWidth * (i) + columnWidth,
                y1: margins.top,
                y2: height - margins.bottom
            })
        }

        const extent = d3.extent([].concat(...columns.map(d => d.data.map(value => value.x))));

        const boundaries = {
            min: -extent[1],
            max: extent[1],
            zero: extent[0],
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
