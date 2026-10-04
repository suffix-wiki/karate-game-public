document.addEventListener("pagesLoaded", () => {
  loadGame();
  const showOpening = !isStoryEventSeen("opening");
  openScreen("screen-home", { playBgm: !showOpening });
  if (showOpening) {
    playStoryEvent("opening", () => startBGM(BGM_SETTINGS.screens["screen-home"]));
  }
});
