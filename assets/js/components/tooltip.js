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
            tooltip.style.top = `${y}px`;
            tooltip.style.left = `${x}px`;
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