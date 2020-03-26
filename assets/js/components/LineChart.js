function LineChart(
  series,
  container,
  options = {}
) {

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
          labelsPosition: 'outside'
        }
      },
      margin: { top: 20, right: 20, bottom: 30, left: 30 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
  }

  const SCALES= {
    linear: d3.scaleLinear,
    time: d3.scaleTime,
    log: d3.scaleLog,
  };

  options = Object.assign(DEFAULT_OPTIONS, {} , options);
  const { axes, margin, padding, titles } = options;

  // console.log('container', container)
  // console.log('series', series)
  this.width = container.getBoundingClientRect().width;
  this.height = this.width * (options.ratio || (9 / 16));

  const xExtent = d3.extent(
    [].concat(
      ...Object.values(series).map(d =>
        d3.extent(d.data, dd => dd[axes.x.field])
      )
    )
  );

  const x = SCALES[axes.x.scale]()
    .domain(xExtent)
    .range([margin.left + padding.left, this.width - margin.right - padding.right]);

  const yExtent = axes.y.extent || d3.extent(
    [].concat(
      ...Object.values(series).map(d =>
        d3.extent(d.data, dd => dd[axes.y.field])
      )
    )
  );
  // console.log('yExtent', yExtent)

  const y = SCALES[axes.y.scale]()
    .domain(yExtent)
    .nice()
    .rangeRound([this.height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .defined(d => !isNaN(d[axes.y.field]))
    .x((d, i) => x(d[axes.x.field]))
    .y(d => y(d[axes.y.field]));

  const area = d3
    .area()
    .defined(d => !isNaN(d[axes.y.field]))
    .x((d, i) => x(d[axes.x.field]))
    .y0(d => y(0))
    .y1(d => y(d[axes.y.field]));

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
          } else {
            g.select(".domain").attr('d',`M${margin.left+0.5},0H${this.width-margin.right}`)
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
      g.attr("class", `y axis ${axes.y.hideTicks ? 'no-ticks' : ''}`)
        .attr("transform", `translate(${margin.left},0)`)
        .call(
          d3.axisLeft(y)
          .ticks(axes.y.ticks || 5, axes.y.ticksFormat || "~s")
        )
        .call(g => g.select(".domain").remove())
        .call(g => {
          g
            .selectAll('.tick line.grid')
            .attr('x2', this.width - (margin.left + margin.right))
            .style('stroke-dasharray', '2 4');
        })
        if (options.axes.y.labelsPosition === 'inside') {
          g.call(g => {
            g.selectAll('text:first-of-type')
              .attr('x', 3)
              .attr('dy', "-0.5em")
              .style('text-anchor', 'start')
              .style('fill', d => (d === 0) ? 'none' : 'currenColor')
          })
          .call(g => {
            g.selectAll(".tick:last-of-type text")
              .text(d => `${d3.format(axes.y.ticksFormat || "~s")(d)} ${axes.y.title || ''}`)
          })
        }
    };

    const svgContainer = d3.select(container)
                            .append("div")
                            .style("width", "100%");

    const svg=svgContainer
      .append("svg")
      .attr('class', 'line-chart')
      .attr("width", this.width)
      .attr("height", this.height);

    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);

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
      .attr("d", d => line(d.data));

    let areaPath;
    if(options.area) {
      areaPath = seriesGroup
        .append("path")
        .attr("class","area")
        .attr("d", d => area(d.data));
    }

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
          .text(d => d.label && typeof options.labelsFunction === 'function' ? options.labelsFunction(d) : d.label.text)
    }

    if(axes.y.grid) {
      svg.select('.axis.y')
        .selectAll('.tick')
        .append('line')
        .attr('class','grid')
        .attr('x1', 0)
        .attr('x2', this.width - (margin.left + margin.right))
    }
    if(axes.y.title && options.axes.y.labelsPosition !== 'inside') {
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
      if(options.area && areaPath) {
        areaPath.attr("d", d => area(d.data));
      }

      if(options.dots) {
        dots.attr("cx",d => x(d[axes.x.field]))
            .attr("cy",d => y(d[axes.y.field]))
      }

      if(label) {
        label
          .attr("x", d => x(d.data[d.data.length - 1][axes.x.field]))
          .attr("y", d => y(d.data[d.data.length - 1][axes.y.field]))
      }

    };
    if(typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(entries => {
        for (let entry of entries) {
          if (entry.target === svgContainer.node()) {
            const cr = entry.contentRect;
            if (cr.width !== this.width) {
              this.width = cr.width;
              this.height = this.width * (options.ratio || (9 / 16));
              updateChart();
            }
          }
          // console.log('Element:', entry.target);
          // console.log(`Element size: ${cr.width}px x ${cr.height}px`);
          // console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
        }
      });

      // Observe one or multiple elements
      ro.observe(svgContainer.node());
    } else {
      const resize = () => {
        this.width = container.getBoundingClientRect().width;
        this.height = this.width * (options.ratio || (9 / 16));
        updateChart();
      }
      window.addEventListener('resize', resize.bind(this));
    }
}
