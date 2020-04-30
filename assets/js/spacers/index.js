recoveredSpacer = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartData = [];
    
    const prepareData = () => {
        data.italy.global.forEach((d, i) => {
            chartData.push({
                x: moment(d.datetime).valueOf(),
                y: d.recovered,
            });
        });
    }

    const reset = () => {
        const chartContainer = document.querySelector('#recovered-spacer-chart-container');
        chartContainer.innerHTML = '';

        Spacer({
            text: toLocalText('recovered'),
            target: '#recovered-spacer-chart-container',
            maxY: data.italy.global[data.italy.global.length - 1].tested,
            data: chartData,
            className: 'recovered',
        });
    }

    let html = `<div class="spacer-chart-container" id="recovered-spacer-chart-container"></div>`;
    
    prepareData();
    $container.innerHTML = html;
    reset();
    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}

deathSpacer = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartData = [];
    
    const prepareData = () => {
        data.italy.global.forEach((d, i) => {
            chartData.push({
                x: moment(d.datetime).valueOf(),
                y: d.deaths,
            });
        });
    }

    const reset = () => {
        const chartContainer = document.querySelector('#death-spacer-chart-container');
        chartContainer.innerHTML = '';
        Spacer({
            text: toLocalText('fatalities'),
            target: '#death-spacer-chart-container',
            maxY: data.italy.global[data.italy.global.length - 1].tested,
            data: chartData,
            className: 'death',
        });
    }

    let html = `<div class="spacer-chart-container" id="death-spacer-chart-container"></div>`;
    
    prepareData();
    $container.innerHTML = html;
    reset();
    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}

hospitalizedSpacer = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartData = [];
    
    const prepareData = () => {
        data.italy.global.forEach((d, i) => {
            chartData.push({
                x: moment(d.datetime).valueOf(),
                y: d.hospital,
            });
        });
    }

    const reset = () => {
        const chartContainer = document.querySelector('#hospital-spacer-chart-container');
        chartContainer.innerHTML = '';
        Spacer({
            text: toLocalText('hospitalized'),
            target: '#hospital-spacer-chart-container',
            maxY: data.italy.global[data.italy.global.length - 1].tested,
            data: chartData,
            className: 'hospital',
        });
    }

    let html = `<div class="spacer-chart-container" id="hospital-spacer-chart-container"></div>`;
    
    prepareData();
    $container.innerHTML = html;
    reset();
    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}

quarantinedSpacer = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartData = [];
    const prepareData = () => {
        data.italy.global.forEach((d, i) => {
            chartData.push({
                x: moment(d.datetime).valueOf(),
                y: d.quarantinized,
            });
        });
    }

    const reset = () => {
        const chartContainer = document.querySelector('#quarantined-spacer-chart-container');
        chartContainer.innerHTML = '';
        Spacer({
            text: toLocalText('quarantined'),
            target: '#quarantined-spacer-chart-container',
            maxY: data.italy.global[data.italy.global.length - 1].tested,
            data: chartData,
            className: 'quarantined',
        });
    }

    let html = `<div class="spacer-chart-container" id="quarantined-spacer-chart-container"></div>`;
    
    prepareData();
    $container.innerHTML = html;
    reset();
    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}

totalSpacer = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartData = [];
    const prepareData = () => {
        data.italy.global.forEach((d, i) => {
            chartData.push({
                x: moment(d.datetime).valueOf(),
                y: d.cases,
            });
        });
    }

    const reset = () => {
        const chartContainer = document.querySelector('#total-spacer-chart-container');
        chartContainer.innerHTML = '';
        Spacer({
            text: toLocalText('totalCases'),
            target: '#total-spacer-chart-container',
            maxY: data.italy.global[data.italy.global.length - 1].tested,
            data: chartData,
            className: 'total',
        });
    }

    let html = `<div class="spacer-chart-container" id="total-spacer-chart-container"></div>`;
    
    prepareData();
    $container.innerHTML = html;
    reset();
    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}

testedSpacer = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartData = [];
    const prepareData = () => {
        data.italy.global.forEach((d, i) => {
            chartData.push({
                x: moment(d.datetime).valueOf(),
                y: d.tested,
            });
        });
    }

    const reset = () => {
        const chartContainer = document.querySelector('#tested-spacer-chart-container');
        chartContainer.innerHTML = '';
        Spacer({
            text: toLocalText('tested'),
            target: '#tested-spacer-chart-container',
            maxY: data.italy.global[data.italy.global.length - 1].tested,
            data: chartData,
            className: 'total',
        });
    }

    let html = `<div class="spacer-chart-container" id="tested-spacer-chart-container"></div>`;
    
    prepareData();
    $container.innerHTML = html;
    reset();
    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}

newSpacer = (data, id) => {
    const $container = document.querySelector(`#${id}`);
    const chartData = [];
    const prepareData = () => {
        data.italy.global.forEach((d, i) => {
            chartData.push({
                x: moment(d.datetime).valueOf(),
                y: (i === 0) ? 0 : d.cases - data.italy.global[i - 1].cases,
            });
        });
    }

    const reset = () => {
        const chartContainer = document.querySelector('#new-spacer-chart-container');
        chartContainer.innerHTML = '';
        Spacer({
            text: toLocalText('newCases'),
            target: '#new-spacer-chart-container',
            maxY: data.italy.global[data.italy.global.length - 1].tested,
            data: chartData,
            className: 'new',
        });
    }

    let html = `<div class="spacer-chart-container" id="new-spacer-chart-container"></div>`;
    
    prepareData();
    $container.innerHTML = html;
    reset();
    window.addEventListener('resize', reset.bind(this));
    $container.classList.remove('loading');
}