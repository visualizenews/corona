(() => {
    const dataSource = 'https://corona.elezioni.io/data';
    let data = {};
    const $chartContainer = document.querySelector('#charts-container');

    const drawCharts = () => {
        setTimeout(
            () => {
                $chartContainer.classList.remove('loading');
            },
            1500);
    }
    
    const prepareCharts = () => {
        console.log('DATA LOADED', data);
        drawCharts();
    }
    
    const loadData = async () => {
        fetch(dataSource)
            .then(response => {
                return response.json();
            })
            .then(input => {
                if (!input.error) {
                    data = input.data;
                    prepareCharts();
                } else {
                    alert(input.message);
                }
            });
    }

    const init = async () => {
        await loadData();
    }

    init();
})();