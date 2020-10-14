dayComparison = (data, id) => {
  const $container = document.querySelector(`#${id}`);
  const chartData = {};

  const prepareData = () => {
  }

  const reset = () => {
    $container.classList.add('loading');
    document.querySelector('#dayComparison-chart-container').innerHTML = '';
    drawChart();
    $container.classList.remove('loading');
  }

  const drawChart = () => {

  };

  if ($container) {
      const html = `<div class="dayComparison-chart-container" id="dayComparison-chart-container"></div>`;
      prepareData();
      $container.innerHTML = html;
      reset();
      window.addEventListener('resize', reset.bind(this));
  }
}
