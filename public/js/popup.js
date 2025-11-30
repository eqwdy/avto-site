const popup = document.getElementById("popup");
const popupInner = document.getElementById("popupInner");
const popupClose = document.getElementById("popupClose");

function openPopup() {
  popup.classList.add("active");
}

function closePopup() {
  popup.classList.remove("active");
}

function showPopupTime(time) {
  openPopup();
  setTimeout(() => {
    closePopup();
  }, time);
}

function goodAnswer(answer) {
  popup.style.backgroundColor = "var(--color-popup-green)";
  popupInner.textContent = answer;
  showPopupTime(3000);
}

function badAnswer(answer) {
  popup.style.backgroundColor = "var(--color-popup-red)";
  popupInner.textContent = answer;
  showPopupTime(3000);
}
