timeline = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const dayHeight = 12;
    const margins = { top: 80, right: 30, bottom: 20, left: 10 };
    const columnsHeaders = [
        {id: 'timeline-totalcases', title: 'Total Cases', index: 'cases', data: [], invertColors: false},
        {id: 'timeline-deaths', title: 'Deaths', index: 'deaths', data: [], invertColors: false},
        {id: 'timeline-recovered', title: 'Recovered', index: 'recovered', data: [], invertColors: true},
        {id: 'timeline-activecases', title: 'Active Cases', index: d => d.cases - d.deaths - d.recovered, data: [], invertColors: false},
        {id: 'timeline-hospitalized', title: 'Hospitalized', index: 'hospital_total', data: [], invertColors: false},
        {id: 'timeline-quarantined', title: 'Quarantined', index: 'quarantinized', data: [], invertColors: false},
    ];
    
    const reset = () => {
        $container.classList.add('loading');
        const $containers = document.querySelectorAll('#timeline-chart-italy');
        $containers.forEach( $container => $container.innerHTML = '' );
        createChart('#timeline-chart-italy');
        $container.classList.remove('loading');
    }

    const prepareData = () => {
        columnsHeaders.forEach((column, index) => {
            columnsHeaders[index].data = data.italy.global.map((d, i) => ({
                y: moment(d.datetime).valueOf(),
                x: (typeof column.index === 'function') ? column.index(d) : d[column.index],
                /*
                x: (() => {
                    if (i === 0) {
                        return 0;
                    }
                    if (data.italy.global[i - 1][column.index] === 0) {
                        return 0;
                    }
                    return (d[column.index] - data.italy.global[i - 1][column.index]) * 100 / data.italy.global[i - 1][column.index];
                })()
                */
            })
        )});
    }

    const drawColumn = (column, svg, y, boundaries) => {
        console.log(column);
        const g = svg
            .append('g')
            .attr('id', column.id)
            .attr('class', 'timeline-column');

        // Vertical Line
        /*
        g
            .append('line')
            .attr('x1', column.center)
            .attr('x2', column.center)
            .attr('y1', column.y1)
            .attr('y2', column.y2)
            .attr('class', 'timeline-axis-y')
        */
        // Scales
        const x = d3.scaleLinear()
            .domain([boundaries.min, boundaries.max])
            .range([column.x1, column.x2]);

        // Bars
        column.data.forEach( d => {
            const yPos = y(d.y);
            const xPos = x(d.x);
            const xZero = x(0);
            const bWidth = Math.abs(xPos - xZero);
            g
                .append('rect')
                .attr('y', yPos)
                .attr('x', Math.min(xPos, xZero))
                .attr('height', dayHeight - 2)
                .attr('width', bWidth)
                .attr('class', `timeline-chart-column-bar ${column.class}`)
                .attr('transform', `translate(-${(bWidth) / 2} -${(dayHeight - 2) / 2})`)
                .attr('rx', (dayHeight - 2) / 4)

            // Titles
            g
                .append('text')
                .text(column.title)
                .attr('x', x(0))
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'timeline-chart-column-title')
                

        });

    }

    const createChart = (target) => {
        const container = d3.selectAll(target);
        const width = document.querySelector(target).offsetWidth;
        const height = (days * dayHeight) + margins.top + margins.bottom;
        const maxRadius = Math.min(width/5, dayHeight);

        container.style('height', `${height}px`);

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
            timeline
                .append('text')
                    .attr('id', `day-${index}`)
                    .attr('x', margins.left)
                    .attr('y', yPos - 2)
                    .attr('text-anchor', 'start')
                    .attr('alignment-baseline', 'middle')
                    .attr('class', 'timeline-chart-timeline-label')
                    .text(moment(day.datetime).format('MMM Do'));
            timeline
                .append('line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', yPos)
                .attr('y2', yPos)
                .attr('class', 'timeline-chart-timeline-grid')
        });

        // Columns
        const columnWidth = Math.round(width - margins.left - margins.right) / (columnsHeaders.length + 1);
        const columns = [];
        for (let i=0; i<columnsHeaders.length; i++) {
            columns.push({
                center: columnWidth * (i + 1) + columnWidth / 2,
                class: columnsHeaders[i].invertColors ? 'inverted' : 'normal',
                data: columnsHeaders[i].data,
                id: columnsHeaders[i].id,
                index: columnsHeaders[i].index,
                title: columnsHeaders[i].title,
                width: columnWidth,
                x1: columnWidth * (i + 1),
                x2: columnWidth * (i + 1) + columnWidth,
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
            drawColumn(column, svg, y, boundaries);
        })
    };
    
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    const firstDay = d3.max(data.italy.global, d => moment(d.datetime).valueOf());
    const lastDay = d3.min(data.italy.global, d => moment(d.datetime).valueOf());
    const days = data.italy.global.length;

    const html = `<div class="timeline">
        <div class="timeline-wrapper">
            <div class="timeline-chart" id="timeline-chart-italy"></div>
        </div>
        <p class="cases-recovered-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    prepareData();
    createChart('#timeline-chart-italy');

    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}