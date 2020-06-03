newCasesVsRecoveries = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  const $div = document.createElement('div');
  $container.appendChild($div);

  // console.log("ITALY", data.italy.global);

  $container.classList.remove("loading");

  new NewCasesVsRecoveries($container, data.italy.global)

  const updated = moment(data.generated).format(dateFormat.completeDateTime);

  d3.select($container)
    .append('p')
    .attr('class','last-update')
    .text(`${toLocalText('lastUpdate')}: ${updated}`)
};

function NewCasesVsRecoveries(container, data, options = {}) {
  const series = {};

  const values = [];
  data
    .forEach((d,i) => {
      d.newRecoveries =  i > 0 ? d.recovered - data[i - 1].recovered : null;
      values.push(d)
      if(values.length === 7) {
        // d.movingWeekRight = [...values];
        d.movingAvgNewCases = d3.mean([...values], value => value.new_tested_positive);
        d.movingAvgNewRecoveries = d3.mean([...values], value => value.newRecoveries);
        values.shift();
      }
    });

  // console.log('DATA', data);

  const labels = {
    movingAvgNewCases: {
      text: toLocalText('dailyNewCases'),
      position: "top",
      textAlign: 'middle',
      middle: true,
    },
    movingAvgNewRecoveries: {
      text: toLocalText('dailyRecoveries'),
      position: "bottom",
      textAlign: 'middle',
      middle: true,
    },
  };
  const localNumberFormat = d3LocaleFormat.format(numberFormat.no_decimals);
  const logNumberFormat = d3LocaleFormat.format(numberFormat.no_trailing);

  Object.entries(labels).forEach(serie => {
    // console.log('---->', serie);
    const id = serie[0];
    series[id] = {
      id,
      data: data.filter(d => d.recovered >= 10).map(d => {
        return {
          id,
          value: d[id],
          ts: +new Date(d.datetime),
        }
      }),
      label: serie[1],
    }
  })

  // console.log('SERIES', series)

  const div = document.createElement('div');
  div.id = '#new-cases-vs-recovery-chart-wrapper';
  div.class = "comparison-chart-wrapper";
  container.appendChild(div);

  new LineChart(series, div, {
    margin: { top: 20, right: 0, bottom: 30, left: 0 },
    padding: { top: 0, right: 50, bottom: 0, left: 0 },
    area: false,
    axes: {
      x: {
        field: "ts",
        title: "",
        scale: "time",
        ticks: 5,
        ticksFormat: (d,i) => {
          if(i === 0) {
            this.prevDateTick = d;
            return d3.timeFormat('%b %d')(d)
          }
          if(this.prevDateTick) {
            if(d3.timeFormat('%m')(this.prevDateTick) !== d3.timeFormat('%m')(d)) {
              this.prevDateTick = d;
              return d3.timeFormat('%b %d')(d)
            }
          }
          this.prevDateTick = d;
          return d3.timeFormat('%d')(d);
        },
        removeTicks: (value) => value === 0,
      },
      y: {
        field: "value",
        // title: '% on population',
        // title: "cases per 100k people",
        title: '',
        scale: "linear",
        grid: true,
        ticks: 3,
        labelsPosition: 'inside',
        ticksFormat: ',.0d'
      }
    },
    labels: true,
    labelsFunction: (d) => {
      const lastValue = d.data[d.data.length - 1].value;
      return d.label.text;
    },
    dots: {
      visible: false,
      label: false,
      filter: (d,i,data) => {
        return i === data.length - 1;
      },
      labelsFunction: (d) => {
        return '';
        return localNumberFormat(d);
      },
    },
    intersections: {
      visible: true,
      series: ['movingAvgNewCases','movingAvgNewRecoveries'],
    }
  });


}
