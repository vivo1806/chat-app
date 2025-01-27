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
const $messages = document.querySelector("#messages");
const $container = document.querySelector(".container");
const $sidebar = document.querySelector("#sidebar");
const messagetemplate = document.querySelector("#message-template").innerHTML;
const sidebartemplate = document.querySelector("#sidebar-template").innerHTML;
const locationtemplate = document.querySelector("#locationtemplate").innerHTML;
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const $newmessage = $messages.lastElementChild;
  const newmessageStyle = getComputedStyle($newmessage);
  const newmessageMargin = parseInt(newmessageStyle.marginBottom);
  const newmessageheight = $newmessage.offsetHeight + newmessageMargin;

  const visibleHeight = $container.offsetHeight;
  const containerHeight = $container.scrollHeight;
  const scrollOffset = $container.scrollTop + visibleHeight;
  console.log(containerHeight, "containerheight");
  console.log(newmessageheight, "newmessageheight");
  console.log(scrollOffset, "scrollOffset");
  if (containerHeight - newmessageheight <= scrollOffset) {
    //NOTE:automate scroll
    //
    $container.scrollTop = $container.scrollHeight;
    console.log($container.scrollTop);
  }
};
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
    username: msg.username,
    msg: msg.text,
    time: moment(msg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationmessage", (url) => {
  const html = Mustache.render(locationtemplate, {
    username: url.username,
    url: url.url,
    time: moment(url.createdAt).format("h:mm a"),
  });

  $message.insertAdjacentHTML("beforeend", html);
  setTimeout(() => {
    autoScroll();
  }, 0);
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

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebartemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
