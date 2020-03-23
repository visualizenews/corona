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
          ].filter(d => d.cases > 0);
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
      }).filter(d => d.cases > 0)
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
    }).filter(d => d.cases > 0);

    // console.log('regionsData', Object.values(regionsData))

    new RegionsComparison(
      $container,
      Object.values(regionsData)
        //.filter(d => d.id === "lombardia")
        .filter(d => d.id !== "trento" && d.id !== "bolzano")
        .sort((a,b) => {
          return b.data[b.data.length - 1]['cases'] - a.data[a.data.length - 1]['cases']
        }),
        {
          comparisonSeries: [
            regionsData.lombardia,
            // {
            //   id: 'italy',
            //   data: countryData,
            //   label: {
            //     text:'italy',
            //     position: 'top',
            //     textAlign: 'right'
            //   }
            // }
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

    const addButtons = d3.select(`#${id}`);

    addButtons
      .append('p')
      .attr('class', 'regions-show-more')
      .append('button')
      .attr('class', 'button')
      .attr('id', 'regions-button')
      .text('Show all regions')
      .on('click', () => {
        const target = document.querySelector('#region-container-wrapper-can-collapse');
        const button = document.querySelector('#regions-button');
        console.log('b', button);
        if (target.classList.contains('is-hidden')) {
          target.classList.remove('is-hidden');
          button.innerHTML = 'Show top 6 regions';
        } else {
          target.classList.add('is-hidden');
          button.innerHTML = 'Show all regions';
          window.location.href = `#${id}`;
        }
      });

    addButtons
      .append('p')
      .attr('class', 'regions-update last-update')
      .text(`Last update: ${moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a')}`);

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

function drawChart(d, i) {
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
  new LineChart(series, container, {
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
        field: "cases",
        extent: [1, fieldExtent[1]],
        title: !i ? "cases" : "",
        scale: "log",
        grid: true,
        ticks: 3,
        labelsPosition: 'inside'
      }
    },
    labels: true,
    labelsFunction: (d) => {
      const lastValue = d.data[d.data.length - 1].cases;
      return `${regionsLabels[d.id]} ${numberFormat(lastValue)}`;
    }
  });
}

function RegionsComparison(container, data, options = {}) {
  const { comparisonSeries = [] } = options;
  console.log('RegionsComparison', data)

  const fieldExtent = d3.extent(data, d => d.data[d.data.length - 1]['cases'])

  const data1 = data.slice(0, 6);
  const data2 = data.slice(6, data.length);

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

  regions1.each(function (d, i) {
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
          field: "cases",
          extent: [1, fieldExtent[1]],
          title: !i ? "cases" : "",
          scale: "log",
          grid: true,
          ticks: 3,
          labelsPosition: 'inside'
        }
      },
      labels: true,
      labelsFunction: (d) => {
        const lastValue = d.data[d.data.length - 1].cases;
        return `${regionsLabels[d.id]} ${numberFormat(lastValue)}`;
      }
    });
  });
  regions2.each(function (d, i) {
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
          field: "cases",
          extent: [1, fieldExtent[1]],
          title: !i ? "cases" : "",
          scale: "log",
          grid: true,
          ticks: 3,
          labelsPosition: 'inside'
        }
      },
      labels: true,
      labelsFunction: (d) => {
        const lastValue = d.data[d.data.length - 1].cases;
        return `${regionsLabels[d.id]} ${numberFormat(lastValue)}`;
      }
    });
  });
}
