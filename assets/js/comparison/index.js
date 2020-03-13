comparisonChart = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  new ComparisonChart($container, data);

  $container.classList.remove("loading");
};

function ComparisonChart(container, data, options = {}) {
  const margin = { top: 20, right: 20, bottom: 30, left: 30 };

  this.width = container.getBoundingClientRect().width;
  this.height = this.width * (9 / 16);

  const xAxis = g => {
    g
      .attr('class','x axis')
      .attr("transform", `translate(0,${this.height - margin.bottom})`).call(
      d3
        .axisBottom(x)
        .ticks(this.width / 80)
        .tickSizeOuter(0)
    );
  };

  const yAxis = g => {
    g
      .attr('class','y axis')
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g =>
        g
          .select(".tick:last-of-type text")
          .clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(data.y)
      );
  };

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
        perc: epicenter[1].cases / population[epicenter[0]],
        diff: thisDate.diff(startDate, "days")
      });
    });
  });

  // console.log(epicenters);

  const xExtent = d3.extent(
    [].concat(
      ...Object.values(epicenters).map(d => d3.extent(d.data, dd => dd.diff))
    )
  );

  const x = d3
    .scaleLinear()
    .domain(xExtent)
    .range([margin.left, this.width - margin.right]);

  const yExtent = d3.extent(
    [].concat(
      ...Object.values(epicenters).map(d => d3.extent(d.data, dd => dd.perc))
    )
  );

  const y = d3
    .scaleLinear()
    .domain(yExtent)
    .nice()
    .range([this.height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .defined(d => !isNaN(d.perc))
    .x((d, i) => x(d.diff))
    .y(d => y(d.perc));

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height);

  const path = svg
    .append("g")
    .selectAll("g")
    .data(Object.values(epicenters))
    .join("g")
    .attr("id", d => d.id)
    .attr("class", "series")
    .append("path")
    //.style("mix-blend-mode", "multiply")
    .attr("d", d => line(d.data));

  svg.append("g").call(xAxis);
  // svg.append("g").call(yAxis);

  const updateChart = () => {
    // console.log("new size", this.width, this.height);
    x.range([margin.left, this.width - margin.right]);
    y.range([this.height - margin.bottom, margin.top]);

    svg.attr("width", this.width);
    svg.attr("height", this.height);

    // svg.selectAll("g.y.axis")
    //     .call(yAxis);
    svg.selectAll("g.x.axis")
        .attr("transform", `translate(0,${this.height - margin.bottom})`)
        .call(xAxis);

    path.attr("d", d => line(d.data));
  };
  if(typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === container) {
          const cr = entry.contentRect;
          if (cr.width !== this.width) {
            this.width = cr.width;
            this.height = this.width * (9 / 16);
            updateChart();
          }
        }
        // console.log('Element:', entry.target);
        // console.log(`Element size: ${cr.width}px x ${cr.height}px`);
        // console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
      }
    });

    // Observe one or multiple elements
    ro.observe(container);
  }

}
