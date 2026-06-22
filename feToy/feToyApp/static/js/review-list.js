const params = new URLSearchParams(window.location.search);

const selectedTitle = params.get("title") || "생명과학의기초";
const selectedProfessor = params.get("professor") || "김태훈";
const selectedColor = params.get("color") || "blue-light";

const pageTitle = document.getElementById("pageTitle");
const reviewList = document.getElementById("reviewList");
const writeBtn = document.getElementById("writeBtn");
const summaryStars = document.getElementById("summaryStars");
const iconPaths = document.getElementById("iconPaths");

const likeIcon = iconPaths.dataset.like;
const commentIcon = iconPaths.dataset.comment;
const starActiveIcon = iconPaths.dataset.starActive;
const starInactiveIcon = iconPaths.dataset.starInactive;

pageTitle.textContent = `${selectedTitle} 수강 후기`;

const reviewData = [
  {
    date: "06/12 14:20",
    semester: "26년 1학기 수강자",
    rating: 5,
    like: 3,
    comment: 3,
    content:
      "수업을 들어도 모르겠고 언제나 어렵지만... 책보고 공부해도 되고 성적도 잘 나와서 괜찮은 수업입니다.",
  },
  {
    date: "06/12 14:05",
    semester: "26년 1학기 수강자",
    rating: 4,
    like: 3,
    comment: 3,
    content: "교수님 천사",
  },
  {
    date: "06/12 12:20",
    semester: "26년 1학기 수강자",
    rating: 4,
    like: 1,
    comment: 3,
    content: "어려운데 다들 어려워해서 성적은 잘 나와요.",
  },
  {
    date: "06/10 11:50",
    semester: "26년 1학기 수강자",
    rating: 4,
    like: 1,
    comment: 2,
    content:
      "바공 생각하시는거면 꼭 들으세요. 저도 바공 생각하고 입학했는데 들은 후에 생각이 많이 바뀌었습니다... 내용은 고등학교 때와...",
  },
  {
    date: "12/27 14:20",
    semester: "25년 2학기 수강자",
    rating: 2,
    like: 3,
    comment: 3,
    content: "설명이 이해가 잘 안됨",
    mine: true,
  },
  {
    date: "11/12 14:32",
    semester: "25년 2학기 수강자",
    rating: 4,
    like: 3,
    comment: 3,
    content: "생2 좋아했던 사람으로서 재밌었어요",
  },
];

function makeStars(score) {
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    const src = i <= score ? starActiveIcon : starInactiveIcon;
    stars += `<img src="${src}" alt="별점">`;
  }

  return stars;
}

summaryStars.innerHTML = makeStars(4);

function renderReviews() {
  reviewList.innerHTML = "";

  reviewData.forEach((review) => {
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
                <button type="button">수정</button>
                <button type="button">삭제</button>
              </div>`
            : ""
        }
      </div>

      <div class="review-rating-row">
        <div class="review-stars">${makeStars(review.rating)}</div>

        <div class="review-meta">
          <span>
            <img src="${likeIcon}" alt="좋아요">
            ${review.like}
          </span>
          <span>
            <img src="${commentIcon}" alt="댓글">
            ${review.comment}
          </span>
        </div>
      </div>

      <p class="review-content">${review.content}</p>
    `;

    reviewList.appendChild(item);
  });
}

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

renderReviews();