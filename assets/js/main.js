(() => {
    const dataSource = 'https://corona.elezioni.io/data';
    let data = {};

    const enableCharts = () => {
        if (chartObjects) {
            chartObjects.forEach(object => {
                console.log('object', object);
                console.log('object', typeof window[object.method], object.method, object.id);
                if (typeof window[object.method] === 'function') {
                    console.log('object', object.method);
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
                    enableCharts();
                } else {
                    alert(input.message);
                }
            });
    }

    const ready = fn => {
        if (document.readyState != 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(loadData);
})();