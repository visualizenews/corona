regionsComparison = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  d3.json('/assets/json/regioni.json').then((populations) => {
    const regionsData = {}
    data.italy.regions
    .forEach(r => {
      Object.entries(r.data)
        // .filter(d => d[0] === 'lombardia')
        .forEach(d => {
          // console.log(d)
          if (!regionsData[d[0]]) {
            const regionPopulation = populations.find(r => r.id === d[0]);
            regionsData[d[0]] = {
              id: d[0],
              data: [],
              population: regionPopulation ? regionPopulation.population : 1,
              startDate: r.datetime,
              label: {
                text: d[0],
                position: "top"
              },
            };
          }
        regionsData[d[0]].data = [
          ...regionsData[d[0]].data,
          {
            date: r.datetime,
            diff: moment(r.datetime).diff(moment(regionsData[d[0]].startDate), "days"),
            ts: +new Date(r.datetime),
            ...Object.assign(d[1], {perc: d[1].cases / regionsData[d[0]].population * 100000}),
          }
        ];
      });
    });

    const countryData = data.italy.global.map(d => {
      return {
        date: d.datetime,
        diff: moment(d.datetime).diff(moment(data.italy.global[0].datetime), "days"),
        ts: +new Date(d.datetime),
        perc: d.cases / population['italy'] * 100000,
        ...d,
      }
    });

    //console.log('countryData', countryData)

    new RegionsComparison($container, regionsData, { comparisonSeries: [{id: 'italy', data: countryData, label: {text:'Italy', position: 'top'}}]});

    $container.classList.remove("loading");
  });
};

function RegionsComparison(container, data, options = {}) {

  const {comparisonSeries = []} = options;
  // console.log('RegionsComparison', data)

  const regions = d3.select(container)
    .selectAll('div.region-container')
    .data(Object.values(data).sort((a,b) => {
      return b.data[b.data.length - 1].perc - a.data[b.data.length - 1].perc;
    }))
    .join('div')
      .attr('class','region-container')

  regions
    .append("h3")
    .style('margin-left', '30px')
    .text(d => d.id)

  regions.each(function(d, i) {
    const series = {};
    comparisonSeries.forEach(serie => {
      series[serie.id] = {
        ...serie,
        classNames: ['comparison-series'],
        label: !i ? serie.label : false,
      };
    });
    series[d.id] = d;
    new LineChart(series, this, {
      margin: { top: 20, right: 50, bottom: 30, left: 30 },
      axes: {
        x: {
          field: 'diff',
          scale: 'linear',
          hideAxis: true,
          ticks: 3,
        },
        y: {
          field: 'perc',
          extent: [0, 150],
          title: !i ? 'per 100k people' : '',
          scale: 'linear',
          grid: true,
          ticks: 3,
        }
      },
      labels: true,
    })
  })

}
