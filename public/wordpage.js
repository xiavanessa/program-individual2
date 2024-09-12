// // Send the data to the server
// function fetchData(url, body) {
//   fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json；charset=utf-8",
//     },
//     body: JSON.stringify({
//       body,
//     }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log("Success:", data);
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });
// }

// // Function to retrieve values from modal input fields
// function getBody() {
//   return {
//     engelska: $("#engelska").val().trim(),
//     indefiniteSingular: $("#indefinite--singular").val().trim(),
//     definiteSingular: $("#definite--singular").val().trim(),
//     indefinitePlural: $("#indefinite--plural").val().trim(),
//     definitePlural: $("#definite--plural").val().trim(),
//     example: $("#example").val().trim(),
//   };
// }

// // Function to validate if any fields are empty
// function areFieldsEmpty(body) {
//   return Object.values(body).some((value) => !value);
// }

// //get modal values
// $(function () {
//   $("#myModal").on("click", "#add", function () {
//     console.log("add button clicked");

//     // Retrieve values from the modal input fields
//     const body = getBody();

//     // Check if any of the fields are empty
//     if (areFieldsEmpty(body)) {
//       alert("Please fill in all fields before submitting.");
//     } else {
//       console.log(body);

//       // Send the data to the server
//       fetchData("http://localhost:8080/add-word", body);

//       // Hide the modal
//       $("#myModal").modal("hide");
//     }
//   });
// });

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
