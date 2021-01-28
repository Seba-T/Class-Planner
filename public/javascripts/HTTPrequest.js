

 async function displayCalendarGrid (viewOption, date){
 const response = await fetch(`http://localhost:3000/src/date/${date.toISOString()}/viewOption/${viewOption}`);
 const html = await response.text()
 console.log(response);
 document.querySelector("#app-calendar").innerHTML = html;

}
async function postCurrentView(currentViewOption, currentDisplayedDate) {
  if (serverRequestHandler.canUpdateState) {
    // console.log("Current view posted!");
    serverRequestHandler.callBackFunction();
    const currentCall = JSON.stringify({
      currentDisplayedDate,
      currentViewOption,
    });
    let response = await fetch(
      "https://api.jsonbin.io/b/5ffb1d0f63bb30027e750fd1",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          versioning: "false",
          "secret-key":
            "$2b$10$jh1EEkdP0otYeS/5KOaumuuMedAtU1QPo2Kdxl5QHIwyEd6eFYJ3e",
        },
        body: currentCall,
      }
    );
    if (response.status !== 200) {
      document.write("HTTP error: " + response.status);
    }
  } else {
    serverRequestHandler.calledWhileOnTimeout = true;
    serverRequestHandler.lastParams = [currentViewOption, currentDisplayedDate];
  }
}

async function pickUpWhereYouLeftOff() {
  let response = await fetch(
    "https://api.jsonbin.io/b/5ffb1d0f63bb30027e750fd1/latest",
    {
      method: "GET",
      headers: {
        "secret-key":
          "$2b$10$jh1EEkdP0otYeS/5KOaumuuMedAtU1QPo2Kdxl5QHIwyEd6eFYJ3e",
      },
    }
  );
  if (response.ok) {
    const returnedJSON = await response.text();
    console.log(returnedJSON);
    return JSON.parse(returnedJSON);
  } else {
    document.write("HTTP error: " + response.status);
  }
}
