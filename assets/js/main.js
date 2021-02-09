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
    let data = {
        epicenters: [],
        generated: '',
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
            return axios.get(`${dataSource}/italia`);
        }

        const getRegioni = () => {
            return axios.get(`${dataSource}/regioni`);
        }

        const getRegioni2020 = () => {
            return axios.get(`${dataSource}/regioni2020`);
        }

        const getProvince = () => {
            return axios.get(`${dataSource}/province`);
        }

        const getEpicentri = () => {
            return axios.get(`${dataSource}/epicentri`);
        }

        // const getVax = () => {
        //     return axios.get(`${dataSource}/vaccinazioni`);
        // }

        Promise.all([getItalia(), getRegioni(), getProvince(), getRegioni2020()])
            .then(function (results) {
                if (!results[0].data.error) {
                    data.italy.global = results[0].data.data.italy.global;
                    data.tested = results[0].data.data.tested;
                    data.generated = results[0].data.data.generated;
                }
                if (!results[1].data.error) {
                    data.italy.regions = results[1].data.data.italy.regions;
                    data.generated = results[0].data.data.generated;
                }
                if (!results[2].data.error) {
                    data.italy.provinces = results[2].data.data.italy.provinces;
                    data.generated = results[0].data.data.generated;
                }
                // if (!results[3].data.error) {
                //     data.italy.vax = results[3].data.data.italy.vax;
                //     data.generated = results[0].data.data.generated;
                // }
                if (!results[3].data.error) {
                    data.italy.regions = data.italy.regions.concat(results[3].data.data.italy.regions).sort((a,b) => a.datetime > b.datetime ? 1 : -1);
                    data.generated = results[0].data.data.generated;
                }
                document.querySelector('.updated-timestamp').innerHTML = moment(data.generated).format(dateFormat.completeDateTime);
                document.querySelector('body').classList.remove('loading');
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