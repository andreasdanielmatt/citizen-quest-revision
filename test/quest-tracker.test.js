const chai = require('chai');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const eventemitter2 = require('chai-eventemitter2');
const QuestTracker = require('../src/js/lib/model/quest-tracker');
const FlagStore = require('../src/js/lib/model/flag-store');

chai.use(eventemitter2());
const { expect } = chai;

function loadFixture(name) {
  return yaml.load(fs.readFileSync(path.join(__dirname, 'fixtures', 'quest-tracker', name)));
}

describe('QuestTracker', () => {
  let questTracker = null;
  let flags = null;
  const config = {
    game: {
      maxActiveQuests: 2,
    },
  };

  beforeEach(() => {
    flags = new FlagStore();
    questTracker = new QuestTracker(config, flags);
  });

  describe('on storyline change', () => {
    it('should emit a "storylineChanged" event', () => {
      expect(questTracker.events).to.emit('storylineChanged').on(() => {
        const fixture = loadFixture('storyline-default.yml');
        questTracker.setActiveStoryline(fixture);
      });
      expect(questTracker.getActiveQuest()).to.be.null;
      expect(questTracker.getActiveStage()).to.be.null;
    });
  });

  describe('before any quest is active', () => {
    const fixture = loadFixture('storyline-default.yml');
    beforeEach(() => {
      questTracker.setActiveStoryline(fixture);
    });

    it('should return the initial available quests', () => {
      expect(questTracker.getAvailableQuests()).to.deep.equal([
        'mayorIdea',
        'birthday1',
      ]);
    });

    it('should return the npcs with quests', () => {
      expect(questTracker.getNpcsWithQuests()).to.deep.equal({
        mayor: 'cake',
        citizen1: 'party',
      });
    });

    it('should emit a "questActive" event when a quest becomes active', () => {
      questTracker.setActiveStoryline(fixture);
      expect(questTracker.events).to.emit('questActive', { withArgs: ['mayorIdea'] }).on(() => {
        questTracker.setActiveQuest('mayorIdea');
      });
      expect(questTracker.getActiveQuest()).to.deep.equal(fixture.quests.mayorIdea);
      expect(questTracker.getActiveStage()).to.deep.equal(fixture.quests.mayorIdea.stages[1]);
    });

    it('should emit a "stageChanged" event when a quest becomes active', () => {
      questTracker.setActiveStoryline(fixture);
      expect(questTracker.events).to.emit('stageChanged', { withArgs: ['mayorIdea', 1, null] }).on(() => {
        questTracker.setActiveQuest('mayorIdea');
      });
      expect(questTracker.getActiveQuest()).to.deep.equal(fixture.quests.mayorIdea);
      expect(questTracker.getActiveStage()).to.deep.equal(fixture.quests.mayorIdea.stages[1]);
    });
  });

  describe('when a quest is active', () => {
    const fixture = loadFixture('storyline-default.yml');
    beforeEach(() => {
      questTracker.setActiveStoryline(fixture);
      questTracker.setActiveQuest('mayorIdea');
    });

    it('should emit a "questInactive" event when it is cancelled', () => {
      expect(questTracker.events).to.emit('questInactive', { withArgs: ['mayorIdea'] }).on(() => {
        questTracker.setActiveQuest(null);
      });
      expect(questTracker.getActiveQuest()).to.be.null;
      expect(questTracker.getActiveStage()).to.be.null;
    });

    it('should emit a "noQuest" event when it is cancelled', () => {
      expect(questTracker.events).to.emit('noQuest').on(() => {
        questTracker.setActiveQuest(null);
      });
      expect(questTracker.getActiveQuest()).to.be.null;
      expect(questTracker.getActiveStage()).to.be.null;
    });

    it('should emit a "questInactive" event when a new quest is selected', () => {
      expect(questTracker.events).to.emit('questInactive', { withArgs: ['mayorIdea'] }).on(() => {
        questTracker.setActiveQuest('birthday1');
      });
      expect(questTracker.getActiveQuest()).to.deep.equal(fixture.quests.birthday1);
      expect(questTracker.getActiveStage()).to.deep.equal(fixture.quests.birthday1.stages[0]);
    });

    it('should not emit a "noQuest" event when a new quest is selected', () => {
      expect(questTracker.events).to.emit('noQuest', { count: 0 }).on(() => {
        questTracker.setActiveQuest('birthday1');
      });
    });

    it('should emit a "questActive" event when a new quest is selected', () => {
      expect(questTracker.events).to.emit('questActive', { withArgs: ['birthday1'] }).on(() => {
        questTracker.setActiveQuest('birthday1');
      });
      expect(questTracker.getActiveQuest()).to.deep.equal(fixture.quests.birthday1);
      expect(questTracker.getActiveStage()).to.deep.equal(fixture.quests.birthday1.stages[0]);
    });

    it('should emit a "stageChanged" event when a new quest is selected', () => {
      expect(questTracker.events).to.emit('stageChanged', { withArgs: ['birthday1', 0, null] }).on(() => {
        questTracker.setActiveQuest('birthday1');
      });
      expect(questTracker.getActiveQuest()).to.deep.equal(fixture.quests.birthday1);
      expect(questTracker.getActiveStage()).to.deep.equal(fixture.quests.birthday1.stages[0]);
    });
  });

  describe('when a stage is completed', () => {
    const fixture = loadFixture('storyline-default.yml');
    beforeEach(() => {
      questTracker.setActiveStoryline(fixture);
      questTracker.setActiveQuest('mayorIdea');
    });

    it('should emit a "stageChanged" event', () => {
      expect(questTracker.events).to.emit('stageChanged', { withArgs: ['mayorIdea', 0, 1] }).on(() => {
        flags.set('talkedToBaker', 1);
      });
      expect(questTracker.getActiveQuest()).to.deep.equal(fixture.quests.mayorIdea);
      expect(questTracker.getActiveStage()).to.deep.equal(fixture.quests.mayorIdea.stages[0]);
    });

    it('should not emit a "questDone" event', () => {
      expect(questTracker.events).to.emit('questDone', { count: 0 }).on(() => {
        flags.set('talkedToBaker', 1);
      });
    });

    it('should not emit a "questActive" event', () => {
      expect(questTracker.events).to.emit('questActive', { count: 0 }).on(() => {
        flags.set('talkedToBaker', 1);
      });
    });

    it('should not emit a "noQuest" event', () => {
      expect(questTracker.events).to.emit('noQuest', { count: 0 }).on(() => {
        flags.set('talkedToBaker', 1);
      });
    });
  });

  describe('when the last stage is completed', () => {
    const fixture = loadFixture('storyline-default.yml');
    beforeEach(() => {
      questTracker.setActiveStoryline(fixture);
      questTracker.setActiveQuest('mayorIdea');
      flags.set('talkedToBaker', 1);
    });

    it('should change the available quests', () => {
      flags.set('quest.mayorIdea.done', 1);
      expect(questTracker.getAvailableQuests()).to.deep.equal([
        'celebration',
        'birthday1',
      ]);
    });

    it('should return the npcs with quests', () => {
      flags.set('quest.mayorIdea.done', 1);
      expect(questTracker.getNpcsWithQuests()).to.deep.equal({
        mayor: 'party',
        citizen1: 'party',
      });
    });

    it('should emit a "questDone" event', () => {
      expect(questTracker.events).to.emit('questDone', { withArgs: ['mayorIdea'] }).on(() => {
        flags.set('quest.mayorIdea.done', 1);
      });
      expect(questTracker.getActiveQuest()).to.be.null;
      expect(questTracker.getActiveStage()).to.be.null;
    });

    it('should emit a "questInactive" event', () => {
      expect(questTracker.events).to.emit('questInactive', { withArgs: ['mayorIdea'] }).on(() => {
        flags.set('quest.mayorIdea.done', 1);
      });
      expect(questTracker.getActiveQuest()).to.be.null;
      expect(questTracker.getActiveStage()).to.be.null;
    });

    it('should emit a "noQuest" event', () => {
      expect(questTracker.events).to.emit('noQuest', { withArgs: [] }).on(() => {
        flags.set('quest.mayorIdea.done', 1);
      });
      expect(questTracker.getActiveQuest()).to.be.null;
      expect(questTracker.getActiveStage()).to.be.null;
    });

    it('should not emit a "stageChanged" event', () => {
      expect(questTracker.events).to.emit('stageChanged', { count: 0 }).on(() => {
        flags.set('quest.mayorIdea.done', 1);
      });
    });

    it('should not emit a "questActive" event', () => {
      expect(questTracker.events).to.emit('questActive', { count: 0 }).on(() => {
        flags.set('quest.mayorIdea.done', 1);
      });
    });
  });
});
