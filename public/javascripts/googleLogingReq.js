function init() {
  gapi.load("auth2", function () {
    gapi.auth2.init({
      client_id:
        "900965066281-tcj9qciujqodr2bs6sl4hc85mhmips1b.apps.googleusercontent.com",
    });
  });
}
function onSignIn(googleUser) {
  const id_token = googleUser.getAuthResponse().id_token;
  // fetch(`${domainName}/tokensignin`, {
  //   method: "POST",
  //   headers: {
  //     "content-Type": "application/x-www-form-urlencoded",
  //   },
  //   body: 'idtoken =' + id_token,
  //   // name: profile.getGivenName(),
  //   // surname: profile.getFamilyName(),
  // });
  var xhr = new XMLHttpRequest();
  xhr.open("POST", `${domainName}/tokensignin`);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onload = function () {
    console.log("Signed in as: " + xhr.response);
    if (xhr.status === 200) onSuccefullLogin();
  };
  xhr.send("idtoken=" + id_token);

}


async function onSuccefullLogin() {
  const lastSessionInfo = await pickUpWhereYouLeftOff();
  window.state.currentView = {
    viewOption: lastSessionInfo.lastViewOption,
    date: new Date(lastSessionInfo.lastDate),
  };
  document.querySelector("body").style.opacity = "1";
};