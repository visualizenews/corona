regionsTrendMap = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  const mapSelector = '#regionsTrendMap-map';
  const chartData = {};
  let chartMaxY = Number.MIN_SAFE_INTEGER;
  let size = 'S';
  let highlighted = 'veneto';

  const matrix = {
    abruzzo: [4, 5],
    basilicata: [3, 6],
    bolzano: [3, 0],
    calabria: [2, 6],
    campania: [3, 5],
    'emilia-romagna': [3, 3],
    'friuli-venezia-giulia': [4, 2],
    lazio: [2, 4],
    liguria: [1, 3],
    lombardia: [2, 2],
    marche: [4, 4],
    molise: [4, 6],
    piemonte: [1, 2],
    puglia: [4, 7],
    sardegna: [0, 4],
    sicilia: [0, 6],
    toscana: [2, 3],
    trento: [3, 1],
    umbria: [3, 4],
    'valle-d-aosta': [1, 1],
    veneto: [3, 2],
  };

  const box = {
    'S': [62, 62],
    'M': [94, 94],
    'L': [110, 110],
    'XL': [140, 140],
  }
  
  const prepareData = () => {
    let maxLatest = Number.MIN_SAFE_INTEGER;
    let keys = [];
    data.italy.regions.forEach((element, index) => {
      const ts = moment(element.datetime).valueOf();
      const x = index;
      keys = Object.keys(element.data);
      keys.forEach(key => {
          if (index >= 3 && index < data.italy.regions.length - 3) {
              if (!chartData[key]) {
                  chartData[key] = {
                      id: key,
                      label: regionsMinimalLabels[key],
                      data: [],
                  }
              }
              const y = (() => {
                  let number = 0;
                  const start = index - 3;
                  const stop = index + 3;
                  for (let i = start; i <= stop; i++) {
                      number += data.italy.regions[i].data[key].new_tested_positive || 0;
                  }
                  return number / 7;
              })();
              chartData[key].data.push({
                  ts,
                  x,
                  lv: element.data[key].new_tested_positive,
                  y,
              });
              if (y > chartMaxY) {
                chartMaxY = y;
              }
          }
      });
    });
    keys.forEach((key) => {
      if (chartData[key].data[chartData[key].data.length - 1].y >= maxLatest ) {
        maxLatest = chartData[key].data[chartData[key].data.length - 1].y;
        highlighted = key;
      }
    });
  };

  const reset = () => {
    $container.classList.add('loading');
    size = 'S';
    if (window.matchMedia('screen and (min-width: 768px)').matches) {
      size = 'M';
    }
    if (window.matchMedia('screen and (min-width: 1024px)').matches) {
      size = 'L';
    }
    if (window.matchMedia('screen and (min-width: 1280px)').matches) {
      size = 'XL';
    }
    console.log(size);
    document.querySelector(mapSelector).innerHTML = '';
    drawMap();
    $container.classList.remove('loading');
  };

  const drawMap = () => {
    console.log(chartData);
    const keys = Object.keys(chartData);
    keys.forEach((k, i) => {
      const style = `left: ${matrix[k][0] * box[size][0]}px; top: ${matrix[k][1] * box[size][1]}px;`;
      const html = `<div class="regionsTrendMap-region ${highlighted === k ? 'highlighted' : ''}" id="regionsTrendMap-region-${k}" style="${style}">
        <div class="regionsTrendMap-region-sparkline"></div>
        <div class="regionsTrendMap-region-name"><h3>${(size === 'L' || size === 'XL') ? regionsShortLabels[k] : regionsMinimalLabels[k]}</h3></div>
      </div>`;
      document.querySelector(mapSelector).innerHTML += html;
      sparkline(chartData[k].data, `#regionsTrendMap-region-${k} .regionsTrendMap-region-sparkline`, 'regionsTrendMap', chartMaxY);
    });
  };

  console.log(data);
  const updated = moment(data.generated).format(dateFormat.completeDateTime);
  const html = `<div class="regionsTrendMap">
    <div class="regionsTrendMap-container">
      <div class="regionsTrendMap-map" id="regionsTrendMap-map"><div>
    </div>
    <p class="counter-update last-update">Last update: ${updated}.</p>
  </div>`;
  prepareData();
  $container.innerHTML = html;
  window.addEventListener('resize', reset.bind(this));
  reset();
};