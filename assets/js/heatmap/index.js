heatmap = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    const chartData = {
        newCases: [],
        deaths: [],
        hospital: [],
        icu: [],
        quarantined: [],
        tested: [],
        recovered: [],
    };
    const chartDescriptions = {
        newCases: {
            title: 'New Cases',
            description: '',
            tooltip: '<p>On <strong>[DAY]</strong> there have been an average increment of <strong>[AVG]</strong> of new cases.</p><p>The worst <strong>[DAY]</strong> so far has been <strong>[WORSTDATE]</strong> with [WORSTVALUE].</p><p>The better has been <strong>[BETTERDATE]</strong> with <strong>[BETTERVALUE]</strong>.</p>',
            worst: [],
            better: [],
        },
        deaths: {
            title: 'Fatalities',
            description: '',
            tooltip: 'On <strong>[DAY]</strong> there have been an average of increment of <strong>[AVG]</strong> of fatalities.<br />The worst <strong>[DAY]</strong> so far has been <strong>[WORSTDATE]</strong> with <strong>[WORSTVALUE]</strong> fatalities.</p><p>The better has been <strong>[BETTERDATE]</strong> with <strong>[BETTERVALUE]</strong> fatalities.',
            worst: [],
            better: [],
        },
        hospital: {
            title: 'Hospitalized',
            description: 'The total number of people admitted to an hospital due to COVID-19 (including ICU admissions).',
            worst: [],
            better: [],
        },
        icu: {
            title: 'ICU',
            descriptions: 'People admitted to ICU',
            worst: [],
            better: [],
        },
        quarantined: {
            title: 'Quarantined',
            description: '',
            worst: [],
            better: [],
        },
        tested: {
            title: 'Tests',
            description: 'The total number of tests that returned a result that day, either positive or negative.',
            tooltip: 'On <strong>[DAY]</strong> there have been an average of increment of <strong>[AVG]</strong> of test.<br />The worst <strong>[DAY]</strong> so far has been <strong>[WORSTDATE]</strong> with <strong>[WORSTVALUE]</strong> test.</p><p>The better has been <strong>[BETTERDATE]</strong> with <strong>[BETTERVALUE]</strong> test.',
            worst: [],
            better: [],
        },
        recovered: {
            title: 'Recovered',
            description: 'The number of people that have been declared recovered that day.',
            worst: [],
            better: [],
        }
    };
    const numberOfDays = [];
    const purpleColors = ['#f7f7f7', '#ffd6db', '#ffb6c1', '#ff93a7', '#ff6b8c', '#ff2e71'];
    const daysOfTheWeek = [ { s: 'Su', l: 'Sunday' }, { s: 'Mo', l: 'Monday' }, { s: 'Tu', l: 'Tuesday' }, { s: 'We', l: 'Wednesday' }, { s: 'Th', l: 'Thursday' }, { s: 'Fr', l: 'Friday' }, { s: 'Sa', l: 'Saturday' } ];
    let chartContainerWidth = 0;

    const reset = () => {
        const chartContainer = document.querySelector('#heatmap-wrapper');
        chartContainerWidth = chartContainer.offsetWidth;
        chartContainer.innerHTML = '';
        drawHeatmap();
        $container.classList.remove('loading');
    }

    const prepareData = () => {
        const dataByDay = {
            newCases: [],
            deaths: [],
            hospital: [],
            icu: [],
            quarantined: [],
            recovered: [],
            tested: [],
        };
        data.italy.global.forEach((d, i) => {
            const dayOfTheWeek = moment(d.datetime).format('d');

            if (!chartData.newCases[dayOfTheWeek]) {
                chartData.newCases[dayOfTheWeek] = 0;
                numberOfDays[dayOfTheWeek] = 0;
                dataByDay.newCases[dayOfTheWeek] = [];
            }
            if (!chartData.deaths[dayOfTheWeek]) {
                chartData.deaths[dayOfTheWeek] = 0;
                numberOfDays[dayOfTheWeek] = 0;
                dataByDay.deaths[dayOfTheWeek] = [];
            }
            if (!chartData.hospital[dayOfTheWeek]) {
                chartData.hospital[dayOfTheWeek] = 0;
                numberOfDays[dayOfTheWeek] = 0;
                dataByDay.hospital[dayOfTheWeek] = [];
            }
            if (!chartData.icu[dayOfTheWeek]) {
                chartData.icu[dayOfTheWeek] = 0;
                numberOfDays[dayOfTheWeek] = 0;
                dataByDay.icu[dayOfTheWeek] = [];
            }
            if (!chartData.quarantined[dayOfTheWeek]) {
                chartData.quarantined[dayOfTheWeek] = 0;
                numberOfDays[dayOfTheWeek] = 0;
                dataByDay.quarantined[dayOfTheWeek] = [];
            }
            if (!chartData.tested[dayOfTheWeek]) {
                chartData.tested[dayOfTheWeek] = 0;
                numberOfDays[dayOfTheWeek] = 0;
                dataByDay.tested[dayOfTheWeek] = [];
            }
            if (!chartData.recovered[dayOfTheWeek]) {
                chartData.recovered[dayOfTheWeek] = 0;
                numberOfDays[dayOfTheWeek] = 0;
                dataByDay.recovered[dayOfTheWeek] = [];
            }
            /*
            chartData.newCases[dayOfTheWeek] += d.new_tested_positive;
            chartData.deaths[dayOfTheWeek] += ((i === 0) ? d.deaths : d.deaths - data.italy.global[i - 1].deaths);
            chartData.hospital[dayOfTheWeek] += ((i === 0) ? d.hospital : d.hospital - data.italy.global[i - 1].hospital);
            chartData.icu[dayOfTheWeek] += ((i === 0) ? d.icu : d.icu - data.italy.global[i - 1].icu);
            chartData.quarantined[dayOfTheWeek] += ((i === 0) ? d.quarantinized : d.quarantinized - data.italy.global[i - 1].quarantinized);
            chartData.tested[dayOfTheWeek] += ((i === 0) ? d.tested : d.tested - data.italy.global[i - 1].tested);
            chartData.recovered[dayOfTheWeek] += ((i === 0) ? d.recovered : d.recovered - data.italy.global[i - 1].recovered);
            numberOfDays[dayOfTheWeek] += 1;

            dataByDay.newCases[dayOfTheWeek].push( { date: d.datetime, value: d.new_tested_positive } );
            dataByDay.deaths[dayOfTheWeek].push( { date: d.datetime, value: ((i === 0) ? d.deaths : d.deaths - data.italy.global[i - 1].deaths) } );
            dataByDay.hospital[dayOfTheWeek].push( { date: d.datetime, value: ((i === 0) ? d.hospital : d.hospital - data.italy.global[i - 1].hospital) } );
            dataByDay.icu[dayOfTheWeek].push( { date: d.datetime, value: ((i === 0) ? d.icu : d.icu - data.italy.global[i - 1].icu) } );
            dataByDay.quarantined[dayOfTheWeek].push( { date: d.datetime, value: ((i === 0) ? d.quarantined : d.quarantined - data.italy.global[i - 1].quarantined) } );
            dataByDay.tested[dayOfTheWeek].push( { date: d.datetime, value: ((i === 0) ? d.tested : d.tested - data.italy.global[i - 1].tested) } );
            dataByDay.recovered[dayOfTheWeek].push( { date: d.datetime, value: ((i === 0) ? d.recovered : d.recovered - data.italy.global[i - 1].recovered) } );
            */
           if (i > 0) {
            dataByDay.newCases[dayOfTheWeek].push( { date: d.datetime, value: d.new_tested_positive, perc: (d.deaths - data.italy.global[i - 1].deaths) / data.italy.global[i - 1].deaths } );
            dataByDay.deaths[dayOfTheWeek].push( { date: d.datetime, value: d.deaths - data.italy.global[i - 1].deaths, perc: (d.deaths - data.italy.global[i - 1].deaths) / data.italy.global[i - 1].deaths } );
            dataByDay.hospital[dayOfTheWeek].push( { date: d.datetime, value: (d.hospital - data.italy.global[i - 1].hospital), perc: (d.hospital - data.italy.global[i - 1].hospital) / data.italy.global[i - 1].hospital } );
            dataByDay.icu[dayOfTheWeek].push( { date: d.datetime, value: (d.icu - data.italy.global[i - 1].icu), perc: (d.icu - data.italy.global[i - 1].icu) / data.italy.global[i - 1].icu } );
            dataByDay.quarantined[dayOfTheWeek].push( { date: d.datetime, value: (d.quarantinized - data.italy.global[i - 1].quarantinized), perc: (d.quarantinized - data.italy.global[i - 1].quarantinized) / data.italy.global[i - 1].quarantinized } );
            dataByDay.tested[dayOfTheWeek].push( { date: d.datetime, value: (d.tested - data.italy.global[i - 1].tested), perc: ((d.tested - data.italy.global[i - 1].tested) / data.italy.global[i - 1].tested) } );
            dataByDay.recovered[dayOfTheWeek].push( { date: d.datetime, value: (d.recovered - data.italy.global[i - 1].recovered), perc: (d.recovered - data.italy.global[i - 1].recovered) / data.italy.global[i - 1].recovered } );

            chartData.newCases[dayOfTheWeek] = d3.mean(dataByDay.newCases[dayOfTheWeek], d => d.perc);
            chartData.deaths[dayOfTheWeek] = d3.mean(dataByDay.deaths[dayOfTheWeek], d => d.perc);
            chartData.hospital[dayOfTheWeek] = d3.mean(dataByDay.hospital[dayOfTheWeek], d => d.perc);
            chartData.icu[dayOfTheWeek] = d3.mean(dataByDay.icu[dayOfTheWeek], d => d.perc);
            chartData.quarantined[dayOfTheWeek] = d3.mean(dataByDay.quarantined[dayOfTheWeek], d => d.perc);
            chartData.tested[dayOfTheWeek] = d3.mean(dataByDay.tested[dayOfTheWeek], d => d.perc);
            chartData.recovered[dayOfTheWeek] = d3.mean(dataByDay.recovered[dayOfTheWeek], d => d.perc);
            numberOfDays[dayOfTheWeek] += 1;
           }
        });
        const keys = Object.keys(chartDescriptions);
        keys.forEach(k => {
            for (i=0; i<7; i++) {
                if (k === 'recovered' || k === 'tested') {
                    const worstIndex = d3.minIndex(dataByDay[k][i], d => d.value);
                    chartDescriptions[k].worst[i] = dataByDay[k][i][worstIndex];
                    const betterIndex = d3.maxIndex(dataByDay[k][i], d => d.value);
                    chartDescriptions[k].better[i] = dataByDay[k][i][betterIndex];
                } else {
                    const worstIndex = d3.maxIndex(dataByDay[k][i], d => d.value);
                    chartDescriptions[k].worst[i] = dataByDay[k][i][worstIndex];
                    const betterIndex = d3.minIndex(dataByDay[k][i], d => d.value);
                    chartDescriptions[k].better[i] = dataByDay[k][i][betterIndex];
                }
            }
        });
    }

    const drawHeatmap = () => {
        const keys = Object.keys(chartData);
        const chartContainer = d3.select('#heatmap-wrapper');
        
        const colorScaleClusters = d3.scaleCluster().domain([
            -0.3,
            ...chartData.newCases,
            ...chartData.deaths,
            ...chartData.hospital,
            ...chartData.icu,
            ...chartData.quarantined,
            ...chartData.tested,
            ...chartData.recovered,
            3
        ]).range(purpleColors).clusters();
        var colorScale = d3.scaleThreshold()
            .domain(colorScaleClusters)
            .range(purpleColors);

        keys.forEach((k, i) => {
            const heatmapHeaderContainer = chartContainer
                .append('div')
                .attr('class', 'heatmap-header');
            daysOfTheWeek.forEach(d => {
                heatmapHeaderContainer.append('div')
                    .attr('class', 'heatmap-header-day')
                    .text(d.s);
            });

            const singleHeatmapContainer = chartContainer
                .append('div')
                .attr('class', `heatmap-chart heatmap-chart${k}`);

            const tooltip = Tooltip(singleHeatmapContainer.node(), `${id}${k}`);
            
            const singleHeatmapHeading = singleHeatmapContainer
                .append('div')
                .attr('class', 'heatmap-chart-heading');
            
                singleHeatmapHeading
                .append('div')
                .attr('class', 'heatmap-chart-title')
                .append('h3')
                    .text(chartDescriptions[k].title);

            chartData[k].forEach( (d,i) => {
                singleHeatmapContainer.append('div')
                    .attr('class', 'heatmap-chart-day')
                    .attr('style', `background-color: ${colorScale(d)}`)
                    .on('mouseenter', () => {
                        const dayWidth = ((chartContainerWidth - 150) / 7);
                        const x = Math.round(dayWidth * i + 150 + (dayWidth / 2));
                        let position = 'bottom-center';
                        if (i > 4) {
                            position = 'bottom-right';
                        }

                        const content = chartDescriptions[k].tooltip
                            .replace(/\[DAY\]/ig, daysOfTheWeek[i].l)
                            .replace(/\[AVG\]/ig, d3.format('.2%')(d / numberOfDays[i]))
                            .replace(/\[WORSTDATE\]/ig, chartDescriptions[k].worst[i].date)
                            .replace(/\[WORSTVALUE\]/ig, chartDescriptions[k].worst[i].value)
                            .replace(/\[BETTERDATE\]/ig, chartDescriptions[k].better[i].date)
                            .replace(/\[BETTERVALUE\]/ig, chartDescriptions[k].better[i].value);
                        tooltip.show(content, x, 33, position, 'light');
                    })
                    .on('mouseleave', ( )=> {
                        tooltip.hide();
                    });
            });
            
            if (chartDescriptions[k].description !== '') {
                singleHeatmapContainer
                    .append('div')
                    .attr('class', 'heatmap-chart-description')
                    .text(chartDescriptions[k].description);
            }
        });
    }

    let html = `<div class="heatmap">
        <div class="heatmap-wrapper" id="heatmap-wrapper">
            
        </div>
        <p class="counter-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;
    prepareData();
    window.addEventListener('resize', reset.bind(this));
    reset();
}
