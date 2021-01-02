const sparkline = (serie, target, prefix, maxY = false, fill = false) => {
    const container = d3.selectAll(target);
    const $container = document.querySelector(target);
    const chartWidth = $container.offsetWidth;
    const chartHeight = $container.offsetHeight;
    const hMargin = 0;

    const minX = d3.min(serie, a => a.x);
    const maxX = d3.max(serie, a => a.x);
    const minY = d3.min(serie, a => a.y);

    const x = d3.scaleLinear()
        .domain([minX, maxX])
        .range([hMargin, chartWidth - hMargin]);

    let chartMaxY = (maxY === false) ? d3.max(serie, a => a.y) : maxY;

    const y = d3.scaleLinear()
        .domain([chartMaxY, minY])
        .range([0, chartHeight]);

    const svg = container
        .append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight);
    svg.append('path')
            .datum(serie)
            .attr('class', `${prefix}-line`)
            .attr('fill', 'none')
            .attr('d', d3.line()
                .x(d => x(d.x))
                .y(d => y(d.y))
            );
    if (fill) {
        const fillSerie = serie.splice(0);
        const firstPoint = { x: minX, y: minY };
        const lastPoint = { x: maxX, y: minY };
        fillSerie.unshift(firstPoint);
        fillSerie.push(lastPoint);
        svg.append('path')
            .datum(fillSerie)
            .attr('class', `${prefix}-fill`)
            .attr('fill', '#fff')
            .attr('d', d3.line()
                .x(d => x(d.x))
                .y(d => y(d.y))
            );
    }
}