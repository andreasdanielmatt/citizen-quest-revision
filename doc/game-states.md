# Notes about the game stateHandler

The game can be in the following states:

- idle: No one is playing. This is a "demo" / "attract players" mode.
- intro: At least one station has a player, but the round has not started yet.
- playing: A round of the game is in progress.
- ending: The round is over, results are being shown.

Transitions between these states happen in this way:

- idle -> intro: A player presses a button on a station.
- intro -> playing: Either
  - If there's an intro sequence, it ended, timed out, or every player pressed a button to skip it.
  - If there's no intro, the server might jump straight to playing.
- playing -> ending: The round is over, either because the time ran out or because all quests have been completed.
- ending -> idle: The results have been shown. Every player confirmed or timed out. The game is now idle again.
- ending -> intro: Optionally, a "Continue?" screen could be shown after the results. If the player
    decides to continue, the game goes back to intro.

Game stations can be in the following states:

- idle: No one is playing.
- active: A player is playing.

Transitions between these states happen in this way:

- idle -> active: A player presses a button on the station.
- active -> idle: When 
  - the game transitions from ending to idle
  - the game transitions from ending to intro but the player in this station decided not to continue
