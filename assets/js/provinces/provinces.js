provincesMap = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  // console.log("PROVINCES", data.italy.provinces);

  d3.json("/assets/maps/limits_IT_provinces.topo.json").then(topology => {
    d3.json("/assets/json/province.json").then(provinces => {
      const provincesInfo = {};
      provinces.forEach(province => {
        if(!provincesInfo[province.id]) {
          provincesInfo[province.id] = province;
        }
      })
      new ProvincesMap($container, data.italy.provinces, topology, provincesInfo);
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

  const percExtent = d3.extent(geo.features, d => {
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
  })
  //console.log(percExtent)
  // const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0,0.002]);

  //console.log('--->',n)

  const legendProps = {
    top: 20,
    left: -10,
    width: 150,
    height: 10,
    ticks: 5,
    tickSize: 10,
    tickFormat: (d) => {
      const tick = d3.format(",.0f")(d * 10000);
      return `${d>=0.001?'>':''}${tick}`;
    },
    title: "Cases per 10,000 people"
  }
  const colorScale = d3.scaleQuantize([0, 0.001], d3.schemePuRd[legendProps.ticks])
  const xTick = colorScale.copy().range(d3.quantize(d3.interpolate(0, legendProps.width), legendProps.ticks + 1));
  const legend = svg.append("g")
        .attr("class","map-legend")
        .attr("transform", `translate(${this.width - (legendProps.width + margin.right) + legendProps.left},${margin.top + legendProps.top})`)
        // .attr("x", this.width - (legendProps.width + margin.right))
        // .attr("y", margin.top + legendProps.top);

  legend.append("image")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendProps.width)
        .attr("height", legendProps.height)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(colorScale.copy().domain(d3.quantize(d3.interpolate(0, 1), 2))).toDataURL());
  //console.log(xTick.ticks())
  let tickAdjust = g => g.selectAll(".tick line").attr("y1", margin.top + margin.bottom - legendProps.height);
  legend.append("g")
      .attr("transform", `translate(0,${legendProps.height})`)
      .call(d3.axisBottom(xTick)
        .ticks(legendProps.ticks, typeof legendProps.tickFormat === "string" ? legendProps.tickFormat : undefined)
        .tickFormat(typeof legendProps.tickFormat === "function" ? legendProps.tickFormat : undefined)
        .tickSize(legendProps.tickSize)
        //.tickValues(xTick.ticks())
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
