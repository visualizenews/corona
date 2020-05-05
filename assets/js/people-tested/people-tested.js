peopleTested = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  let $chartContainer =  {};
  const chartData = [];
  const base = 10000;
  let sortBy = 'weighted_people_tested';
  let showMethod = 'absolute';
  const sortOptions = ['weighted_people_tested', 'weighted_total_tests', 'people_tested', 'total_tests', 'population', 'cases', 'ratio'];
  const showOptions = ['absolute', 'weighted'];
  let maxPopulation = 0;
  
  const reset = () => {
    console.log('reset')
    $container.classList.add('loading');
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
    // sortData();
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

    chartData.forEach(d => {
      const regionContainer = container
        .append('div')
        .attr('class', 'peopleTested-region')
        .attr('id', `peopleTested-region-${d.region}`);
      
      const chartContainer = regionContainer
        .append('div')
        .attr('class', 'peopleTested-chart');

      /*
        const summaryContainer = regionContainer
        .append('div')
        .attr('class', 'peopleTested-legend');

      // Summary
      summaryContainer
        .append('h3')
        .text(screenSize === 'l' ? d.label : d.shortLabel);

      const dl = summaryContainer
        .append('dl');

      dl.append('dt')
        .text(toLocalText('population'))
      dl.append('dd')
        .text(d3LocaleFormat.format(numberFormat.thousands)(d.population));
      dl.append('dt')
        .text(toLocalText('peopleTested'));
      dl.append('dd')
        .text(d3LocaleFormat.format(numberFormat.thousands)(d.total_people_tested));
      dl.append('dt')
        .text(toLocalText('tests'));
      dl.append('dd')
        .text(d3LocaleFormat.format(numberFormat.thousands)(d.total_tests_done));
      dl.append('dt')
        .text(toLocalText('testedPerBase'));
      dl.append('dd')
        .text(`${d3LocaleFormat.format(numberFormat.decimals)(d.weighted_people_tested)}/${d3LocaleFormat.format(numberFormat.thousands)(base)} ${toLocalText('residents')}`);
      dl.append('dt')
        .text(toLocalText('testsPerBase'));
      dl.append('dd')
        .text(`${d3LocaleFormat.format(numberFormat.decimals)(d.weighted_tests_done)}/${d3LocaleFormat.format(numberFormat.thousands)(base)} ${toLocalText('residents')}`);
      dl.append('dt')
        .text(toLocalText('testsPerPerson'));
      dl.append('dd')
        .text(d3LocaleFormat.format(numberFormat.decimals)(d.ratio));
      */
      // Chart
      let maxWidth = 60;
      if (screenSize === 'm') {
        maxWidth = 90;
      } else if (screenSize === 'l') {
        maxWidth = 150;
      }
      if (showMethod === 'absolute') {
        maxWidth += 50;
      }

      console.log(screenSize, maxWidth);
      
      const sqrtScale = d3.scaleSqrt(domain, [0, maxWidth]);
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