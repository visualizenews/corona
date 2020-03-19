regionsComparison = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  d3.json("/assets/json/regioni.json").then(populations => {
    const regionsData = {};
    data.italy.regions.forEach(r => {
      Object.entries(r.data)
        // \.filter(d => d[0] === 'lombardia')
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
                "days"
              ),
              ts: +new Date(r.datetime),
              ...Object.assign(d[1], {
                perc: (d[1].cases / regionsData[d[0]].population) * 100000
              })
            }
          ];
        });
    });
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
      })
    };
    // console.log(regionsData);

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
    });

    // console.log('regionsData', Object.values(regionsData))

    new RegionsComparison(
      $container,
      Object.values(regionsData)
        // .filter(d => d.id === "lombardia")
        .filter(d => d.id !== "trento" && d.id !== "bolzano")
        .sort((a,b) => {
          return b.data[b.data.length - 1]['perc'] - a.data[a.data.length - 1]['perc']
        }),
        {
          comparisonSeries: [
            {
              id: 'italy',
              data: countryData,
              label: {
                text:'Italy',
                position: 'top',
                textAlign: 'right'
              }
            }
          ]
        }
    );
    // new RegionsMap($container, regionsData, {
    //   binSize: [80,80],
    //   comparisonSeries: [
    //     {
    //       id: "italy",
    //       data: countryData,
    //       label: { text: "Italy", position: "top", textAlign: "right" }
    //     }
    //   ]
    // });

    $container.classList.remove("loading");
  });
};

function RegionsMap(container, data, options = {}) {
  const { comparisonSeries = [] } = options;
  // console.log('RegionsComparison', data)
  const mapRegionsToIndex = {};
  Object.values(data)
  // .filter(d => d.id === "lombardia")
  .filter(d => d.id !== "trento" && d.id !== "bolzano")
    .forEach((d) => {
      mapRegionsToIndex[d.index] = d.id;
    });

  const regions = d3.select(container)
    .append("div")
    .attr("class", "regions-map")
    .selectAll("div.region-container")
    .data(d3.range(5 * 9).map(d => {
      return mapRegionsToIndex[d] ? data[mapRegionsToIndex[d]] : null;
    }))
    .join("div")
    .attr("class", "region-container")
    .attr("data-region",d => d ? d.id : 'none')

  regions.each(function(d, i) {
    if(d) {
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
        margin: { top: 0, right: 0, bottom: 0, left: 3 },
        ratio: 1,
        area: true,
        axes: {
          x: {
            field: "diff",
            scale: "linear",
            hideAxis: true,
            ticks: 3,
            removeTicks: value => true, // value === 0
          },
          y: {
            field: "perc",
            extent: [0, 180],
            title: !i ? "per 100k people" : "",
            scale: "linear",
            grid: false,
            ticks: 3,
            hideTicks: true
          }
        },
        labels: false
      });
    }
  });
}

function RegionsComparison(container, data, options = {}) {
  const { comparisonSeries = [] } = options;
  console.log('RegionsComparison', data)

  const fieldExtent = d3.extent(data, d => d.data[d.data.length - 1]['perc'])

  console.log(fieldExtent)

  const regions = d3
    .select(container)
    .selectAll("div.region-container")
    .data(data)
    .join("div")
    .attr("class", "region-container");

  regions
    .append("h3")
    .style("margin-left", "30px")
    .text(d => d.id);

  regions.each(function(d, i) {
    const series = {};
    comparisonSeries.forEach(serie => {
      series[serie.id] = {
        ...serie,
        classNames: ["comparison-series"],
        label: !i ? serie.label : false
      };
    });
    series[d.id] = d;
    const numberFormat = d3.format(',.0f');
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
          extent: [0, fieldExtent[1] * 1.05],
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
