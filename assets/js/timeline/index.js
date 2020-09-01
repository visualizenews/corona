timeline = (data, id) => {
    const $container = document.querySelector(`#${id}`);

    const newCases = (d, i ) => {
        if (i === 0) { return 0; }
        if (selectedView === 'italy') {
         return d.cases - data.italy.global[i-1].cases;
        } else {
            // Controlla le regioni
            return d.cases - regionsData[selectedView][i-1].cases;
        }
    }

    const activeCases = (d,i) => {
        return d.cases - d.deaths - d.recovered;
    }

    let showMode = 'compact';
    const compactDays = 30;
    let firstDay, lastDay, days;

    const dayHeight = 12;
    const margins = { top: 10, right: 5, bottom: 20, left: 10 };
    const regionsData = {};
    const columnsHeaders = [
        {id: 'timeline-newcases', title: toLocalText('newCases'), index: newCases, data: [], invertColors: false},
        {id: 'timeline-totalcases', title: toLocalText('totalCases'), index: 'cases', data: [], invertColors: false},
        {id: 'timeline-deaths', title: toLocalText('fatalities'), index: 'deaths', data: [], invertColors: 'deaths'},
        {id: 'timeline-recovered', title: toLocalText('recovered'), index: 'recovered', data: [], invertColors: 'recovered'},
        {id: 'timeline-activecases', title: toLocalText('activeCases'), index: activeCases, data: [], invertColors: false},
        {id: 'timeline-hospitalized', title: toLocalText('hospitalized'), index: 'hospital_total', data: [], invertColors: false},
        {id: 'timeline-icu', title: toLocalText('icu'), index: 'icu', data: [], invertColors: false},
        {id: 'timeline-quarantined', title: toLocalText('quarantinedAbbr'), index: 'quarantinized', data: [], invertColors: false},
    ];
    let columns = [];
    let tooltip = {};
    let selectedView = 'italy';

    let timeout = null;
    const timeoutDuration = 5000;

    const reset = () => {
        firstDay = d3.max(data.italy.global, d => moment(d.datetime).valueOf());
        lastDay = d3.min(data.italy.global, d => moment(d.datetime).valueOf());
        days = data.italy.global.length;
    
        if (showMode === 'compact') {
            firstDay = d3.max(data.italy.global.slice(-compactDays), d => moment(d.datetime).valueOf());
            lastDay = d3.min(data.italy.global.slice(-compactDays), d => moment(d.datetime).valueOf());
            days = compactDays;
        }

        $container.classList.add('loading');
        columns = [];
        const $chart = document.querySelector('#timeline-chart-italy-9');
        $chart.innerHTML = ' ';
        createChart('#timeline-chart-italy-9');
        if (showMode === 'compact') {
            showDetails(compactDays - 1);
        } else {
            showDetails(data.italy.global.length - 1);
        }
        $container.classList.remove('loading');
    }

    const prepareSelect = () => {
        regions = Object.keys(data.italy.regions[0].data);
        data.italy.regions.forEach((d) => {
            regions.forEach((r) => {
                if (!regionsData[r]) {
                    regionsData[r] = [];
                }
                const day = Object.assign({}, d.data[r]);
                day.datetime = d.datetime;
                regionsData[r].push(day);
            })
        });
        const target = document.querySelector('#timeline-select-view');
        let options = [];
        regions.forEach(d => {
            options.push( { option: regionsLabels[d], value: d } );
        });
        options.sort( (a, b) => ((a.option > b.option) ? 1 : -1) );
        options.unshift({ option: toLocalText('italy'), value: 'italy' });
        options.forEach((o) => {
                const option = document.createElement('option');
                option.value = o.value;
                option.text = o.option;
                if (option.value === selectedView) {
                    option.selected = true;
                }
                target.appendChild(option);
            });
        target.addEventListener('change', selectionChanged);
    }

    const selectionChanged = (e) => {
        selectedView = e.target.options[e.target.selectedIndex].value;
        prepareData();
        reset();
    }

    const prepareData = () => {
        if (selectedView === 'italy') {
            columnsHeaders.forEach((column, index) => {
                columnsHeaders[index].data = data.italy.global.map((d, i) => ({
                    y: moment(d.datetime).valueOf(),
                    x: (typeof column.index === 'function') ? column.index(d, i) : d[column.index],
                })
            )});
        } else {
            columnsHeaders.forEach((column, index) => {
                columnsHeaders[index].data = regionsData[selectedView].map((d, i) => ({
                    y: moment(d.datetime).valueOf(),
                    x: (typeof column.index === 'function') ? column.index(d, i) : d[column.index],
                })
            )});
        }
    }

    const updateLabels = (index) => {
        let percentFormat = numberFormat.percent_decimals_short;
        if (window.matchMedia('(min-width:769px)').matches) {
            percentFormat = numberFormat.percent_decimals;
        }
        columns.forEach(column => {
            const label = document.querySelector(`#timeline-chart-column-detail-${column.id}`);
            const perc = document.querySelector(`#timeline-chart-column-perc-${column.id}`);
            label.innerHTML = d3LocaleFormat.format(numberFormat.thousands)(column.data[index].x);
            if (index === 0) {
                perc.innerHTML = '';
            } else {
                let val = 1;
                let diff = 0;
                if (column.data[index - 1].x !== 0) {
                    val = (column.data[index].x - column.data[index - 1].x) / column.data[index - 1].x;
                    diff = column.data[index].x - column.data[index - 1].x;
                }
                d3.select(perc)
                  .classed('negative-perc', val <= 0)
                  .html(`<b>${d3LocaleFormat.format(numberFormat.thousands_sign)(diff)} </b><i>${d3LocaleFormat.format(percentFormat)(val)}</i>`)
                // perc.innerHTML = d3LocaleFormat.format(percentFormat)(val);
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
                if (showMode === 'compact') {
                    showDetails(compactDays - 1);
                } else {
                    showDetails(data.italy.global.length - 1);
                }
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
                .attr('width', (barWidth > 0) ? barWidth : 0)
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
        /*
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
        */
    }

    const createChart = (target) => {
        const container = d3.selectAll(target);
        const width = document.querySelector(target).offsetWidth;
        const height = (days * dayHeight) + margins.top + margins.bottom;
        const columnWidth = Math.round(width - margins.left - margins.right - 50) / (columnsHeaders.length);
        let gridDistance = 50;
        let columnsDistance = 30;
        let outputDateFormat = dateFormat.minimal;
        if (window.matchMedia('(min-width:769px)').matches) {
            outputDateFormat = dateFormat.shortDayOfTheWeek;
            gridDistance = 80;
            columnsDistance = 50;
        }

        // Titles
        const titles = container.append('div')
            .attr('class', 'timeline-chart-titles')
            .append('div')
            .attr('class', 'timeline-chart-titles-columns');

        columnsHeaders.forEach((column, index) => {
            const titleContainer = titles.append('div')
                .attr('class', 'timeline-chart-titles-column')
                .attr('style', `left: ${columnsDistance + (index * columnWidth)}px; width: ${columnWidth}px`)

            // Title
            titleContainer.append('div')
                .text(column.title)
                .attr('class', 'timeline-chart-column-title');

            // Details
            titleContainer
                .append('div')
                .attr('id', `timeline-chart-column-detail-${column.id}`)
                .text('')
                .attr('class', `timeline-chart-column-detail ${column.invertColors ? column.invertColors : 'normal'}`);
    
            // Perc
            titleContainer
                .append('div')
                .attr('id', `timeline-chart-column-perc-${column.id}`)
                .attr('class', `timeline-chart-column-perc timeline-chart-column-perc-${column.id}`)
        });

        const y = d3.scaleLinear()
            .domain([firstDay, lastDay])
            .range([margins.top, height - margins.bottom]);

        const svgWrapper = container.append('div')
            .attr('style', `height: ${height}px`)
            .attr('class','timeline-chart-svg-wrapper');

        tooltip = Tooltip(svgWrapper.node(), id);

        const svg = svgWrapper
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewbox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const timeline = svg
            .append('g')
            .attr('class', 'timeline')

        // Grid
        let showData = data.italy.global.slice(0);
        if (selectedView === 'italy') {
            if (showMode === 'compact') {
                showData = showData.slice(-compactDays);
            }
            showData.forEach((day, index) => {
                const yPos = y(moment(day.datetime).valueOf());
                svgWrapper
                    .append('div')
                        .attr('id', `day-${index}`)
                        .attr('style', `left: ${margins.left}px; top: ${yPos - 2}px`)
                        .attr('class', `timeline-chart-timeline-label timeline-day-${index} ${(index === 0 || index === data.italy.global.length - 1) ? 'visible' : ''}`)
                        .text(moment(day.datetime).format(outputDateFormat));
                timeline
                    .append('line')
                    .attr('x1', gridDistance)
                    .attr('x2', width)
                    .attr('y1', yPos)
                    .attr('y2', yPos)
                    .attr('xCenter', (width - gridDistance) / 2)
                    .attr('class', `timeline-chart-timeline-grid timeline-day-${index}`);
            });

            const first = y(moment(showData[0].datetime).valueOf());
            const last = y(moment(showData[showData.length - 1].datetime).valueOf());
            svg.append('line')
              .attr('x1', gridDistance / 2)
              .attr('y1', first - dayHeight)
              .attr('x2', gridDistance / 2)
              .attr('y2', last + dayHeight)
              .attr('stroke', '#444')
              .attr('stroke-width', 1)

            svg.append('path')
              .attr('stroke', '#444')
              .attr('stroke-width', 1)
              .attr('fill', 'none')
              .attr('d',`M${gridDistance / 2 - 5},${last + dayHeight + 6}l5,-7l5,7`)
        } else {
            showData = regionsData[selectedView].slice(0);
            if (showMode === 'compact') {
                showData = showData.slice(-compactDays);
            }
            showData.forEach((day, index) => {
                const yPos = y(moment(day.datetime).valueOf());
                svgWrapper
                    .append('div')
                        .attr('id', `day-${index}`)
                        .attr('style', `left: ${margins.left + 2}px; top: ${yPos - 2}px`)
                        .attr('class', `timeline-chart-timeline-label timeline-day-${index} ${(index === 0 || index === regionsData[selectedView].length - 1) ? 'visible' : ''}`)
                        .text(moment(day.datetime).format(outputDateFormat));
                timeline
                    .append('line')
                    .attr('x1', gridDistance)
                    .attr('x2', width)
                    .attr('y1', yPos)
                    .attr('y2', yPos)
                    .attr('xCenter', (width - gridDistance) / 2)
                    .attr('class', `timeline-chart-timeline-grid timeline-day-${index}`);
            });

            const first = y(moment(showData[0].datetime).valueOf());
            const last = y(moment(showData[showData.length - 1].datetime).valueOf());
            svg.append('line')
              .attr('x1', gridDistance / 2)
              .attr('y1', first - dayHeight)
              .attr('x2', gridDistance / 2)
              .attr('y2', last + dayHeight)
              .attr('stroke', '#444')
              .attr('stroke-width', 1)

            svg.append('path')
              .attr('stroke', '#444')
              .attr('stroke-width', 1)
              .attr('fill', 'none')
              .attr('d',`M${gridDistance / 2 - 5},${last + dayHeight + 6}l5,-7l5,7`);
        }

        // Columns
        for (let i=0; i<columnsHeaders.length; i++) {
            columns.push({
                center: (margins.left + columnsDistance) + columnWidth * (i) + (columnWidth / 2),
                class: columnsHeaders[i].invertColors ? columnsHeaders[i].invertColors : 'normal',
                data: (showMode === 'compact') ? columnsHeaders[i].data.slice(-compactDays) : columnsHeaders[i].data,
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

    const updated = moment(data.generated).format(dateFormat.completeDateTime);

    const html = `<div class="timeline">
        <h3 class="timeline-select-wrapper" id="timeline-anchor">${toLocalText('show')}: <select name="timeline-select-view" id="timeline-select-view" size="1"></select></h3>
        <div class="timeline-wrapper">
            <div class="timeline-chart" id="timeline-chart-italy-9"></div>
        </div>
        <p class="timeline-show-more"><button class="button" id="timeline-mode-switch">${toLocalText('showAll')}</button></p>
        <p class="cases-recovered-update last-update">${toLocalText('lastUpdate')}: ${updated}.</p>
    </div>`;

    $container.innerHTML = html;

    prepareSelect();
    prepareData();
    reset();

    window.addEventListener('resize', reset.bind(this));
    const showModeButton = document.querySelector('#timeline-mode-switch')
    showModeButton.addEventListener('click', () => {
        if (showMode === 'compact') {
            showMode = 'all';
            showModeButton.innerHTML = toLocalText('last30');
        } else {
            showMode = 'compact';
            showModeButton.innerHTML = toLocalText('showAll');
        }
        reset();
        document.querySelector('#timeline-anchor').scrollIntoView();
    });
    $container.classList.remove('loading');
}
