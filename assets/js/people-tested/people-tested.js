peopleTested = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  let $chartContainer =  {};
  const chartData = [];
  const base = 10000;
  let sortBy = 'weighted_people_tested';
  let showMethod = 'weighted';
  const sortOptions = ['weighted_people_tested', 'weighted_tests_done', 'total_people_tested', 'total_tests_done', 'population', 'confirmedCases', 'ratio'];
  const showOptions = ['absolute', 'weighted'];
  let maxPopulation = 0;
  let tooltipVisible = false;
  let tooltipPreviousTarget = '';
  
  const reset = () => {
    $chartContainer.innerHTML = '';
    drawChart();
    $container.classList.remove('loading');
  }

  const prepareData = () => {
    const latestData = data.italy.regions[ data.italy.regions.length - 1];
    const keys = Object.keys(latestData.data);
    keys.forEach(key => {
      chartData.push({
        confirmedCases: latestData.data[key].cases,
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
    let mouseSupport = false;
    if (window.matchMedia('screen and (any-pointer: fine)').matches) {
      mouseSupport = true;
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
      const tooltipContent = `<div class="peopleTested-tooltip-inner">
          <h2>${d.label}</h2>
          <dl>
            <dt>${toLocalText('population')}</dt>
            <dd><span>${d3LocaleFormat.format(numberFormat.thousands)(d.population)}</span></dd>
            <dt>${toLocalText('confirmedCases')}</dt>
            <dd><span>${d3LocaleFormat.format(numberFormat.thousands)(d.confirmedCases)}</span></dd>
            <dt>${toLocalText('peopleTested')}</dt>
            <dd><span>${d3LocaleFormat.format(numberFormat.thousands)(d.total_people_tested)}</span></dd>
            <dt>${toLocalText('tests')}</dt>
            <dd><span>${d3LocaleFormat.format(numberFormat.thousands)(d.total_tests_done)}</span></dd>
            <dt>${toLocalText('testedPerBase', { base: d3LocaleFormat.format(numberFormat.abbreviated)(base) })}</dt>
            <dd><span>${d3LocaleFormat.format(numberFormat.decimals)(d.weighted_people_tested)}</span></dd>
            <dt>${toLocalText('testsPerBase', { base: d3LocaleFormat.format(numberFormat.abbreviated)(base) })}</dt>
            <dd><span>${d3LocaleFormat.format(numberFormat.decimals)(d.weighted_tests_done)}</span></dd>
            <dt>${toLocalText('testsPerPerson')}</dt>
            <dd><span>${d3LocaleFormat.format(numberFormat.decimals)(d.ratio)}</span></dd>
          </dl>
        </div>`;
      const tooltipTarget = document.querySelector(`#peopleTested-region-${d.region}`);
      if (mouseSupport) {
        chartContainer.on('mouseover', () => {
          const tooltipDomRect = tooltipTarget.getBoundingClientRect();
          const tooltipVh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
          const tooltipX = tooltipTarget.offsetLeft + (tooltipTarget.offsetWidth / 2);
          let tooltipY = tooltipTarget.offsetTop;
          let tooltipVposition = 'top';
          let tooltipHposition = 'center';
          if (screenSize === 's' && (i % 3) === 0) {
            tooltipHposition = 'left';
          } else if (screenSize === 's' && (i % 3) === 2) {
            tooltipHposition = 'right';
          }
          if (tooltipDomRect.top < tooltipVh / 2) {
            tooltipVposition = 'bottom';
            tooltipY = tooltipY + tooltipDomRect.height + 6;
          }
          tooltip.show(tooltipContent, tooltipX, tooltipY, `${tooltipVposition}-${tooltipHposition}`, 'light');
          tooltipVisible = true;
          tooltipPreviousTarget = tooltipTarget;
          tooltipTarget.classList.add('active');
        })
          .on('mouseout', () => {
            tooltip.hide();
            tooltipVisible = false;
            tooltipPreviousTarget = '';
            tooltipTarget.classList.remove('active');
          })
      } else {
        chartContainer.on('click', () => {
          if (tooltipVisible && tooltipPreviousTarget === tooltipTarget) {
            tooltip.hide();
            tooltipVisible = false;
            tooltipPreviousTarget = '';
            tooltipTarget.classList.remove('active');
          } else {
            if (tooltipPreviousTarget !== '' && tooltipPreviousTarget !== tooltipTarget) {
              tooltip.hide();
              tooltipPreviousTarget.classList.remove('active');
            }
            const tooltipDomRect = tooltipTarget.getBoundingClientRect();
            const tooltipVh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            const tooltipX = tooltipTarget.offsetLeft + (tooltipTarget.offsetWidth / 2);
            let tooltipY = tooltipTarget.offsetTop;
            let tooltipVposition = 'top';
            let tooltipHposition = 'center';
            if (screenSize === 's' && (i % 3) === 0) {
              tooltipHposition = 'left';
            } else if (screenSize === 's' && (i % 3) === 2) {
              tooltipHposition = 'right';
            }
            if (tooltipDomRect.top < tooltipVh / 2) {
              tooltipVposition = 'bottom';
              tooltipY = tooltipY + tooltipDomRect.height + 6;
            }
            tooltip.show(tooltipContent, tooltipX, tooltipY, `${tooltipVposition}-${tooltipHposition}`, 'light');
            tooltipPreviousTarget = tooltipTarget;
            tooltipVisible = true;
            tooltipTarget.classList.add('active');
          }
        });
      }
    });
  }

  const initCheckbox = () => {
    const checkbox = document.querySelector('#peopleTested-showMethod');
    if (showMethod === 'weighted') {
      checkbox.checked = true;
    }
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        showMethod = 'weighted';
      } else {
        showMethod = 'absolute';
      }
      reset();
    });
  }

  const initSelect = () => {
    const select = document.querySelector('#peopleTested-sortBy');
    select.value = sortBy;
    select.addEventListener('change', () => {
      sortBy = select.value;
      reset();
    });
  }
  
  const updated = moment(data.generated).format(dateFormat.completeDateTime);

  const html = `<div class="peopleTested">
      <div class="peopleTested-filters">
        <div class="peopleTested-show">${toLocalText('show')}</div>
        <div class="peopleTested-switch">
          <label>${toLocalText('weighted')} <span><input type="checkbox" name="peopleTested-showMethod" id="peopleTested-showMethod" value="1" /><i></i></span> ${toLocalText('absolute')}</label>
        </div>
        <div class="peopleTested-sort">${toLocalText('sort')}</div>
        <div class="peopleTested-select">
          <select name="peopleTested-shortBy" id="peopleTested-sortBy" size="1">
            ${sortOptions.map(d=> `<option value="${d}">${toLocalText(d)}</option>`)}
          </select>
        </div>
      </div>
      <div class="peopleTested-wrapper" id="peopleTested-wrapper"></div>
      <div class="peopleTested-legend">
        <h3>${toLocalText('legend')}</h3>
        <div class="peopleTested-legend-wrapper">
          <div class="peopleTested-legend-pop">${toLocalText('population')}</div>
          <div class="peopleTested-legend-tes">${toLocalText('tests')}</div>
          <div class="peopleTested-legend-peo">${toLocalText('peopleTested')}</div>
        </div>
      </div>
      <p class="peopleTested-update last-update">${toLocalText('lastUpdate')}: ${updated}.</p>
  </div>`;
    
  $container.innerHTML = html;
  $chartContainer = document.querySelector('#peopleTested-wrapper');
  prepareData();
  initCheckbox();
  initSelect();
  window.addEventListener('resize', reset.bind(this));
  reset();
}