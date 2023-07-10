/**
 * A jQuery plugin that resizes the given $element to fit its parent $element while
 * maintaining the specified aspect ratio.
 *
 * @param $element {HTMLElement} The $element to resize.
 * @param aspectRatio {number} The aspect ratio to keep.
 */
(function ($) {
  $.fn.fillWithAspect = function (aspectRatio) {
    const $parent = this.parent();
    const parentWidth = $parent.width();
    const parentHeight = $parent.height();
    const parentAspect = parentWidth / parentHeight;
    if (parentAspect > aspectRatio) {
      this.width(parentHeight * aspectRatio);
      this.height(parentHeight);
    } else {
      this.width(parentWidth);
      this.height(parentWidth / aspectRatio);
    }

    return this;
  };
}(jQuery));
