const sparkline = (serie, target, prefix, maxY = null, fill = false, yProp = 'y') => {
    const container = d3.selectAll(target);
    const $container = document.querySelector(target);
    const chartWidth = $container.offsetWidth;
    const chartHeight = $container.offsetHeight;
    const hMargin = 0;

    if (fill) {
        const minY = Math.min(... serie.map(s => s[yProp] || false));
        const minX = Math.min(... serie.map(s => s.x));
        const maxX = Math.max(... serie.map(s => s.x));

        console.log(minY, minX, maxX);

        serie.unshift({ x: minX, [yProp]: minY});
        serie.push({ x: maxX, [yProp]: minY });

        console.log('serie', serie);
    }

    const scaleX = d3.scaleLinear()
        .domain([d3.min(serie, a => a.x), d3.max(serie, a => a.x)])
        .range([hMargin, chartWidth - hMargin]);

    let chartMaxY = (maxY === false || maxY === null) ? d3.max(serie, a => a[yProp]) : maxY;
    const scaleY = d3.scaleLinear()
        .domain([chartMaxY, d3.min(serie, a => a[yProp])])
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
                .x(d => scaleX(d.x))
                .y(d => scaleY(d[yProp]))
            );
}