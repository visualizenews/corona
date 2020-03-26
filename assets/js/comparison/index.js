comparisonChart = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  // new ComparisonChart($container, data);
  new ComparisonChart($container, data);
  $container.classList.remove("loading");
};
function ComparisonChart(container, data, options = {}) {
  const epicenters = {};
  const labels = {
    lombardia: {
      text: "Lombardia",
      position: "left", // "top",
      // textAlign: 'middle'
    },
    daegu: {
      text: "Daegu",
      position: "left"
    },
    hubei: { text: "Hubei", position: "top", textAlign: "right" }
  };
  const numberFormat = d3.format(',.0f');
  const logNumberFormat = d3.format('~s');
  data.epicenters.forEach(d => {
    Object.entries(d.data)
    .filter(epicenter => epicenter[1].cases > 400)
    .forEach(epicenter => {
      if (!epicenters[epicenter[0]]) {
        epicenters[epicenter[0]] = {
          startDate: new Date(d.datetime),
          id: epicenter[0],
          label: labels[epicenter[0]],
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

  // console.log('epicenters', epicenters)

  const div = document.createElement('div');
  div.id = '#comparison-chart-wrapper';
  div.class = "comparison-chart-wrapper";
  container.appendChild(div);

  new LineChart(epicenters, div, {
    margin: { top: 20, right: 0, bottom: 30, left: 0 },
    padding: { top: 0, right: 30, bottom: 0, left: 0 },
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
        // title: "cases per 100k people",
        title: "confirmed cases",
        scale: "log",
        grid: true,
        ticks: 3,
        labelsPosition: 'inside',
        ticksFormat: ',.0d'
      }
    },
    labels: true,
    labelsFunction: (d) => {
      const lastValue = d.data[d.data.length - 1].cases;
      return `${d.label.text} ${numberFormat(lastValue)}`;
    },
  });
}
