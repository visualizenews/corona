testsVsNewCases = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  const margins = { top: 10, right: 10, bottom: 40, left: 10 };
  let chartData = {};

  const prepareData = () => {
    const serie1 = {
      data: [],
    };
    const serie2 = {
      data: [],
    };
    data.italy.global.forEach((d, i) => {
      if (i === 0) {
        serie1.data.push({
          x: moment(d.datetime).valueOf(),
          y: 0,
        });
        serie2.data.push({
          x: moment(d.datetime).valueOf(),
          y: 0,
        });
      } else {
        serie1.data.push({
          x: moment(d.datetime).valueOf(),
          y: (d.tested - data.italy.global[i - 1].tested) / data.italy.global[i - 1].tested,
        });
        serie2.data.push({
          x: moment(d.datetime).valueOf(),
          y: (d.hospital_total - data.italy.global[i - 1].hospital_total) / data.italy.global[i - 1].hospital_total,
        });
      }
    });
    chartData = { serie1, serie2 };
  }

  const drawChart = (target) => {
    const chartContainer = document.querySelector(target);
    const width = chartContainer.offsetWidth;
    const height = chartContainer.offsetHeight;
    const x = d3.scaleLinear()
    .domain(d3.extent(chartData.serie1.data, d => d.x))
    .range([margins.left, width - margins.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(chartData.serie1.data, d => d.y))
    .range([height - margins.bottom, margins.top]);

  const container = d3.select(target);
  const svg = container
      .append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('viewbox', `0 0 ${width} ${height}`)
          .attr('preserveAspectRatio', 'xMidYMid meet');

  // Axis
  const axis = svg
    .append('g');
  
  axis.attr('class', 'testsVsNewCases-x-axis-group')
      .append('line')
      .attr('class', 'testsVsNewCases-x-axis')
      .attr('x1', 0 + margins.left)
      .attr('x2', width - margins.right)
      .attr('y1', height - margins.bottom + 2)
      .attr('y2', height - margins.bottom + 2);

  const serie1 = svg
    .append('g')
    .attr('class', 'testsVsNewCases-serie1');

  const serie2 = svg
    .append('g')
    .attr('class', 'testsVsNewCases-serie2');

  const curve = d3.curveCatmullRom.alpha(.5);
  
  serie1.append("path")
    .datum(chartData.serie1.data)
    .attr('class', 'testsVsNewCases-serie testsVsNewCases-serie1')
    .attr("d", d3.line()
      .curve(curve)
      .x(d => x(d.x))
      .y(d => y(d.y))
    )
  
  serie2.append("path")
    .datum(chartData.serie2.data)
    .attr('class', 'testsVsNewCases-serie testsVsNewCases-serie2')
    .attr("d", d3.line()
      .curve(curve)
      .x(d => x(d.x))
      .y(d => y(d.y))
    )


    chartData.serie1.data.forEach((item, index) => {
      // Axis
      axis
          .append('line')
          .attr('x1', () => x(item.x))
          .attr('x2', () => x(item.x))
          .attr('y1', height - margins.bottom + 2)
          .attr('y2', (index === 0 || index === serie1.length - 1) ? height - margins.bottom + 7 : height - margins.bottom + 5)
          .attr('class', 'testsVsNewCases-axis-tick');

      if (index === 0) {
          axis
              .append('text')
              .attr('x', () => x(item.x))
              .attr('y', height - margins.bottom + 20)
              .text( moment(item.x).format('MMM, Do') )
              .attr('text-anchor', 'start')
              .attr('alignment-baseline', 'top')
              .attr('class', 'testsVsNewCases-axis-tick-label');
      }

      if (index === chartData.serie1.data.length - 1) {
          axis
              .append('text')
              .attr('x', () => x(item.x))
              .attr('y', height - margins.bottom + 20)
              .text( moment(item.x).format('MMM, Do') )
              .attr('text-anchor', 'end')
              .attr('alignment-baseline', 'top')
              .attr('class', 'testsVsNewCases-axis-tick-label');
      }
    });
  }

  const reset = () => {
      $container.classList.add('loading');
      const $chartContainer = document.querySelector('#chart-testsVsNewCases');
      $chartContainer.html = '';
      drawChart('#chart-testsVsNewCases');
      $container.classList.remove('loading');
  }

  prepareData();

  let html = `<div class="testsVsNewCases-wrapper">
    <div class="testsVsNewCases-chart" id="chart-testsVsNewCases"></div>
  </div>`;
  
  $container.innerHTML = html;
  window.addEventListener('resize', reset.bind(this));
  reset();
}
