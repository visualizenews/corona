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
        ].filter(d => d.cases > 100);

        console.log(d[0], countriesData[d[0]].data)
      });
  });

  // console.log('countriesData', countriesData)

  // new CountriesComparison($container, countriesData, { comparisonSeries: [
  //   countriesData.italy
  // ]});
  // console.log('---------------')
  // console.log(data)
  // console.log(countriesData)
  // console.log('---------------')
  new CountryComparisonChart($container, data);

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

function CountryComparisonChart(container, data, options = {}) {
  const epicenters = {};
  const labels = {
    lombardia: {
      text: "Lombardia",
      position: "top",
      textAlign: 'middle'
    },
    daegu: {
      text: "Daegu",
      position: "left"
    },
    hubei: { text: "Hubei", position: "top", textAlign: "right" }
  };
  const numberFormat = d3.format(',.0f');
  data.int.forEach(d => {
    Object.entries(d.data)
    .filter(epicenter => epicenter[1].cases > 100)
    .forEach(epicenter => {
      if (!epicenters[epicenter[0]]) {
        epicenters[epicenter[0]] = {
          startDate: new Date(d.datetime),
          id: epicenter[0],
          label: labels[epicenter[0]] || {
            text: epicenter[0],
            position: 'top',
            textAlign: 'right',
          },
          data: []
        };
      }
      const startDate = moment(epicenters[epicenter[0]].startDate);
      const thisDate = moment(d.datetime);
      epicenters[epicenter[0]].data.push({
        ...epicenter[1],
        perc: (epicenter[1].cases / population[epicenter[0]]) * 100000,
        diff: thisDate.diff(startDate, "days"),
      });
    });
  });
  console.log('epicenters', epicenters)

  const div = document.createElement('div');
  div.id = '#countries-chart-wrapper';
  div.class = "countries-chart-wrapper";
  container.appendChild(div);

  new LineChart({
    italy: epicenters['italy'],
    germany: epicenters['germany'],
    spain: epicenters['spain'],
    france: epicenters['france'],
    uk: epicenters['uk'],
    us: epicenters['us'],
    'south-korea': epicenters['south-korea'],
  }, div, {
    margin: { top: 20, right: 0, bottom: 30, left: 0 },
    area: false,
    axes: {
      x: {
        field: "diff",
        title: "days",
        scale: "linear",
        ticks: 10,
        removeTicks: (value) => value === 0,
      },
      y: {
        field: "cases",
        // title: '% on population',
        title: "confirmed cases",
        scale: "log",
        grid: true,
        ticks: 3,
        labelsPosition: 'inside',
        ticksFormat: ',.0d',
      }
    },
    labels: true,
    labelsFunction: (d) => {
      const lastValue = d.data[d.data.length - 1].cases;
      return `${d.label.text} ${numberFormat(lastValue)}`;
    },
  });
}
