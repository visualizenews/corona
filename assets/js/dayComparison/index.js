dayComparison = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  const updated = moment(data.generated).format(dateFormat.completeDateTime);
  const lockdownStart = '2020-03-11';
  const lockdownEnd = '2020-05-04';
  const schoolsOpen = '2020-09-14';
  const margins = [ 20, 30, 20, 60 ];
  const kpis = [ 'new_tested_positive', 'deaths_diff', 'hospital', 'icu'];
  const kpiLabels = {
    new_tested_positive: 'newCases',
    deaths_diff: 'fatalities',
    hospital: 'hospitalized',
    icu: 'icu',
  };
  const symbols = {
    new_tested_positive: 'newCases',
    deaths_diff: 'deaths',
    hospital: 'hospital',
    icu: 'icu',
  };
  const firstPeak = (() => {
    const baseData = data.italy.global.filter((d) => d.datetime >= lockdownStart && d.datetime < lockdownEnd);
    baseData.sort((a, b) => b.new_tested_positive - a.new_tested_positive);
    return baseData[0];
  })();
  const lowestPoint = (() => {
    const baseData = data.italy.global.filter((d) => d.datetime >= lockdownStart && d.datetime < lockdownEnd);
    baseData.sort((a, b) => a.new_tested_positive - b.new_tested_positive);
    return baseData[0];
  })();
  const lines = [
    {
      label: 'icuSafeLimit',
      value: Math.round(6458 * 0.3),
      kpi: 'icu',
    }
  ];
  const milestones = {
    lockdownStart: {
      datetime: lockdownStart,
    },
    lockdownEnd: {
      datetime: lockdownEnd,
    },
    firstPeak: {
      datetime: firstPeak.datetime,
    },
    lowestPoint: {
      datetime: lowestPoint.datetime,
    },
    schoolsOpen: {
      datetime: schoolsOpen,
    },
  };
  const chartData = [];
  const today = data.italy.global[data.italy.global.length - 1];
  today.deaths_diff = today.deaths - data.italy.global[data.italy.global.length - 2].deaths;
  today.tested_diff = today.tested - data.italy.global[data.italy.global.length - 2].tested;
  let screenSize = (window.matchMedia('screen and (min-width:768px)').matches) ? 'L' : 'S';

  const prepareData = () => {
    const events = {};
    // Create Clusters
    // 1. Most similar number before the first peak
    const before = data.italy.global.filter(d => d.datetime < milestones.firstPeak.datetime);
    let delta = Number.MAX_SAFE_INTEGER;
    before.forEach((b) => {
      const diff = Math.abs(today.new_tested_positive - b.new_tested_positive);
      if (diff < delta) {
        delta = diff;
        events.beforeFirstPeak = b;
      }
    });
    // 2. Most similar number between the first peak and the end of lockdown
    const after = data.italy.global.filter(d => d.datetime > milestones.firstPeak.datetime && d.datetime < lowestPoint.datetime);
    delta = Number.MAX_SAFE_INTEGER;
    after.forEach((b) => {
      const diff = Math.abs(today.new_tested_positive - b.new_tested_positive);
      if (diff < delta) {
        delta = diff;
        events.afterFirstPeak = b;
      }
    });
    events.lowestPoint = lowestPoint;
    events.today = today;
    events.firstPeak = firstPeak;
    const keys = Object.keys(events);
    keys.forEach((k) => {
      chartData.push({
        event: k,
        data: events[k]
      });
    });
    chartData.sort((a,b) => a.data.datetime > b.data.datetime ? 1 : -1);
    chartData.forEach((d) => {
      const previousDate = moment(d.data.datetime).subtract(1, 'DAYS').format('YYYY-MM-DD');
      const previousDay = data.italy.global.find(dg => dg.datetime === previousDate);
      d.data.deaths_diff = d.data.deaths - previousDay.deaths;
      d.data.tested_diff = d.data.tested - previousDay.tested;
    });
  }

  const reset = () => {
    screenSize = (window.matchMedia('screen and (min-width:768px)').matches) ? 'L' : 'S';
    $container.classList.add('loading');
    const $chartContainer = $container.querySelector('#dayComparison-chart-container');
    $chartContainer.innerHTML = '';
    drawChart();
    $container.classList.remove('loading');
  }

  const changeSelection = (event) => {
    // 
    if ($container.classList.contains(`dayComparison-show-${event}`)) {
      $container.classList.remove(`dayComparison-show-${event}`);
    } else {
        $container.classList.forEach(className => {
            if (className.startsWith('dayComparison-show-')) {
                $container.classList.remove(className);
            }
        });
        $container.classList.add(`dayComparison-show-${event}`);
    }
  };

  const drawChart = () => {
    const chartContainer = d3.select(`#${id} #dayComparison-chart-container`);
    const maxH = d3.max(chartData, d => d.data.hospital);
    const maxC = d3.max(chartData, d => d.data.new_tested_positive);
    const maxI = d3.max(chartData, d => d.data.icu);
    const maxD = d3.max(chartData, d => d.data.deaths_diff);
    // const maxT = d3.max(chartData, d => d.data.tested);
    const minH = d3.min(chartData, d => d.data.hospital);
    const minC = d3.min(chartData, d => d.data.new_tested_positive);
    const minI = d3.min(chartData, d => d.data.icu);
    const minD = d3.min(chartData, d => d.data.deaths_diff);
    // const minT = d3.min(chartData, d => d.data.tested);
    const maxY = Math.max(maxH, maxC, maxI, maxD);
    const minY = Math.min(minH, minC, minI, minD);
    const height = 400;
    const svgHeight = height + margins[0] + margins[2];
    const svgWidth = chartContainer.node().offsetWidth;
    const width = svgWidth - margins[1] - margins[3];
    const colWidth = Math.floor(width / chartData.length);
    const connectors = {};
    // Create SVG
    const svg = chartContainer.append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .attr('viewbox', `0 0 ${svgWidth} ${svgHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const connectorsWrapper = svg.append('g');

    const y = d3.scaleLinear()
      .domain([minY, maxY]) 
      .range([height, margins[0]]);
    chartData.forEach((c, i) => {
      // Group
      const g = svg.append('g');
      // Lines
      const xpos = margins[3] + (colWidth * i) + Math.floor(colWidth / 2);
      g.append('line')
        .attr('x1', xpos)
        .attr('x2', xpos)
        .attr('y1', margins[0])
        .attr('y2', height)
        .attr('class', `dayComparison-day-line dayComparison-day-line-${c.event}`);
      // Points
      kpis.forEach((k) => {
        if (!connectors[k]) {
          connectors[k] = {
            points: [],
          };
        }
        const ypos = y(c.data[k]);

        connectors[k].points.push(`${xpos}, ${ypos}`);
        g.append('use')
          .attr('xlink:href', `#${symbols[k]}`)
          .attr('x', xpos)
          .attr('y', ypos)
          .attr('width', 10)
          .attr('height', 10)
          .attr('class', `dayComparison-point dayComparison-point-${k} dayComparison-point-${c.event}`)
          .attr('data-value', c.data[k])
          .attr('data-event', c.event)
          .attr('data-kpi', k)
          .on('mouseup', () => { changeSelection(k) });
        
        chartContainer.append('div')
          .attr('style', `top: ${(screenSize === 'L') ? ypos + 60 : ypos + 100}px; left: ${xpos}px;`)
          .attr('class', `dayComparison-point-label dayComparison-point-label-${k} dayComparison-point-label-${c.event}`)
          .html(d3.format(',')(c.data[k]));

        if (i === 0) {
          chartContainer.append('div')
            .attr('style', `top: ${(screenSize === 'L') ? ypos + 60 : ypos + 100}px; left: ${xpos}px;`)
            .attr('class', `dayComparison-point-legend dayComparison-point-legend-${k} dayComparison-point-legend-${c.event}`)
            .html(toLocalText(kpiLabels[k]))
            .on('mouseup', () => { changeSelection(k); });
        }
      });
      // Labels
      const gl = chartContainer.append('div')
        .attr('class', 'dayComparison-labels')
        .attr('style', `top: 0; left: ${xpos}px;`);

      gl.append('div')
        .attr('class', `dayComparison-event dayComparison-event-${c.event}`)
        .html(toLocalText(c.event));
      gl.append('div')
        .attr('class', `dayComparison-date dayComparison-date-${c.event}`)
        .html(moment(c.data.datetime).format(dateFormat.short));
      gl.append('div')
        .attr('class', `dayComparison-tests dayComparison-tests-${c.event}`)
        .html(`${toLocalText('tested')}: ${d3.format(',')(c.data.tested_diff)}`);
    }); 

    // Connectors 
    const ck = Object.keys(connectors);
    ck.forEach((k) => {
      const points = connectors[k].points.join(' ');
      connectorsWrapper.append('polyline')
        .attr('points', points)
        .attr('class', `dayComparison-connector dayComparison-connector-${k}`);
    });

    // Numbers
    const lx = Math.floor(margins[3] / 2);
    const gd = svg.append('g');
    gd.append('line')
      .attr('x1', lx)
      .attr('x2', lx)
      .attr('y1', y(minY) - 10)
      .attr('y2', y(maxY) + 10)
      .attr('class', 'dayComparison-arrow-body');
    gd.append('line')
      .attr('x1', lx - 5)
      .attr('x2', lx)
      .attr('y1', y(maxY) + 15)
      .attr('y2', y(maxY) + 10)
      .attr('class', 'dayComparison-arrow-arm');
    gd.append('line')
      .attr('x1', lx + 5)
      .attr('x2', lx)
      .attr('y1', y(maxY) + 15)
      .attr('y2', y(maxY) + 10)
      .attr('class', 'dayComparison-arrow-arm');

    gd.append('text')
      .attr('x', lx)
      .attr('y', y(minY))
      .attr('class', 'dayComparison-number')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(d3.format(',')(minY));
    gd.append('text')
      .attr('x', lx)
      .attr('y', y(maxY))
      .attr('class', 'dayComparison-number')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(d3.format(',')(maxY));

    lines.forEach(l => {
      const ypos = y(l.value);
      connectorsWrapper.append('line')
        .attr('x1', Math.floor(margins[3] / 4))
        .attr('x2', Math.floor(svgWidth - (margins[1] / 4)))
        .attr('y1', ypos)
        .attr('y2', ypos)
        .attr('class', `dayComparison-level dayComparison-level-${l.kpi}`);
    })
  };

  if ($container) {
      const html = `<div class="dayComparison-chart-container">
        <div id="dayComparison-chart-container"></div>
        <p class="dayComparison-update last-update">
            <svg width="200" height="16" viewbox="0 0 200 16" preserveAspectRatio="xMidYMid meet">
              <line x1="5" x2="195" y1="8" y2="8" class="dayComparison-level" /> 
            </svg><br />
            ${toLocalText('dayComparisonLegend')}<br />
            ${toLocalText('bestDayLegend')}
        </p>
        <p class="dayComparison-update last-update">
          ${toLocalText('lastUpdate')}: ${updated}.
        </p>
      </div>`;
      prepareData();
      $container.innerHTML = html;
      reset();
      $container.classList.add('dayComparison-show-new_tested_positive');
      window.addEventListener('resize', reset.bind(this));
  }
}
