class StorylineManager {
  constructor(config) {
    this.config = config;
  }

  getAll() {
    const ids = Object.keys(this.config?.storylines || {});
    if (ids.length === 0) {
      throw new Error('Error: No storylines defined in config');
    }
    return ids;
  }

  getFirst() {
    const ids = this.getAll();
    return ids[0] ?? null;
  }

  getNext(storylineId) {
    if (storylineId === null) {
      return this.getFirst();
    }
    const ids = this.getAll();
    const currentIndex = ids.indexOf(storylineId);
    if (currentIndex === -1) {
      throw new Error(`Error: Attempting to get next storyline for unknown storyline ${storylineId}`);
    }
    const nextIndex = (currentIndex + 1) % ids.length;
    return ids[nextIndex];
  }
}

module.exports = StorylineManager;
