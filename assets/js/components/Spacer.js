const Spacer = (properties) => {
  const {target, data, className, text} = properties;
  const chartContainer = document.querySelector(target);
  const width = chartContainer.offsetWidth;
  const height = chartContainer.offsetHeight;

  const minVal = d3.min(data, d => d.y);
  const maxVal = d3.max(data, d => d.y);

  const y = d3.scaleLinear()
      .domain([-maxVal, maxVal])
      .range([height, 0]);
  
  const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, width]);

  const container = d3.select(target);
  const svg = container
      .append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('viewbox', `0 0 ${width} ${height}`)
          .attr('preserveAspectRatio', 'xMidYMid meet');

  const curve = d3.curveCatmullRom.alpha(.5);
  const keys = ['y'];  
  const stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(keys)(data);

  const path = d3.area()
    .curve(curve)
    .x(d => x(d.data.x))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  svg
      .selectAll('.layer')
      .data(stackedData)
      .enter()
        .append('path')
        .attr('class', `spacer-chart-area spacer-chart-area-${className}`)
        .attr('d', path);

  container
      .append('div')
      .attr('class', `spacer-chart-label spacer-chart-label-${className}`)
      .text(`${d3.format(',')(data[data.length - 1].y)} ${text} as of ${moment(data[data.length - 1].x).format('DD/MM')}`)

}