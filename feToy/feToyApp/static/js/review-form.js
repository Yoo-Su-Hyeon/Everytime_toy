const reviewParams = new URLSearchParams(window.location.search);
const selectedTitle = reviewParams.get("title");
const selectedProfessor = reviewParams.get("professor");
let selectedColor = reviewParams.get("color");

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
  { text: "생명과학의기초 / 김태훈 / 화D목C / 차205", color: "blue-light" },
  { text: "식품과학의기초 / 정미숙, 한정우 / 월C수D / 차203", color: "blue-light" },
  { text: "최신일반화학 / 박현 / 월A수B / 차201", color: "blue" },
  { text: "덕성인의기초 / 이용민 / 금A / 차101", color: "orange" },
  { text: "이해와소통세미나 / 최인선 / 월A수B / 차205", color: "orange" },
  { text: "컴퓨팅사고 / 박주연 / 화B목B / 차202", color: "orange" },
  { text: "현대사회와부족들 / 함세정 / 수A목A / 차204", color: "yellow" },
];

const semesters = [
  "26년 1학기",
  "25년 겨울학기",
  "25년 2학기",
  "25년 여름학기",
  "25년 1학기"
];

if (selectedTitle && selectedProfessor) {
  const matchedLecture = lectures.find((lecture) =>
    lecture.text.includes(selectedTitle) &&
    lecture.text.includes(selectedProfessor)
  );

  if (matchedLecture) {
    lectureName.value = matchedLecture.text;
    selectedColor = matchedLecture.color;
  } else {
    lectureName.value = `${selectedTitle} / ${selectedProfessor}`;
  }
}

function applyButtonColor() {
  submitBtn.classList.remove("blue-light", "blue", "orange", "yellow", "pink");

  if (selectedColor) {
    submitBtn.classList.add(selectedColor);
  }
}

function updateSelectedColorByLecture() {
  const matchedLecture = lectures.find((lecture) =>
    lectureName.value.includes(lecture.text.split(" / ")[0])
  );

  if (matchedLecture) {
    selectedColor = matchedLecture.color;
  }
}

function checkForm() {
  updateSelectedColorByLecture();

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

  const filteredLectures = lectures.filter((lecture) =>
    lecture.text.includes(keyword)
  );

  filteredLectures.forEach((lecture) => {
    const li = document.createElement("li");
    li.textContent = lecture.text;

    li.addEventListener("click", () => {
      lectureName.value = lecture.text;
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

stars.forEach((star) => {
  star.addEventListener("click", () => {
    selectedScore = Number(star.dataset.score);
    scoreValue.textContent = selectedScore;

    stars.forEach((item) => {
      item.classList.toggle("active", Number(item.dataset.score) <= selectedScore);
    });

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

submitBtn.addEventListener("click", () => {
  alert("후기 작성이 완료되었습니다.");
});

checkForm();