const params = new URLSearchParams(window.location.search);

const selectedTitle = params.get("title") || "생명과학의기초";
const selectedProfessor = params.get("professor") || "김태훈";
const selectedColor = params.get("color") || "blue-light";

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

const likeIcon = iconPaths.dataset.like;
const commentIcon = iconPaths.dataset.comment;
const starActiveIcon = iconPaths.dataset.starActive;
const starInactiveIcon = iconPaths.dataset.starInactive;
const emptyIcon = iconPaths.dataset.empty;

pageTitle.textContent = `${selectedTitle} 수강 후기`;
professorName.textContent = `교수명: ${selectedProfessor}`;

let currentRatingFilter = "전체";
let currentSortFilter = "최신순";
let deleteTargetId = null;

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
    comment: 3,
    content: "설명이 이해가 잘 안됨",
    mine: true,
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

function getStorageKey() {
  return `reviews_${selectedTitle}_${selectedProfessor}`;
}

function getDeletedKey() {
  return `deleted_${selectedTitle}_${selectedProfessor}`;
}

function getSavedReviews() {
  const saved = localStorage.getItem(getStorageKey());
  return saved ? JSON.parse(saved) : [];
}

function saveReviews(reviews) {
  localStorage.setItem(getStorageKey(), JSON.stringify(reviews));
}

function getDeletedDefaultIds() {
  const deleted = localStorage.getItem(getDeletedKey());
  return deleted ? JSON.parse(deleted) : [];
}

function saveDeletedDefaultIds(ids) {
  localStorage.setItem(getDeletedKey(), JSON.stringify(ids));
}

function getDefaultReviewsForCurrentCourse() {
  if (selectedTitle === "생명과학의기초" && selectedProfessor === "김태훈") {
    const deletedIds = getDeletedDefaultIds();
    return defaultReviews.filter((review) => !deletedIds.includes(review.id));
  }

  return [];
}

function getAllReviews() {
  return [...getSavedReviews(), ...getDefaultReviewsForCurrentCourse()];
}

function makeStars(score) {
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    const src = i <= score ? starActiveIcon : starInactiveIcon;
    stars += `<img src="${src}" alt="별점">`;
  }

  return stars;
}

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

function renderReviews() {
  reviewList.innerHTML = "";

  let filteredReviews = getAllReviews();

  updateSummary(filteredReviews);

  if (currentRatingFilter !== "전체") {
    filteredReviews = filteredReviews.filter((review) => {
      return review.rating === Number(currentRatingFilter);
    });
  }

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

    reviewList.appendChild(item);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      location.href =
        "/reviews/write/" +
        "?title=" +
        encodeURIComponent(selectedTitle) +
        "&professor=" +
        encodeURIComponent(selectedProfessor) +
        "&color=" +
        encodeURIComponent(selectedColor) +
        "&editId=" +
        encodeURIComponent(id);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteTargetId = btn.dataset.id;
      openDeleteConfirmModal();
    });
  });
}

function closeAllDropdowns() {
  ratingFilter.classList.remove("open");
  sortFilter.classList.remove("open");
}

ratingFilter.querySelector(".select-btn").addEventListener("click", function (event) {
  event.stopPropagation();

  const isOpen = ratingFilter.classList.contains("open");
  closeAllDropdowns();

  if (!isOpen) {
    ratingFilter.classList.add("open");
  }
});

sortFilter.querySelector(".select-btn").addEventListener("click", function (event) {
  event.stopPropagation();

  const isOpen = sortFilter.classList.contains("open");
  closeAllDropdowns();

  if (!isOpen) {
    sortFilter.classList.add("open");
  }
});

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

sortFilter.querySelectorAll(".select-dropdown li").forEach(function (item) {
  item.addEventListener("click", function (event) {
    event.stopPropagation();

    currentSortFilter = item.dataset.value;
    sortFilterText.textContent = currentSortFilter;

    sortFilter.classList.remove("open");
    renderReviews();
  });
});

document.addEventListener("click", closeAllDropdowns);

writeBtn.classList.add(selectedColor);

writeBtn.addEventListener("click", function () {
  location.href =
    "/reviews/write/" +
    "?title=" +
    encodeURIComponent(selectedTitle) +
    "&professor=" +
    encodeURIComponent(selectedProfessor) +
    "&color=" +
    encodeURIComponent(selectedColor);
});

function openDeleteConfirmModal() {
  deleteModal.classList.add("show");
  deleteModalText.textContent = "수강 후기를 정말 삭제하시겠습니까?";
  deleteBtnRow.style.display = "flex";
  deleteOkBtn.style.display = "none";
}

function openDeleteDoneModal() {
  deleteModalText.textContent = "수강 후기가 삭제되었습니다.";
  deleteBtnRow.style.display = "none";
  deleteOkBtn.style.display = "block";
}

cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.classList.remove("show");
  deleteTargetId = null;
});

confirmDeleteBtn.addEventListener("click", () => {
  if (!deleteTargetId) return;

  if (deleteTargetId.startsWith("my-")) {
    const savedReviews = getSavedReviews().filter(
      (review) => review.id !== deleteTargetId
    );
    saveReviews(savedReviews);
  } else {
    const deletedIds = getDeletedDefaultIds();

    if (!deletedIds.includes(deleteTargetId)) {
      deletedIds.push(deleteTargetId);
    }

    saveDeletedDefaultIds(deletedIds);
  }

  deleteTargetId = null;
  renderReviews();
  openDeleteDoneModal();
});

deleteOkBtn.addEventListener("click", () => {
  deleteModal.classList.remove("show");
});

renderReviews();