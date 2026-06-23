document.addEventListener("DOMContentLoaded", function () {
  // 회원가입 페이지 요소
  const signupForm = document.getElementById("signupForm");
  const studentIdInput = document.getElementById("studentId");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const studentIdError = document.getElementById("studentIdError");
  const passwordError = document.getElementById("passwordError");

  // 회원가입 페이지에서만 실행
  if (
    signupForm &&
    studentIdInput &&
    passwordInput &&
    studentIdError &&
    passwordError
  ) {
    const studentIdHelp = studentIdError.nextElementSibling;
    const passwordHelp = passwordError.nextElementSibling;

    studentIdError.style.display = "none";
    passwordError.style.display = "none";

    if (togglePassword) {
      togglePassword.addEventListener("click", function () {
        passwordInput.type =
          passwordInput.type === "password" ? "text" : "password";
      });
    }

    signupForm.addEventListener("submit", function (event) {
      const studentId = studentIdInput.value.trim();
      const password = passwordInput.value.trim();

      let isValid = true;

      if (!/^\d{8}$/.test(studentId)) {
        studentIdInput.classList.add("input-error");
        studentIdError.style.display = "block";
        if (studentIdHelp) studentIdHelp.style.display = "none";
        isValid = false;
      } else {
        studentIdInput.classList.remove("input-error");
        studentIdError.style.display = "none";
        if (studentIdHelp) studentIdHelp.style.display = "";
      }

      if (!/^(?=.*[a-z])(?=.*\d)[a-z\d]{8,10}$/.test(password)) {
        passwordInput.classList.add("input-error");
        passwordError.style.display = "block";
        if (passwordHelp) passwordHelp.style.display = "none";
        isValid = false;
      } else {
        passwordInput.classList.remove("input-error");
        passwordError.style.display = "none";
        if (passwordHelp) passwordHelp.style.display = "";
      }

      if (!isValid) {
        event.preventDefault();
        return;
      }

      // 올바른 경우에는 폼 제출을 막지 않음
      // 백엔드로 POST 전송 → 백엔드가 /main/?signup=1 으로 이동
    });

    studentIdInput.addEventListener("input", function () {
      studentIdInput.classList.remove("input-error");
      studentIdError.style.display = "none";
      if (studentIdHelp) studentIdHelp.style.display = "";
    });

    passwordInput.addEventListener("input", function () {
      passwordInput.classList.remove("input-error");
      passwordError.style.display = "none";
      if (passwordHelp) passwordHelp.style.display = "";
    });
  }

  // 로그인 페이지 요소
  const loginBtn = document.getElementById("loginBtn");
  const loginPasswordInput =
    document.getElementById("loginPassword");
  const toggleLoginPassword =
    document.getElementById("toggleLoginPassword");

  if (toggleLoginPassword && loginPasswordInput) {
    toggleLoginPassword.addEventListener("click", function () {
      loginPasswordInput.type =
        loginPasswordInput.type === "password"
          ? "text"
          : "password";
    });
  }

});