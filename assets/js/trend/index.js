trend = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const ratio = 10000;
    let chartData = {};
    let selectedView = '';

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
        switchClass();
    }

    const switchClass = () => {
        const $classSwitch = $container.querySelector('.trend')
        $classSwitch.classList.forEach(className => {
            if (className.startsWith('region-')) {
                $classSwitch.classList.remove(className);
            }
        });
        $classSwitch.classList.add(`region-${selectedView}`);
    };

    const switchSelection = () => {
        document.querySelector(`#trend-select-view option[value="${selectedView}"]`).selected = true;
        selectionChanged({ target: { options: [ { value: selectedView } ], selectedIndex: 0 } });

    };

    const reset = () => {
        $container.classList.add('loading');
        $chartContainer.innerHTML = '';
        drawChart();
        $container.classList.remove('loading');
    };

    const findMax = () => {
        let max = Number.MIN_SAFE_INTEGER;
        const keys = Object.keys(chartData);
        keys.forEach((k) => {
            if (k !== 'italy') {
                if (chartData[k].data[chartData[k].data.length - 1][(weightedData ? 'yW' : 'y')] >= max) {
                    selectedView = k;
                    max = chartData[k].data[chartData[k].data.length - 1][(weightedData ? 'yW' : 'y')];
                }
            }
        });
    }

    const prepareData = () => {
        chartData = {};
        chartData.italy = {
            id: 'italy',
            area: true,
            index: 6,
            coords: [1, 1],
            label: {
                text: regionsLabels['italy'],
                position: 'bottom',
                textAlign: 'right',
                dy: '1.2em',
            },
            startDate: '2020-03-02',
            data: [],
        };
        data.italy.global.forEach((element, index) => {
            if (index >= 3 && index < data.italy.global.length - 3) {
                const y = (() => {
                    let number = 0;
                    const start = index - 3;
                    const stop = index + 3;
                    for (let i = start; i <= stop; i++) {
                        number += data.italy.global[i].new_tested_positive;
                    }
                    return number / 7;
                })();
                chartData.italy.data.push({
                    ts: moment(element.datetime).valueOf(),
                    lv: element.new_tested_positive,
                    x: index,
                    y,
                    yW: y * ratio  / population.italy,
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
                    const y = (() => {
                        let number = 0;
                        const start = index - 3;
                        const stop = index + 3;
                        for (let i = start; i <= stop; i++) {
                            number += data.italy.regions[i].data[key].new_tested_positive || 0;
                        }
                        return number / 7;
                    })();
                    chartData[key].data.push({
                        ts,
                        x,
                        lv: element.data[key].new_tested_positive,
                        y,
                        yW: y * ratio / population[key],
                    });
                }
            })
        });
        if (reduceData) {
            const keys = Object.keys(chartData);
            const limit = moment().subtract(60, 'days').valueOf();
            keys.forEach(k => {
                chartData[k].data = chartData[k].data.filter(d => d.ts >= limit);
            });
        }
    };

    const drawChart = () => {
        // sparkline(chartData, '#trend-chart', 'trend');
        const maxY = (() => {
            let max = Number.MIN_SAFE_INTEGER;
            const keys = Object.keys(chartData);
            keys.forEach((key) => {
                max = Math.max(max, d3.max(chartData[key].data, d => d[(weightedData ? 'yW' : 'y')]))
            });
            return max;
        })();
        new LineChart(chartData, $chartContainer, {
            margin: { top: 20, right: 20, bottom: 30, left: 20 },
            ratio: (window.matchMedia('screen and (min-width:768px)').matches) ? .6 : 1,
            area: false,
            axes: {
              x: {
                field: "ts",
                hideAxis: false,
                scale: "time",
                ticks: 10,
                removeTicks: (value) => value === 0,
                ticksFormat: (d,i) => {
                  if(i === 0) {
                    this.prevDateTick = d;
                    return d3.timeFormat('%b %d')(d)
                  }
                  if(this.prevDateTick) {
                    if(d3.timeFormat('%m')(this.prevDateTick) !== d3.timeFormat('%m')(d)) {
                      this.prevDateTick = d;
                      return d3.timeFormat('%b %d')(d)
                    }
                  }
                  this.prevDateTick = d;
                  return d3.timeFormat('%d')(d);
                },
              },
              y: {
                field: (weightedData ? 'yW' : 'y'),
                extent: [(weightedData ? 0 : 1), maxY],
                title: toLocalText('newCases'),
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

    const initCheckboxes = () => {
        const checkbox1 = document.querySelector('#trend-period');
        const checkbox2 = document.querySelector('#trend-weighted');
        if (reduceData) {
            checkbox1.checked = true;
        }
        if (weightedData) {
            checkbox2.checked = true;
        }
        checkbox1.addEventListener('change', () => {
            if (checkbox1.checked) {
                reduceData =  true;
            } else {
                reduceData = false;
            }
            $container.classList.add('loading');
            prepareData();
            reset();
        });
        checkbox2.addEventListener('change', () => {
            if (checkbox2.checked) {
                weightedData =  true;
            } else {
                weightedData = false;
            }
            $container.classList.add('loading');
            prepareData();
            reset();
            findMax();
            switchSelection();
        });
    }

    let reduceData = true;
    let weightedData = false;
    const updated = moment(data.generated).format(dateFormat.completeDateTime);
    let html = `<div class="trend region-${selectedView}">
        <div class="trend-wrapper">
            <div class="trend-select-wrapper">
            <div class="tested-show">${toLocalText('show')}</div>
            <div class="switch"><label>${toLocalText('last60days')} <span><input type="checkbox" name="trend-period" id="trend-period" value="1" checked="checked"/><i></i></span> ${toLocalText('allPeriod')}</label></div>
            <br />
            <div class="switch"><label>${toLocalText('weighted_new_cases')} <span><input type="checkbox" name="trend-weighted" id="trend-weighted" value="1" /><i></i></span> ${toLocalText('absolute_new_cases')}</label></div>
            <div>${toLocalText('highlight')}: <select size="1" name="trend-select-view" id="trend-select-view"></select></div>
            </div>
            <div id="trend-chart" class="trend-chart-container">
            </div>
        </div>
        <p class="trend-update last-update">${toLocalText('lastUpdate')}: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    const $chartContainer = document.querySelector('#trend-chart');
    window.addEventListener('resize', reset.bind(this));
    initCheckboxes();
    prepareData();
    findMax();
    prepareSelect();
    switchSelection();
    reset();
}
