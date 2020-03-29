testsVsNewCases = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  const margins = { top: 10, right: 10, bottom: 40, left: 10 };
  const chartData = [];

  const prepareData = () => {
    console.log(data.italy.global[data.italy.global.length - 1]);
    data.italy.global.forEach((d, i) => {
      if (i === 0) {
        chartData.push({
          x: moment(d.datetime).valueOf(),
          y1: 0, // Nuovi Test
          y2: 0, // Nuovi Ospedali
        });
      } else {
        chartData.push({
          x: moment(d.datetime).valueOf(),
          y1: d.tested - data.italy.global[i - 1].tested,
          y2: d.hospital_total - data.italy.global[i - 1].hospital_total,
        });
      }
    });
  }

  const drawChart = (target) => {
    const chartContainer = document.querySelector(target);
    const width = chartContainer.offsetWidth;
    const height = chartContainer.offsetHeight;

    const pointWidth = Math.min((width - margins.left - margins.right) / chartData.length, 8);
    const pointHeight = 2;

    const x = d3.scaleLinear()
      .domain(d3.extent(chartData, d => d.x))
      .range([margins.left, width - margins.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(chartData, d => d.y1))
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
    
    const connectors = svg
      .append('g')
      .attr('class', 'testsVsNewCases-connectors');

    chartData.forEach((item, index) => {
      const pointX = x(item.x);

      console.log( y(10), y(100), y(1000));

      if (index > 0) {
        console.log('x', item.x, 'y1', item.y1, y(item.y1), 'y2', item.y2, y(item.y2));
        const pointY1 = y(item.y1);
        const pointY2 = y(item.y2);
        // Connectors
        connectors
          .append('line')
          .attr('x1', pointX)
          .attr('x2', pointX)
          .attr('y1', pointY1 + 2)
          .attr('y2', pointY2 - 4)
          .attr('class', 'testsVsNewCases-serie-connector')
          .attr('id', `testsVsNewCases-serie-connector-${index}`);

        // Serie 2
        serie2
          .append('rect')
          .attr('x', pointX)
          .attr('y', pointY2)
          .attr('width', pointWidth)
          .attr('height', pointHeight)
          .attr('class', 'testsVsNewCases-serie-point')
          .attr('id', `testsVsNewCases-serie1-point-${index}`)
          .attr('transform', `translate(-${pointWidth / 2} -2)`);


        // Serie 1
        serie1
          .append('rect')
          .attr('x', pointX)
          .attr('y', pointY1)
          .attr('width', pointWidth)
          .attr('height', pointHeight)
          .attr('class', 'testsVsNewCases-serie-point')
          .attr('id', `testsVsNewCases-serie1-point-${index}`)
          .attr('transform', `translate(-${pointWidth / 2} -2)`);
      }

      // Axis
      axis
          .append('line')
          .attr('x1', () => pointX)
          .attr('x2', () => pointX)
          .attr('y1', height - margins.bottom + 2)
          .attr('y2', (index === 0 || index === serie1.length - 1) ? height - margins.bottom + 7 : height - margins.bottom + 5)
          .attr('class', 'testsVsNewCases-axis-tick');

      if (index === 0) {
          axis
              .append('text')
              .attr('x', () => pointX)
              .attr('y', height - margins.bottom + 20)
              .text( moment(item.x).format('MMM, Do') )
              .attr('text-anchor', 'start')
              .attr('alignment-baseline', 'top')
              .attr('class', 'testsVsNewCases-axis-tick-label');
      }

      if (index === chartData.length - 1) {
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
