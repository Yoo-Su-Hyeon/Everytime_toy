const params = new URLSearchParams(window.location.search);

const selectedTitle = params.get("title") || "생명과학의기초";
const selectedProfessor = params.get("professor") || "김태훈";
const selectedColor = params.get("color") || "blue-light";
const selectedId = params.get("id") || "";
const selectedDate = params.get("date") || "06/10 11:50";
const selectedSemester = params.get("semester") || "26년 1학기 수강자";
const selectedRating = Number(params.get("rating")) || 4;
const selectedLike = Number(params.get("like")) || 1;
const selectedMine = params.get("mine") === "true";
const selectedContent = params.get("content") || "";

const iconPaths = document.getElementById("iconPaths");

const likeIconPath = iconPaths.dataset.like;
const likeActiveIconPath = iconPaths.dataset.likeActive;
const commentIconPath = iconPaths.dataset.comment;
const starActiveIcon = iconPaths.dataset.starActive;
const starInactiveIcon = iconPaths.dataset.starInactive;
const commentLikeIcon = iconPaths.dataset.commentLike;
const replyBtnIcon = iconPaths.dataset.replyBtn;
const replyArrowIcon = iconPaths.dataset.replyArrow;
const replyLikeIcon = iconPaths.dataset.replyLike;

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

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

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

async function deleteReview() {
  if (/^\d+$/.test(String(selectedId))) {
    try {
      await fetch("/api/reviews/delete/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({ id: Number(selectedId) }),
      });
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }
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

    <button type="button" id="commentMoveBtn">
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

  document.getElementById("commentMoveBtn").addEventListener("click", function () {
    commentInput.focus();
  });

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

// 대댓글 대상 추적
let replyTarget = null;
let focusingForReply = false;
let myAnonNum = null; // 이 세션에서 내가 쓸 익명 번호

// 댓글 좋아요 / 대댓글 버튼 (동적으로 추가되는 댓글 포함)
commentList.addEventListener("click", function (event) {
  // 대댓글 버튼 → 대상 기억 후 하단 입력창 포커스
  const replyBtn = event.target.closest(".comment-reply-btn");
  if (replyBtn) {
    const article = replyBtn.closest("article");

    // 대댓글의 경우 부모 댓글을 찾음
    if (article.classList.contains("reply")) {
      let prev = article.previousElementSibling;
      while (prev && prev.classList.contains("reply")) {
        prev = prev.previousElementSibling;
      }
      replyTarget = prev || article;
    } else {
      replyTarget = article;
    }

    focusingForReply = true;
    commentInput.placeholder = "대댓글을 입력하세요.";
    commentInput.focus();
    setTimeout(function () { focusingForReply = false; }, 0);
    return;
  }

  // 댓글 좋아요
  const likeBtn = event.target.closest(".comment-like-btn");
  if (!likeBtn) return;

  const article = likeBtn.closest("article");
  const countEl = article.querySelector(".comment-like-count");
  if (!countEl) return;

  const isLiked = likeBtn.dataset.liked === "true";
  likeBtn.dataset.liked = isLiked ? "false" : "true";
  countEl.textContent = Number(countEl.textContent) + (isLiked ? -1 : 1);
  likeBtn.style.opacity = isLiked ? "1" : "0.5";
});

function getNextAnonNumber() {
  let max = 0;
  commentList.querySelectorAll("strong").forEach(function (el) {
    const match = el.textContent.match(/^익명(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return max + 1;
}

// 입력창 직접 클릭 시 대댓글 모드 해제
commentInput.addEventListener("focus", function () {
  if (!focusingForReply) {
    replyTarget = null;
    commentInput.placeholder = "댓글을 입력하세요.";
  }
});

commentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = commentInput.value.trim();

  if (text === "") {
    alert("댓글을 입력해주세요.");
    return;
  }

  if (replyTarget) {
    // 대댓글 생성
    const reply = document.createElement("article");
    reply.className = "comment-item reply";
    if (myAnonNum === null) myAnonNum = getNextAnonNumber();
    const replyAnonNum = myAnonNum;
    reply.innerHTML = `
      <span class="reply-mark">
        <img src="${replyArrowIcon}" alt="댓글" />
      </span>
      <div class="reply-body">
        <div class="comment-top">
          <strong>익명${replyAnonNum}</strong>
          <div class="comment-icons">
            <button type="button" class="comment-like-btn" data-liked="false">
              <img src="${commentLikeIcon}" alt="좋아요" />
            </button>
            <button type="button" class="comment-reply-btn">
              <img src="${replyBtnIcon}" alt="댓글" />
            </button>
          </div>
        </div>
        <p>${text}</p>
        <span>방금 전
          <span class="comment-like-info">
            <img src="${replyLikeIcon}" alt="좋아요" />
            <span class="comment-like-count">0</span>
          </span>
        </span>
      </div>
    `;

    // 부모 댓글 이후 마지막 대댓글 다음에 삽입
    let insertAfter = replyTarget;
    while (
      insertAfter.nextElementSibling &&
      insertAfter.nextElementSibling.classList.contains("comment-item") &&
      insertAfter.nextElementSibling.classList.contains("reply")
    ) {
      insertAfter = insertAfter.nextElementSibling;
    }
    insertAfter.after(reply);

    replyTarget = null;
    commentInput.placeholder = "댓글을 입력하세요.";
  } else {
    // 일반 댓글 생성 (익명 번호 자동 부여)
    if (myAnonNum === null) myAnonNum = getNextAnonNumber();
    const anonNum = myAnonNum;
    const newComment = document.createElement("article");
    newComment.className = "comment-item";
    newComment.innerHTML = `
      <div class="comment-top">
        <strong>익명${anonNum}</strong>
        <div class="comment-icons">
          <button type="button" class="comment-like-btn" data-liked="false">
            <img src="${commentLikeIcon}" alt="좋아요">
          </button>
          <button type="button" class="comment-reply-btn">
            <img src="${replyBtnIcon}" alt="댓글">
          </button>
        </div>
      </div>
      <p>${text}</p>
      <span class="comment-date">방금 전</span>
    `;
    commentList.appendChild(newComment);
  }

  commentInput.value = "";
});

cancelDeleteBtn.addEventListener("click", function () {
  deleteModal.classList.remove("show");
});

confirmDeleteBtn.addEventListener("click", async function () {
  await deleteReview();
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