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
    role: JSON.parse(localStorage.getItem("role")),
  };
  if (window.state.currentUser.role === "admin") {
    console.log("did it ");
    document.querySelector("#add-day").style.display = "block";
  }
  document.querySelector("body").style.opacity = "1";
});


function signUpForDate(params) {
  window.state.currentUser.dates.forEach((date) => {
    if (
      date.subject === params.subject &&
      date.date.slice(0, 10) === params.date.slice(0, 10)
    ) {
      document.querySelector(
        "#modal-content"
      ).innerHTML = `<button type="button" data-dismiss="modal" class="btn btn-outline-danger" onclick='signUpForDateObj.signUpAction("DELETE")'>Annulla la tua interrogazione</button>`;
    }
  });
  signUpForDateObj.date = params.date;
  signUpForDateObj.subject = params.subject;
}

const signUpForDateObj = {
  date: null,
  subject: null,
  signUpAction: function (action, priority = 0) {
    submitSignUpAction(action, this.date, this.subject, priority);
  },
};
