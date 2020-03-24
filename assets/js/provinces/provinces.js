provincesMap = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  const $div = document.createElement('div');
  $container.appendChild($div);

  // console.log("PROVINCES", data.italy.provinces);

  d3.json("/assets/maps/limits_IT_provinces.topo.json").then(topology => {
    d3.json("/assets/json/province.json").then(provinces => {
      const provincesInfo = {};
      provinces.forEach(province => {
        if(!provincesInfo[province.id]) {
          provincesInfo[province.id] = province;
        }
      })
      new ProvincesMap($div, data.italy.provinces, topology, provincesInfo);
    })
  });

  $container.classList.remove("loading");
};

function ramp(color, n = 256) {
  const canvas = document.createElement('canvas');// DOM.canvas(n, 1);
  canvas.width = n;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}

function ProvincesMap(container, data, topology, provincesInfo, options = {}) {
  const margin = {
    left:0,
    top: 0,
    right: 0,
    bottom: 0,
  }

  console.log('ProvincesMap',data)
  const regionsMap = {
    "valle d'aosta/vallée d'aoste": "valle-d-aosta",
    "trentino-alto adige/südtirol": "trentino-alto-adige",
    "friuli-venezia giulia": "friuli-venezia-giulia"
  };
  const provinceMap = {
    "bolzano/bozen": "bolzano",
    "sud sardegna": "sud-sardegna",
    "reggio di calabria": "reggio-di-calabria",
    "vibo valentia": "vibo-valentia",
    "pesaro e urbino": "pesaro-e-urbino",
    "ascoli piceno": "ascoli-piceno",
    "forlì-cesena": "forli-cesena",
    "monza e della brianza": "monza-e-della-brianza",
    "reggio nell'emilia": "reggio-nell-emilia",
    "l'aquila": "l-aquila",
    "valle d'aosta/vallée d'aoste": "aosta",
    "la spezia": "la-spezia"
  };
  const latestData = data[data.length - 1].data;
  const provincesData = {
    ...latestData,
    "trentino-alto-adige": { ...latestData.trento, ...latestData.bolzano }
  };

  this.width = container.getBoundingClientRect().width;
  this.height = this.width * 1.5;
  //console.log(topology);
  const geo = topojson.feature(topology, topology.objects.provinces);
  const projection = d3.geoMercator().fitSize([this.width, this.height], geo),
    path = d3.geoPath(projection),
    bb = path.bounds(geo);

  //console.log(geo);

  const w = bb[1][0] - bb[0][0],
    h = bb[1][1] - bb[0][1],
    x = bb[0][0],
    y = bb[0][1];

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .attr("viewBox", `${x} ${y} ${w} ${h}`);
  const percs = geo.features.map(d => {
    const regionName = d.properties.reg_name.toLowerCase();

    const region = provincesData[regionsMap[regionName] || regionName];

    let provinceName = d.properties.prov_name.toLowerCase();
    provinceName = provinceMap[provinceName] || provinceName
    const province = region[provinceName];
    if(!province) {
      console.log(provinceName, region)
    }
    province.perc = province.cases / provincesInfo[provinceName].value;
    d.properties.perc = province.cases / provincesInfo[provinceName].value;
    return province.perc;
  });
  const percExtent = d3.extent(percs);
  // console.log('percExtent', percExtent)
  // const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0,0.002]);

  const caseExtent = d3.extent(geo.features, d => {
    const regionName = d.properties.reg_name.toLowerCase();

    const region = provincesData[regionsMap[regionName] || regionName];

    let provinceName = d.properties.prov_name.toLowerCase();
    provinceName = provinceMap[provinceName] || provinceName
    const province = region[provinceName];
    if(!province) {
      console.log(provinceName, region)
    }
    //province.perc = province.cases / provincesInfo[provinceName].value;
    d.properties.cases = province.cases;// / provincesInfo[provinceName].value;
    return province.cases;
  })

  //console.log('--->',n)

  const legendProps = {
    top: 20,
    left: -10,
    width: 150,
    height: 10,
    ticks: 6,
    tickValues: [0.0001, 0.0005, 0.001, 0.0025, 0.005, Math.round(percExtent[1]* 1000)/1000],
    //tickValues: [1, 10, 100, 10000, 50000],
    tickSize: 10,
    tickFormat: (d) => {
      const tick = d3.format(",.0f")(d * 10000);
      return tick;
      return `${d>=0.006?'>':''}${tick}`;
    },
    title: "Cases per 10,000 people"
  }
  const purpleColors = ["#2F4858", "#34537C", "#5C5798", "#9651A2", "#D13F95", "#FF2E71"];
  const purpleColors2 = ['#f7f7f7', '#ffd6db', '#ffb6c1', '#ff93a7', '#ff6b8c', '#ff2e71'];
  //const colorScale = d3.scaleQuantile(percs, d3.schemePuRd[legendProps.ticks])
  const colorScale = d3.scaleQuantile(percs, purpleColors2)
  //const colorScale = d3.scaleCluster().domain(percs).range(purpleColors2);
  // const colorScale = d3.scaleThreshold(legendProps.tickValues, d3.schemePuRd[legendProps.ticks]);
  // const colorScale = d3.scaleLog(caseExtent, [d3.schemePuRd[legendProps.ticks][0], d3.schemePuRd[legendProps.ticks][4]])
  // console.log('QUANTIZE', colorScale.ticks())
  console.log('QUANTILES', colorScale.quantiles())
  // console.log('CLUSTERS', colorScale.clusters())
  const quantiles = [...new Set([...colorScale.quantiles()])];
  /// const clusters = [...new Set([...colorScale.clusters()])];
  // var threshold = d3.scaleThreshold()
  //   .domain([0.11, 0.22, 0.33, 0.50])
  //   .range(["#6e7c5a", "#a0b28f", "#d8b8b3", "#b45554", "#760000"]);
  // const xTick = d3.scaleLog().domain(caseExtent).range([0, legendProps.width]);

  const xTick = d3.scaleLinear(d3.extent(quantiles), [0, legendProps.width]);
  // const xTick = d3.scaleLinear(d3.extent(clusters), [0, legendProps.width]);


  // const xTick = colorScale.copy().domain([0, legendProps.width]);
  const legend = svg.append("g")
        .attr("class","map-legend")
        .attr("transform", `translate(${this.width - (legendProps.width + margin.right) + legendProps.left},${margin.top + legendProps.top})`)
        // .attr("x", this.width - (legendProps.width + margin.right))
        // .attr("y", margin.top + legendProps.top);

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", margin.top + margin.bottom - legendProps.height);
  legend.append("g")
      .attr("transform", `translate(0,${legendProps.height})`)
      .call(
        d3.axisBottom(xTick)
          //.ticks(legendProps.ticks, typeof legendProps.tickFormat === "string" ? legendProps.tickFormat : undefined)
          .tickFormat(typeof legendProps.tickFormat === "function" ? legendProps.tickFormat : undefined)
          .tickSize(legendProps.tickSize)
          .tickValues(quantiles)
          // .tickValues(clusters)
      )
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top + margin.bottom - legendProps.height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(legendProps.title))
      .call(g => {
        g.selectAll('.tick')
          .append('rect')
          .attr("x", 0)
          .attr("y", margin.top + margin.bottom - legendProps.height)
          .attr("width", (d,i) => {
            // console.log('i', i, d)
            if(quantiles[i + 1]) {
              return xTick(quantiles[i + 1]) - xTick(d);
            }
            // if(clusters[i + 1]) {
            //   return xTick(clusters[i + 1]) - xTick(d);
            // }

          })
          .attr("height", legendProps.height)
          .attr('fill', d => {
          //  console.log('------>', d, xTick(d));
            return colorScale(d)
          })
      })
  //console.log(geo.features)

  const paths = svg
    .append("g")
    .selectAll("path")
    .data(geo.features)
    .enter()
    .append("path")
    .attr("id", d => d.properties.prov_name)
    .attr("d", path)
    .attr("fill", d => {
      return colorScale(d.properties.perc);
    })
    .attr("data-perc", d => d.properties.perc)
    .attr("stroke", "#222")
    .attr("stroke-width", 0.5);

  const updateMap = () => {
    const projection = d3.geoMercator().fitSize([this.width, this.height], geo),
      path = d3.geoPath(projection),
      bb = path.bounds(geo);

    const w = bb[1][0] - bb[0][0],
      h = bb[1][1] - bb[0][1],
      x = bb[0][0],
      y = bb[0][1];

    //console.log(this.width,'x',this.height)
    svg.attr("width", this.width)
       .attr("height", this.height)
        .attr("viewBox", `${x} ${y} ${w} ${h}`);
    paths.attr("d", path)

    legend.attr("transform", `translate(${this.width - (legendProps.width + margin.right) + legendProps.left},${margin.top + legendProps.top})`)
    legend.select("image")
      .attr("width", legendProps.width)
      //.attr("xlink:href", ramp(colorScale.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  if(typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === container) {
          const cr = entry.contentRect;
          if (cr.width !== this.width) {
            this.width = cr.width;
            this.height = this.width * 1.5;
            updateMap();
          }
        }
      }
    });

    // Observe one or multiple elements
    ro.observe(container);
  }


}
