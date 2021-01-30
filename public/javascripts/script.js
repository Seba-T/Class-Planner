window.addEventListener("load", () => {
  document.querySelector("body").style.opacity = "1";
  // document.getElementById("singin").style.display = "block";
  // document.getElementById("signin").click();
});

const setStylesOnElement = function (element, styles) {
  Object.assign(element.style, styles);
};
