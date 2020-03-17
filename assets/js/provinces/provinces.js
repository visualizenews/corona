provincesMap = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  console.log("PROVINCES", data.italy.provinces);

  d3.json("/assets/maps/limits_IT_provinces.topo.json").then(topology => {
    new ProvincesMap($container, data.italy.provinces, topology);
  });

  $container.classList.remove("loading");
};

function ProvincesMap(container, data, topology, options = {}) {
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
    "reggio nell'emilia": "emilia-romagna",
    "l'aquila": "l-aquila",
    "valle d'aosta/vallée d'aoste": "valle-d-aosta",
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

  const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 900]);

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

      const provinceName = d.properties.prov_name.toLowerCase();
      const province = region[provinceMap[provinceName] || provinceName];
      return colorScale(province.cases);
    })
    .attr("stroke", "#222")
    .attr("stroke-width", 0.5);
}
