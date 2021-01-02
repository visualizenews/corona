regionsJoyPlot = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  const mapSelector = '#regionsJoyPlot-map';
  const chartData = [];
  let chartMaxY = {
    new_tested_positive: Number.MIN_SAFE_INTEGER,
    deaths: Number.MIN_SAFE_INTEGER,
    hospital: Number.MIN_SAFE_INTEGER,
    icu: Number.MIN_SAFE_INTEGER,
    recovered: Number.MIN_SAFE_INTEGER,
  };
  let size = 'S';
  let highlighted = 'veneto';
  const indicators = ['new_tested_positive', 'hospital', 'icu', 'recovered', 'deaths', ];

  const matrix = {
    abruzzo: 13,
    basilicata: 15,
    bolzano: 6,
    calabria: 16,
    campania: 12,
    'emilia-romagna': 8,
    'friuli-venezia-giulia': 7,
    lazio: 12,
    liguria: 2,
    lombardia: 3,
    marche: 11,
    molise: 14,
    piemonte: 1,
    puglia: 15,
    sardegna: 18,
    sicilia: 17,
    toscana: 9,
    trento: 5,
    umbria: 10,
    'valle-d-aosta': 0,
    veneto: 4,
  };

  const box = {
    'S': [62, 20],
    'M': [94, 20],
    'L': [110, 20],
    'XL': [140, 20],
  }
  
  const prepareData = () => {
    let maxLatest = Number.MIN_SAFE_INTEGER;
    let keys = [];
    const tmpChartData = {};
    data.italy.regions.forEach((element, index) => {
      const ts = moment(element.datetime).valueOf();
      const x = index;
      keys = Object.keys(element.data);
      keys.forEach(key => {
          if (index >= 3 && index < data.italy.regions.length - 3) {
              if (!tmpChartData[key]) {
                tmpChartData[key] = {
                      id: key,
                      label: regionsMinimalLabels[key],
                      data: [],
                  }
              }
              const new_tested_positive = (() => {
                  let number = 0;
                  const start = index - 3;
                  const stop = index + 3;
                  for (let i = start; i <= stop; i++) {
                      number += data.italy.regions[i].data[key].new_tested_positive || 0;
                  }
                  return number / 7;
              })();
              const deaths = (() => {
                let number = 0;
                const start = index - 3;
                const stop = index + 3;
                number = data.italy.regions[stop].data[key].deaths - data.italy.regions[start].data[key].deaths;
                return number / 7;
              })();
              const hospital = (() => {
                let number = 0;
                const start = index - 3;
                const stop = index + 3;
                number = data.italy.regions[stop].data[key].hospital - data.italy.regions[start].data[key].hospital;
                return number / 7;
              })();
              const icu = (() => {
                let number = 0;
                const start = index - 3;
                const stop = index + 3;
                number = data.italy.regions[stop].data[key].icu - data.italy.regions[start].data[key].icu;
                return number / 7;
              })();
              const recovered = (() => {
                let number = 0;
                const start = index - 3;
                const stop = index + 3;
                number = data.italy.regions[stop].data[key].recovered - data.italy.regions[start].data[key].recovered;
                return number / 7;
              })();
              tmpChartData[key].data.push({
                  datetime: element.datetime,
                  ts,
                  x,
                  new_tested_positive,
                  deaths,
                  hospital,
                  icu,
                  recovered,
              });
              if (new_tested_positive > chartMaxY.new_tested_positive) {
                chartMaxY.new_tested_positive = new_tested_positive;
              }
              if (deaths > chartMaxY.deaths) {
                chartMaxY.deaths = deaths;
              }
              if (hospital > chartMaxY.hospital) {
                chartMaxY.hospital = hospital;
              }
              if (icu > chartMaxY.icu) {
                chartMaxY.icu = icu;
              }
              if (recovered > chartMaxY.recovered) {
                chartMaxY.recovered = recovered;
              }
          }
      });
    });
    keys.forEach((key) => {
      if (tmpChartData[key].data[tmpChartData[key].data.length - 1].new_tested_positive >= maxLatest ) {
        maxLatest = tmpChartData[key].data[tmpChartData[key].data.length - 1].new_tested_positive;
        highlighted = key;
      }
      chartData.push({
        key,
        order: matrix[key],
        data: tmpChartData[key].data.filter(t => t.ts),
      });
    });
    // chartData.sort((a, b) => b.data[b.data.length - 1].new_tested_positive - a.data[a.data.length - 1].new_tested_positive);
    chartData.sort((a, b) => a.order - b.order);
  };

  const reset = () => {
    $container.classList.add('loading');
    size = 'S';
    if (window.matchMedia('screen and (min-width: 768px').matches) {
      size = 'M';
    }
    if (window.matchMedia('screen and (min-width: 1024px').matches) {
      size = 'L';
    }
    if (window.matchMedia('screen and (min-width: 1280px').matches) {
      size = 'XL';
    }
    document.querySelector(mapSelector).innerHTML = '';
    drawMap();
    $container.classList.remove('loading');
  };

  const drawMap = () => {
    document.querySelector(mapSelector).innerHTML +=  '<div class="regionsJoyPlot-names"></div><div class="regionsJoyPlot-charts"></div>';
    const $names = document.querySelector(`${mapSelector} .regionsJoyPlot-names`);
    indicators.forEach((i) => {
      const html = `<div class="regionsJoyPlot-indicator" id="regionsJoyPlot-indicator-${i}"></div>`;
      document.querySelector(`${mapSelector} .regionsJoyPlot-charts`).innerHTML += html;
    });
    chartData.forEach((k, i) => {
      const style = `top: ${i * box[size][1]}px;`;
      const name = `<div class="regionsJoyPlot-region-name" style="${style}"><h3>${regionsShortLabels[k.key]}</h3></div>`;
      $names.innerHTML += name;
      indicators.forEach((ind) => {
        const html = `<div class="regionsJoyPlot-region ${highlighted === k.key ? 'highlighted' : ''}" id="regionsJoyPlot-region-${ind}-${k.key}" style="${style}"><div class="regionsJoyPlot-region-sparkline-container"><div class="regionsJoyPlot-region-sparkline"></div></div></div>`;
        document.querySelector(`#regionsJoyPlot-indicator-${ind}`).innerHTML += html;
        sparkline([...k.data], `#regionsJoyPlot-region-${ind}-${k.key} .regionsJoyPlot-region-sparkline`, 'regionsJoyPlot', chartMaxY[ind], true, ind);
      });
    });
  };

  const updated = moment(data.generated).format(dateFormat.completeDateTime);
  const html = `<div class="regionsJoyPlot">
    <div class="regionsJoyPlot-container">
      <div class="regionsJoyPlot-map" id="regionsJoyPlot-map">
      <div>
    </div>
    <p class="counter-update last-update">Last update: ${updated}.</p>
  </div>`;
  prepareData();
  $container.innerHTML = html;
  window.addEventListener('resize', reset.bind(this));
  reset();
};