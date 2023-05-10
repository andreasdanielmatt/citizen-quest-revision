function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

module.exports = clone;
