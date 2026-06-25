// =============================================
// review-list.js — 과목별 수강 후기 목록 페이지
// =============================================

// URL 파라미터에서 과목명·교수명·배지 색상 읽기
const params = new URLSearchParams(window.location.search);

const selectedTitle = params.get("title") || "생명과학의기초";
const selectedProfessor = params.get("professor") || "김태훈";
const selectedColor = params.get("color") || "blue-light";

// DOM 요소 참조
const pageTitle = document.getElementById("pageTitle");
const professorName = document.getElementById("professorName");
const reviewList = document.getElementById("reviewList");
const writeBtn = document.getElementById("writeBtn");
const iconPaths = document.getElementById("iconPaths");
const summaryStars = document.getElementById("summaryStars");

const ratingFilter = document.getElementById("ratingFilter");
const sortFilter = document.getElementById("sortFilter");
const ratingFilterText = document.getElementById("ratingFilterText");
const sortFilterText = document.getElementById("sortFilterText");

const deleteModal = document.getElementById("deleteModal");
const deleteModalText = document.getElementById("deleteModalText");
const deleteBtnRow = document.getElementById("deleteBtnRow");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const deleteOkBtn = document.getElementById("deleteOkBtn");

// HTML data 속성에서 아이콘 경로 읽기
const likeIcon = iconPaths.dataset.like;
const commentIcon = iconPaths.dataset.comment;
const starActiveIcon = iconPaths.dataset.starActive;
const starInactiveIcon = iconPaths.dataset.starInactive;
const emptyIcon = iconPaths.dataset.empty;

// 헤더 과목명·교수명 표시
pageTitle.textContent = `${selectedTitle} 수강 후기`;
professorName.textContent = `교수명: ${selectedProfessor}`;

// 현재 선택된 필터 상태
let currentRatingFilter = "전체";
let currentSortFilter = "최신순";
let deleteTargetId = null;

// 생명과학의기초 / 김태훈 과목에만 표시되는 샘플 후기 데이터
// mine: false → 수정·삭제 버튼 표시 안 함
const defaultReviews = [
  {
    id: "default-1",
    date: "06/12 14:20",
    semester: "26년 1학기 수강자",
    rating: 5,
    like: 3,
    comment: 3,
    content:
      "수업을 들어도 모르겠고 언제나 어렵지만... 책보고 공부해도 되고 성적도 잘 나와서 괜찮은 수업입니다.",
    mine: false,
  },
  {
    id: "default-2",
    date: "06/12 14:05",
    semester: "26년 1학기 수강자",
    rating: 4,
    like: 3,
    comment: 3,
    content: "교수님 천사",
    mine: false,
  },
  {
    id: "default-3",
    date: "06/12 12:20",
    semester: "26년 1학기 수강자",
    rating: 4,
    like: 1,
    comment: 3,
    content: "어려운데 다들 어려워해서 성적은 잘 나와요.",
    mine: false,
  },
  {
    id: "default-4",
    date: "06/10 11:50",
    semester: "26년 1학기 수강자",
    rating: 4,
    like: 1,
    comment: 2,
    content:
      "바공 생각하시는거면 꼭 들으세요. 저도 바공 생각하고 입학했는데 들은 후에 생각이 많이 바뀌었습니다... 내용은 고등학교 때와...",
    mine: false,
  },
  {
    id: "default-5",
    date: "12/27 14:20",
    semester: "25년 2학기 수강자",
    rating: 2,
    like: 3,
    comment: 0,
    content: "설명이 이해가 잘 안됨",
    mine: false,
  },
  {
    id: "default-6",
    date: "11/12 14:32",
    semester: "25년 2학기 수강자",
    rating: 5,
    like: 3,
    comment: 3,
    content: "생2 좋아했던 사람으로서 재밌었어요",
    mine: false,
  },
];

// 쿠키에서 Django CSRF 토큰 읽기 (API POST 요청 시 필요)
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

// 삭제된 기본 샘플 후기 ID를 localStorage에서 관리하는 유틸 함수
function getDeletedKey() {
  return `deleted_${selectedTitle}_${selectedProfessor}`;
}

function getDeletedDefaultIds() {
  const deleted = localStorage.getItem(getDeletedKey());
  return deleted ? JSON.parse(deleted) : [];
}

function saveDeletedDefaultIds(ids) {
  localStorage.setItem(getDeletedKey(), JSON.stringify(ids));
}

// 현재 과목이 생명과학의기초 / 김태훈인 경우에만 샘플 후기 반환
// (삭제된 항목은 localStorage 기록을 통해 제외)
function getDefaultReviewsForCurrentCourse() {
  if (selectedTitle === "생명과학의기초" && selectedProfessor === "김태훈") {
    const deletedIds = getDeletedDefaultIds();
    return defaultReviews.filter((review) => !deletedIds.includes(review.id));
  }
  return [];
}

// API에서 DB에 저장된 후기를 가져오고, 샘플 후기와 합쳐서 반환
// mine 필드는 서버에서 현재 로그인 사용자 기준으로 설정됨
async function getAllReviews() {
  try {
    const response = await fetch(
      `/api/reviews/?title=${encodeURIComponent(selectedTitle)}&professor=${encodeURIComponent(selectedProfessor)}`
    );
    const data = await response.json();
    return [...(data.reviews || []), ...getDefaultReviewsForCurrentCourse()];
  } catch (err) {
    console.error("후기 로드 실패:", err);
    return getDefaultReviewsForCurrentCourse();
  }
}

// 별점 이미지 HTML 생성 (score 이하는 활성화 별, 초과는 비활성화 별)
function makeStars(score) {
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    const src = i <= score ? starActiveIcon : starInactiveIcon;
    stars += `<img src="${src}" alt="별점">`;
  }

  return stars;
}

// 별점 필터 드롭다운의 각 항목에 실제 후기 개수를 업데이트
function updateRatingCounts(reviews) {
  const total = reviews.length;
  const counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  reviews.forEach(function (r) {
    if (r.rating in counts) counts[r.rating]++;
  });

  const ratingDropdown = document.querySelector(".rating-dropdown");

  const totalLi = ratingDropdown.querySelector('[data-value="전체"]');
  if (totalLi) totalLi.textContent = `전체(${total})`;

  [5, 4, 3, 2, 1].forEach(function (n) {
    const li = ratingDropdown.querySelector(`[data-value="${n}"]`);
    if (!li) return;
    const img = li.querySelector("img");
    li.innerHTML = (img ? img.outerHTML : "") + ` ${n}(${counts[n]})`;
  });
}

// 상단 평균 별점 및 점수 표시 업데이트
function updateSummary(reviews) {
  if (reviews.length === 0) {
    document.querySelector(".summary-left strong").textContent = "0.00";
    summaryStars.innerHTML = makeStars(0);
    return;
  }

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  document.querySelector(".summary-left strong").textContent =
    average.toFixed(2);

  summaryStars.innerHTML = makeStars(Math.round(average));
}

// 후기가 없을 때 빈 상태 화면 표시
function renderEmptyState() {
  reviewList.innerHTML = `
    <div class="empty-state">
      <p>
        아직 수강 후기가 없어요.<br>
        수강 후기를 작성해 주세요.
      </p>

      <img class="empty-icon" src="${emptyIcon}" alt="예외 화면 아이콘">
    </div>
  `;
}

// 후기 상세 페이지로 이동 (URL 파라미터로 후기 데이터 전달)
function goToDetail(review) {
  location.href =
    "/reviews/detail/" +
    "?title=" + encodeURIComponent(selectedTitle) +
    "&professor=" + encodeURIComponent(selectedProfessor) +
    "&color=" + encodeURIComponent(selectedColor) +
    "&id=" + encodeURIComponent(review.id) +
    "&date=" + encodeURIComponent(review.date) +
    "&semester=" + encodeURIComponent(review.semester) +
    "&rating=" + encodeURIComponent(review.rating) +
    "&like=" + encodeURIComponent(review.like) +
    "&comment=" + encodeURIComponent(review.comment) +
    "&mine=" + encodeURIComponent(review.mine) +
    "&content=" + encodeURIComponent(review.content);
}

// 후기 목록 렌더링
// - API + 샘플 후기 병합 후 현재 필터·정렬 조건 적용
// - mine: true인 후기에만 수정·삭제 버튼 표시 (본인 작성 후기 구분)
async function renderReviews() {
  reviewList.innerHTML = "";

  const allReviews = await getAllReviews();

  // 전체 목록 기준으로 요약 정보 및 별점별 개수 업데이트
  updateSummary(allReviews);
  updateRatingCounts(allReviews);

  let filteredReviews = [...allReviews];

  // 별점 필터 적용
  if (currentRatingFilter !== "전체") {
    filteredReviews = filteredReviews.filter((review) => {
      return review.rating === Number(currentRatingFilter);
    });
  }

  // 정렬 적용
  if (currentSortFilter === "추천순") {
    filteredReviews.sort((a, b) => b.like - a.like);
  }

  if (currentSortFilter === "오래된순") {
    filteredReviews.reverse();
  }

  if (filteredReviews.length === 0) {
    renderEmptyState();
    return;
  }

  filteredReviews.forEach((review) => {
    const item = document.createElement("article");
    item.className = "review-item";

    item.innerHTML = `
      <div class="review-top">
        <div>
          <p class="review-date">${review.date}</p>
          <p class="review-semester">${review.semester}</p>
        </div>

        ${
          review.mine
            ? `<div class="review-actions">
                <button type="button" class="edit-btn" data-id="${review.id}">수정</button>
                <button type="button" class="delete-btn" data-id="${review.id}">삭제</button>
              </div>`
            : ""
        }
      </div>

      <div class="review-rating-row">
        <div class="review-stars">${makeStars(review.rating)}</div>

        <div class="review-meta">
          <span class="like-count">
            <img src="${likeIcon}" alt="좋아요">
            ${review.like}
          </span>

          <span class="comment-count">
            <img src="${commentIcon}" alt="댓글">
            ${review.comment}
          </span>
        </div>
      </div>

      <p class="review-content">${review.content}</p>
    `;

    // 후기 항목 클릭 시 상세 페이지로 이동
    item.addEventListener("click", () => {
      goToDetail(review);
    });

    reviewList.appendChild(item);
  });

  // 수정 버튼: 후기 작성 폼으로 이동 (editId 전달)
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const id = btn.dataset.id;

      location.href =
        "/reviews/write/" +
        "?title=" + encodeURIComponent(selectedTitle) +
        "&professor=" + encodeURIComponent(selectedProfessor) +
        "&color=" + encodeURIComponent(selectedColor) +
        "&editId=" + encodeURIComponent(id);
    });
  });

  // 삭제 버튼: 삭제 확인 모달 표시
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      deleteTargetId = btn.dataset.id;
      openDeleteConfirmModal();
    });
  });
}

// 필터 드롭다운 모두 닫기
function closeAllDropdowns() {
  ratingFilter.classList.remove("open");
  sortFilter.classList.remove("open");
}

// 별점 필터 드롭다운 열기/닫기 토글
ratingFilter.querySelector(".select-btn").addEventListener("click", function (event) {
  event.stopPropagation();

  const isOpen = ratingFilter.classList.contains("open");
  closeAllDropdowns();

  if (!isOpen) {
    ratingFilter.classList.add("open");
  }
});

// 정렬 필터 드롭다운 열기/닫기 토글
sortFilter.querySelector(".select-btn").addEventListener("click", function (event) {
  event.stopPropagation();

  const isOpen = sortFilter.classList.contains("open");
  closeAllDropdowns();

  if (!isOpen) {
    sortFilter.classList.add("open");
  }
});

// 별점 필터 선택 시 목록 재렌더링
ratingFilter.querySelectorAll(".select-dropdown li").forEach(function (item) {
  item.addEventListener("click", function (event) {
    event.stopPropagation();

    currentRatingFilter = item.dataset.value;
    ratingFilterText.textContent =
      currentRatingFilter === "전체" ? "전체" : `★ ${currentRatingFilter}`;

    ratingFilter.classList.remove("open");
    renderReviews();
  });
});

// 정렬 방식 선택 시 목록 재렌더링
sortFilter.querySelectorAll(".select-dropdown li").forEach(function (item) {
  item.addEventListener("click", function (event) {
    event.stopPropagation();

    currentSortFilter = item.dataset.value;
    sortFilterText.textContent = currentSortFilter;

    sortFilter.classList.remove("open");
    renderReviews();
  });
});

// 드롭다운 외부 클릭 시 닫기
document.addEventListener("click", closeAllDropdowns);

// 후기 작성 버튼: 과목 색상 적용 후 작성 폼으로 이동
writeBtn.classList.add(selectedColor);

writeBtn.addEventListener("click", function () {
  location.href =
    "/reviews/write/" +
    "?title=" + encodeURIComponent(selectedTitle) +
    "&professor=" + encodeURIComponent(selectedProfessor) +
    "&color=" + encodeURIComponent(selectedColor);
});

// 삭제 확인 모달 표시
function openDeleteConfirmModal() {
  deleteModal.classList.add("show");
  deleteModalText.textContent = "수강 후기를 정말 삭제하시겠습니까?";
  deleteBtnRow.style.display = "flex";
  deleteOkBtn.style.display = "none";
}

// 삭제 완료 모달로 전환
function openDeleteDoneModal() {
  deleteModalText.textContent = "수강 후기가 삭제되었습니다.";
  deleteBtnRow.style.display = "none";
  deleteOkBtn.style.display = "block";
}

// 삭제 취소 버튼
cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.classList.remove("show");
  deleteTargetId = null;
});

// 삭제 확인 버튼
// - 숫자 ID: DB 후기 → API(/api/reviews/delete/)로 삭제 요청
// - 문자열 ID (default-X): 샘플 후기 → localStorage에 삭제 기록 저장
confirmDeleteBtn.addEventListener("click", async () => {
  if (!deleteTargetId) return;

  if (/^\d+$/.test(String(deleteTargetId))) {
    try {
      await fetch("/api/reviews/delete/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({ id: Number(deleteTargetId) }),
      });
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }
  } else {
    const deletedIds = getDeletedDefaultIds();
    if (!deletedIds.includes(deleteTargetId)) {
      deletedIds.push(deleteTargetId);
    }
    saveDeletedDefaultIds(deletedIds);
  }

  deleteTargetId = null;
  await renderReviews();
  openDeleteDoneModal();
});

// 삭제 완료 확인 버튼: 모달 닫기
deleteOkBtn.addEventListener("click", () => {
  deleteModal.classList.remove("show");
});

// 페이지 로드 시 후기 목록 초기 렌더링
renderReviews();
