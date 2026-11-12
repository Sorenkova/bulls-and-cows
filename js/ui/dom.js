export const h = (tag, props = {}, ...children) => {
    const element = document.createElement(tag);
    Object.assign(element, props);
    element.append(...children);
    return element;
};
