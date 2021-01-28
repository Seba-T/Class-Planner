/*
 *
 * Onload functions
 *
 *
 */
window.addEventListener("load", async () => {
  const lastSessionInfo = await pickUpWhereYouLeftOff();
  window.state.currentView = {
    viewOption: lastSessionInfo.currentViewOption,
    date: new Date(lastSessionInfo.currentDisplayedDate),
  };
  document.querySelector("body").style.opacity = "1";
});
/*
 *
 * End of Onload functions
 * 
 *
 */

const setStylesOnElement = function (element, styles) {
  Object.assign(element.style, styles);
};