regionsComparison = (data, id) => {
  const $container = document.querySelector(`#${id}`);

  const regionsData = {}
  data.italy.regions.forEach(r => {
    Object.entries(r.data).forEach(d => {
      if (!regionsData[d[0]]) {
        regionsData[d[0]] = {
          id: d[0],
          data: []
        };
      }
      regionsData[d[0]].data = [
        ...regionsData[d[0]].data,
        {
          date: r.datetime,
          ...d[1]
        }
      ];
    });
  });

  new RegionsComparison($container, regionsData);

  $container.classList.remove("loading");
};

function RegionsComparison(container, data, options = {}) {

  console.log(data)

  const regions = d3.select(container)
    .selectAll('div.region-container')
    .data(Object.values(data))
    .join('div')
      .attr('class','region-container')

  regions
    .append("h4")
    .text(d => d.id)
}
