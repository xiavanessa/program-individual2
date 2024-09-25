"strict mode";
//navbar
const navLogout = () => {
  const logoutBtn = document.querySelector("#logoutButton");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", async function () {
    try {
      const response = await fetch("/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Logout was successful, redirect to the home or login page
        window.location.href = "/index"; // or wherever you want to redirect after logout
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Error during logout. Please try again.");
    }
  });
};
navLogout();

//home page
//Section1 refresh btn
const homeSection1Refresh = function () {
  const paginationButton = document.querySelector(".home-pagination__btn");
  if (!document.querySelector(".home-pagination__btn")) return;

  paginationButton.addEventListener("click", function (e) {
    e.preventDefault();
    const url = this.getAttribute("href"); // get the href attribute
    console.log("Refreshing page with URL:", url);

    // fetch the data
    fetch(`http://localhost:8080/home${url}`)
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        //parse the response data as JSON
        return response.json();
      })
      .then((data) => {
        // empty the current words container
        const wordsContainer = document.querySelector(".homepage-section1-row");
        wordsContainer.innerHTML = "";

        // loop
        data.words.forEach((word) => {
          const wordHtml = `
            <div class="col-1-of-6 col-md-4 col-sm-6 col-xs-12">
              <div class="thumbnail feature-box">
                <div class="feature-box__section--1">
                  <h3><b>${word.word}</b></h3>
                </div>
                <div class="feature-box__section--2">
                  <p><b>ORDKLASS: </b>${word.word_class}</p>
                </div>
                <div class="feature-box__section--3">
                  <div class="feature-box__section--3__example">
                    <p><b>1.&nbsp;</b><span>${word.example_1}</span></p>
                  </div>
                  <div class="feature-box__section--3__example">
                    <p><b>2.&nbsp;</b><span>${word.example_2}</span></p>
                  </div>
                  <div class="text-center">
                    <button
                      class="btn section--1__btn"
                      data-toggle="modal"
                      data-target="#detailModal-${word.id}"
                    >
                      <span class="glyphicon glyphicon-search"></span>
                      Läs mer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal -->
            <div
              class="modal fade"
              id="detailModal-${word.id}"
              tabindex="-1"
              role="dialog"
              aria-labelledby="detailModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="detailModalLabel">Detaljer om
                      "${word.word}"</h5>
                    <button
                      type="button"
                      class="close"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <h3><b>${word.word}</b></h3>
                    <p>${word.word_forms}</p>
                    <hr />
                    <h4><b>Definition</b></h4>
                    <p>${word.word_definition}</p>
                    <br />
                    <h4><b>Examples</b></h4>
                    <p>1. ${word.example_1}</p>
                    <p>${word.example_1_translation}</p>
                    <p>2. ${word.example_2}</p>
                    <p>${word.example_2_translation}</p>
                  </div>
                  <div class="modal-footer">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      data-dismiss="modal"
                    >Stäng</button>
                  </div>
                </div>
              </div>
            </div>
          `;
          wordsContainer.insertAdjacentHTML("beforeend", wordHtml);
        });

        // update the pagination button href
        const nextPage =
          data.currentPage + 1 > data.totalPages ? 1 : data.currentPage + 1;
        paginationButton.setAttribute(
          "href",
          `/words?page=${nextPage}&limit=${data.limit}`
        );
      })
      .catch((error) => {
        console.error("Error fetching words:", error);
      });
  });
};
homeSection1Refresh();

//section 2 slider
const slider = function () {
  const slides = document.querySelectorAll(".slide");
  const btnLeft = document.querySelector(".slider__btn--left");
  const btnRight = document.querySelector(".slider__btn--right");
  const dotContainer = document.querySelector(".dots");
  if (!slides || !btnLeft || !btnRight || !dotContainer) return;

  let currentSlide = 0;
  const maxSlide = slides.length;

  //functions
  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll(".dots__dot")
      .forEach((dot) => dot.classList.remove("dots__dot--active"));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add("dots__dot--active");
  };

  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  //next slide
  const nextSlide = function () {
    if (currentSlide === maxSlide - 1) {
      currentSlide = 0;
    } else {
      currentSlide++;
    }
    goToSlide(currentSlide);
    activateDot(currentSlide);
  };

  const prevSlide = function () {
    if (currentSlide === 0) {
      currentSlide = maxSlide - 1;
    } else {
      currentSlide--;
    }
    goToSlide(currentSlide);
    activateDot(currentSlide);
  };

  const init = function () {
    goToSlide(0);
    createDots();

    activateDot(0);
  };
  init();

  //event handlers
  btnRight.addEventListener("click", nextSlide);
  btnLeft.addEventListener("click", prevSlide);

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") prevSlide();
    e.key === "ArrowRight" && nextSlide();
  });

  dotContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("dots__dot")) {
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};
slider();

//wordpage
//modal
// Add a word
$(function () {
  $("#myModal").on("click", "#addWordButton", async function () {
    // Get the values from the form
    const body = {
      english: $("#engelska").val(),
      indefiniteSingular: $("#indefinite--singular").val(),
      definiteSingular: $("#definite--singular").val(),
      indefinitePlural: $("#indefinite--plural").val(),
      definitePlural: $("#definite--plural").val(),
      example: $("#example").val(),
      isCustom: 1,
    };

    // Ensure no empty fields
    if (Object.values(body).some((value) => value === "")) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    try {
      const response = await fetch("/words/add-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        // Word added successfully, notify the user
        alert("Word added successfully!");

        // Redirect to the last page to see the newly added word
        window.location.href = `/words?page=${result.totalPages}&limit=10`;
      } else {
        console.error(result.error);
        alert("Failed to add word: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error adding word");
    }
  });
});

$(function () {
  $("table").on("click", ".delete-word", async function () {
    const wordId = $(this).data("id");
    console.log("delete button clicked", wordId);

    const confirmed = confirm("Are you sure you want to delete this word?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/words/delete-word/${wordId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        alert("Word deleted successfully!");
        $(this).closest("tr").remove();
      } else {
        alert("Failed to delete word: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting word");
    }
  });
});

// Edit word
$(document).on("click", ".edit-word", function () {
  const wordId = $(this).data("id");
  const english = $(this).data("english");
  const indefiniteSingular = $(this).data("indefinite-singular");
  const definiteSingular = $(this).data("definite-singular");
  const indefinitePlural = $(this).data("indefinite-plural");
  const definitePlural = $(this).data("definite-plural");
  const example = $(this).data("example");

  // Fill the form with the existing data
  $("#wordId").val(wordId);
  $("#english").val(english);
  $("#indefiniteSingular").val(indefiniteSingular);
  $("#definiteSingular").val(definiteSingular);
  $("#indefinitePlural").val(indefinitePlural);
  $("#definitePlural").val(definitePlural);
  $("#old-example").val(example);

  // Show the modal (if not automatically triggered by data-toggle)
  $("#editWordModal").modal("show");
});

// Submit the form to update the word
$("#editWordForm").submit(async function (e) {
  e.preventDefault();

  const wordId = $("#wordId").val();
  const english = $("#english").val();
  const indefiniteSingular = $("#indefiniteSingular").val();
  const definiteSingular = $("#definiteSingular").val();
  const indefinitePlural = $("#indefinitePlural").val();
  const definitePlural = $("#definitePlural").val();
  const example = $("#old-example").val();

  console.log(
    wordId,
    english,
    indefiniteSingular,
    definiteSingular,
    indefinitePlural,
    definitePlural,
    example
  );

  // Send updated data to the server
  try {
    const response = await fetch(`/words/update-word/${wordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        english: english,
        indefiniteSingular: indefiniteSingular,
        definiteSingular: definiteSingular,
        indefinitePlural: indefinitePlural,
        definitePlural: definitePlural,
        example: example,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      location.reload(); // Optionally, reload the page to see the updated data
    } else {
      alert("Error updating the word: " + result.error);
    }
  } catch (err) {
    alert("Error updating the word");
    console.error(err);
  }
});

const searchWords = function () {
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchWord");
  const nounsTableBody = document.getElementById("nounsTableBody");
  const paginationDiv = document.getElementById("pagination");
  const backButton = document.getElementById("backButton");
  if (
    !searchButton ||
    !searchInput ||
    !nounsTableBody ||
    !paginationDiv ||
    !backButton
  )
    return;

  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
      const url = `http://localhost:8080/words/search?q=${encodeURIComponent(
        searchTerm
      )}`;

      // Fetch API to perform the search
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json(); // Assume backend returns JSON data
        })
        .then((data) => {
          // Clear current table
          nounsTableBody.innerHTML = "";

          // Populate the table with search results
          data.words.forEach((word) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${word.english}</td>
                <td>${word.indefiniteSingular}</td>
                <td>${word.definiteSingular}</td>
                <td>${word.indefinitePlural}</td>
                <td>${word.definitePlural}</td>
                <td>${word.example}</td>
                <td>
                  ${
                    word.is_custom
                      ? `<button class="btn btn-primary btn-xs edit-word" data-id="${word.id}">Edit</button>
                  <button class="btn btn-danger btn-xs delete-word" data-id="${word.id}">Delete</button>`
                      : ""
                  }
                </td>
              `;
            nounsTableBody.appendChild(row);
          });

          // Update pagination information
          paginationDiv.innerHTML = `
              ${
                data.currentPage > 1
                  ? `<a href="?page=${data.currentPage - 1}&limit=${
                      data.limit
                    }" class="btn btn-primary">Previous</a>`
                  : ""
              }
              ${
                data.currentPage < data.totalPages
                  ? `<a href="?page=${data.currentPage + 1}&limit=${
                      data.limit
                    }" class="btn btn-primary">Next</a>`
                  : ""
              }
              <span>Page ${data.currentPage} of ${data.totalPages}</span>
            `;

          // Show the "Back" button
          backButton.style.display = "block";
        })
        .catch((error) => {
          console.error("Error fetching words:", error);
        });
    }
  });

  // Back button functionality: reloads the original page (all words)
  backButton.addEventListener("click", function () {
    // Simply reload the page to get the full list of words
    window.location.href = "http://localhost:8080/words";
    // Hide the "Back" button
    backButton.style.display = "none";
  });
};

searchWords();
