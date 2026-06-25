// =============================================
// review-detail.js — 수강 후기 상세 페이지
// =============================================

// URL 파라미터에서 후기 상세 데이터 읽기
// mine: true이면 본인 작성 후기 → 수정·삭제 버튼 표시, 댓글 목록 초기화
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

// HTML data 속성에서 아이콘 경로 읽기
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

// DOM 요소 참조
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

// 후기 상세 정보 화면에 출력
detailTitle.textContent = `${selectedTitle} 수강 후기`;
detailProfessor.textContent = `교수명: ${selectedProfessor}`;
detailSemester.textContent = selectedSemester;
detailDate.textContent = selectedDate;
detailScore.textContent = `${selectedRating} / 5`;
detailContent.textContent = selectedContent;

// 별점 이미지 HTML 생성
function makeStars(score) {
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    const src = i <= score ? starActiveIcon : starInactiveIcon;
    stars += `<img src="${src}" alt="별점">`;
  }

  return stars;
}

detailStars.innerHTML = makeStars(selectedRating);

// 쿠키에서 Django CSRF 토큰 읽기 (API DELETE 요청 시 필요)
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

// 삭제된 샘플 후기 ID를 localStorage에서 관리하는 유틸 함수
// (과목별 수강 후기 목록에서와 동일한 키 체계 사용)
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

// 삭제 확인 모달이 없으면 동적으로 생성하여 DOM에 추가
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

// 삭제 확인 모달 표시
function openDeleteConfirmModal() {
  deleteModal.classList.add("show");
  deleteModalText.textContent = "수강 후기를 정말 삭제하시겠습니까?";
  deleteBtnRow.style.display = "flex";
  deleteOkBtn.style.display = "none";
}

// 삭제 완료 메시지로 모달 전환
function openDeleteDoneModal() {
  deleteModalText.textContent = "수강 후기가 삭제되었습니다.";
  deleteBtnRow.style.display = "none";
  deleteOkBtn.style.display = "block";
}

// 후기 삭제 처리
// - 숫자 ID: DB 후기 → API로 삭제
// - 문자열 ID (default-X): 샘플 후기 → localStorage에 삭제 기록
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

// 액션 바 렌더링
// - mine: true → 수정·삭제·댓글 버튼 표시 (본인 작성 후기)
// - mine: false → 추천·댓글·신고 버튼 표시 (다른 사람 후기)
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

  // 본인 후기 상세 진입 시 댓글 목록 초기화 (빈 상태로 시작)
  commentList.innerHTML = "";
  commentInput.placeholder = "첫 댓글을 입력해 보세요.";

  // 수정 버튼: 후기 작성 폼으로 이동 (editId 전달)
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

  // 삭제 버튼: 삭제 확인 모달 표시
  document.getElementById("deleteReviewBtn").addEventListener("click", function () {
    openDeleteConfirmModal();
  });
} else {
  // 다른 사람 후기 → 추천 토글 + 댓글 이동 + 신고 버튼
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

  // 댓글 버튼: 하단 댓글 입력창으로 포커스 이동 (일반 댓글 모드)
  document.getElementById("commentMoveBtn").addEventListener("click", function () {
    commentInput.focus();
  });

  // 추천 버튼: 토글로 좋아요 +1/-1 처리 (UI 반영만, 서버 미연동)
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

// 대댓글 대상 댓글을 추적하는 변수
// replyTarget: 클릭한 댓글의 article 요소 (null이면 일반 댓글 모드)
// focusingForReply: 프로그래밍적 포커스 시 focus 이벤트가 replyTarget을 초기화하는 것을 방지
// myAnonNum: 현재 페이지 세션에서 나에게 부여된 익명 번호 (페이지 재진입 시 초기화)
let replyTarget = null;
let focusingForReply = false;
let myAnonNum = null;

// 이벤트 위임으로 동적 댓글에도 버튼 동작 적용
commentList.addEventListener("click", function (event) {
  // 대댓글 버튼 클릭 처리
  const replyBtn = event.target.closest(".comment-reply-btn");
  if (replyBtn) {
    const article = replyBtn.closest("article");

    // 대댓글에 달린 답글 버튼이면, 부모 댓글(원본 댓글)을 찾아 replyTarget으로 설정
    if (article.classList.contains("reply")) {
      let prev = article.previousElementSibling;
      while (prev && prev.classList.contains("reply")) {
        prev = prev.previousElementSibling;
      }
      replyTarget = prev || article;
    } else {
      replyTarget = article;
    }

    // 포커스 이벤트로 인한 replyTarget 초기화를 잠시 막음
    focusingForReply = true;
    commentInput.placeholder = "대댓글을 입력하세요.";
    commentInput.focus();
    setTimeout(function () { focusingForReply = false; }, 0);
    return;
  }

  // 댓글 좋아요 버튼 클릭 처리 (토글, UI 반영만)
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

// 기존 댓글에서 가장 높은 익명 번호를 찾아 다음 번호 반환
// 동일 세션에서 같은 사용자의 익명 번호 일관성은 myAnonNum으로 관리
function getNextAnonNumber() {
  let max = 0;
  commentList.querySelectorAll("strong").forEach(function (el) {
    const match = el.textContent.match(/^익명(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return max + 1;
}

// 댓글 입력창 직접 클릭·탭 시 대댓글 모드 해제 (일반 댓글 모드로 전환)
// focusingForReply가 true이면 대댓글 버튼 클릭에 의한 포커스이므로 모드 유지
commentInput.addEventListener("focus", function () {
  if (!focusingForReply) {
    replyTarget = null;
    commentInput.placeholder = "댓글을 입력하세요.";
  }
});

// 댓글 폼 제출 처리
commentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = commentInput.value.trim();

  if (text === "") {
    alert("댓글을 입력해주세요.");
    return;
  }

  if (replyTarget) {
    // 대댓글 생성: 부모 댓글 바로 아래(기존 대댓글 끝)에 삽입
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

    // 부모 댓글 이후 연속된 대댓글을 지나 가장 마지막 위치에 삽입
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
    // 일반 댓글 생성: 익명 번호 세션 내 일관성 유지 (myAnonNum 재사용)
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

// 삭제 취소 버튼: 모달 닫기
cancelDeleteBtn.addEventListener("click", function () {
  deleteModal.classList.remove("show");
});

// 삭제 확인 버튼: 실제 삭제 수행
confirmDeleteBtn.addEventListener("click", async function () {
  await deleteReview();
});

// 삭제 완료 확인 버튼: 후기 목록 페이지로 이동
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
