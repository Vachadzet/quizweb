const API_URL =
  "https://raw.githubusercontent.com/lomsadze123/movie-api/refs/heads/main/data.json";

let allData = [];
let bookmarks = new Set();

function loadBookmarks() {
  const saved = localStorage.getItem("bookmarks");

  if (saved) {
    JSON.parse(saved).forEach((title) => bookmarks.add(title));
  }
}

function saveBookmarks() {
  localStorage.setItem("bookmarks", JSON.stringify([...bookmarks]));
}

function getImgSrc(item) {
  if (window.innerWidth >= 768) {
    return item.thumbnail.regular.large || item.thumbnail.regular.medium;
  }

  return item.thumbnail.regular.small || item.thumbnail.regular.medium;
}

function createCard(item) {
  const isBookmarked = bookmarks.has(item.title);

  const card = document.createElement("div");
  card.className = "movie-card";

  card.innerHTML = `
    <div class="thumbnail-container">
      <img
        src="${getImgSrc(item)}"
        alt="${item.title}"
        class="movie-thumb"
        loading="lazy"
      />

      <button
        class="bookmark-btn ${isBookmarked ? "bookmarked" : ""}"
        data-title="${item.title}"
      >
        <svg
          width="12"
          height="14"
          viewBox="0 0 12 14"
          fill="${isBookmarked ? "white" : "none"}"
          stroke="white"
          stroke-width="1.5"
        >
          <path d="M1 1h10v12l-5-3-5 3V1z"/>
        </svg>
      </button>
    </div>

    <div class="meta-container">
      <div class="details-row">
        <span>${item.year}</span>
        <span>•</span>
        <span> ${item.category}</span>
        <span>•</span>
        <span>${item.rating}</span>
      </div>

      <h3 class="movie-title">${item.title}</h3>
    </div>
  `;

  const bookmarkBtn = card.querySelector(".bookmark-btn");

  bookmarkBtn.addEventListener("click", () => {
    const svg = bookmarkBtn.querySelector("svg");

    if (bookmarks.has(item.title)) {
      bookmarks.delete(item.title);
      bookmarkBtn.classList.remove("bookmarked");
      svg.setAttribute("fill", "none");
    } else {
      bookmarks.add(item.title);
      bookmarkBtn.classList.add("bookmarked");
      svg.setAttribute("fill", "white");
    }

    saveBookmarks();
  });

  return card;
}

function render(searchText = "") {
  const grid = document.getElementById("seriesGrid");
  const pageTitle = document.querySelector(".page-title");

  grid.innerHTML = "";

  const tvSeries = allData.filter((item) => item.category === "TV Series");

  const query = searchText.toLowerCase().trim();

  const filteredItems = query
    ? tvSeries.filter((item) => item.title.toLowerCase().includes(query))
    : tvSeries;

  if (query) {
    pageTitle.textContent = `Found ${filteredItems.length} result${
      filteredItems.length !== 1 ? "s" : ""
    } for '${searchText}'`;
  } else {
    pageTitle.textContent = "TV Series";
  }

  if (filteredItems.length === 0) {
    grid.innerHTML = `
      <p style="
        color:#5A698F;
        padding:40px 0;
        font-size:18px;
      ">
        No results found.
      </p>
    `;
    return;
  }

  filteredItems.forEach((item) => {
    grid.appendChild(createCard(item));
  });
}

async function init() {
  loadBookmarks();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    allData = await response.json();

    render();
  } catch (error) {
    console.error(error);

    document.getElementById("seriesGrid").innerHTML = `
      <p style="
        color:#FC4747;
        padding:40px 0;
      ">
        Failed to load content.
      </p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-input");

  searchInput.addEventListener("input", (e) => {
    render(e.target.value);
  });

  init();
});