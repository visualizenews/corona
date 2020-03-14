comparisonChart = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  // new ComparisonChart($container, data);
  new ComparisonChart($container, data);
  $container.classList.remove("loading");
};
function ComparisonChart(container, data, options = {}) {
  const epicenters = {};
  data.epicenters.forEach(d => {
    Object.entries(d.data).forEach(epicenter => {
      if (!epicenters[epicenter[0]]) {
        epicenters[epicenter[0]] = {
          startDate: new Date(d.datetime),
          id: epicenter[0],
          data: []
        };
      }
      const startDate = moment(epicenters[epicenter[0]].startDate);
      const thisDate = moment(d.datetime);
      epicenters[epicenter[0]].data.push({
        ...epicenter[1],
        perc: epicenter[1].cases / population[epicenter[0]] * 1000000,
        diff: thisDate.diff(startDate, "days")
      });
    });
  });

  new LineChart(epicenters, container, {
    margin: { top: 20, right: 20, bottom: 30, left: 50 },
    axes: {
      x: {
        field: 'diff',
        title: 'Day',
      },
      y: {
        field: 'perc',
        // title: '% on population',
        title: 'per 1m people'
      }
    }
  })
}
