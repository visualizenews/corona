heatmap = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');
    const chartData = [];
    const purpleColors = ['#f7f7f7', '#ffd6db', '#ffb6c1', '#ff93a7', '#ff6b8c', '#ff2e71'];

    const reset = () => {
        const chartContainer = document.querySelector('#heatmap-wrapper');
        chartContainer.innerHTML = '';
        drawHeatmap();
        $container.classList.remove('loading');
    }

    const prepareData = () => {
        console.log(data.italy.global[0]);
        
        data.italy.global.forEach((d, i) => {
            chartData.push({
                datetime: moment(d.datetime).valueOf(),
                increment_deaths: (i > 0) ? d.deaths - data.italy.global[i-1].deaths : d.deaths,
                increment_active: (d.cases - d.deaths - d.recovered), //(i > 0) ? d.cases - d.deaths - d.recovered - (data.italy.global[i-1].cases - data.italy.global[i-1].deaths - data.italy.global[i-1].recovered) : 0,
            });
        });
    }

    const drawHeatmap = () => {
        const colorScaleClusters = d3.scaleCluster().domain(chartData.map(d => d.increment_deaths)).range(purpleColors).clusters();
        var colorScale = d3.scaleThreshold()
          .domain(colorScaleClusters)
          .range(purpleColors);
        console.log(colorScale(1), colorScale(10), colorScale(20), colorScale(1000));
        const x = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.increment_active)])
            .range([5, 50]);
        const wrapper = d3.select('#heatmap-wrapper');
        wrapper.selectAll('div')
            .data(chartData)
                .enter()
                    .append('div')
                        .attr('class', 'heatmap-day')
                        .attr('style', d => `height: ${Math.max(Math.floor(x(d.increment_active)),1)}px;flex: 0 0 ${Math.max(Math.floor(x(d.increment_active)),1)}px; background-color:${colorScale(d.increment_deaths)}`);
    }

    let html = `<div class="heatmap">
        <div class="heatmap-wrapper" id="heatmap-wrapper">
            
        </div>
        <p class="counter-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;
    prepareData();
    window.addEventListener('resize', reset.bind(this));
    reset();
}
