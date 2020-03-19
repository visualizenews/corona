const sparkline = (serie, target, prefix) => {
    const container = d3.selectAll(target);
    const $container = document.querySelector(target);
    const chartWidth = $container.offsetWidth;
    const chartHeight = $container.offsetHeight;
    const hMargin = 0;

    const x = d3.scaleLinear()
        .domain([d3.min(serie, a => a.x), d3.max(serie, a => a.x)])
        .range([hMargin, chartWidth - hMargin]);

    const y = d3.scaleLinear()
        .domain([d3.max(serie, a => a.y), d3.min(serie, a => a.y)])
        .range([0, chartHeight]);

    container
        .append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .append('path')
            .datum(serie)
            .attr('class', `${prefix}-line`)
            .attr('fill', 'none')
            .attr('d', d3.line()
                .x(d => x(d.x))
                .y(d => y(d.y))
            );
}