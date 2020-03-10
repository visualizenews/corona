const main = () => {
    const dataSource = 'https://corona.elezioni.io/data';
    let data = {};

    const enableCharts = () => {
        if (chartObjects) {
            chartObjects.forEach(object => {
                if (typeof window[object.method] === 'function') {
                    window[object.method](data, object.id);
                }
            });
        }
    }

    const loadData = () => {
        document.querySelector('body').classList.remove('loading');
        fetch(dataSource)
            .then(response => {
                return response.json();
            })
            .then(input => {
                if (!input.error) {
                    data = input.data;
                    document.querySelector('.updated-timestamp').innerHTML = moment(input.data.generated).format('dddd, MMMM Do YYYY, h:mm a');
                    enableCharts();
                } else {
                    alert(input.message);
                }
            });
    }
    loadData();
};

const ready = () => {
    if (document.readyState != 'loading') {
        main();
    } else {
        document.addEventListener('DOMContentLoaded', main);
    }
};

ready();