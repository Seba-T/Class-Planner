const domainName = "http://oifioiillinkdiarte1111.it";

async function displayCalendarGrid(viewOption, date) {
  const currentCall = JSON.stringify({
    date,
    viewOption,
  });
  let response = await fetch(`${domainName}/getcalendarview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: currentCall,
  });
  if (response.status !== 200) {
    document.write("HTTP error: " + response.status);
    if (response.status === 403) location.reload();
  }
  const html = await response.text();
  document.querySelector("#app-calendar").innerHTML = html;
  document.querySelectorAll(" .availableDate").forEach((elm) => {
    if (elm.childElementCount > 2) {
      elm.style["padding-bottom"] = "0px";
    }
  });
  const weekdays = document.querySelector("#weekdays");
  if (viewOption === "Week") weekdays.style.display = "inline-flex";
  else weekdays.style.display = "none";
}
async function pickUpWhereYouLeftOff() {
  let response = await fetch(`${domainName}/getview`);
  if (response.ok) {
    const returnedJSON = await response.text();
    return JSON.parse(returnedJSON);
  } else {
    document.write("HTTP error: " + response.status);
  }
}
async function submitSignUpAction(action, date, subject, priority) {
  const submitData = JSON.stringify({ date, subject, priority, action });
  let response = await fetch(`${domainName}/signupfordate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: submitData,
  });
  if (response.status === 200) {
    const currentLocalStorage = JSON.parse(localStorage.getItem("dates"));
    if (action === "CREATE") {
      currentLocalStorage.push({ date, subject });
      localStorage.setItem("dates", JSON.stringify(currentLocalStorage));
    } else {
      const newLocalStorage = currentLocalStorage.filter(
        (elm) =>
          elm.subject !== subject || elm.date.slice(0, 10) !== date.slice(0, 10)
      );
      localStorage.setItem("dates", JSON.stringify(newLocalStorage));
    }
    $("#confirm-alert").modal("hide");
    location.reload();
  } else {
    alert("request failed");
    location.reload();
  }
}
