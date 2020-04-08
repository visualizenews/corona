const Annotation = (container, id) => {
    const elementId = id;
    const annotation = document.createElement('div')
        annotation.classList.add('annotation');
        annotation.id = `${elementId}-annotation`;
        container.appendChild(annotation);

    const innerContent = document.createElement('div');
    innerContent.classList.add('annotation-inner');
    annotation.appendChild(innerContent);

    return {
        show: (content, x, y, position, theme) => {
            if (!theme) theme = 'default';
            innerContent.innerHTML = content;
            annotation.style.top = `${y}px`;
            annotation.style.left = `${x}px`;
            annotation.classList.add(position);
            annotation.classList.add(`theme-${theme}`);
            annotation.classList.add('annotation-visible');
        },
        hide: () => {
            annotation.classList.value = 'annotation';
            innerContent.innerHTML = '';
        }
    }
}