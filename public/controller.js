"strict mode";
//navbar
const navLogout = () => {
  const logoutBtn = document.querySelector("#logoutButton");
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
$(function () {
  $("#myModal").on("click", "#addWordButton", async function () {
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
      const response = await fetch("/add-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        // Word added successfully, append the new word to the table
        alert("Word added successfully!");

        // 添加新的行到表格，并设置正确的 data-id
        const newRow = `
          <tr>
            <td>${body.english}</td>
            <td>${body.indefiniteSingular}</td>
            <td>${body.definiteSingular}</td>
            <td>${body.indefinitePlural}</td>
            <td>${body.definitePlural}</td>
            <td>${body.example}</td>
            <td>
              <button
                class="btn btn-danger btn-sm delete-word"
                data-id="${result.id}"
              >Delete</button>
            </td>
          </tr>
        `;
        // 将新行插入到表格的主体
        $("table tbody").append(newRow);

        // 清空输入框
        $(
          "#engelska, #indefinite--singular, #definite--singular, #indefinite--plural, #definite--plural, #example"
        ).val("");
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
  // 点击删除按钮，发送删除请求
  $("table").on("click", ".delete-word", async function () {
    const wordId = $(this).data("id");
    console.log("delete button clicked", wordId);

    const confirmed = confirm("Are you sure you want to delete this word?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/delete-word/${wordId}`, {
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
