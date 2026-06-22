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
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  });

  signupBtn.addEventListener("click", function () {
    const studentId = studentIdInput.value.trim();
    const password = passwordInput.value.trim();

    let isValid = true;

    if (!/^\d{8}$/.test(studentId)) {
      studentIdError.style.display = "block";
      isValid = false;
    } else {
      studentIdError.style.display = "none";
    }

    if (!/^(?=.*[a-z])(?=.*\d)[a-z\d]{8,10}$/.test(password)) {
      passwordError.style.display = "block";
      isValid = false;
    } else {
      passwordError.style.display = "none";
    }

    if (!isValid) {
      return;
    }

    alert("회원가입이 완료되었습니다.");
    window.location.href = "/main/";
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

