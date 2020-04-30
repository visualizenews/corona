const toLocalText = (entry, obj) => {
    let text = entry;
    if (vocabulary[entry]) {
        text = vocabulary[entry];
    }
    if (obj) {
        const keys = Object.keys(obj);
        keys.forEach(k => {
            const re = new RegExp(`{${k}}`, 'g');
            text = text.replace(re, obj[k]);
        });
    }
    return text;
}

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
                    document.querySelector('.updated-timestamp').innerHTML = moment(input.data.generated).format(dateFormat.completeDateTime);
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