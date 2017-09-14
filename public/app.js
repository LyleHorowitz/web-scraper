// Loads results onto the page
function getResults() {
  // Empty any results currently on the page
  $("#results").empty();
  // Grab all of the current posts
  $.getJSON("/all", function(data) {
    // For each post...
    for (var i = 0; i < data.length; i++) {
      // ...populate #results with a p-tag that includes the post's title and object id
      $("#results").prepend("<p class='dataentry' data-id=" + data[i]._id + "><span class='dataTitle' data-id=" +
        data[i]._id + ">" + data[i].title + "</span><span class=deleter>X</span></p>");
    }
  });
}

// Runs the getResults function as soon as the script is executed
getResults();

// When the #makenew button is clicked
$(document).on("click", "#makenew", function() {
  // AJAX POST call to the submit route on the server
  // This will take the data from the form and send it to the server
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/submit",
    data: {
      title: $("#title").val(),
      post: $("#post").val(),
      created: Date.now()
    }
  })
  // If that API call succeeds, add the title and a delete button for the post to the page
  .done(function(data) {
    // Add the title and delete button to the #results section
    $("#results").prepend("<p class='dataentry' data-id=" + data._id + "><span class='dataTitle' data-id=" +
      data._id + ">" + data.title + "</span><span class=deleter>X</span></p>");
    // Clear the post and title inputs on the page
    $("#post").val("");
    $("#title").val("");
  }
  );
});

// When the #clearall button is pressed
$("#clearall").on("click", function() {
  // Make an AJAX GET request to delete the posts from the db
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "/clearall",
    // On a successful call, clear the #results section
    success: function(response) {
      $("#results").empty();
    }
  });
});


// When user clicks the deleter button for a post
$(document).on("click", ".deleter", function() {
  // Save the p tag that encloses the button
  var selected = $(this).parent();
  // Make an AJAX GET request to delete the specific post
  // this uses the data-id of the p-tag, which is linked to the specific post
  $.ajax({
    type: "GET",
    url: "/delete/" + selected.attr("data-id"),

    // On successful call
    success: function(response) {
      // Remove the p-tag from the DOM
      selected.remove();
      // Clear the post and title inputs
      $("#post").val("");
      $("#title").val("");
      // Make sure the #actionbutton is submit (in case it's update)
      $("#actionbutton").html("<button id='makenew'>Submit</button>");
    }
  });
});

// When user click's on post title, show the post, and allow for updates
$(document).on("click", ".dataTitle", function() {
  // Grab the element
  var selected = $(this);
  // Make an ajax call to find the post
  // This uses the data-id of the p-tag, which is linked to the specific post
  $.ajax({
    type: "GET",
    url: "/find/" + selected.attr("data-id"),
    success: function(data) {
      // Fill the inputs with the data that the ajax call collected
      $("#post").val(data.post);
      $("#title").val(data.title);
      // Make the #actionbutton an update button, so user can
      // Update the post s/he chooses
      $("#actionbutton").html("<button id='updater' data-id='" + data._id + "'>Update</button>");
    }
  });
});

// When user click's update button, update the specific post
$(document).on("click", "#updater", function() {
  // Save the selected element
  var selected = $(this);
  // Make an AJAX POST request
  // This uses the data-id of the update button,
  // which is linked to the specific post title
  // that the user clicked before
  $.ajax({
    type: "POST",
    url: "/update/" + selected.attr("data-id"),
    dataType: "json",
    data: {
      title: $("#title").val(),
      post: $("#post").val()
    },
    // On successful call
    success: function(data) {
      // Clear the inputs
      $("#post").val("");
      $("#title").val("");
      // Revert action button to submit
      $("#actionbutton").html("<button id='makenew'>Submit</button>");
      // Grab the results from the db again, to populate the DOM
      getResults();
    }
  });
});
