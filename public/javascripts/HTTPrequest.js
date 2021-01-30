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
  //  console.log(response);
  document.querySelector("#app-calendar").innerHTML = html;
}
async function pickUpWhereYouLeftOff() {
  let response = await fetch(`${domainName}/getview`);
  if (response.ok) {
    const returnedJSON = await response.text();
    console.log(returnedJSON);
    return JSON.parse(returnedJSON);
  } else {
    document.write("HTTP error: " + response.status);
  }
}
