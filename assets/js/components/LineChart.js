const DEFAULT_OPTIONS = {
    axes: {
      x: {
        field: 'x',
        title: '',
        scale: 'linear',
      },
      y: {
        field: 'y',
        title: '',
        scale: 'linear',
      }
    },
    margin: { top: 20, right: 20, bottom: 30, left: 30 },
}
function LineChart(
  series,
  container,
  options = {}
) {

  const SCALES= {
    linear: d3.scaleLinear,
    log: d3.scaleLog,
  };

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

  const x = SCALES[axes.x.scale]()
    .domain(xExtent)
    .range([margin.left, this.width - margin.right]);

  const yExtent = axes.y.extent || d3.extent(
    [].concat(
      ...Object.values(series).map(d =>
        d3.extent(d.data, dd => dd[axes.y.field])
      )
    )
  );

  const y = SCALES[axes.y.scale]()
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
            // .ticks(this.width)
            .ticks(axes.x.ticks || 5)
            .tickSizeOuter(0)
        )
        .call(g => {
          if(axes.x.hideAxis) {
            g.select(".domain").remove()
          }
        })
        .call(g => {
          if(axes.x.removeTicks) {
            g.selectAll('.tick')
              .each(function(d){
                if(axes.x.removeTicks(d)) {
                  //g.select(this).remove();
                  d3.select(this).remove();
                }
              })
          }

        })
    };

    const yAxis = g => {
      g.attr("class", "y axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(
          d3.axisLeft(y)
          .ticks(axes.y.ticks || 5)
          // .ticks(10, "~s")
        )
        .call(g => g.select(".domain").remove())
        .call(g => {
          g
            .selectAll('.tick line.grid')
            .attr('x2', this.width - (margin.left + margin.right))
        })
    };

    const svg = d3
      .select(container)
      .append("svg")
      .attr('class', 'line-chart')
      .attr("width", this.width)
      .attr("height", this.height);

    const seriesGroup = svg
      .append("g")
      .selectAll("g")
      .data(Object.values(series))
      .join("g")
      .attr("id", d => d.id)
      .attr("class", d => ['series', ...(d.classNames || [])].join(' '));
    // console.log(series)
    const path = seriesGroup
      .append("path")
      //.style("mix-blend-mode", "multiply")
      .attr("d", d => line(d.data));

    let dots;
    if(options.dots) {
      dots = seriesGroup
        .selectAll("circle")
        .data(d => d.data)
        .join("circle")
        .attr("cx",d => x(d[axes.x.field]))
        .attr("cy",d => y(d[axes.y.field]))
        .attr("r", 3)
    }

    let label;
    if(options.labels) {
      label = seriesGroup
          .append("text")
          .attr("class", d => `series-label align-${d.label.position || 'left'} text-align-${d.label.textAlign || 'left'}`)
          .attr("x", d => x(d.data[d.data.length - 1][axes.x.field]))
          .attr("y", d => y(d.data[d.data.length - 1][axes.y.field]))
          .attr("dx", d => {
            let dx = "0.5em";
            if(d.label.position === 'top') {
              dx = "0";
            }
            return dx;
          })
          .attr("dy", d => {
            let dy = "0.25em";
            if(d.label.position === 'top') {
              dy = "-0.5em";
            }
            return dy;
          })
          .text(d => d.label.text)
    }


    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);


    if(axes.y.grid) {
      svg.select('.axis.y')
        .selectAll('.tick')
        .append('line')
        .attr('class','grid')
        .attr('x1', 0)
        .attr('x2', this.width - (margin.left + margin.right))
    }

    if(axes.y.title) {
      const lastTick = svg.select('.axis.y')
        .select(".tick:last-of-type")
        .call(tick => {
          const tickText = tick.node().appendChild(tick.select('text').node().cloneNode());
          d3.select(tickText).attr("x", 3)
          .attr("class","axis-title")
          .text(axes.y.title)
        })

    }
    if(axes.x.title) {
        svg.select('.axis.x')
          .select(".tick:last-of-type text")
          .clone()
          .attr("x", 10)
          .attr("class","axis-title")
          .text(axes.x.title)

    }


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

      if(options.dots) {
        dots.attr("cx",d => x(d[axes.x.field]))
            .attr("cy",d => y(d[axes.y.field]))
      }

      if(options.labels) {
        label
          .attr("x", d => x(d.data[d.data.length - 1][axes.x.field]))
          .attr("y", d => y(d.data[d.data.length - 1][axes.y.field]))
      }

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
