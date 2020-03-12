tests = (data, id) => {

    alert();
    const $container = document.querySelector(`#${id}`);

    const createChart = (serie, target) => {

        const container = d3.selectAll(target);

    };

    const test_update = (data.italy.global[data.italy.global.length-1].tested - data.italy.global[data.italy.global.length-2].tested) * 100 / data.italy.global[data.italy.global.length-1].tested;
    
    
    const updated = moment(data.generated).format('dddd, MMMM Do YYYY, h:mm a');

    let html = `<div class="tests">
        <div class="tests-wrapper">
            <h4 class="tests-title">So far have been tested</h4>
            <3 class="tests-number">${d3.format('.2s')(data.italy.global[data.italy.global.length-1].tested)} <span class="tests-number-increment">${d3.format('+.2f')(test_update)}%<sup>*</sup></span>
        </div>
        <p class="counter-update last-update"><sup>*</sup> Compared to the previous day.<br />Last update: ${updated}.</p>
    </div>`;
    
    $container.innerHTML = html;

    $container.classList.remove('loading');
}