regionsComparison = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  d3.json('/assets/json/regioni.json').then((populations) => {
    const regionsData = {}
    data.italy.regions
    .forEach(r => {
      Object.entries(r.data).forEach(d => {
        // console.log(d)
        if (!regionsData[d[0]]) {
          const regionPopulation = populations.find(r => r.id === d[0]);
          regionsData[d[0]] = {
            id: d[0],
            data: [],
            population: regionPopulation ? regionPopulation.population : 1,
            startDate: r.datetime,
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

    new RegionsComparison($container, regionsData);

    $container.classList.remove("loading");
  });
};

function RegionsComparison(container, data, options = {}) {

  console.log(data)

  const regions = d3.select(container)
    .selectAll('div.region-container')
    .data(Object.values(data).sort((a,b) => {
      return b.data[b.data.length - 1].perc - a.data[b.data.length - 1].perc;
    }))
    .join('div')
      .attr('class','region-container')

  regions
    .append("h4")
    .text(d => d.id)

  regions.each(function(d) {
    new LineChart({[d.id]:{id: d.id, data: d.data}}, this, {
      axes: {
        x: {
          field: 'diff',
        },
        y: {
          field: 'perc',
          extent: [0, 120],
          title: 'per 100k people',
        }
      }
    })
  })

}
