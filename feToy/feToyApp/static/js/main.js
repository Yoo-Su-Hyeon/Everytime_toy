const params = new URLSearchParams(window.location.search);

const modal = document.getElementById("signupModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");

const searchInput = document.getElementById("searchInput");
const courseList = document.getElementById("courseList");
const courseTitle = document.getElementById("courseTitle");

const myCourses = [
  { badge: "전필", badgeClass: "blue-light", title: "생명과학의기초", professor: "김태훈" },
  { badge: "전탐", badgeClass: "blue-light", title: "식품과학의기초", professor: "정미숙, 한정우" },
  { badge: "전공", badgeClass: "blue", title: "최신일반화학", professor: "박현" },
  { badge: "필교", badgeClass: "orange", title: "덕성인의기초", professor: "이용민" },
  { badge: "필교", badgeClass: "orange", title: "이해와소통세미나", professor: "최인선" },
  { badge: "필교", badgeClass: "orange", title: "컴퓨팅사고", professor: "박주연" },
  { badge: "교양", badgeClass: "yellow", title: "현대사회와부족들", professor: "함세정" },
];

const allCourses = [
  { badge: "전탐", badgeClass: "blue-light", title: "심리학개론", professor: "임혜진" },
  { badge: "전공", badgeClass: "blue", title: "성격심리학", professor: "임혜진" },
  { badge: "전공", badgeClass: "blue", title: "사회심리학", professor: "조희정" },
  { badge: "전공", badgeClass: "blue", title: "사회심리학", professor: "미정" },
  { badge: "전공", badgeClass: "blue", title: "인사심리학: 인적자원 분석 및 개발", professor: "박지영" },
  { badge: "교양", badgeClass: "yellow", title: "광고심리", professor: "박주연" },
  { badge: "교양", badgeClass: "yellow", title: "색채심리와현대생활", professor: "김제중" },
  { badge: "일반", badgeClass: "pink", title: "(N)신경심리학", professor: "미정" },
  { badge: "일반", badgeClass: "pink", title: "(N)신경심리학", professor: "박주연" },
  { badge: "일반", badgeClass: "pink", title: "(N)심리치료", professor: "미정" },
];

function renderCourses(courses) {
  courseList.innerHTML = "";

  courses.forEach(function (course) {
    const item = document.createElement("div");
    item.className = "course-item";

    item.innerHTML = `
      <span class="badge ${course.badgeClass}">${course.badge}</span>
      <div>
        <strong>${course.title}</strong>
        <p>${course.professor}</p>
      </div>
    `;

    item.addEventListener("click", function () {
      location.href =
        "/reviews/write/" +
        "?title=" + encodeURIComponent(course.title) +
        "&professor=" + encodeURIComponent(course.professor) +
        "&color=" + encodeURIComponent(course.badgeClass);
    });

    courseList.appendChild(item);
  });
}

if (params.get("signup") === "success") {
  modal.classList.add("show");
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", function () {
    modal.classList.remove("show");
    window.history.replaceState({}, document.title, "/main/");
  });
}

renderCourses(myCourses);

searchInput.addEventListener("input", function () {
  const keyword = searchInput.value.trim().toLowerCase();

  if (keyword === "") {
    courseTitle.style.display = "block";
    renderCourses(myCourses);
    return;
  }

  courseTitle.style.display = "none";

  const filteredCourses = allCourses.filter(function (course) {
    return (
      course.title.toLowerCase().includes(keyword) ||
      course.professor.toLowerCase().includes(keyword)
    );
  });

  renderCourses(filteredCourses);
});