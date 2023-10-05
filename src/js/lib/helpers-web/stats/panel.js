/**
 * Based on https://github.com/mrdoob/stats.js
 * Copyright (c) 2009-2016 stats.js authors
 * Licensed under the The MIT License
 *
 * adapted by Eric Londaits for IMAGINARY gGmbH (c) 2023
 */

const PR = Math.round(window.devicePixelRatio || 1);
const WIDTH = 80 * PR;
const HEIGHT = 48 * PR;
const TEXT_X = 3 * PR;
const TEXT_Y = 2 * PR;
const GRAPH_X = 3 * PR;
const GRAPH_Y = 15 * PR;
const GRAPH_WIDTH = 74 * PR;
const GRAPH_HEIGHT = 30 * PR;

class Panel {
  constructor(name, fg, bg) {
    this.name = name;
    this.fg = fg;
    this.bg = bg;

    this.min = Infinity;
    this.max = 0;

    this.canvas = document.createElement('canvas');
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.canvas.style.cssText = 'width:80px;height:48px';

    this.context = this.canvas.getContext('2d');
    this.context.font = `bold ${9 * PR}px Helvetica,Arial,sans-serif`;
    this.context.textBaseline = 'top';
    this.context.fillStyle = this.bg;
    this.context.fillRect(0, 0, WIDTH, HEIGHT);
    this.context.fillStyle = this.fg;
    this.context.fillText(this.name, TEXT_X, TEXT_Y);
    this.context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    this.dom = this.canvas;
  }

  update(value, maxValue) {
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, WIDTH, GRAPH_Y);
    this.context.fillStyle = this.fg;
    this.context.fillText(
      `${Math.round(value)} ${this.name} (${Math.round(this.min)}-${Math.round(this.max)})`,
      TEXT_X,
      TEXT_Y
    );

    this.context.drawImage(
      this.canvas,
      GRAPH_X + PR,
      GRAPH_Y,
      GRAPH_WIDTH - PR,
      GRAPH_HEIGHT,
      GRAPH_X,
      GRAPH_Y,
      GRAPH_WIDTH - PR,
      GRAPH_HEIGHT
    );

    this.context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(
      GRAPH_X + GRAPH_WIDTH - PR,
      GRAPH_Y,
      PR,
      Math.round((1 - (value / maxValue)) * GRAPH_HEIGHT)
    );
  }
}

module.exports = Panel;
