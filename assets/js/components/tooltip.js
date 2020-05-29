const Tooltip = (container, id) => {
    const elementId = id;
    const tooltip = document.createElement('div')
        tooltip.classList.add('tooltip');
        tooltip.id = `${elementId}-tooltip`;
        container.appendChild(tooltip);

    const innerContent = document.createElement('div');
    innerContent.classList.add('tooltip-inner');
    tooltip.appendChild(innerContent);

    return {
        show: (content, x, y, position, theme) => {
            if (!theme) theme = 'default';
            innerContent.innerHTML = content;
            if(this.y == null || this.y !== y) {
              tooltip.style.top = `${y}px`;
              this.y = y;
            }
            if(this.x == null || this.x !== x) {
              tooltip.style.left = `${x}px`;
              this.x = x;
            }
            tooltip.classList.add(position);
            tooltip.classList.add(`theme-${theme}`);
            tooltip.classList.add('tooltip-visible');
        },
        hide: () => {
            tooltip.classList.value = 'tooltip';
            innerContent.innerHTML = '';
        }
    }
}
