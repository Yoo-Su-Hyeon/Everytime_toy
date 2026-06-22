const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const signupForm = document.getElementById("signupForm");

togglePassword.addEventListener("click", function () {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

signupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  window.location.href = "/main/?signup=success";
});