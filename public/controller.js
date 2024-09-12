"strict mode";
//slider
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
async function fetchData(url, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    // Parse the JSON response
    const data = await response.json();

    // Log success and return data
    console.log("Success:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

// retrieve values from modal input fields
function getBody() {
  return {
    engelska: $("#engelska").val().trim(),
    indefiniteSingular: $("#indefinite--singular").val().trim(),
    definiteSingular: $("#definite--singular").val().trim(),
    indefinitePlural: $("#indefinite--plural").val().trim(),
    definitePlural: $("#definite--plural").val().trim(),
    example: $("#example").val().trim(),
  };
}

// Function to validate if any fields are empty
function areFieldsEmpty(body) {
  return Object.values(body).some((value) => !value);
}

// Get modal values
$(function () {
  $("#myModal").on("click", "#add", async function () {
    console.log("add button clicked");
    const body = getBody();

    if (areFieldsEmpty(body)) {
      alert("Please fill in all fields before submitting.");
    } else {
      console.log(body);
      //send the data to server
      await fetchData("http://localhost:8080/add-word", body);

      // Hide the modal
      $("#myModal").modal("hide");

      // Reset the input fields
      $("#engelska").val("");
      $("#indefinite--singular").val("");
      $("#definite--singular").val("");
      $("#indefinite--plural").val("");
      $("#definite--plural").val("");
      $("#example").val("");
    }
  });
});
