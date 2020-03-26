evolution = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const margins = { top: 20, right: 0, bottom: 40, left: 0 };
    const chartData = [];
    
    const prepareData = () => {
        data.italy.global.forEach((d, i) => {
            if (i === 0) {
                increment = 0;
            } else {
                increment = d.cases - data.italy.global[i - 1].cases;
            }
            if (increment > 0) {
                chartData.push({
                    x: moment(d.datetime).valueOf(),
                    y: (i === 0) ? 0 : increment,
                });
            }
        });
    }

    const reset = () => {
        console.log(chartData);
        const chartContainer = document.querySelector('#evolution-chart-container');
        const width = chartContainer.offsetWidth;
        const height = chartContainer.offsetHeight;
        const path = "M0,0 L10,40 L80, 200Z";

        const svg = d3.select('#evolution-chart-container')
            .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewbox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');

        const axis = svg
            .append('g')
            .append('line')
            .attr('class', 'evolution-chart-x-axis')
            .attr('x1', margins.left)
            .attr('x2', width - margins.right)
            .attr('y1', height - margins.bottom)
            .attr('y2', height - margins.bottom)

        const line = svg
            .append('g')
            .append('path')
            .attr('class', 'evolution-chart-path')
            .attr('d', path)


    }

    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');

    let html = `<div class="evolution">
        <div class="evolution-wrapper">
            <div class="evolution-chart-container" id="evolution-chart-container"></div>
        </div>
        <p class="counter-update last-update">Last update: ${updated}.</p>
    </div>`;
    
    prepareData();
    $container.innerHTML = html;
    reset();
    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}
