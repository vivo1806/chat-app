const socket = io();
// const c = 0;
// const p = document.querySelector("#c");
// const btn = document.querySelector("#inc");
//
// socket.on("countUpdated", (count) => {
//   p.innerHTML = count;
// });
// btn.addEventListener("click", (e) => {
//   e.preventDefault();
//   socket.emit("increment");
//
// });
//
//
const $messageform = document.querySelector("#form");
const $messageinput = document.querySelector("#msg");
const $messagebtn = document.querySelector("button");
const $sendlocationbtn = document.querySelector("#send-location");
const $message = document.querySelector("#messages");
const messagetemplate = document.querySelector("#message-template").innerHTML;
const locationtemplate = document.querySelector("#locationtemplate").innerHTML;

// Disable the submit button initially
$messagebtn.setAttribute("disabled", "disabled");

// Monitor input field changes
$messageinput.addEventListener("input", () => {
  if ($messageinput.value.trim() === "") {
    $messagebtn.setAttribute("disabled", "disabled");
  } else {
    $messagebtn.removeAttribute("disabled");
  }
});

// Form submission handler
$messageform.addEventListener("submit", (e) => {
  e.preventDefault();

  // Prevent submission if the input is empty
  if ($messageinput.value.trim() === "") {
    return;
  }

  $messagebtn.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", $messageinput.value, (error) => {
    $messageinput.value = ""; // Clear the input
    $messageinput.focus(); // Refocus the input field
    $messagebtn.setAttribute("disabled", "disabled"); // Disable button again for empty input

    if (error) {
      console.log(error);
    }
  });
});
socket.on("message", (msg) => {
  const html = Mustache.render(messagetemplate, {
    msg: msg.text,
    time: moment(msg.createdAt).format("h:mm a"),
  });
  $message.insertAdjacentHTML("beforeend", html);
});

socket.on("locationmessage", (url) => {
  const html = Mustache.render(locationtemplate, {
    url: url.url,
    time: moment(url.createdAt).format("h:mm a"),
  });

  $message.insertAdjacentHTML("beforeend", html);
});
$sendlocationbtn.addEventListener("click", () => {
  console.log("bug1");
  if (!navigator.geolocation) {
    return console.log("Geolocation is not supported by your browser");
  }

  console.log("bug2");

  $sendlocationbtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((pos) => {
    const cord = pos.coords;
    socket.emit(
      "sendLocation",
      `https://google.com/maps?q=${cord.latitude},${cord.longitude}`,
      () => {
        $sendlocationbtn.removeAttribute("disabled");
        console.log("location send!");
      },
    );
  });
});
