document.addEventListener("DOMContentLoaded", function () {
  const studentIdInput = document.getElementById("studentId");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const signupBtn = document.getElementById("signupBtn");
  const studentIdError = document.getElementById("studentIdError");
  const passwordError = document.getElementById("passwordError");

  studentIdError.style.display = "none";
  passwordError.style.display = "none";

  togglePassword.addEventListener("click", function () {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  });

  signupBtn.addEventListener("click", function () {
    const studentId = studentIdInput.value.trim();
    const password = passwordInput.value.trim();

    let isValid = true;

    if (!/^\d{8}$/.test(studentId)) {
      studentIdInput.classList.add("input-error");
      studentIdError.style.display = "block";
      isValid = false;
    } else {
      studentIdInput.classList.remove("input-error");
      studentIdError.style.display = "none";
    }

    if (!/^(?=.*[a-z])(?=.*\d)[a-z\d]{8,10}$/.test(password)) {
      passwordInput.classList.add("input-error");
      passwordError.style.display = "block";
      isValid = false;
    } else {
      passwordInput.classList.remove("input-error");
      passwordError.style.display = "none";
    }

    if (!isValid) {
      return;
    }

    window.location.href = "/main/?signup=success";
  });
  studentIdInput.addEventListener("input", function () {
    studentIdInput.classList.remove("input-error");
    studentIdError.style.display = "none";
  });

  passwordInput.addEventListener("input", function () {
    passwordInput.classList.remove("input-error");
    passwordError.style.display = "none";
  });
  [studentIdInput, passwordInput].forEach(function (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        signupBtn.click();
      }
    });
  });
});

const loginBtn = document.getElementById("loginBtn");
const loginPasswordInput = document.getElementById("loginPassword");
const toggleLoginPassword = document.getElementById("toggleLoginPassword");

if (toggleLoginPassword && loginPasswordInput) {
  toggleLoginPassword.addEventListener("click", function () {
    loginPasswordInput.type =
      loginPasswordInput.type === "password" ? "text" : "password";
  });
}

if (loginBtn) {
  loginBtn.addEventListener("click", function () {
    alert("로그인되었습니다.");
    window.location.href = "/main/";
  });
}
