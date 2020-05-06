peopleTested = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  let $chartContainer =  {};
  const chartData = [];
  const base = 10000;
  let sortBy = 'weighted_people_tested';
  let showMethod = 'weighted';
  const sortOptions = ['weighted_people_tested', 'weighted_total_tests', 'people_tested', 'total_tests_done', 'population', 'cases', 'ratio'];
  const showOptions = ['absolute', 'weighted'];
  let maxPopulation = 0;
  
  const reset = () => {
    console.log('reset')
    $chartContainer.innerHTML = '';
    drawChart();
    $container.classList.remove('loading');
  }

  const prepareData = () => {
    const latestData = data.italy.regions[ data.italy.regions.length - 1];
    const keys = Object.keys(latestData.data);
    console.log(latestData, keys);
    keys.forEach(key => {
      chartData.push({
        cases: latestData.data[key].cases,
        label: regionsLabels[key],
        shortLabel: regionsShortLabels[key],
        population: population[key],
        ratio: latestData.data[key].tested / latestData.data[key].people_tested,
        region: key,
        total_cases: latestData.data[key].cases,
        total_people_tested: latestData.data[key].people_tested,
        total_tests_done: latestData.data[key].tested,
        weighted_people_tested: base * latestData.data[key].people_tested / population[key],
        weighted_tests_done: base * latestData.data[key].tested / population[key],
      });
    });
    maxPopulation = d3.max(chartData, d => d.population);
  }

  const sortData = () => {
    chartData.sort((a, b) => b[sortBy] - a[sortBy]);
  }

  const drawChart = () => {
    sortData();
    const container = d3.select('#peopleTested-wrapper')
      .attr('class', `peopleTested-wrapper peopleTested-${showMethod}`);
    
    let screenSize = 's';
    if (window.matchMedia('screen and (min-width:1200px)').matches) {
      screenSize = 'l';
    } else if (window.matchMedia('screen and (min-width:768px)').matches) {
      screenSize = 'm';
    }

    let domain = [0, base];
    if (showMethod === 'absolute') {
      domain = [0, maxPopulation];
    }

    const tooltip = Tooltip(container.node(), id);

    chartData.forEach((d, i) => {
      const regionContainer = container
        .append('div')
        .attr('class', 'peopleTested-region')
        .attr('id', `peopleTested-region-${d.region}`);
      
      const chartContainer = regionContainer
        .append('div')
        .attr('class', 'peopleTested-chart');
      // Chart
      let maxWidth = 50;
      let minWidth = 2
      if (screenSize === 'm') {
        maxWidth = 90;
        minWidth = 5;
      } else if (screenSize === 'l') {
        maxWidth = 150;
        minWidth = 10;
      }

      console.log(screenSize, maxWidth);
      
      const sqrtScale = d3.scaleSqrt(domain, [minWidth, maxWidth]);
      const pop = Math.round(sqrtScale( showMethod === 'absolute' ? d.population : base ));
      const peo = Math.round(sqrtScale( showMethod === 'absolute' ? d.total_people_tested : d.weighted_people_tested ));
      const tes = Math.round(sqrtScale( showMethod === 'absolute' ? d.total_tests_done : d.weighted_tests_done ));

      chartContainer.append('div')
        .attr('class', 'peopleTested-chart-base')
        .attr('style', `width: ${pop}px; height: ${pop}px`);

      chartContainer.append('div')
        .attr('class', 'peopleTested-chart-tests')
        .attr('style', `width: ${tes}px; height: ${tes}px`);

      chartContainer.append('div')
        .attr('class', 'peopleTested-chart-people')
        .attr('style', `width: ${peo}px; height: ${peo}px`);

      chartContainer.append('h3')
        .text(screenSize === 'l' ? d.label : d.shortLabel);
      // Tooltip
      chartContainer.on('mouseover', () => {
        const content = `<div class="peopleTested-tooltip-inner">
          <h2>${d.label}</h2>
          <dl>
            <dt>${toLocalText('population')}</dt>
            <dd>${d3LocaleFormat.format(numberFormat.thousands)(d.population)}</dd>
            <dt>${toLocalText('confirmedCases')}</dt>
            <dd>${d3LocaleFormat.format(numberFormat.thousands)(d.cases)}</dd>
            <dt>${toLocalText('peopleTested')}</dt>
            <dd>${d3LocaleFormat.format(numberFormat.thousands)(d.total_people_tested)}</dd>
            <dt>${toLocalText('tests')}</dt>
            <dd>${d3LocaleFormat.format(numberFormat.thousands)(d.total_tests_done)}</dd>
            <dt>${toLocalText('testedPerBase')}</dt>
            <dd>${d3LocaleFormat.format(numberFormat.decimals)(d.weighted_people_tested)}<span>/${d3LocaleFormat.format(numberFormat.abbreviated)(base)} ${toLocalText('residents')}</span></dd>
            <dt>${toLocalText('testsPerBase')}</dt>
            <dd>${d3LocaleFormat.format(numberFormat.decimals)(d.weighted_tests_done)}<span>/${d3LocaleFormat.format(numberFormat.abbreviated)(base)} ${toLocalText('residents')}</span></dd>
            <dt>${toLocalText('testsPerPerson')}</dt>
            <dd>${d3LocaleFormat.format(numberFormat.decimals)(d.ratio)}</dd>
          </dl>
        </div>`;
        const target = document.querySelector(`#peopleTested-region-${d.region}`);
        const domRect = target.getBoundingClientRect();
        const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const x = target.offsetLeft + (target.offsetWidth / 2);
        let y = target.offsetTop - 3;

        console.log(domRect, vh);

        let vposition = 'top';
        let hposition = 'center';
        if (screenSize === 's' && (i % 3) === 0) {
          hposition = 'left';
        } else if (screenSize === 's' && (i % 3) === 2) {
          hposition = 'right';
        }
        if (domRect.top < vh / 2) {
          vposition = 'bottom';
          y = y + domRect.height + 6;
        }
        tooltip.show(content, x, y, `${vposition}-${hposition}`, 'light');
      })
        .on('mouseout', () => { tooltip.hide(); })
    });
  }
  
  const updated = moment(data.generated).format(dateFormat.completeDateTime);

  const html = `<div class="peopleTested">
      <div class="peopleTested-wrapper" id="peopleTested-wrapper"></div>
      <p class="peopleTested-update last-update">${toLocalText('lastUpdate')}: ${updated}.</p>
  </div>`;
    
  $container.innerHTML = html;
  $chartContainer = document.querySelector('#peopleTested-wrapper');
  prepareData();
  window.addEventListener('resize', reset.bind(this));
  reset();
}