// =============================================
// accounts.js — 회원가입 / 로그인 폼 유효성 검사 및 UI 처리
// =============================================

document.addEventListener("DOMContentLoaded", function () {

  // ── 회원가입 페이지 ──────────────────────────
  const signupForm = document.getElementById("signupForm");
  const studentIdInput = document.getElementById("studentId");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const studentIdError = document.getElementById("studentIdError");
  const passwordError = document.getElementById("passwordError");

  // 회원가입 폼 요소가 존재하는 경우에만 실행
  if (
    signupForm &&
    studentIdInput &&
    passwordInput &&
    studentIdError &&
    passwordError
  ) {
    // 에러 메시지 아래의 안내 텍스트 요소 (에러 표시 시 겹침 방지를 위해 숨김 처리)
    const studentIdHelp = studentIdError.nextElementSibling;
    const passwordHelp = passwordError.nextElementSibling;

    // 초기 상태: 에러 메시지 숨김
    studentIdError.style.display = "none";
    passwordError.style.display = "none";

    // 비밀번호 표시/숨김 토글 버튼
    if (togglePassword) {
      togglePassword.addEventListener("click", function () {
        passwordInput.type =
          passwordInput.type === "password" ? "text" : "password";
      });
    }

    // 폼 제출 시 클라이언트 유효성 검사
    signupForm.addEventListener("submit", function (event) {
      const studentId = studentIdInput.value.trim();
      const password = passwordInput.value.trim();

      let isValid = true;

      // 학번: 숫자 8자리 형식 검사
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

      // 비밀번호: 영소문자 + 숫자 조합 8~10자 형식 검사
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

      // 유효하지 않으면 폼 제출 차단
      if (!isValid) {
        event.preventDefault();
        return;
      }

      // 유효한 경우 폼을 서버로 제출 → 백엔드가 /main/?signup=1 로 리다이렉트
    });

    // 입력값 변경 시 에러 표시 초기화
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

  // ── 로그인 페이지 ──────────────────────────
  const loginPasswordInput = document.getElementById("loginPassword");
  const toggleLoginPassword = document.getElementById("toggleLoginPassword");

  // 로그인 비밀번호 표시/숨김 토글 버튼
  if (toggleLoginPassword && loginPasswordInput) {
    toggleLoginPassword.addEventListener("click", function () {
      loginPasswordInput.type =
        loginPasswordInput.type === "password" ? "text" : "password";
    });
  }

});
