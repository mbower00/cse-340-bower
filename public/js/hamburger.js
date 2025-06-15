const hamburgerElement = document.getElementById("hamburger-header");

hamburgerElement.addEventListener("click", () => {
  hamburgerElement.classList.toggle("opened");
});
