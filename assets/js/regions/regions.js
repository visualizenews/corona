regionsComparison = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  d3.json("/assets/json/regioni.json").then(populations => {
    const regionsData = {};
    data.italy.regions.forEach(r => {
      Object.entries(r.data)
        //.filter(d => d[0] === 'lombardia')
        .forEach(d => {
          // console.log(d)
          if (!regionsData[d[0]]) {
            const regionPopulation = populations.find(r => r.id === d[0]);
            const coords = regionPopulation ? regionPopulation.coords : [0,0];
            regionsData[d[0]] = {
              id: d[0],
              data: [],
              population: regionPopulation ? regionPopulation.population : 1,
              coords,
              index: coords[0] * 5 + coords[1],
              startDate: r.datetime,
              area: true,
              label: {
                text: d[0],
                position: "top",
                textAlign: "right"
              }
            };
          }

          regionsData[d[0]].data = [
            ...regionsData[d[0]].data,
            {
              date: r.datetime,
              diff: moment(r.datetime).diff(
                moment(regionsData[d[0]].startDate),
                'days'
              ),
              ts: +new Date(r.datetime),
              ...Object.assign(d[1], {
                perc: (d[1].cases / regionsData[d[0]].population) * 100000
              })
            }
          ].filter(d => d.cases > 0);

          const values = [];
          regionsData[d[0]].data
            .forEach((v,i) => {
              // console.log(regionsData[d[0]])
              v.newRecoveries =  (i > 0 && regionsData[d[0]].data[i - 1]) ? v.recovered - regionsData[d[0]].data[i - 1].recovered : null;
              v.newDeaths =  (i > 0 && regionsData[d[0]].data[i - 1]) ? v.deaths - regionsData[d[0]].data[i - 1].deaths : null;
              values.push(v)
              if(values.length === 7) {
                // d.movingWeekRight = [...values];
                v.movingAvgNewCases = d3.mean([...values], value => value.new_tested_positive);
                v.movingAvgNewRecoveries = d3.mean([...values], value => value.newRecoveries);
                v.movingAvgNewDeaths = d3.mean([...values], value => value.newDeaths);
                values.shift();
              }
            });
        });
    });
    // console.log('regionsData', regionsData)
    if(regionsData['trento']) {
      const trentinoPopulation = populations.find(
        r => r.id === "trentino-alto-adige"
      );
      const coordsTrentino = trentinoPopulation ? trentinoPopulation.coords : [0,0];
      regionsData["trentino-alto-adige"] = {
        id: "trentino-alto-adige",
        population: trentinoPopulation ? trentinoPopulation.population : 1,
        coords: coordsTrentino,
        index: coordsTrentino[0] * 5 + coordsTrentino[1],
        startDate: regionsData["trento"].startDate,
        area: true,
        label: {
          text: "trentino alto adige",
          position: "top",
          textAlign: "right"
        },
        data: regionsData["trento"].data.map(d => {
          const sameDay = regionsData["trento"].data.find(
            day => day.date === d.date
          );
          return {
            ...d,
            cases: d.cases + (sameDay ? sameDay.cases : 0)
          };
        }).filter(d => d.cases > 0)
      };
      // console.log(regionsData);
    }

    const countryData = data.italy.global.map(d => {
      return {
        date: d.datetime,
        diff: moment(d.datetime).diff(
          moment(data.italy.global[0].datetime),
          "days"
        ),
        ts: +new Date(d.datetime),
        perc: (d.cases / population["italy"]) * 100000,
        ...d
      };
    }).filter(d => d.cases > 0);

    // console.log('regionsData', Object.values(regionsData))

    const comparisonSettings = [
      {
        id: 'new_cases',
        title: toLocalText('cases'),
        label: toLocalText('dailyCases'),
        scale: 'linear',
        maxValue: 1500,
        series: [
          {
            type: 'bars',
            field: 'new_tested_positive'
          },
          {
            type: 'line',
            field: 'movingAvgNewCases'
          },
        ],
      },
      {
        id: 'new_deaths',
        title: toLocalText('fatalities'), // 'new fatalities',
        label: toLocalText('dailyFatalities'),
        scale: 'linear',
        maxValue: 400,
        series: [
          {
            type: 'bars',
            field: 'newDeaths'
          },
          {
            type: 'line',
            field: 'movingAvgNewDeaths'
          },
        ],
      },
      {
        id: 'new_recoveries',
        title: toLocalText('recoveries'), // 'new recoveries',
        label: toLocalText('dailyRecoveries'),
        scale: 'linear',
        maxValue: 1500,
        series: [
          {
            type: 'bars',
            field: 'newRecoveries'
          },
          {
            type: 'line',
            field: 'movingAvgNewRecoveries'
          },
        ],
      },
    ];

    const selectedSettings = comparisonSettings[0];

    const indicatorSelector = d3.select(`#${id}`)
                                .append('div')
                                  .attr('class','indicator-select-wrapper')
                                  .call(div => {
                                    div.append('span')
                                      .text(`${toLocalText('show')}: `);
                                  })
                                  .call(div => {
                                    div.append('select')
                                      .attr('size',1)
                                      .attr('name', 'regions-indicator-selecor')
                                      .attr('id','regionsIndicatorSelector')
                                        .on('change',  function(){
                                          const id = d3.select(this).property('value');
                                          console.log('change', id)
                                          const cs = comparisonSettings.find(d => d.id === id)
                                          window.comparison.updateCharts(cs)
                                        })
                                        .selectAll('options')
                                        .data(comparisonSettings)
                                          .join('option')
                                          .attr('value', d => d.id)
                                          .property('selected', d => d.id === selectedSettings.id)
                                          .text(d => d.title)
                                  })

    window.comparison = new RegionsComparison(
      $container,
      Object.values(regionsData)
        //.filter(d => d.id === "lombardia")
        .filter(d => d.id !== "trento" && d.id !== "bolzano")
        .sort((a,b) => {
          return b.data[b.data.length - 1]['cases'] - a.data[a.data.length - 1]['cases']
        }),
        {
          comparisonSeries: [
            // {
            //   ...regionsData.lombardia,
            //   data: regionsData.lombardia.data.map(d => ({
            //     ...d,
            //     value: d.movingAvgNewCases,
            //   })),
            //   id: 'movingAverage',
            // },
          ],
          field: 'value',
          settings: selectedSettings,
        }
    );

    const addButtons = d3.select(`#${id}`);

    addButtons
      .append('p')
      .attr('class', 'regions-show-more')
      .append('button')
      .attr('class', 'button')
      .attr('id', 'regions-button')
      .text(toLocalText('showAllRegions'))
      .on('click', () => {
        const target = document.querySelector('#region-container-wrapper-can-collapse');
        const button = document.querySelector('#regions-button');
        if (target.classList.contains('is-hidden')) {
          target.classList.remove('is-hidden');
          button.innerHTML = toLocalText('showTopNRegions', { number: 6 });
        } else {
          target.classList.add('is-hidden');
          button.innerHTML = toLocalText('showAllRegions');
          window.location.href = `#${id}`;
        }
      });

    addButtons
      .append('p')
      .attr('class', 'regions-update last-update')
      .text(`${toLocalText('lastUpdate')}: ${moment(data.generated).format(dateFormat.completeDateTime)}`);

    $container.classList.remove("loading");
  });
};

function RegionsComparison(container, data, options = {}) {
  const { comparisonSeries = [], field = 'cases', settings } = options;
  //console.log('RegionsComparison', data, options)

  // const fieldExtent = d3.extent(data, d => d.data[d.data.length - 1][field])
  const fieldExtent = d3.extent(data, d => d3.max(d.data, v => v[field]))
  // console.log('fieldExtent', field, fieldExtent)
  const data1 = data.slice(0, 6);
  const data2 = data.slice(6, data.length);

  const charts = [];

  const regions1 = d3
    .select(container)
    .append('div')
    .attr('class', 'region-container-wrapper')
    .selectAll("div.region-container")
    .data(data1)
    .join("div")
    .attr("class", "region-container");

  regions1
    .append("h3")
    .text(d => regionsLabels[d.id]);

  const regions2 = d3
    .select(container)
    .append('div')
    .attr('class', 'region-container-wrapper is-hidden')
    .attr('id', 'region-container-wrapper-can-collapse')
    .selectAll("div.region-container")
    .data(data2)
    .join("div")
    .attr("class", "region-container");

  regions2
    .append("h3")
    .text(d => regionsLabels[d.id]);
  //console.log('SETTINGS', settings)
  regions1.each(function (d, i) {
    const series = {};

    series[d.id] = {
      ...d,
      d: d.id,
      data: d.data.map(v => ({
        ...v,
        value: v[settings.series[0].field],
      })),
      type: settings.series[0].type,
    };
    series[`${d.id}_movingAverage`] = {
      ...d,
      id:`${d.id}_movingAverage`,
      data: d.data.map(v => ({
        ...v,
        value: v[settings.series[1].field],
      })),
      type: settings.series[1].type,
    };
    comparisonSeries.forEach(serie => {
      series[serie.id] = {
        ...serie,
        classNames: ["comparison-series"],
        label: !i ? serie.label : false,
        type: 'line',
      };
    });
    // series[d.id] = d;
    const localNumberFormat = d3LocaleFormat.format(numberFormat.no_decimals);
    d.chart = new LineChart(series, this, {
      //debug: true,
      id: d.id,
      tooltip: {
        label: settings.label,
      },
      margin: { top: 20, right: 0, bottom: 30, left: 0 },
      padding: { top: 0, right: 30, bottom: 0, left: 0 },
      axes: {
        x: {
          field: "diff",
          scale: "linear",
          title: !i ? toLocalText('days') : "",
          hideAxis: true,
          ticks: 3,
          removeTicks: value => value === 0
        },
        y: {
          field: 'value',
          extent: [0, settings.maxValue],
          maxValue: settings.maxValue,
          title: !i ? settings.title : "",
          scale: settings.scale,
          grid: true,
          ticks: 3,
          labelsPosition: 'inside'
        }
      },
      labels: false,
      labelsFunction: (d) => {
        const lastValue = d.data[d.data.length - 1][field];
        return localNumberFormat(lastValue);
        // return `${regionsLabels[d.id]} ${numberFormat(lastValue)}`;
      }
    });
  });
  regions2.each(function (d, i) {
    const series = {};
    comparisonSeries.forEach(serie => {
      series[serie.id] = {
        ...serie,
        classNames: ["comparison-series"],
        label: false
      };
    });
    series[d.id] = {
      ...d,
      id: d.id,
      data: d.data.map(v => ({
        ...v,
        value: v[settings.series[0].field],
      })),
      type: settings.series[0].type,
    };
    series[`${d.id}_movingAverage`] = {
      ...d,
      id:`${d.id}_movingAverage`,
      data: d.data.map(v => ({
        ...v,
        value: v[settings.series[1].field],
      })),
      type: settings.series[1].type,
    };
    const localNumberFormat = d3LocaleFormat.format(numberFormat.no_decimals);

    d.chart = new LineChart(series, this, {
      id: d.id,
      margin: { top: 20, right: 0, bottom: 30, left: 0 },
      axes: {
        x: {
          field: "diff",
          scale: "linear",
          hideAxis: true,
          ticks: 3,
          removeTicks: value => value === 0
        },
        y: {
          field: 'value',
          extent: [0, settings.maxValue],
          maxValue: settings.maxValue,
          title: !i ? toLocalText('confirmedCases') : "",
          scale: settings.scale,
          grid: true,
          ticks: 3,
          labelsPosition: 'inside'
        }
      },
      tooltip: {
        label: settings.label,
      },
      labels: false,
      labelsFunction: (d) => {
        const lastValue = d.data[d.data.length - 1][field];
        return localNumberFormat(lastValue);
        // return `${regionsLabels[d.id]} ${numberFormat(lastValue)}`;
      }
    });
  });

  this.updateCharts = (settings) => {
    //console.log('updateCharts', settings)
    const updateChart = (d, i) => {
      const series = {};
      series[d.id] = {
        id: d.id,
        data: d.data.map(v => ({
          ...v,
          value: v[settings.series[0].field],
        })),
        type: settings.series[0].type,
      };
      series[`${d.id}_movingAverage`] = {
        id: `${d.id}_movingAverage`,
        data: d.data.map(v => ({
          ...v,
          value: v[settings.series[1].field],
        })),
        type: settings.series[1].type,
      };

      d.chart.update({
        series,
        title: !i ? settings.title : "",
        scale: settings.scale,
        maxValue: settings.maxValue,
        tooltip: {
          label: settings.label,
        },
      });
    }
    regions1.each((d,i) => updateChart(d,i));
    regions2.each(d => updateChart(d));
  }
}
