provincesMap = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  console.log("PROVINCES", data.italy.provinces);

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

function ProvincesMap(container, data, topology, provincesInfo, options = {}) {
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
    "forlì-cesena": "forl-cesena",
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
  console.log(topology);
  const geo = topojson.feature(topology, topology.objects.provinces);
  const projection = d3.geoMercator().fitSize([this.width, this.height], geo),
    path = d3.geoPath(projection),
    bb = path.bounds(geo);

  console.log(geo);

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

    return province.cases / provincesInfo[provinceName].value;
  })
  console.log(percExtent)
  const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0,0.002]);

  svg
    .append("g")
    .selectAll("path")
    .data(geo.features)
    .enter()
    .append("path")
    .attr("id", d => d.properties.prov_name)
    .attr("d", path)
    .attr("fill", d => {
      const regionName = d.properties.reg_name.toLowerCase();

      const region = provincesData[regionsMap[regionName] || regionName];

      let provinceName = d.properties.prov_name.toLowerCase();
      provinceName = provinceMap[provinceName] || provinceName
      const province = region[provinceName];

      return colorScale(province.cases / provincesInfo[provinceName].value);
    })
    .attr("stroke", "#222")
    .attr("stroke-width", 0.5);
}
