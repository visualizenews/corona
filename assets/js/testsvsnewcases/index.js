testsVSnewCases = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  const chartId = 'testsvsnewcases-chart-container';
  const chartData = []; // Tests + New Cases + %
  let annotations = [];
  let overallData = 0; 
  const margins = [ 10, 110, 60, 10];
  let screenSize;
  const pixelMatrix = {};

  const prepareData = () => {
    data.italy.global.forEach((d, i) => {
      chartData.push({
        x: moment(d.datetime).valueOf(),
        y1: (i > 0) ? (d.tested - data.italy.global[i - 1].tested) : d.tested,
        y2: d.new_tested_positive,
        y3: (i > 0) ? (d.new_tested_positive / (d.tested - data.italy.global[i - 1].tested)) : (d.new_tested_positive / d.tested),
        y4: (i > 0 && data.italy.global[i - 1].people_tested > 0) ? (d.people_tested - data.italy.global[i - 1].people_tested) : 0,
      });
    });
    const lastDay = data.italy.global.length - 1;
    overallData = data.italy.global[lastDay].cases / data.italy.global[lastDay].tested;
    const topY1 = d3.maxIndex(chartData, d => d.y1);
    const topY2 = d3.maxIndex(chartData, d => d.y2);
    const topY3 = d3.maxIndex(chartData, d => d.y3);
    annotations = [
      {
        id: 'schoolsOpen',
        x: moment('2020-09-14').valueOf(),
        y: null,
        text: `<div>${moment('2020-09-14').format(dateFormat.minimal)}<br />Riapertura<br />scuole</div>`,
        position: 'bottom',
      },
      {
        id: 'startLockdown',
        x: moment('2020-03-21').valueOf(),
        y: null,
        text: `<div>${moment('2020-03-21').format(dateFormat.minimal)}<br />Inizio<br />Lockdown</div>`,
        position: 'bottom',
      },
      {
        id: 'endLockdown',
        x: moment('2020-04-05').valueOf(),
        y: null,
        text: `<div>${moment('2020-04-05').format(dateFormat.minimal)}<br />Fine<br />Lockdown</div>`,
        position: 'bottom',
      },
      {
        id: 'globalRatio',
        x: chartData[chartData.length - 1].x,
        y: overallData,
        f: 'y3',
        text: `<div>
          <strong>${d3.format(".2%")(overallData)}</strong> <span>${toLocalText('globalRatio')}</span>
          </div>`,
        position: 'top',
      },
      {
        id: 'lastDay',
        x: chartData[chartData.length - 1].x,
        y: chartData[chartData.length - 1].y1,
        f: 'y1',
        text: `<div>
          ${moment(chartData[chartData.length - 1].x).format(dateFormat.minimal)}<br />
          <div>
          <strong>${d3.format(',')(chartData[chartData.length - 1].y1)}</strong> <span>${toLocalText('tests')}</span><br />
          <strong>${d3.format(',')(chartData[chartData.length - 1].y2)}</strong> <span>${toLocalText('newCases')}</span><br />
          <strong>${d3.format(".2%")(chartData[chartData.length - 1].y3)}</strong> <span>${toLocalText('testsRatio')}</span>
          </div>`,
        position: 'top',
      },
      {
        id: 'maxTests',
        x: chartData[topY1].x,
        y: chartData[topY1].y1,
        f: 'y1',
        text: `<div>${moment(chartData[topY1].x).format(dateFormat.minimal)}<br />
        <span><strong>${d3.format(',')(chartData[topY1].y1)}</strong> ${toLocalText('testsPerformed')}</span></div>`,
        position: 'auto',
      },
      {
        id: 'maxPositives',
        x: chartData[topY2].x,
        y: chartData[topY2].y2,
        f: 'y1',
        text: `<div>${moment(chartData[topY2].x).format(dateFormat.minimal)}<br />
        <span><strong>${d3.format(',')(chartData[topY2].y2)}</strong> ${toLocalText('newCases')}</span></div>`,
        position: 'top',
      },
      {
        id: 'maxRatio',
        x: chartData[topY3].x,
        y: chartData[topY3].y3,
        f: 'y3',
        text: `<div>${moment(chartData[topY3].x).format(dateFormat.minimal)}<br />
        <span><strong>${d3.format('.2%')(chartData[topY3].y3)}</strong> ${toLocalText('testsRatio')}</span></div>`,
        position: 'auto',
      },
    ];
  }

  const reset = () => {
    screenSize = (window.matchMedia('screen and (min-width: 768px)').matches) ? 'L' : 'S';
    $container.classList.add('loading');
    document.querySelector(`#${chartId} .chart-container`).innerHTML = '';
    drawChart(chartData, chartId);
    $container.classList.remove('loading');
  }

  const drawChart = (chartData, chartId) => {
    const $chartContaneir = d3.select(`#${chartId} .chart-container`);
    const width = $chartContaneir.node().offsetWidth;
    const height = Math.min(400, Math.round(width / 5 * 4));
    const barWidth = Math.max(1, ((width - margins[1] - margins[3]) / chartData.length) - 2);
    
    const svg = $chartContaneir.append('svg')
      .attr('class', `${chartId}-chart`)
      .attr('id', `${chartId}-chart`)
      .attr('width', width)
      .attr('height', height)
      .attr('viewbox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const pattern = svg.append('pattern')
      .attr('id', 'diagonalHatch')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 4)
      .attr('height', 4);

    pattern.append('path')
      .attr('d','M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
      .attr('class', 'pattern-line');

    const x = d3.scaleLinear()
      .domain([d3.min(chartData, d => d.x), d3.max(chartData, d => d.x)])
      .range([margins[3], width - margins[1]]);

    const y1 = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.y1)])
      .range([height - margins[2], margins[0]]);

    const y3 = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.y3)])
      .range([height - margins[2], margins[0]]);

    const curve = d3.line()
      .x(point => x(point.x))
      .y(point => y3(point.y3))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Data
    const bars = svg.append('g')
      .attr('class', 'bars');

    const line = svg.append('g')
      .attr('class', 'lines');

    const yZero = y1(0);

    chartData.forEach((d, i) => {
      // Bars
      const xPos = x(d.x) - (barWidth / 2);
      bars.append('rect')
        .attr('id', `bar-tests-${i}`)
        .attr('class', 'bar-tests')
        .attr('x', xPos)
        .attr('width', barWidth)
        .attr('y', y1(d.y1))
        .attr('height', yZero - y1(d.y1))
        .attr('fill', 'white');

      bars.append('rect')
        .attr('id', `bar-positives-${i}`)
        .attr('class', 'bar-positives')
        .attr('x', xPos)
        .attr('width', barWidth)
        .attr('y', y1(d.y2))
        .attr('height', yZero - y1(d.y2))
        .attr('fill', 'white');

      for (let i = xPos, y = xPos + barWidth; i < y; i++) {
        pixelMatrix[Math.floor(i)] = {
          text: `<div>
            ${moment(d.x).format(dateFormat.minimal)}<br />
            <div>
            <strong>${d3.format(',')(d.y1)}</strong> <span>${toLocalText('tests')}</span><br />
            <strong>${d3.format(',')(d.y2)}</strong> <span>${toLocalText('newCases')}</span><br />
            <strong>${d3.format(".2%")(d.y3)}</strong> <span>${toLocalText('testsRatio')}</span>
          </div>`,
          x: Math.floor(x(d.x)),
          y: Math.round(y1(d.y1)),
        }
      }
    });

    console.log(pixelMatrix);

    // Line
    line.append('path')
      .attr('class', 'line-percent')
      .attr('id', 'line-percent')
      .attr('d', curve(chartData))
      .attr('stroke-width', 4)
      .attr('stroke', 'red')
      .attr('fill', 'none');

    // Overall
    line.append('line')
      .attr('class', 'overall-percent-line')
      .attr('id', 'overall-percent-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y3(overallData))
      .attr('y2', y3(overallData))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 6')
      .attr('stroke', 'cyan');

    // Annotations
    annotations.forEach((a, i) => {
      const yPosFunction = (v, f) => {
        switch (f) {
          case 'y1':
            return y1(v);
          case 'y2':
            return y2(v);
          case 'y3':
          default:
            return y3(v);
        }
      };
      const aXpos = x(a.x);
      let style = `left: ${aXpos}px; `;
      let className = `chart-annotation chart-annotation-${i} chart-annotation-${a.position} chart-annotation-${a.id}`;
      if (aXpos > width * .66) {
        style = `left: auto; right: ${width - aXpos}px; text-align: right;`;
        className = `${className} chart-annotation-right`;
      }
      switch (a.position) {
        case 'top':
        case 'auto':
          style += `top: ${yPosFunction(a.y, a.f)}px; `;
          break;
        case 'bottom':
        default:
          style += `top: calc(100% - ${margins[2]}px)`;
      }
      if (a.id === 'globalRatio') {
        
      }
      $chartContaneir.append('div')
        .attr('class', className)
        .attr('id', a.id)
        .attr('style', style)
        .html(a.text);

    });

    const axis = svg.append('g')
      .attr('class', 'axis');

    // X-Axis
    axis.append('line')
      .attr('class', 'x-axis')
      .attr('id', 'x-axis')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yZero - 1)
      .attr('y2', yZero - 1)
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    // Labels
    chartData.forEach((d, i) => {
      if (i === 0) {
        axis.append('line')
          .attr('class', 'x-axis-tick')
          .attr('x1', x(d.x))
          .attr('x2', x(d.x))
          .attr('y1', yZero - 1)
          .attr('y2', yZero + 5)
          .attr('stroke', 'white')
          .attr('stroke-width', 1);
        axis.append('text')
          .attr('class', 'x-axis-label')
          .attr('x', x(d.x))
          .attr('y', yZero + 18)
          .attr('text-anchor', 'start')
          .attr('alignment-baseline', 'top')
          .attr('dominant-baseline', 'top')
          .attr('fill', 'white')
          .text(moment(d.x).format(screenSize === 'S' ? dateFormat.minimal : dateFormat.monthDay));
      } else if (i === chartData.length - 1) {
        axis.append('line')
          .attr('class', 'x-axis-tick')
          .attr('x1', x(d.x))
          .attr('x2', x(d.x))
          .attr('y1', yZero - 1)
          .attr('y2', yZero + 5)
          .attr('stroke', 'white')
          .attr('stroke-width', 1);
      } else if ((moment(d.x).format('DD') === '15') && screenSize === 'L') {
        const xPos  = x(d.x);
        if (xPos > 100 && xPos < width - 100) {
          axis.append('line')
            .attr('class', 'x-axis-tick')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', yZero - 1)
            .attr('y2', yZero + 5)
            .attr('stroke', 'white')
            .attr('stroke-width', 1);
          axis.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', xPos)
            .attr('y', yZero + 18)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'top')
            .attr('dominant-baseline', 'top')
            .attr('fill', 'white')
            .text(moment(d.x).format(screenSize === 'S' ? dateFormat.minimal : dateFormat.monthDay));
        }
      } else if ((moment(d.x).format('DD') === '01')) {
        const xPos  = x(d.x);
        if (xPos > 100 && xPos < width - 100) {
          axis.append('line')
            .attr('class', 'x-axis-tick')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', yZero - 1)
            .attr('y2', yZero + 5)
            .attr('stroke', 'white')
            .attr('stroke-width', 1);
          axis.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', xPos)
            .attr('y', yZero + 18)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'top')
            .attr('dominant-baseline', 'top')
            .attr('fill', 'white')
            .text(moment(d.x).format(screenSize === 'S' ? dateFormat.minimal : dateFormat.monthDay));
        }
      }
    });
  }

  if ($container) {
      const updated = moment(data.generated).format(dateFormat.completeDateTime);
      const html = `<div class="${chartId}" id="${chartId}"><div class="chart-container"></div><p class="last-update">${toLocalText('lastUpdate')}: ${updated}.</p></div>`;
      $container.innerHTML = html;
      prepareData();
      reset();
      window.addEventListener('resize', reset.bind(this));
      const tooltip = Tooltip($container, id);
      const hoverElement = document.querySelector('.chart-container');
      hoverElement.addEventListener('mousemove', (e) => {
        const rect = hoverElement.getBoundingClientRect();
        const hoverElementHeight = rect.height;
        const hoverElementWidth = rect.width;
        const offsetY = rect.top;
        const offsetX = rect.left;
        const realY = e.clientY - offsetY;
        const realX = e.clientX - offsetX;
        const validY = hoverElementHeight - margins[2];
        const validX = hoverElementWidth - margins[1];
        if (realY <= validY && realX <= validX) {
          if (pixelMatrix[realX]) {
            const position = (realX < hoverElementWidth / 3) ? 'top-left' : 'top-right';
            tooltip.show(pixelMatrix[realX].text, pixelMatrix[realX].x, pixelMatrix[realX].y, position, 'light');
          }
        } else {
          tooltip.hide();
        }
      })
  }
}
