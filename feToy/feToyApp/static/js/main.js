const searchInput = document.getElementById("searchInput");
const courseList = document.getElementById("courseList");
const courseTitle = document.getElementById("courseTitle");
const logoutBtn = document.getElementById("logoutBtn");

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
    professor: "이용敏",
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
  { badge: "전공", badgeClass: "blue", title: "사회심리학", professor: "미정" },
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
        "?title=" +
        encodeURIComponent(course.title) +
        "&professor=" +
        encodeURIComponent(course.professor) +
        "&color=" +
        encodeURIComponent(course.badgeClass);
    });

    courseList.appendChild(item);
  });
}

// 처음에는 내 수강 중인 과목 보여주기
renderCourses(myCourses);

// 내 수강 과목 키 세트 (allCourses 중복 제거용)
const myCoursesSet = new Set(myCourses.map(function (c) {
  return c.title + "||" + c.professor;
}));

// 검색 기능 (한글 IME 입력 완료 후에도 동작하도록 compositionend 병행)
function doSearch() {
  const keyword = searchInput.value.trim().toLowerCase();

  if (keyword === "") {
    courseTitle.style.display = "block";
    renderCourses(myCourses);
    return;
  }

  courseTitle.style.display = "none";

  // 내 수강 과목: 제목/교수명 어디든 keyword가 포함되면 매칭
  const myFiltered = myCourses.filter(function (course) {
    return course.title.toLowerCase().includes(keyword) ||
           course.professor.toLowerCase().includes(keyword);
  });

  // 전체 과목: 단어(공백 기준) 시작 부분에만 매칭 — 복합어 중간 우연 매칭 방지
  const allFiltered = allCourses.filter(function (course) {
    if (myCoursesSet.has(course.title + "||" + course.professor)) return false;
    const t = course.title.toLowerCase();
    const p = course.professor.toLowerCase();
    return t.split(/\s+/).some(function (w) { return w.startsWith(keyword); }) ||
           p.split(/\s+/).some(function (w) { return w.startsWith(keyword); });
  });

  const filteredCourses = [...myFiltered, ...allFiltered];

  if (filteredCourses.length === 0) {
    courseList.innerHTML = '<p class="no-result">검색 결과가 없습니다.</p>';
  } else {
    renderCourses(filteredCourses);
  }
}

searchInput.addEventListener("input", doSearch);
searchInput.addEventListener("compositionend", doSearch);

// 로그아웃 버튼 클릭 이벤트 (독립적으로 분리)
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    location.href = "/login/";
  });
}

// 회원가입 완료 모달
document.addEventListener("DOMContentLoaded", function () {
  const signupModal = document.getElementById("signupModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  const urlParams = new URLSearchParams(window.location.search);
  const isNewSignup = urlParams.get("signup") === "1";

  if (isNewSignup && signupModal) {
    signupModal.classList.add("show");
    // URL에서 파라미터 제거 (새로고침 시 재표시 방지)
    history.replaceState({}, "", "/main/");
  }

  if (modalCloseBtn && signupModal) {
    modalCloseBtn.addEventListener("click", function () {
      signupModal.classList.remove("show");
    });
  }
});
