fatalitiesAndCases = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  const $div = document.createElement('div');
  $container.appendChild($div);

  console.log('fatalitiesAndCases', data);

  new FatalitiesAndCases($div, data.italy.global.map(d => {
    d.hospital_for_change = d.hospital_total + d.deaths + d.recovered;
    return d;
  }));

  $container.classList.remove("loading");
};

function FatalitiesAndCases(container, data, options = {}) {
  const margin = {
    left:0,
    top: 0,
    right: 0,
    bottom: 0,
  }

  // console.log(container)

  this.width = container.getBoundingClientRect().width;

  const columns = d3.select(container).append('div')
                    .attr('class','vs-cols')

  const cases = columns.append('ul')
      .attr('class','vs-col')
      .attr('id','cases');

  const fatalities = columns.append('ul')
      .attr('class','vs-fatalities')
      .attr('id','fatalities');

  const fatalities2 = columns.append('ul')
      .attr('class','vs-fatalities')
      .attr('id','fatalities2');

  const numberFormat = d3.format('+,.2%');
  const daysForAvg = [7, 0]; // min [1, 0]
  const incubationTime = 14; // min 0

  const FIELDS = ['hospital_for_change','deaths'];
  const comparison_indicator = FIELDS[0]; // 'hospital_total';

  data.forEach((d, i) => {
    d.ts = new Date(d.datetime);
    d.index = i;
    FIELDS.forEach(field => {
      if(i > 0) {
        const onDayBefore = (d[field] - data[i-1][field]) / data[i-1][field];

        if(!d.onDayBefore) {
          d.onDayBefore = {};
        }
        d.onDayBefore[field] = onDayBefore;
      }
      if(i > daysForAvg[0]) {
        const values = d3.range(i - daysForAvg[0], i + daysForAvg[1]).filter(day => data[day]).map(day => data[day + 1][field]);
        console.log('VALUES', d3.range(i - daysForAvg[0], i + daysForAvg[1]).filter(day => data[day]).map(day => data[day + 1]))
        const percs = d3.range(i - daysForAvg[0], i + daysForAvg[1]).filter(day => data[day]).map(day => {
          const perc = (data[day][field] - data[day-1][field]) / data[day-1][field];
          return perc;
        });

        if(!d.percs) {
          d.percs = {};
          d.avgPercs = {};
        }
        if(!d.values) {
          d.values = {};
          d.avgValues = {};
          d.sumValues = {}
        }

        d.percs[field] = percs;
        d.avgPercs[field] = d3.mean(percs);

        d.values[field] = values;
        d.avgValues[field] = d3.mean(values);
        d.sumValues[field] = d3.sum(values);

        if(data[i - 1].values) {
          if(!d.changeValues) {
            d.changeValues = {}
          }
          d.changeValues[field] = {
            sum: (data[i].sumValues[field] - data[i - 1].sumValues[field]) / data[i - 1].sumValues[field],
            sumValues: [data[i - 1].sumValues[field], data[i].sumValues[field]],
            avg: (data[i].avgValues[field] - data[i - 1].avgValues[field]) / data[i - 1].avgValues[field],
            avgValues: [data[i - 1].avgValues[field], data[i].avgValues[field]],
          };
        }

      }


    })
  });



  cases
    .selectAll('li')
    .data(data)
    .join()
    .append('li')
      .attr('class','day')
      .text((d,i) => {
        const field = comparison_indicator;
        // console.log(d)
        if(i > daysForAvg[0]) {
          return `${d[field]}(${numberFormat(d.onDayBefore[field])}): ${numberFormat(d.avgPercs[field])} / ${d.changeValues ? numberFormat(d.changeValues[field].sum): '-'}`;
        }
        if(i > 0) {
          return `${d[field]} ${numberFormat(d.onDayBefore[field])}`;
        }
        return d[field];
      })

  fatalities
    .selectAll('li')
    .data(data)
    .join()
    .append('li')
      .attr('class','day')
      .text((d,i) => {
        let cases2WeeksAgo = '-';
        if(i > incubationTime + daysForAvg[0]) {
          cases2WeeksAgo = numberFormat(data[i - incubationTime].avgPercs[comparison_indicator]);
        }

        const field = 'deaths';
        if(i > daysForAvg[0]) {
          return `${d[field]} (${numberFormat(d.onDayBefore[field])}) ${numberFormat(d.avgPercs[field])} <-> ${cases2WeeksAgo}`;
        }

        return d[field];
      })

  fatalities2
    .selectAll('li')
    .data(data)
    .join()
    .append('li')
      .attr('class','day')
      .text((d,i) => {
        let avgCases2WeeksAgo = '-';
        let cases2WeeksAgo = '-';
        if(i > incubationTime + daysForAvg[0] + 1) {
          cases2WeeksAgo = Math.round(data[i - incubationTime].avgValues[comparison_indicator]);
          avgCases2WeeksAgo = numberFormat(data[i - incubationTime].changeValues[comparison_indicator].avg);
        }

        const field = 'deaths';
        if(i > daysForAvg[0] + 1) {
          console.log(d)
          return `${Math.round(d.avgValues[field])} ${numberFormat(d.changeValues[field].avg)} <-> ${avgCases2WeeksAgo} ${cases2WeeksAgo}`;
        }

        return d[field];
      })

    const dataForSeries = data.map((d,i) => {
      let avgCases2WeeksAgo = null;
      let cases2WeeksAgo = null;
      if(i > daysForAvg[0]) {
        if(i > incubationTime + daysForAvg[0] + 1) {
          cases2WeeksAgo = (data[i - incubationTime].avgValues[comparison_indicator]);
          avgCases2WeeksAgo = (data[i - incubationTime].changeValues[comparison_indicator].avg);
        }
        // console.log('--->',i,d)
        return {
          ...d,
          cases2WeeksAgo,
          avgCases2WeeksAgo,
          indicator: d.changeValues && d.changeValues['deaths'] ? d.changeValues['deaths'].avg : null,
          comparison_indicator: d.changeValues && d.changeValues[comparison_indicator] ? d.changeValues[comparison_indicator].avg : null,
        }
      }

      //
      // const field = 'deaths';
      // if(i > daysForAvg + 1) {
      //   //console.log(d)
      //   return `${Math.round(d.avgValues[field])} ${numberFormat(d.changeValues[field].avg)} <-> ${avgCases2WeeksAgo} ${cases2WeeksAgo}`;
      // }

      return null;
    }).filter(d => d)


    console.log('dataForSeries', dataForSeries)
    const series = {};
    [{
      id: 'indicator',
      label: 'deaths',
    }, {
      id: 'comparison_indicator',
      //id: 'avgCases2WeeksAgo',
      label: 'hospital',
    }].forEach(field => {
      series[field.id] = {
        id: field.id,
        label: {
          text: field.label,
        },
        data: [...dataForSeries].map(d => {
          return {
            ...d,
            value: d[field.id],
          };
        }),
      }
    })
    console.log('SERIES', series)
    const chartContainer = d3.select(container).append('div').attr('id','percChart').node();
    new LineChart(series, chartContainer, {
      margin: { top: 20, right: 0, bottom: 30, left: 0 },
      padding: { top: 0, right: 70, bottom: 0, left: 50 },
      ratio: 9/16,
      area: false,
      axes: {
        x: {
          field: "ts",
          scale: "time",
          title: '',
          hideAxis: false,
          ticks: 10,
          removeTicks: value => false, //value === 0
        },
        y: {
          field: "value",
          extent: [0],
          title: ' weekly change',
          scale: "linear",
          grid: true,
          // ticks: 3,
          labelsPosition: 'inside',
          hideTicks: false,
          ticksFormat: '+,.0%',
          removeTicks: value => false, //value === 0
        }
      },
      labels: true,
      debug: true,
      gauge: true,
      markers: {
        visible: true,
        labelFormat: '+,.2%',
      }
    });
}
