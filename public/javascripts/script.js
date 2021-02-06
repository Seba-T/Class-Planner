window.addEventListener("load", async () => {
  const lastSessionInfo = await pickUpWhereYouLeftOff();
  window.state.currentView = {
    viewOption: lastSessionInfo.lastViewOption,
    date: new Date(lastSessionInfo.lastDate),
  };
  window.state.currentUser = {
    name: JSON.parse(localStorage.getItem("name")),
    googleId: JSON.parse(localStorage.getItem("googleId")),
    dates: JSON.parse(localStorage.getItem("dates")),
  };
  // console.log(window.state.currentUser.dates);
  document.querySelector("body").style.opacity = "1";
});

const setStylesOnElement = function (element, styles) {
  ect.assign(element.style, styles);
};

function signUpForDate(params) {
  window.state.currentUser.dates.forEach((date) => {
    if (
      date.subject === params.subject &&
      date.date.slice(0, 10) === params.date.slice(0, 10)
    ) {
      console.log("we are in");
      document.querySelector(
        "#modal-content"
      ).innerHTML = `<button type="button" class="btn btn-outline-danger" onclick='signUpForDateObj.signUpAction("DELETE")'>Annulla la tua interrogazione</button>`;
    }
  });
  signUpForDateObj.date = params.date;
  signUpForDateObj.subject = params.subject;
  console.log(params);
}

const signUpForDateObj = {
  date: null,
  subject: null,
  signUpAction: function (action, priority = 0) {
    submitSignUpAction(action, this.date, this.subject, priority);
  },
};
