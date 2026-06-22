const params = new URLSearchParams(window.location.search);

const modal = document.getElementById("signupModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");

const searchInput = document.getElementById("searchInput");
const courseList = document.getElementById("courseList");
const courseTitle = document.getElementById("courseTitle");

// 메인화면에 처음 보일 내 수강 중인 과목
const myCourses = [
  {
    badge: "전필",
    badgeClass: "blue-light",
    title: "생명과학의기초",
    professor: "김태훈",
  },
  {
    badge: "전탐",
    badgeClass: "blue-light",
    title: "식품과학의기초",
    professor: "정미숙, 한정우",
  },
  {
    badge: "전공",
    badgeClass: "blue",
    title: "최신일반화학",
    professor: "박현",
  },
  {
    badge: "필교",
    badgeClass: "orange",
    title: "덕성인의기초",
    professor: "이용민",
  },
  {
    badge: "필교",
    badgeClass: "orange",
    title: "이해와소통세미나",
    professor: "최인선",
  },
  {
    badge: "필교",
    badgeClass: "orange",
    title: "컴퓨팅사고",
    professor: "박주연",
  },
  {
    badge: "교양",
    badgeClass: "yellow",
    title: "현대사회와부족들",
    professor: "함세정",
  },
];

// 검색할 때 나올 전체 과목
const allCourses = [
  {
    badge: "전탐",
    badgeClass: "blue-light",
    title: "심리학개론",
    professor: "임혜진",
  },
  {
    badge: "전공",
    badgeClass: "blue",
    title: "성격심리학",
    professor: "임혜진",
  },
  {
    badge: "전공",
    badgeClass: "blue",
    title: "사회심리학",
    professor: "조희정",
  },
  {
    badge: "전공",
    badgeClass: "blue",
    title: "사회심리학",
    professor: "미정",
  },
  {
    badge: "전공",
    badgeClass: "blue",
    title: "인사심리학: 인적자원 분석 및 개발",
    professor: "박지영",
  },
  {
    badge: "교양",
    badgeClass: "yellow",
    title: "광고심리",
    professor: "박주연",
  },
  {
    badge: "교양",
    badgeClass: "yellow",
    title: "색채심리와현대생활",
    professor: "김제중",
  },
  {
    badge: "일반",
    badgeClass: "pink",
    title: "(N)신경심리학",
    professor: "미정",
  },
  {
    badge: "일반",
    badgeClass: "pink",
    title: "(N)신경심리학",
    professor: "박주연",
  },
  {
    badge: "일반",
    badgeClass: "pink",
    title: "(N)심리치료",
    professor: "미정",
  },
];

// 과목 목록 그리기
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

    // 과목 클릭 시 과목별 수강 후기 페이지로 이동
    item.addEventListener("click", function () {
      location.href =
        "/reviews/list/" +
        "?title=" + encodeURIComponent(course.title) +
        "&professor=" + encodeURIComponent(course.professor) +
        "&color=" + encodeURIComponent(course.badgeClass);
    });

    courseList.appendChild(item);
  });
}

// 회원가입 완료 모달
if (params.get("signup") === "success" && modal) {
  modal.classList.add("show");
}

if (modalCloseBtn && modal) {
  modalCloseBtn.addEventListener("click", function () {
    modal.classList.remove("show");
    window.history.replaceState({}, document.title, "/main/");
  });
}

// 처음에는 내 수강 중인 과목 보여주기
renderCourses(myCourses);

// 검색 기능
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

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    location.href = "/login/";
  });
}