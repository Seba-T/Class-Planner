function clearPage(value) {
  let elements = new Array();
  const elementsSelectors = [".app-calendar", "#date", " .currentViewOption"];
  elementsSelectors.forEach((elm) =>
    elements.push(document.querySelector(elm))
  );

  elements.forEach((elm) =>
    elm.animate(
      [
        { opacity: 0, easing: "ease-in" },
        { opacity: 1, easing: "ease-in" },
        // { opacity: 0 },
      ],
      value * 2
    )
  );
}


// clearPage = animationHandler(clearPage, false);

const leftArrow = document.querySelector(".left");
const rightArrow = document.querySelector(".right");
leftArrow.addEventListener("click", () =>
  window.state.updateView({ viewOption: 0, date: 0, direction: "left" })
);
rightArrow.addEventListener("click", () =>
  window.state.updateView({ viewOption: 0, date: 0, direction: "right" })
);

document.querySelectorAll(".dropdownElm").forEach((viewOption) => {
  //dropdown menu to select view
  viewOption.addEventListener("click", (a) => {
    window.state.updateView({
      viewOption: a.currentTarget.innerHTML,
      date: 0,
      direction: 0,
    });
  });
});

const smallDevice = window.matchMedia("(max-width: 600px)");

smallDevice.addListener(handleSmallDevice);

function handleSmallDevice(e) {
  document.querySelectorAll(".cellTitle").forEach((elm) => {
    if (e.matches) {
      let hiddenCont = `${elm.innerHTML.slice(
        0,
        3
      )}<span class="hideCont">${elm.innerHTML.slice(3)}</span>`;
      elm.innerHTML = hiddenCont;
    } else {
      elm.classList.remove("hideCont");
    }
  });
}

// Run it initially
handleSmallDevice(smallDevice);

function functionFireHandler(fn, parms) {
  if (parms.callBack) {
    let prevParams = { fn: 0, execFn: () => fn() };
  }
  let prevCall = "SOLVED";
  console.log(prevCall);
  return function (...args) {
    if (prevCall === "SOLVED") {
      prevCall = waitFunction(parms.timeLimit).then(() => {
        if (parms.callBack) prevParams.execFn();
        return "SOLVED";
      });
      return fn.call(this, args);
    } else {
      if (!parms.onTimeOutAwait) return fn.call(this, args);
      if (parms.callBack) {
        prevParams.fn = () => fn.call(this, args);
      }
    }
  };
}
