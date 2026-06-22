document.addEventListener("DOMContentLoaded", function () {
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const signupForm = document.getElementById("signupForm");

const studentId = document.getElementById("studentId");
const passwordWrapper = document.querySelector(".password-wrapper");

const studentIdError = document.getElementById("studentIdError");
const passwordError = document.getElementById("passwordError");

togglePassword.addEventListener("click", function () {
passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

signupForm.addEventListener("submit", function (event) {
event.preventDefault();

```
let isValid = true;

studentId.classList.remove("input-error");
passwordWrapper.classList.remove("wrapper-error");
studentIdError.classList.remove("show");
passwordError.classList.remove("show");

if (!/^\d{8}$/.test(studentId.value.trim())) {
  studentId.classList.add("input-error");
  studentIdError.classList.add("show");
  isValid = false;
}

if (!/^[a-z0-9]{8,10}$/.test(passwordInput.value.trim())) {
  passwordWrapper.classList.add("wrapper-error");
  passwordError.classList.add("show");
  isValid = false;
}

if (isValid) {
  window.location.href = "/main/?signup=success";
}
```

});
});
