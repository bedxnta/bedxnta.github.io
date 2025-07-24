function copyDiscordTag() {
  copyToClipboard("@bedanjo", "username");
}

function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text);
  alert(`Copied ${label} to clipboard: ${text}`);
}

function updateClock() {
  const clockElement = document.getElementById("clock");
  const now = new Date().toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata"
  });
  clockElement.textContent = `🕒 ${now} (Asia/Kolkata)`;
}

setInterval(updateClock, 1000);
updateClock();
