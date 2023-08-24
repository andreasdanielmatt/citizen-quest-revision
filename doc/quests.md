## States

### Available

A quest is available when it's ready to be started. Available quests are marked in the city by
a dialogue balloon coming out of an NPC. By talking to the NPC, the player can start the quest.

At most three quests can be available at the same time, but only up to one per NPC.

Currently available quests are the first three that meet these conditions:

- They're not done.
- They meet dependent quests requirements.
- There's not another available quest from that NPC.

### Active

A quest is active when it's being played. The player can only have one active quest at a time.

If a player takes a different quest, the previous one is no longer active.

If a quest is completed, it's no longer active.

The 'active' state is not shared between players. More than one player can have the same quest
active at one time.

### Done

A quest is done when it's completed.

