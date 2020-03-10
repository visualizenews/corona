comparisonChart = (data, id) => {

  console.log(data)
  const $container = document.querySelector(`#${id}`);

  new ComparisonChart($container, data);

  $container.classList.remove('loading');
}

function ComparisonChart(container, data, options = {}) {
  const margin = ({top: 20, right: 20, bottom: 30, left: 30});

  const epicenters = {};
  data.epicenters.forEach(d => {
    Object.entries(d.data).forEach(epicenter => {
      if(!epicenters[epicenter[0]]) {
        epicenters[epicenter[0]] = {
          startDate: new Date(d.datetime),
          id: epicenter[0],
          data: [],
        }
      }
      const startDate = moment(epicenters[epicenter[0]].startDate);
      const thisDate = moment(d.datetime);
      epicenters[epicenter[0]].data.push({
        ...epicenter[1],
        perc: epicenter[1].cases / population[epicenter[0]],
        diff: thisDate.diff(startDate, 'days'),
      })
    })
  });

  console.log(epicenters)

  const {width} = container.getBoundingClientRect();
  const height = width * (9/16);
  console.log(width, height);

  const xExtent = d3.extent([].concat(...Object.values(epicenters).map(d => d3.extent(d.data, dd => dd.diff))));
  console.log(xExtent);

  const x = d3.scaleLinear()
    .domain(xExtent)
    .range([margin.left, width - margin.right]);

  const yExtent = d3.extent([].concat(...Object.values(epicenters).map(d => d3.extent(d.data, dd => dd.perc))));
  console.log(yExtent);

  const y = d3.scaleLinear()
    .domain(yExtent).nice()
    .range([height - margin.bottom, margin.top])

  const line = d3.line()
    .defined(d => !isNaN(d.perc))
    .x((d, i) => x(d.diff))
    .y(d => y(d.perc));

  const svg = d3.select(container)
                .append('svg')
                .attr('width',width)
                .attr('height',height);

  const path = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(Object.values(epicenters))
    .join("path")
      .attr('id', d => d.id)
      //.style("mix-blend-mode", "multiply")
      .attr("d", d => {
        console.log(d);
        console.log(d.data)
        console.log(line(d.data))
        return line(d.data);
      });


}
