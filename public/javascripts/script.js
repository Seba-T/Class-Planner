window.addEventListener("load", async () => {
  const lastSessionInfo = await pickUpWhereYouLeftOff();
  window.state.currentView = {
    viewOption: lastSessionInfo.lastViewOption,
    date: new Date(lastSessionInfo.lastDate),
  };
  document.querySelector("body").style.opacity = "1";
});

const setStylesOnElement = function (element, styles) {
  Object.assign(element.style, styles);
};

function signUpForDate(params) {
  signUpForDateObj.date = new Date(params.date);
  signUpForDateObj.subject = params.subject;
}

const signUpForDateObj = {
  date: new Date(),
  subject: "boh",
  priority: 1,
  set priority(value) {
    signUpForDate();
    this.priority = value;
  },
};
