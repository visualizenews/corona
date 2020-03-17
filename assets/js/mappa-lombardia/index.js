lombardyMap = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    let geodata = {};

    const loadData = async () => {
        const rawdata = await d3.json('/assets/json/lombardia.geojson');
        geodata = rawdata.features;
        console.log(geodata);

        drawMap();
        window.addEventListener('resize', reset.bind(this));
        $container.classList.remove('loading');
    }

    const drawMap = () => {
        const width = $container.querySelector('#lombardyMap-map').offsetWidth;
        const svg = d3.create("svg")
            .attr('viewBox', [0, 0, width, width])
            .attr('width', width)
            .attr('height', width)
/*
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .join("path")
            .attr("fill", d => color(data.get(d.id)))
            .attr("d", path)
            .append("title")
            .text(d => `${d.properties.name}, ${states.get(d.id.slice(0, 2)).name}
        ${format(data.get(d.id))}`);

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);

*/
    }

    const reset = () => {
        $container.classList.add('loading');
        $container.querySelector('#lombardyMap-map').innerHTML = '';
        drawMap();
        $container.classList.remove('loading');
    }
    
    let html = `<div id="lombardyMap-map"></div>`;
    
    $container.innerHTML = html;

    // loadData();
    // poi toglilo
    $container.classList.remove('loading');
}