// import { botSendMessage } from "./botApi.js";

const buttons = document.querySelectorAll(
  "[aria-controls='modalForm'][aria-expanded='false']"
);
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    openModal(button);
  });
});

const modal = document.getElementById("modal");
const request = document.getElementById("request");
const requestClose = document.getElementById("requestClose");
function openModal(btn) {
  modal.classList.add("active");
  request.classList.add("active");
  document.body.style.overflow = "hidden";
  btn.setAttribute("aria-expanded", "true");
}

function closeModal() {
  request.classList.remove("active");
  setTimeout(() => {
    modal.classList.remove("active");
    request.reset();
    document.body.style.overflow = "";
    buttons.forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
    });
  }, 300);
}

requestClose.addEventListener("click", () => {
  closeModal();
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

const requestTel = document.getElementById("requestTel");
let requestTelMask = new Inputmask("+7(999) 999-99-99");
requestTelMask.mask(requestTel);

let requestValidation = new JustValidate(request);
requestValidation
  .addField("#requestName", [
    {
      rule: "required",
      errorMessage: "Введите имя!",
    },
    {
      rule: "minLength",
      value: 2,
      errorMessage: "Минимум 2 символа!",
    },
  ])
  .addField("#requestTel", [
    {
      validator: () => {
        const digits = requestTel.inputmask.unmaskedvalue();
        return digits.length >= 10;
      },
      errorMessage: "Введите телефон полностью!",
    },
  ])
  .onSuccess(async () => {
    let requestData = new FormData(request);

    try {
      const [mailResult, tgResult] = await Promise.all([
        sendDataToMail(requestData),
        sendDataToTg(requestData),
      ]);

      if (mailResult && tgResult) {
        goodAnswer("Всё прошло успешно!");
        form.reset();
        formFiles = [];
        formPreview.innerHTML = "";
      } else {
        badAnswer("Ошибка");
      }
    } catch (err) {
      badAnswer("Ошибка: " + err.message);
    }
  });
