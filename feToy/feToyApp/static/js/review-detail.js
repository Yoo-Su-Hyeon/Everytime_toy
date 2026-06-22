const params = new URLSearchParams(window.location.search);

const selectedTitle = params.get("title") || "생명과학의기초";
const selectedProfessor = params.get("professor") || "김태훈";
const selectedColor = params.get("color") || "blue-light";
const selectedId = params.get("id") || "";
const selectedDate = params.get("date") || "06/10 11:50";
const selectedSemester = params.get("semester") || "26년 1학기 수강자";
const selectedRating = Number(params.get("rating")) || 4;
const selectedLike = Number(params.get("like")) || 1;
const selectedMine = params.get("mine") === "true" || selectedId.startsWith("my-");
const selectedContent = params.get("content") || "";

const iconPaths = document.getElementById("iconPaths");

const likeIconPath = iconPaths.dataset.like;
const likeActiveIconPath = iconPaths.dataset.likeActive;
const commentIconPath = iconPaths.dataset.comment;
const starActiveIcon = iconPaths.dataset.starActive;
const starInactiveIcon = iconPaths.dataset.starInactive;

const detailTitle = document.getElementById("detailTitle");
const detailProfessor = document.getElementById("detailProfessor");
const detailSemester = document.getElementById("detailSemester");
const detailDate = document.getElementById("detailDate");
const detailScore = document.getElementById("detailScore");
const detailStars = document.getElementById("detailStars");
const detailContent = document.getElementById("detailContent");

const actionBar = document.querySelector(".action-bar");
const commentList = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const commentInput = document.getElementById("commentInput");

detailTitle.textContent = `${selectedTitle} 수강 후기`;
detailProfessor.textContent = `교수명: ${selectedProfessor}`;
detailSemester.textContent = selectedSemester;
detailDate.textContent = selectedDate;
detailScore.textContent = `${selectedRating} / 5`;
detailContent.textContent = selectedContent;

function makeStars(score) {
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    const src = i <= score ? starActiveIcon : starInactiveIcon;
    stars += `<img src="${src}" alt="별점">`;
  }

  return stars;
}

detailStars.innerHTML = makeStars(selectedRating);

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

function ensureDeleteModal() {
  let modal = document.getElementById("deleteModal");

  if (modal) return modal;

  modal = document.createElement("div");
  modal.className = "delete-modal";
  modal.id = "deleteModal";

  modal.innerHTML = `
    <div class="delete-modal-content">
      <p id="deleteModalText">수강 후기를 정말 삭제하시겠습니까?</p>

      <div class="delete-btn-row" id="deleteBtnRow">
        <button type="button" class="cancel-btn" id="cancelDeleteBtn">취소</button>
        <button type="button" class="confirm-delete-btn" id="confirmDeleteBtn">삭제</button>
      </div>

      <button type="button" class="ok-btn" id="deleteOkBtn">확인</button>
    </div>
  `;

  document.querySelector(".mobile-container").appendChild(modal);

  return modal;
}

const deleteModal = ensureDeleteModal();
const deleteModalText = document.getElementById("deleteModalText");
const deleteBtnRow = document.getElementById("deleteBtnRow");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const deleteOkBtn = document.getElementById("deleteOkBtn");

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

function deleteReview() {
  if (selectedId.startsWith("my-")) {
    const savedReviews = getSavedReviews().filter((review) => {
      return review.id !== selectedId;
    });

    saveReviews(savedReviews);
  } else {
    const deletedIds = getDeletedDefaultIds();

    if (!deletedIds.includes(selectedId)) {
      deletedIds.push(selectedId);
    }

    saveDeletedDefaultIds(deletedIds);
  }

  openDeleteDoneModal();
}

if (selectedMine) {
actionBar.innerHTML = `
  <button type="button" id="commentMoveBtn">
    <img src="${commentIconPath}" alt="댓글">
    <span>댓글</span>
  </button>

  <button type="button" id="editReviewBtn">
    <img src="/static/images/수정.svg" alt="수정">
    <span>수정</span>
  </button>

  <button type="button" id="deleteReviewBtn">
    <img src="/static/images/삭제.svg" alt="삭제">
    <span>삭제</span>
  </button>
`;

  commentList.innerHTML = "";
  commentInput.placeholder = "첫 댓글을 입력해 보세요.";

  document.getElementById("editReviewBtn").addEventListener("click", function () {
    location.href =
      "/reviews/write/" +
      "?title=" +
      encodeURIComponent(selectedTitle) +
      "&professor=" +
      encodeURIComponent(selectedProfessor) +
      "&color=" +
      encodeURIComponent(selectedColor) +
      "&editId=" +
      encodeURIComponent(selectedId);
  });

  document.getElementById("deleteReviewBtn").addEventListener("click", function () {
    openDeleteConfirmModal();
  });
} else {
  let reviewLikeCount = selectedLike;
  let isReviewLiked = false;

  actionBar.innerHTML = `
    <button type="button" id="reviewLikeBtn">
      <img id="likeIcon" src="${likeIconPath}" alt="좋아요">
      <span id="likeCount">추천 ${reviewLikeCount}</span>
    </button>

    <button type="button">
      <img id="commentIcon" src="${commentIconPath}" alt="댓글">
      <span id="commentCount">댓글 2</span>
    </button>

    <button type="button">
      <span>신고</span>
    </button>
  `;

  const reviewLikeBtn = document.getElementById("reviewLikeBtn");
  const likeIcon = document.getElementById("likeIcon");
  const likeCount = document.getElementById("likeCount");

  reviewLikeBtn.addEventListener("click", function () {
    isReviewLiked = !isReviewLiked;

    if (isReviewLiked) {
      reviewLikeCount += 1;
      reviewLikeBtn.classList.add("active");
      likeIcon.src = likeActiveIconPath;
    } else {
      reviewLikeCount -= 1;
      reviewLikeBtn.classList.remove("active");
      likeIcon.src = likeIconPath;
    }

    likeCount.textContent = `추천 ${reviewLikeCount}`;
  });
}

commentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = commentInput.value.trim();

  if (text === "") {
    alert("댓글을 입력해주세요.");
    return;
  }

  const newComment = document.createElement("article");
  newComment.className = "comment-item";

  newComment.innerHTML = `
    <div class="comment-top">
      <strong>익명</strong>
      <div class="comment-icons">
        <button type="button">
          <img src="${likeIconPath}" alt="좋아요">
        </button>
        <button type="button">
          <img src="${commentIconPath}" alt="댓글">
        </button>
      </div>
    </div>

    <p>${text}</p>
    <span class="comment-date">방금 전</span>
  `;

  commentList.appendChild(newComment);
  commentInput.value = "";
});

cancelDeleteBtn.addEventListener("click", function () {
  deleteModal.classList.remove("show");
});

confirmDeleteBtn.addEventListener("click", function () {
  deleteReview();
});

deleteOkBtn.addEventListener("click", function () {
  location.href =
    "/reviews/list/" +
    "?title=" +
    encodeURIComponent(selectedTitle) +
    "&professor=" +
    encodeURIComponent(selectedProfessor) +
    "&color=" +
    encodeURIComponent(selectedColor);
});