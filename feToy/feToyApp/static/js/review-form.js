// =============================================
// review-form.js — 수강 후기 작성 / 수정 폼
// =============================================

// URL 파라미터에서 과목 정보와 수정 대상 ID를 읽음
// editId가 있으면 수정 모드, 없으면 신규 작성 모드
const reviewParams = new URLSearchParams(window.location.search);

let selectedTitle = reviewParams.get("title");
let selectedProfessor = reviewParams.get("professor");
let selectedColor = reviewParams.get("color");
const editId = reviewParams.get("editId");

// DOM 요소 참조
const stars = document.querySelectorAll("#stars span");
const scoreValue = document.getElementById("scoreValue");
const reviewContent = document.getElementById("reviewContent");
const contentCount = document.getElementById("contentCount");
const lectureName = document.getElementById("lectureName");
const semester = document.getElementById("semester");
const submitBtn = document.getElementById("submitBtn");

const lectureDropdown = document.getElementById("lectureDropdown");
const semesterDropdown = document.getElementById("semesterDropdown");

// 현재 선택된 별점 (0이면 미선택)
let selectedScore = 0;

// 선택 가능한 강의 목록 (강의명 / 교수명 / 시간 / 강의실 형식)
const lectures = [
  { text: "생명과학의기초 / 김태훈 / 화D목C / 차205", title: "생명과학의기초", professor: "김태훈", color: "blue-light" },
  { text: "식품과학의기초 / 정미숙, 한정우 / 월C수D / 차203", title: "식품과학의기초", professor: "정미숙, 한정우", color: "blue-light" },
  { text: "최신일반화학 / 박현 / 월A수B / 차201", title: "최신일반화학", professor: "박현", color: "blue" },
  { text: "덕성인의기초 / 이용민 / 금A / 차101", title: "덕성인의기초", professor: "이용민", color: "orange" },
  { text: "이해와소통세미나 / 최인선 / 월A수B / 차205", title: "이해와소통세미나", professor: "최인선", color: "orange" },
  { text: "컴퓨팅사고 / 박주연 / 화B목B / 차202", title: "컴퓨팅사고", professor: "박주연", color: "orange" },
  { text: "현대사회와부족들 / 함세정 / 수A목A / 차204", title: "현대사회와부족들", professor: "함세정", color: "yellow" },
];

// 선택 가능한 학기 목록
const semesters = [
  "26년 1학기",
  "25년 겨울학기",
  "25년 2학기",
  "25년 여름학기",
  "25년 1학기",
];

// 현재 입력된 강의명을 기반으로 lectures 배열에서 일치하는 강의를 반환
// 일치하는 항목이 없으면 URL 파라미터 값을 기본으로 사용
function getCurrentLecture() {
  const matched = lectures.find((lecture) => lectureName.value.includes(lecture.title));

  if (matched) return matched;

  return {
    title: selectedTitle || "생명과학의기초",
    professor: selectedProfessor || "김태훈",
    color: selectedColor || "blue-light",
    text: lectureName.value,
  };
}

// 쿠키에서 Django CSRF 토큰을 읽어 반환 (API 요청 시 필요)
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

// 별점 UI 업데이트: 선택된 점수 이하 별을 활성화 상태로 표시
function setStars(score) {
  selectedScore = Number(score);
  scoreValue.textContent = selectedScore;

  stars.forEach((star) => {
    star.classList.toggle("active", Number(star.dataset.score) <= selectedScore);
  });
}

// 선택된 강의의 배지 색상을 제출 버튼에 반영
function applyButtonColor() {
  submitBtn.classList.remove("blue-light", "blue", "orange", "yellow", "pink");

  const currentLecture = getCurrentLecture();
  selectedColor = currentLecture.color;

  if (selectedColor) {
    submitBtn.classList.add(selectedColor);
  }
}

// 폼 완성 여부 확인: 별점·내용·강의명·학기가 모두 입력되어야 제출 버튼 활성화
function checkForm() {
  const hasScore = selectedScore > 0;
  const hasContent = reviewContent.value.trim().length > 0;
  const hasLecture = lectureName.value.trim().length > 0;
  const hasSemester = semester.value.trim().length > 0;

  if (hasScore && hasContent && hasLecture && hasSemester) {
    submitBtn.disabled = false;
    applyButtonColor();
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.remove("blue-light", "blue", "orange", "yellow", "pink");
  }
}

// 강의명 입력 시 자동완성 드롭다운 표시
function showLectureDropdown(keyword) {
  lectureDropdown.innerHTML = "";

  const filteredLectures = lectures.filter((lecture) => lecture.text.includes(keyword));

  filteredLectures.forEach((lecture) => {
    const li = document.createElement("li");
    li.textContent = lecture.text;

    li.addEventListener("click", () => {
      lectureName.value = lecture.text;
      selectedTitle = lecture.title;
      selectedProfessor = lecture.professor;
      selectedColor = lecture.color;

      lectureDropdown.classList.remove("show");
      checkForm();
    });

    lectureDropdown.appendChild(li);
  });

  lectureDropdown.classList.toggle("show", filteredLectures.length > 0);
}

// 학기 선택 드롭다운 표시
function showSemesterDropdown() {
  semesterDropdown.innerHTML = "";

  semesters.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;

    li.addEventListener("click", () => {
      semester.value = item;
      semesterDropdown.classList.remove("show");
      checkForm();
    });

    semesterDropdown.appendChild(li);
  });

  semesterDropdown.classList.add("show");
}

// 수정 모드 초기 데이터 로드
// editId가 있으면 API에서 해당 후기를 불러와 폼에 채움 (본인 작성 글만 로드)
async function loadInitialData() {
  const matchedLecture = lectures.find((lecture) => {
    return lecture.title === selectedTitle && lecture.professor === selectedProfessor;
  });

  if (matchedLecture) {
    lectureName.value = matchedLecture.text;
    selectedColor = matchedLecture.color;
  }

  if (editId && selectedTitle && selectedProfessor) {
    try {
      const response = await fetch(
        `/api/reviews/?title=${encodeURIComponent(selectedTitle)}&professor=${encodeURIComponent(selectedProfessor)}`
      );
      const data = await response.json();
      // mine: true 인 후기만 수정 가능 (본인 작성 여부 확인)
      const targetReview = data.reviews.find((r) => String(r.id) === String(editId) && r.mine);

      if (targetReview) {
        reviewContent.value = targetReview.content;
        contentCount.textContent = targetReview.content.length;
        semester.value = targetReview.semester.replace(" 수강자", "");
        setStars(targetReview.rating);
        submitBtn.innerHTML = "✎ 후기 수정";
      }
    } catch (err) {
      console.error("후기 로드 실패:", err);
    }
  }

  checkForm();
}

// 별점 클릭 이벤트
stars.forEach((star) => {
  star.addEventListener("click", () => {
    setStars(star.dataset.score);
    checkForm();
  });
});

// 후기 내용 입력 시 글자 수 카운트 업데이트
reviewContent.addEventListener("input", () => {
  contentCount.textContent = reviewContent.value.length;
  checkForm();
});

// 강의명 입력 시 자동완성 드롭다운 제어
lectureName.addEventListener("input", () => {
  const keyword = lectureName.value.trim();

  if (keyword === "") {
    lectureDropdown.classList.remove("show");
  } else {
    showLectureDropdown(keyword);
  }

  checkForm();
});

lectureName.addEventListener("focus", () => {
  const keyword = lectureName.value.trim();

  if (keyword !== "") {
    showLectureDropdown(keyword);
  }
});

// 학기 입력 클릭/포커스 시 드롭다운 표시
semester.addEventListener("click", showSemesterDropdown);
semester.addEventListener("focus", showSemesterDropdown);

// 드롭다운 외부 클릭 시 닫기
document.addEventListener("click", (event) => {
  if (!lectureName.contains(event.target) && !lectureDropdown.contains(event.target)) {
    lectureDropdown.classList.remove("show");
  }

  if (!semester.contains(event.target) && !semesterDropdown.contains(event.target)) {
    semesterDropdown.classList.remove("show");
  }
});

// 후기 제출 (신규 작성 또는 수정)
// API(/api/reviews/write/)에 POST 요청 후 수강 후기 목록 페이지로 이동
submitBtn.addEventListener("click", async () => {
  submitBtn.disabled = true;

  const currentLecture = getCurrentLecture();

  try {
    const response = await fetch("/api/reviews/write/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify({
        title: currentLecture.title,
        professor: currentLecture.professor,
        color: currentLecture.color,
        rating: selectedScore,
        content: reviewContent.value.trim(),
        semester: `${semester.value.trim()} 수강자`,
        editId: editId || null,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "서버 오류");
    }

    location.replace(
      "/reviews/list/" +
      "?title=" + encodeURIComponent(currentLecture.title) +
      "&professor=" + encodeURIComponent(currentLecture.professor) +
      "&color=" + encodeURIComponent(currentLecture.color)
    );
  } catch (err) {
    alert("후기 저장 중 오류가 발생했습니다: " + err.message);
    submitBtn.disabled = false;
    checkForm();
  }
});

document.getElementById("backBtn").addEventListener("click", function () {
  location.replace(
    "/reviews/list/" +
    "?title=" + encodeURIComponent(selectedTitle || "생명과학의기초") +
    "&professor=" + encodeURIComponent(selectedProfessor || "김태훈") +
    "&color=" + encodeURIComponent(selectedColor || "blue-light")
  );
});

loadInitialData();
