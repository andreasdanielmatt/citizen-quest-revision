function fitParentWidth($element) {
  // Add a css transform to the element to fit the width of its parent
  const parentWidth = $element.parent().width();
  const elementWidth = $element.width();
  const scale = parentWidth / elementWidth;
  if (scale < 1) {
    $element.css('transform', `scale(${scale})`);
  } else {
    $element.css('transform', '');
  }
}

module.exports = {
  fitParentWidth,
};
