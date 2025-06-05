const passwordBtn = document.getElementById("password-btn");

passwordBtn.addEventListener("click", () => {
  const passwordInput = document.getElementById("account_password");
  const type = passwordInput.getAttribute("type");
  if (type === "password") {
    passwordInput.setAttribute("type", "text");
    passwordBtn.innerHTML = "hide";
  } else {
    passwordInput.setAttribute("type", "password");
    passwordBtn.innerHTML = "show";
  }
});
