const sparkline = (serie, target, prefix, maxY = false, fill = false) => {
    const container = d3.selectAll(target);
    const $container = document.querySelector(target);
    const chartWidth = $container.offsetWidth;
    const chartHeight = $container.offsetHeight;
    const hMargin = 0;

    if (fill) {
        const minY = Math.min(... serie.map(s => s.y));
        const minX = Math.min(... serie.map(s => s.x));
        const maxX = Math.max(... serie.map(s => s.x));
        serie.unshift({ x: minX, y: minY});
        serie.push({ x: maxX, y: minY });
    }

    const x = d3.scaleLinear()
        .domain([d3.min(serie, a => a.x), d3.max(serie, a => a.x)])
        .range([hMargin, chartWidth - hMargin]);

    let chartMaxY = (maxY === false) ? d3.max(serie, a => a.y) : maxY;
    const y = d3.scaleLinear()
        .domain([chartMaxY, d3.min(serie, a => a.y)])
        .range([0, chartHeight]);

    container
        .append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .append('path')
            .datum(serie)
            .attr('class', `${prefix}-line`)
            .attr('fill', fill ? '#fff' : 'none')
            .attr('d', d3.line()
                .x(d => x(d.x))
                .y(d => y(d.y))
            );
}