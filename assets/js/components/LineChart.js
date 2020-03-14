const DEFAULT_OPTIONS = {
    axes: {
      x: {
        field: 'x',
        title: '',
      },
      y: {
        field: 'y',
        title: '',
      }
    },
    margin: { top: 20, right: 20, bottom: 30, left: 30 },
}
function LineChart(
  series,
  container,
  options = {}
) {

  options = Object.assign(DEFAULT_OPTIONS, {} , options);
  const { axes, margin, titles } = options;

  // console.log('container', container)
  // console.log('series', series)
  this.width = container.getBoundingClientRect().width;
  this.height = this.width * (9 / 16);

  const xExtent = d3.extent(
    [].concat(
      ...Object.values(series).map(d =>
        d3.extent(d.data, dd => dd[axes.x.field])
      )
    )
  );

  const x = d3
    .scaleLinear()
    .domain(xExtent)
    .range([margin.left, this.width - margin.right]);

  const yExtent = axes.y.extent || d3.extent(
    [].concat(
      ...Object.values(series).map(d =>
        d3.extent(d.data, dd => dd[axes.y.field])
      )
    )
  );

  const y = d3
    .scaleLinear()
    .domain(yExtent)
    .nice()
    .range([this.height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .defined(d => !isNaN(d[axes.y.field]))
    .x((d, i) => x(d[axes.x.field]))
    .y(d => y(d[axes.y.field]));

    const xAxis = g => {
      g.attr("class", "x axis")
        .attr("transform", `translate(0,${this.height - margin.bottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(this.width / 80)
            .tickSizeOuter(0)
        );
    };

    const yAxis = g => {
      g.attr("class", "y axis")
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
            .text(axes.y.title)
        );
    };

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    const path = svg
      .append("g")
      .selectAll("g")
      .data(Object.values(series))
      .join("g")
      .attr("id", d => d.id)
      .attr("class", "series")
      .append("path")
      //.style("mix-blend-mode", "multiply")
      .attr("d", d => line(d.data));

    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);

    const updateChart = () => {
      // console.log("new size", this.width, this.height);
      x.range([margin.left, this.width - margin.right]);
      y.range([this.height - margin.bottom, margin.top]);

      svg.attr("width", this.width);
      svg.attr("height", this.height);

      svg.selectAll("g.y.axis")
          .call(yAxis);
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
