trend = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartData = {};
    let selectedView = 'lombardia';

    const prepareSelect = () => {
        regions = Object.keys(data.italy.regions[0].data);
        const target = document.querySelector('#trend-select-view');
        let options = [];
        regions.forEach(d => {
            options.push( { option: regionsLabels[d], value: d } );
        });
        options.sort( (a, b) => ((a.option > b.option) ? 1 : -1) );
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
        const $classSwitch = $container.querySelector('.trend')
        $classSwitch.classList.forEach(className => {
            if (className.startsWith('region-')) {
                $classSwitch.classList.remove(className);
            }
        });
        $classSwitch.classList.add(`region-${selectedView}`);
    }

    const reset = () => {
        $container.classList.add('loading');
        $chartContainer.innerHTML = '';
        drawChart();
        $container.classList.remove('loading');
    };

    const prepareData = () => {
        chartData.italy = {
            id: 'italy',
            area: true,
            index: 6,
            coords: [1, 1],
            label: {
                text: 'italy',
                position: 'bottom',
                textAlign: 'right',
                dy: '1.2em',
            },
            startDate: '2020-03-02',
            data: [],
        };
        data.italy.global.forEach((element, index) => {
            if (index >= 3 && index < data.italy.global.length - 3) {
                chartData.italy.data.push({
                    ts: moment(element.datetime).valueOf(),
                    lv: element.new_tested_positive,
                    x: index,
                    y: (() => {
                        let number = 0;
                        const start = index - 3;
                        const stop = index + 3;
                        for (let i = start; i <= stop; i++) {
                            number += data.italy.global[i].new_tested_positive;
                        }
                        return number / 7;
                    })(),
                });
            }
        });
        data.italy.regions.forEach((element, index) => {
            const ts = moment(element.datetime).valueOf();
            const x = index;
            const keys = Object.keys(element.data);
            keys.forEach(key => {
                if (index >= 3 && index < data.italy.regions.length - 3) {
                    if (!chartData[key]) {
                        chartData[key] = {
                            id: key,
                            area: true,
                            index: 6,
                            coords: [1, 1],
                            label: {
                                text: regionsLabels[key],
                                position: 'bottom',
                                textAlign: 'right',
                                dy: '1.2em',
                            },
                            startDate: '2020-03-02',
                            data: [],
                        }
                    }
                    chartData[key].data.push({
                        ts,
                        x,
                        lv: element.data[key].new_tested_positive,
                        y: (() => {
                            let number = 0;
                            const start = index - 3;
                            const stop = index + 3;
                            for (let i = start; i <= stop; i++) {
                                number += data.italy.regions[i].data[key].new_tested_positive;
                            }
                            return number / 7;
                        })()
                    });
                }
            })
        });
    };

    const drawChart = () => {
        // sparkline(chartData, '#trend-chart', 'trend');
        new LineChart(chartData, $chartContainer, {
            margin: { top: 20, right: 0, bottom: 30, left: 0 },
            ratio: .6,
            area: false,
            axes: {
              x: {
                field: "x",
                scale: "linear",
                title: 'days',
                hideAxis: false,
                ticks: 3,
                removeTicks: value => value === 0
              },
              y: {
                field: "y",
                extent: [1, d3.max(chartData.italy.data, d => d.y)],
                title: "new cases",
                scale: "linear",
                grid: true,
                ticks: 3,
                labelsPosition: 'inside',
                ticksFormat: ',.0d',
              }
            },
            labels: true,
            labelsFunction: (d) => {
              const lastValue = d.data[d.data.length - 1].lv;
              const lastAvg = Math.round(d.data[d.data.length - 1].y);
              return `${d.label.text}`;
            },
          });
    };
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    let html = `<div class="trend region-${selectedView}">
        <div class="trend-wrapper">
            <div class="trend-select-wrapper">
                Show: <select size="1" name="trend-select-view" id="trend-select-view"></select>
            </div>
            <div id="trend-chart" class="trend-chart-container">
            </div>
        </div>
        <p class="trend-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    const $chartContainer = document.querySelector('#trend-chart');
    window.addEventListener('resize', reset.bind(this));
    prepareSelect();
    prepareData();
    reset();
}
