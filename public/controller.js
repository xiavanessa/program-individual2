"strict mode";
//user management system
function userManagementSystem() {
  // Cache DOM elements
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const updateBtn = document.getElementById("update-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const notification = document.getElementById("notification");
  const allUsers = document.getElementById("all-users");
  const currentUser = document.getElementById("current-user");
  const colorTertiary = getComputedStyle(
    document.documentElement
  ).getPropertyValue("--color-tertiary");

  //if any of the elements are missing, return
  if (
    !loginBtn ||
    !registerBtn ||
    !updateBtn ||
    !deleteBtn ||
    !notification ||
    !allUsers ||
    !currentUser
  )
    return;

  // Utility Functions
  function getBody() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    return { username, password };
  }

  //check if username and password are entered
  function checkIfUsernameAndPasswordAreEntered() {
    const { username, password } = getBody();
    if (!username || !password) {
      displayNotification("Username and password are required.", "red");
      return false;
    }
    return true;
  }

  // Clear input fields
  function clearInputFields() {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  }

  //clear current user
  function clearCurrentUser() {
    currentUser.innerText = "";
  }

  //Display current user
  function displayCurrentUser(data) {
    currentUser.innerText = data.username || "";
    currentUser.style.color = colorTertiary;
  }

  // Display notification
  function displayNotification(
    message,
    color = "green",
    countdown = null,
    duration = 3000
  ) {
    if (countdown !== null) {
      let currentCountdown = countdown;
      notification.innerText = `${message} ${countdown + 1} seconds...`;
      notification.style.backgroundColor = color;
      notification.style.display = "block";
      // Create an interval to update the countdown every second
      const intervalId = setInterval(() => {
        notification.innerText = `${message} ${currentCountdown} seconds...`;
        currentCountdown--;

        //hide the notification when countdown is 0
        if (currentCountdown < 0) {
          clearInterval(intervalId);
          notification.style.display = "none";
        }
      }, 1000);
    } else {
      // No countdown, just display the message
      notification.innerText = message;
      notification.style.backgroundColor = color;
      notification.style.display = "block";
      setTimeout(() => {
        notification.style.display = "none";
      }, duration);
    }
  }

  //jump to website
  function jumpToWebsite(duration = 3000) {
    setTimeout(() => {
      window.location.href = "/";
    }, duration);
  }

  // Fetch data from server
  async function fetchData(url, body = null, method = "POST") {
    try {
      const response = await fetch(`http://localhost:8080/users/${url}`, {
        method,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      displayNotification(
        "Network or server error. Please try again later.",
        "red"
      );
      throw error;
    }
  }

  //fetch all users
  async function fetchUsers() {
    try {
      const data = await fetchData("/users", null, "GET");
      allUsers.innerHTML = data.users.join(", ");
      allUsers.style.color = colorTertiary;
    } catch (error) {
      allUsers.innerText = "Error fetching users.";
    }
  }

  // Event Listeners
  // Log in user
  loginBtn.addEventListener("click", async () => {
    if (!checkIfUsernameAndPasswordAreEntered()) return;

    try {
      const body = getBody();
      const data = await fetchData("/login", body);
      displayCurrentUser(data);
      displayNotification(
        "Login successful! Redirecting to the website in",
        "green",
        2 // Pass countdown argument
      );

      jumpToWebsite();
    } catch (error) {
      clearCurrentUser();
      displayNotification(
        "Login failed: " + (error.message || "Unknown error"),
        "red"
      );
    }
  });

  // Register new user
  registerBtn.addEventListener("click", async () => {
    if (!checkIfUsernameAndPasswordAreEntered()) return;

    try {
      const body = getBody();
      const data = await fetchData("/register", body);

      displayNotification(data.message || "Registration successful!");
      clearInputFields();
      clearCurrentUser();
      fetchUsers();
    } catch (error) {
      displayNotification(
        "Registration failed: " + (error.message || "Unknown error"),
        "red"
      );
    }
  });

  // Update user
  updateBtn.addEventListener("click", async () => {
    if (!checkIfUsernameAndPasswordAreEntered()) return;
    const currentUsername = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const newUsername = prompt("Enter new username:") || "";
    const newPassword = prompt("Enter new password:") || "";

    if (!newUsername && !newPassword) {
      displayNotification("No new username or password entered.", "red");
      return;
    }

    try {
      const body = { password, newUsername, newPassword };
      const data = await fetchData(`/users/${currentUsername}`, body, "PUT");

      displayNotification(data.message || "User updated successfully!");
      clearInputFields();
      clearCurrentUser();
      fetchUsers();
    } catch (error) {
      displayNotification(
        "Update failed: " + (error.message || "Unknown error"),
        "red"
      );
    }
  });

  // Delete user
  deleteBtn.addEventListener("click", async () => {
    if (!checkIfUsernameAndPasswordAreEntered()) return;

    const currentUsername = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const body = { password };
      const data = await fetchData(`/users/${currentUsername}`, body, "DELETE");
      displayNotification(data.message || "User deleted successfully!");
      clearInputFields();
      clearCurrentUser();
      fetchUsers();
    } catch (error) {
      displayNotification(
        "Delete failed: " + (error.message || "Unknown error"),
        "red"
      );
    }
  });

  // Initial fetch
  fetchUsers();
}

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
        window.location.reload();
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Error during logout. Please try again.");
    }
  });
};

const navLogin = () => {
  const loginBtn = document.querySelector("#loginButton");
  if (!loginBtn) return;
  loginBtn.addEventListener("click", function () {
    window.location.href = "/login";
  });
};

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
    fetch(`${url}`)
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

//wordpage
//modal
const wordPageNounsModifyTable = function () {
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
        const response = await fetch("/word/add-word", {
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
          window.location.href = `/word?page=${result.totalPages}&limit=10`;
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

  // Delete word
  $(function () {
    $("table").on("click", ".delete-word", async function () {
      const wordId = $(this).data("id");
      console.log("delete button clicked", wordId);

      const confirmed = confirm("Are you sure you want to delete this word?");
      if (!confirmed) return;

      try {
        const response = await fetch(`/word/delete-word/${wordId}`, {
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
      const response = await fetch(`/word/update-word/${wordId}`, {
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
};

//wordPage Nouns search functionality
const searchNouns = function () {
  // Search functionality for nouns
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

    // Event listener for the search button
    searchButton.addEventListener("click", function () {
      const searchTerm = searchInput.value.trim();

      if (searchTerm) {
        const url = `http://localhost:8080/word/search?q=${encodeURIComponent(
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
            console.log(data);

            // If no results found, show alert box
            if (data.found === false) {
              showAlert("No results found for your search.");
            }

            // If results found
            if (data.words.length > 0) {
              nounsTableBody.innerHTML = "";

              // Populate the table with search results
              data.words.forEach((word) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                <td  class="wordPage--nouns--table--word">${word.english}</td>
                <td  class="wordPage--nouns--table--word">${
                  word.indefiniteSingular
                }</td>
                <td  class="wordPage--nouns--table--word">${
                  word.definiteSingular
                }</td>
                <td  class="wordPage--nouns--table--word">${
                  word.indefinitePlural
                }</td>
                <td  class="wordPage--nouns--table--word">${
                  word.definitePlural
                }</td>
                <td  class="wordPage--nouns--table--word">${word.example}</td>
                <td>

                  ${
                    word.is_custom && data.isAdmin
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
            }
          })
          .catch((error) => {
            console.error("Error fetching words:", error);
          });
      }
    });

    // Back button functionality: reloads the original page (all words)
    backButton.addEventListener("click", function () {
      const url = new URL(window.location.href);
      // Simply reload the page to get the full list of words
      window.location.href = url;
      // Hide the "Back" button
      backButton.style.display = "none";
    });
  };

  function showAlert(message) {
    const alertBox = document.getElementById("alertBox");
    if (!alertBox) return;
    alertBox.innerHTML = message;
    alertBox.style.display = "block";
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 3000); // 3000 milliseconds = 3 seconds
  }

  searchWords();
};

//initialize the functions
const init = function () {
  userManagementSystem();
  homeSection1Refresh();
  slider();
  navLogout();
  navLogin();
  wordPageNounsModifyTable();
  searchNouns();
};

init();
