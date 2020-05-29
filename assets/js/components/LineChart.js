function LineChart(
  series,
  container,
  options = {}
) {

  const DEFAULT_OPTIONS = {
      debug: false,
      intersections: false,
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

  if(options.debug) {
    // console.log('container', container)
    console.log('options', options);
    console.log('series', series);
  }
  this.width = container.getBoundingClientRect().width;
  this.height = this.width * (options.ratio || (9 / 16));

  const svgContainer = d3.select(container)
    .append("div")
    .style("width", "100%");

  const svg=svgContainer
    .append("svg")
    .attr('class', 'line-chart')
    .attr("width", this.width)
    .attr("height", this.height);

  const xExtent = d3.extent(
    [].concat(
      ...Object.values(series).map(d =>
        d3.extent(d.data, dd => dd[axes.x.field])
      )
    )
  );

  const x = SCALES[axes.x.scale]()
    .domain(xExtent).nice()
    .range([margin.left + padding.left, this.width - margin.right - padding.right]);

  const yExtent = axes.y.extent || d3.extent(
    [].concat(
      ...Object.values(series).map(d =>
        d3.extent(d.data, dd => dd[axes.y.field])
      )
    )
  );
  if(options.debug) {
    console.log('yExtent', yExtent);
    console.log('axes.y.maxValue', axes.y.maxValue)
  }
  if(axes.y.maxValue != null && (yExtent[1] >= axes.y.maxValue)) {
    svg.style('overflow','visible');
    yExtent[1] = axes.y.maxValue;
  }

  // console.log('yExtent', yExtent)

  const y = SCALES[axes.y.scale]()
    .domain(yExtent)
    .rangeRound([this.height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .defined(d => !isNaN(d[axes.y.field]))
    .x((d, i) => x(d[axes.x.field]))
    .y(d => {
      // if(options.debug) {
      //   console.log(axes.y.field, d[axes.y.field], y(d[axes.y.field]))
      // }
      return y(d[axes.y.field])
    });

  const area = d3
    .area()
    .defined(d => !isNaN(d[axes.y.field]))
    .x((d, i) => x(d[axes.x.field]))
    .y0(d => y(0))
    .y1(d => y(d[axes.y.field]));

  const areaFill = d3
    .area()
    .x((d, i) => d.x)
    .y0(d => d.y0)
    .y1(d => d.y1);

    const xAxis = g => {
      g.attr("class", "x axis")
        .attr("transform", `translate(0,${this.height - margin.bottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(axes.x.ticks || 5)
            .tickSizeOuter(0)
            .tickFormat(axes.x.ticksFormat)
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
          if (options.axes.y.labelsPosition === 'inside') {
            g.selectAll('.tick').select('line').remove();
          }
        })
        .call(g => {
          if(axes.y.grid) {
            g
              .selectAll('.tick')
              .append('line')
              .attr('class','grid')
              .attr('x1', 0)
              .attr('x2', this.width - (margin.left + margin.right))
          }
        })
        .call(g => {
          g
            .selectAll('.tick line.grid')
            .attr('x2', this.width - (margin.left + margin.right))
            .style('stroke-dasharray', '2 4');
        })
        .call(g => {
          if(axes.y.title && options.axes.y.labelsPosition !== 'inside') {
            g
              .select(".tick:last-of-type")
              .call(tick => {
                const tickText = tick.node().appendChild(tick.select('text').node().cloneNode());
                d3.select(tickText).attr("x", 3)
                .attr("class","axis-title")
                .text(axes.y.title)
              })

          }
        })
        .call(g => {
          if (options.axes.y.labelsPosition === 'inside') {
            g.selectAll('text:first-of-type')
              .attr('x', 3)
              .attr('dy', "-0.5em")
              .style('text-anchor', 'start')
              .style('fill', d => (d === 0) ? 'none' : 'currenColor');
          }
        })
        .call(g => {
          if (options.axes.y.labelsPosition === 'inside') {
            g.selectAll(".tick:last-of-type text")
              .text(d => `${d3LocaleFormat.format(axes.y.ticksFormat || numberFormat.no_trailing)(d)} ${axes.y.title || ''}`)
          }
        })
    };

    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);

    let filledIntersections;
    if(options.intersections) {
      filledIntersections = svg
        .append('g')
        .attr('class','fill-intersections')
    }
    const seriesData = Object.values(series);
    const seriesGroup = svg
      .append("g")
      .selectAll("g")
      .data(seriesData, d => d)
      .join("g")
      .attr("id", d => d.id)
      .attr("class", d => ['series', ...(d.classNames || [])].join(' '))
      .call(g => {
        g
          .filter(d => !d.type || d.type === 'line')
          .append('path')
            .attr("d", d => {
              if(options.debug) {
                console.log('PATH', d.id, d.type, d)
              }
              return line(d.data);
            });
      })

    let barWidth = 0;
    const bars = seriesGroup
                    .filter(d => {
                      if(options.debug) {
                        console.log('DE WE HAVE BARS?', d.type === 'bars', d)
                      }
                      return d.type === 'bars'
                    })
                    .append('g')
                    .attr('class','bars')
                    .selectAll('g.bar')
                      .data(d => {
                        barWidth = Math.floor(x.range()[1] / (d.data.length - 1)) - 1
                        return d.data
                      })
                      .join('g')
                        .attr('class','bar')
                        .attr('data-date',d => new Date(d[axes.x.field]))
                        .attr('transform', d => `translate(${x(d[axes.x.field])},0)`)
                        .call(g => {
                          g.append('rect')
                            .attr('x', -barWidth/2)
                            .attr('y', d => {
                              // console.log(d)
                              return y(d[axes.y.field]);
                            })
                            .attr('width', Math.max(barWidth, 0))
                            .attr('height', d => Math.max(y.range()[0] - y(d[axes.y.field]) - 0.5 , 0))
                        })


    if(options.intersections) {


      // console.log('pathsWithIntersections', pathsWithIntersections);
      pathsWithIntersections = getIntersections();

      filledIntersections
        .selectAll('g.area')
        .data(pathsWithIntersections)
        .join('g')
          .attr("class",d => {
            const pointWithId = d.find(p => typeof p.id !== 'undefined');
            return `area ${pointWithId ? pointWithId.id : ''}`
          })
          .append("path")
          .attr("d", d => areaFill(d));
    }

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
        .selectAll("g")
        .data(d => d.data.map(value => ({...value, ...d})).filter((v,i) => {
          if(options.dots.filter) {
            return options.dots.filter(v,i,d.data);
          }
          return true;
        }))
        .join("g")
        .attr('transform',d => `translate(${x(d[axes.x.field])},${y(d[axes.y.field])})`)
        .call(g => {
          g.append('circle')
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 4)
          if(options.dots.labelsFunction) {
            g.append('text')
              .attr('class','series-label align-middle text-align-left')
              .attr('dx', d => {
                let dx = '0.5em'
                if (d.label.dx) {
                  dx = d.label.dx;
                }
                return dx;
              })
              .attr("dy", d => {
                let dy = "0.25em";
                if(d.label.position === 'top') {
                  dy = "-0.5em";
                }
                if(d.label.position === 'bottom') {
                  dy = "0.75em";
                }
                if (d.label.dy) {
                  dy = d.label.dy;
                }
                return dy;
              })
              .attr('cx',0)
              .attr('cy',0)
              .text(d => options.dots.labelsFunction(d[axes.y.field]))
          }
        })

    }

    let label;
    if(options.labels) {
      label = seriesGroup
          .append("text")
          .attr("class", d => `series-label align-${d.label.position || 'left'} text-align-${d.label.textAlign || 'left'}`)
          .attr("x", d => {
            let index = d.data.length - 1;
            if(d.label.middle) {
              index = Math.round(d.data.length / 2);
            }
            return x(d.data[index][axes.x.field])
          })
          .attr("y", d => {
            let index = d.data.length - 1;
            if(d.label.middle) {
              index = Math.round(d.data.length / 2);
            }
            return y(d.data[index][axes.y.field])
            // y(d.data[d.data.length - 1][axes.y.field])
          })
          .attr("dx", d => {
            let dx = "0.5em";
            if(d.label.position === 'top') {
              dx = "0";
            }
            if(d.label.position === 'bottom') {
              dx = "0";
            }
            if (d.label.dx) {
              dx = d.label.dx;
            }
            return dx;
          })
          .attr("dy", d => {
            let dy = "0.25em";
            if(d.label.position === 'top') {
              dy = "-0.5em";
            }
            if(d.label.position === 'bottom') {
              dy = "1.5em";
            }
            if (d.label.dy) {
              dy = d.label.dy;
            }
            return dy;
          })
          .text(d => d.label && typeof options.labelsFunction === 'function' ? options.labelsFunction(d) : d.label.text)
    }

    // if(axes.y.grid) {
    //   svg.select('.axis.y')
    //     .selectAll('.tick')
    //     .append('line')
    //     .attr('class','grid')
    //     .attr('x1', 0)
    //     .attr('x2', this.width - (margin.left + margin.right))
    // }
    // if(axes.y.title && options.axes.y.labelsPosition !== 'inside') {
    //   const lastTick = svg.select('.axis.y')
    //     .select(".tick:last-of-type")
    //     .call(tick => {
    //       const tickText = tick.node().appendChild(tick.select('text').node().cloneNode());
    //       d3.select(tickText).attr("x", 3)
    //       .attr("class","axis-title")
    //       .text(axes.y.title)
    //     })
    //
    // }
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
      x.range([margin.left + padding.left, this.width - margin.right - padding.right]);
      y.range([this.height - margin.bottom, margin.top]);

      svg.attr("width", this.width);
      svg.attr("height", this.height);

      svg.selectAll("g.y.axis")
          .call(yAxis);
      svg.selectAll("g.x.axis")
          .attr("transform", `translate(0,${this.height - margin.bottom})`)
          .call(xAxis);

      seriesGroup
        .select('path')
        .attr("d", d => {
          // console.log(axes.y.field, d, d.data)
          return line(d.data);
        });

      seriesGroup
        .selectAll('g.bar')
          .data(d => {
            barWidth = Math.floor(x.range()[1] / (d.data.length - 1)) - 1
            return d.data
          })
            .attr('transform', d => `translate(${x(d[axes.x.field])},0)`)
            .select('rect')
              .attr('x', -barWidth/2)
              .attr('y', d => {
                // console.log(d)
                return y(d[axes.y.field]);
              })
              .attr('width', Math.max(barWidth, 0))
              .attr('height', d => Math.max(y.range()[0] - y(d[axes.y.field]) - 0.5 , 0));

      if(options.area && areaPath) {
        areaPath.attr("d", d => area(d.data));
      }

      if(options.intersections) {

        // console.log('pathsWithIntersections', pathsWithIntersections);
        // pathsWithIntersections = getIntersections();


        filledIntersections
          .selectAll('g.area')
          .data(getIntersections())
          .select('path')
            .attr("d", d => areaFill(d));
      }

      if(options.dots) {
        dots.attr('transform',d => `translate(${x(d[axes.x.field])},${y(d[axes.y.field])})`);
      }



      if(label) {
        label
        .attr("x", d => {
          let index = d.data.length - 1;
          if(d.label.middle) {
            index = Math.round(d.data.length / 2);
          }
          return x(d.data[index][axes.x.field])
        })
        .attr("y", d => {
          let index = d.data.length - 1;
          if(d.label.middle) {
            index = Math.round(d.data.length / 2);
          }
          return y(d.data[index][axes.y.field])
        })
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
  function getIntersections() {
    const path1 = seriesGroup.select(`#${options.intersections.series[0]} path`);
    const path2 = seriesGroup.select(`#${options.intersections.series[1]} path`);
    const intersections = intersectsPath(path1.node(), path2.node());
    // console.log('INTERSECTIONS', intersections)

    const path1Points = series[options.intersections.series[0]].data.map(d => ({
      x: x(d[axes.x.field]),
      y: y(d[axes.y.field]),
      id: options.intersections.series[0],
    }));
    const path2Points = series[options.intersections.series[1]].data.map(d => ({
      x: x(d[axes.x.field]),
      y: y(d[axes.y.field]),
      id: options.intersections.series[1],
    }));

    // console.log(path1Points, path2Points)

    const intersectionsAndStartEnd = [
      {
        artificial: true,
        x: d3.min([path1Points[0].x, path2Points[0].x]),
      },
      ...intersections,
      {
        artificial: true,
        x: d3.max([path1Points[path1Points.length - 1].x, path2Points[path2Points.length - 1].x]),
      },
    ];
    // console.log('intersectionsAndStartEnd', intersectionsAndStartEnd)

    const coordsWithIntersections = intersectionsAndStartEnd.map((d, i) => {
      if(intersectionsAndStartEnd[i + 1]) {
        const next = intersectionsAndStartEnd[i + 1];
        return [d,...path1Points.filter(p => p.x >= d.x && p.x <= next.x),next,...path2Points.filter(p => p.x >= d.x && p.x <= next.x).reverse()]
          .filter(p => !p.artificial)
      }
      return null;
    })
    .filter(d => d);

    // console.log('coordsWithIntersections', [...coordsWithIntersections])

    const pathsWithIntersections = coordsWithIntersections.map(d => {
      const mappedCoords = {};
      d.forEach(p => {
        if(!mappedCoords[p.x]) {
          mappedCoords[p.x] = {
            x: p.x,
            id: p.id,
          }
        }
        if(!mappedCoords[p.x].y0) {
          mappedCoords[p.x].y0 = p.y;
        } else {
          mappedCoords[p.x].y1 = p.y;
          if(mappedCoords[p.x].y0 > mappedCoords[p.x].y1) {
            mappedCoords[p.x].id = p.id;
          }
        }
      })

      const values = Object.values(mappedCoords);
      return [...values].map(d => {
        if(typeof d.y1 === 'undefined') {
          return {...d, y1: d.y0}
        }
        return d;
      }).sort((a,b) => a.x - b.x)
    })
    .map(paths => paths.filter(point => point.y0 != null && point.y1 != null))

    // console.log('pathsWithIntersections', pathsWithIntersections.map(paths => paths.filter(point => point.y0 != null && point.y1 != null)))
    return pathsWithIntersections;
  }

  this.getId = () => options.id;

  this.update = (settings) => {
    const { series } = settings;
    console.log(series);
    const xExtent = d3.extent(
      [].concat(
        ...Object.values(series).map(d =>
          d3.extent(d.data, dd => dd[axes.x.field])
        )
      )
    );
    x.domain(xExtent).nice()

    const yExtent = axes.y.extent || d3.extent(
      [].concat(
        ...Object.values(series).map(d =>
          d3.extent(d.data, dd => dd[axes.y.field])
        )
      )
    );

    svg.style('overflow','visible');
    if(axes.y.maxValue != null) { // } && (yExtent[1] > settings.maxValue)) {
      svg.style('overflow','visible');
      yExtent[1] = settings.maxValue;
    }

    if(settings.title) {
      axes.y.title = settings.title;
    }

    console.log('old extents', y.domain())
    console.log('new yExtend', yExtent)

    y.domain(yExtent);

    console.log('current seriesGroup.data', seriesGroup.data())

    seriesGroup.data(seriesGroup.data().map(d => {
      return {
        ...d,
        data: series[d.id].data,
      }
    }));

    console.log('new seriesGroup.data', seriesGroup.data())

    updateChart()
  }
}
