function LineChart(
  series,
  container,
  options = {}
) {

  const log = (...texts) => {
    if(options.debug) {
      console.log(...texts)
    }
  }

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

  log('container', container)
  log('series', series)

  this.width = container.getBoundingClientRect().width;
  this.height = this.width * (options.ratio || (9 / 16));

  const xExtent = d3.extent(
    [].concat(
      ...Object.values(series).map(d =>
        d3.extent(d.data, dd => dd[axes.x.field])
      )
    )
  );

  log('xExtent', xExtent)

  const x = SCALES[axes.x.scale]()
    .domain(xExtent)
    .range([margin.left + padding.left, this.width - margin.right - padding.right]);

  log('X TICKS', x.ticks())

  const extent = d3.extent(
    [].concat(
      ...Object.values(series).map(d =>
        d3.extent(d.data, dd => dd[axes.y.field])
      )
    )
  );

  const yExtent = [
    axes.y.extent && typeof axes.y.extent[0] !== 'undefined' ? axes.y.extent[0] : extent[0],
    axes.y.extent && typeof axes.y.extent[1] !== 'undefined' ? axes.y.extent[1] : extent[1],
  ];

  log('yExtent', yExtent)

  const y = SCALES[axes.y.scale]()
    .domain(yExtent)
    .nice()
    .rangeRound([this.height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .defined(d => d[axes.y.field] && !isNaN(d[axes.y.field]))
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
            .ticks(axes.x.ticks || 5, axes.x.ticksFormat)
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
        .call(g => {
          if(axes.y.removeTicks) {
            g.selectAll('.tick')
              .each(function(d){
                if(axes.y.removeTicks(d)) {
                  //g.select(this).remove();
                  d3.select(this).remove();
                }
              })
          }

        })
        if (options.axes.y.labelsPosition === 'inside') {
          g.call(g => {
            g.selectAll('text:first-of-type')
              .attr('x', 3)
              .attr('dy', "-0.5em")
              .style('text-anchor', 'start')
              // .style('fill', d => (d === 0) ? 'none' : 'currenColor')
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
      .attr("height", this.height)

    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);

    const seriesGroup = svg
      .append("g")
      .selectAll("g")
      .data(Object.values(series))
      .join("g")
      .attr("id", d => d.id)
      .attr("class", d => ['series', ...(d.classNames || [])].join(' '));

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

    const valuesMap = {};
    const valuesMap2 = {};
    const flatYCoords = [];
    Object.values(series).forEach(serie => {
      log('serie', serie);
      serie.data.filter(d => d[axes.y.field] != null).forEach(d => {
        log(d)
        const field = axes.x.field;
        const xRef = d[field].toString();
        if(!valuesMap[xRef]) {
          valuesMap[xRef] = {}
        }
        valuesMap[xRef][serie.id] = d[axes.y.field];

        if(!valuesMap2[serie.id]) {
          valuesMap2[serie.id] = {}
        }

        if(!valuesMap2[serie.id][y(d[axes.y.field])]) {
          valuesMap2[serie.id][y(d[axes.y.field])] = {}
        }
        valuesMap2[serie.id][y(d[axes.y.field])] = {
          x: d[axes.x.field],
          y: d[axes.y.field],
        }
        flatYCoords.push(y(d[axes.y.field]));
      })
    })




    if(options.gauge) {
      log('valuesMap2', valuesMap2)

      const gauge = svg.append('g')
                      .attr('class', 'gauge')

      gauge.append('line')
        .attr('x1', margin.left)
        .attr('y1', 0)
        .attr('x2', this.width - margin.right)
        .attr('y2', 0)
        .attr('stroke', '#fff')

      const gaugeLabels={
        indicator: gauge.append('text')
            .attr('x', 0)
            .attr('y', -5)
            .attr('fill', '#fff'),
        comparison_indicator: gauge.append('text')
            .attr('x', 0)
            .attr('y', 15)
            .attr('fill', '#fff')
      }

      const gaugeDayDroplines = gauge.selectAll('line.day-dropline')
        .data(Object.keys(series).map(d => ({id: d})))
        .join('line')
          .attr('id',d => d.id)
          .attr('class','day-dropline')
          .attr('stroke', '#fff')
          .attr('y2', this.height - margin.bottom)

      svg.on('mousemove', function() {
        const coords = d3.mouse(this);

        const mappedYs = flatYCoords.filter(d => Math.round(d)>=Math.round(coords[1]));

        if(!mappedYs.length) {
          return;
        }

        const mappedY = mappedYs[0];

        const values = {
          x: x.invert(coords[0] + margin.left),
          y: y.invert(mappedY + margin.top),
        }

        values.day = ((d) => {
          const day = new Date(d)
          day.setHours(0);
          day.setMinutes(0);
          day.setSeconds(0);
          day.setMilliseconds(0);
          return day;
        })(values.x);



        const value = valuesMap[values.day.toString()];
        // log(values)
        // log(values.day.toString(), value)
        gauge.attr('transform', `translate(0, ${mappedY})`);
        //gaugeLabels['indicator'].text(value['indicator']);
        //gaugeLabels['comparison_indicator'].text(value['comparison_indicator']);

        gaugeDayDroplines
          .attr('x1', d => {
            // console.log(d, values.y, '->', valuesMap2[d][values.y], x(valuesMap2[d][values.y]), y(values.y))
            const yValues = Object.keys(valuesMap2[d.id]).filter(v => v >= mappedY);
            log(yValues)
            if(yValues.length) {
              const yValue = yValues[0];
              log(d.id, valuesMap2[d.id][yValue].x, x(valuesMap2[d.id][yValue].x))
              d.yValue = yValue;
              return x(valuesMap2[d.id][yValue].x);
            }
          })
          .attr('x2', d => {
            if(d.yValue != null) {
              return x(valuesMap2[d.id][d.yValue].x);
            }
          })
          .attr('y1', d => {
            if(d.yValue != null) {
              return 0; // y(valuesMap2[d.id][d.yValue].y);
            }
          })

      })
    }



    const updateChart = () => {
      // console.log("new size", this.width, this.height);
      x.range([margin.left + padding.left, this.width - margin.right - padding.right]);
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
        this.width = svgContainer.node().getBoundingClientRect().width;
        this.height = this.width * (options.ratio || (9 / 16));
        updateChart();
      }
      window.addEventListener('resize', resize.bind(this));
    }
}
