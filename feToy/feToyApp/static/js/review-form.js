const reviewParams = new URLSearchParams(window.location.search);

let selectedTitle = reviewParams.get("title");
let selectedProfessor = reviewParams.get("professor");
let selectedColor = reviewParams.get("color");
const editId = reviewParams.get("editId");

const stars = document.querySelectorAll("#stars span");
const scoreValue = document.getElementById("scoreValue");
const reviewContent = document.getElementById("reviewContent");
const contentCount = document.getElementById("contentCount");
const lectureName = document.getElementById("lectureName");
const semester = document.getElementById("semester");
const submitBtn = document.getElementById("submitBtn");

const lectureDropdown = document.getElementById("lectureDropdown");
const semesterDropdown = document.getElementById("semesterDropdown");

let selectedScore = 0;

const lectures = [
  { text: "생명과학의기초 / 김태훈 / 화D목C / 차205", title: "생명과학의기초", professor: "김태훈", color: "blue-light" },
  { text: "식품과학의기초 / 정미숙, 한정우 / 월C수D / 차203", title: "식품과학의기초", professor: "정미숙, 한정우", color: "blue-light" },
  { text: "최신일반화학 / 박현 / 월A수B / 차201", title: "최신일반화학", professor: "박현", color: "blue" },
  { text: "덕성인의기초 / 이용민 / 금A / 차101", title: "덕성인의기초", professor: "이용민", color: "orange" },
  { text: "이해와소통세미나 / 최인선 / 월A수B / 차205", title: "이해와소통세미나", professor: "최인선", color: "orange" },
  { text: "컴퓨팅사고 / 박주연 / 화B목B / 차202", title: "컴퓨팅사고", professor: "박주연", color: "orange" },
  { text: "현대사회와부족들 / 함세정 / 수A목A / 차204", title: "현대사회와부족들", professor: "함세정", color: "yellow" },
];

const semesters = [
  "26년 1학기",
  "25년 겨울학기",
  "25년 2학기",
  "25년 여름학기",
  "25년 1학기",
];

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

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

function setStars(score) {
  selectedScore = Number(score);
  scoreValue.textContent = selectedScore;

  stars.forEach((star) => {
    star.classList.toggle("active", Number(star.dataset.score) <= selectedScore);
  });
}

function applyButtonColor() {
  submitBtn.classList.remove("blue-light", "blue", "orange", "yellow", "pink");

  const currentLecture = getCurrentLecture();
  selectedColor = currentLecture.color;

  if (selectedColor) {
    submitBtn.classList.add(selectedColor);
  }
}

function checkForm() {
  const hasScore = selectedScore > 0;
  const hasContent = reviewContent.value.trim().length > 0;
  const hasLecture = lectureName.value.trim().length > 0;
  const hasSemester = semester.value.trim().length > 0;

  if (hasScore && hasContent && hasLecture && hasSemester) {
    submitBtn.disabled = false;
    submitBtn.classList.add("active");
    applyButtonColor();
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.remove("active", "blue-light", "blue", "orange", "yellow", "pink");
  }
}

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

stars.forEach((star) => {
  star.addEventListener("click", () => {
    setStars(star.dataset.score);
    checkForm();
  });
});

reviewContent.addEventListener("input", () => {
  contentCount.textContent = reviewContent.value.length;
  checkForm();
});

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

semester.addEventListener("click", showSemesterDropdown);
semester.addEventListener("focus", showSemesterDropdown);

document.addEventListener("click", (event) => {
  if (!lectureName.contains(event.target) && !lectureDropdown.contains(event.target)) {
    lectureDropdown.classList.remove("show");
  }

  if (!semester.contains(event.target) && !semesterDropdown.contains(event.target)) {
    semesterDropdown.classList.remove("show");
  }
});

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

    location.href =
      "/reviews/list/" +
      "?title=" + encodeURIComponent(currentLecture.title) +
      "&professor=" + encodeURIComponent(currentLecture.professor) +
      "&color=" + encodeURIComponent(currentLecture.color);
  } catch (err) {
    alert("후기 저장 중 오류가 발생했습니다: " + err.message);
    submitBtn.disabled = false;
    checkForm();
  }
});

loadInitialData();