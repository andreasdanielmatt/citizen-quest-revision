const Stats = require('stats.js');

class PingStats {
  constructor() {
    this.panel = new Stats.Panel('ping', '#ff8', '#221');
    this.lastTime = Date.now();
    this.max = 0;
    this.elapsed = 0;
  }

  update() {
    const now = Date.now();
    const ping = now - this.lastTime;
    this.lastTime = now;
    this.max = Math.max(this.max, ping);
    this.elapsed += ping;
    if (this.elapsed > 1000) {
      this.panel.update(this.max, 300);
      this.max = 0;
      this.elapsed = 0;
    }
  }
}

module.exports = PingStats;
