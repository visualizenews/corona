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
    const dataSource = '/data/2020';
    let data = {
        epicenters: [],
        generated: '2020-12-31 23:59:59',
        italy: {
            global: [],
            provinces: [],
            regions: [],
        },
        tested: [],
    };

    const enableCharts = () => {
        // console.log(chartObjects);
        if (chartObjects) {
            chartObjects.forEach(object => {
                if (typeof window[object.method] === 'function') {
                    // try {
                        window[object.method](data, object.id);
                    // } catch(e) {
                    //     console.log(`Error: ${e} on ${object.id}`);
                    // }
                }
            });
        }
    }

    const loadData = () => {
        const getItalia = () => {
            return axios.get(`${dataSource}/italia.json`);
        }

        const getRegioni = () => {
            return axios.get(`${dataSource}/regioni.json`);
        }

        // const getProvince = () => {
        //     return axios.get(`${dataSource}/province`);
        // }

        const getEpicentri = () => {
            return axios.get(`${dataSource}/epicenters.json`);
        }

        // const getVax = () => {
        //     return axios.get(`${dataSource}/vaccinazioni`);
        // }

        Promise.all([getItalia(), getRegioni(), getEpicentri()])
            .then(function (results) {
                if (!results[0].data.error) {
                    data.italy.global = results[0].data.italy.global;
                }
                if (!results[1].data.error) {
                    data.italy.regions = results[1].data.italy.regions;
                }
                if (!results[2].data.error) {
                    data.epicenters = results[2].data.int;
                }
                document.querySelector('.updated-timestamp').innerHTML = moment(data.generated).format(dateFormat.completeDateTime);
                document.querySelector('body').classList.remove('loading');
                console.log(data);
                enableCharts();
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