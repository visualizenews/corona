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
  data.epicenters.forEach(d => {
    Object.entries(d.data).forEach(epicenter => {
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

  console.log('epicenters', epicenters)

  new LineChart(epicenters, container, {
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
        field: "perc",
        // title: '% on population',
        title: "cases per 100k people",
        scale: "linear",
        grid: true,
      }
    },
    labels: true,
    labelsFunction: (d) => {
      const lastValue = d.data[d.data.length - 1].perc;
      return `${d.label.text} ${numberFormat(lastValue)}`;
    },
    labelsPosition: 'inside'
  });
}
