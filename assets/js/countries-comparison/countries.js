countriesComparison = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  const countriesData = {};
  data.int.forEach(r => {
    Object.entries(r.data)
      // \.filter(d => d[0] === 'lombardia')
      .forEach(d => {
        // console.log(d)
        if (!countriesData[d[0]]) {
          countriesData[d[0]] = {
            id: d[0],
            data: [],
            population: population[d[0]],
            startDate: r.datetime,
            area: true,
            label: {
              text: d[0],
              position: "top",
              textAlign: "right"
            }
          };
        }
        countriesData[d[0]].data = [
          ...countriesData[d[0]].data,
          {
            date: r.datetime,
            diff: moment(r.datetime).diff(
              moment(countriesData[d[0]].startDate),
              "days"
            ),
            ts: +new Date(r.datetime),
            ...Object.assign(d[1], {
              perc: (d[1].cases / countriesData[d[0]].population) * 100000
            })
          }
        ];
      });
  });

  // console.log('countriesData', countriesData)

  new CountriesComparison($container, countriesData, { comparisonSeries: [
    countriesData.italy
  ]});

  $container.classList.remove("loading");

};

function CountriesComparison(container, data, options = {}) {
  const { comparisonSeries = [] } = options;
  // console.log('RegionsComparison', data)
  const numberFormat = d3.format(',.0f');
  const countries = d3
    .select(container)
    .selectAll("div.region-container")
    .data(
      Object.values(data)
        .filter(d => d.id !== "south-korea")
        .sort((a, b) => {
          return (
            b.data[b.data.length - 1].perc - a.data[a.data.length - 1].perc
          );
        })
    )
    .join("div")
    .attr("class", "region-container");

  countries
    .append("h3")
    .style("margin-left", "30px")
    .text(d => d.id);

  countries.each(function(d, i) {
    const series = {};
    comparisonSeries.forEach(serie => {
      series[serie.id] = {
        ...serie,
        classNames: ["comparison-series"],
        label: !i ? serie.label : false
      };
    });
    series[d.id] = d;
    new LineChart(series, this, {
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
          field: "perc",
          extent: [0, 50],
          title: !i ? "per 100k people" : "",
          scale: "linear",
          grid: true,
          ticks: 3,
          labelsPosition: 'inside'
        }
      },
      labels: true,
      labelsFunction: (d) => {
        const lastValue = d.data[d.data.length - 1].perc;
        return `${d.label.text} ${numberFormat(lastValue)}`;
      }
    });
  });
}
