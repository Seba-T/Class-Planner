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
  }
  const html = await response.text();
  document.querySelector("#calendar-container").innerHTML = html;
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
async function newPage() {
  let response = await fetch(`${domainName}/newView`);
}
