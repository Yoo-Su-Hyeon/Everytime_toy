const params = new URLSearchParams(window.location.search);
const modal = document.getElementById("signupModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");

if (params.get("signup") === "success") {
  modal.classList.add("show");
}

modalCloseBtn.addEventListener("click", function () {
  modal.classList.remove("show");
  window.history.replaceState({}, document.title, "/main/");
});