// import { botSendMessage } from "./botApi.js";

const form = document.getElementById("form");
const formTel = document.getElementById("formTel");
const formName = document.getElementById("formName");
let formTelMask = new Inputmask("+7(999) 999-99-99");
formTelMask.mask(formTel);

const formFile = document.getElementById("formFile");
const formPreview = document.getElementById("formPreview");

let formFiles = [];
formFile.addEventListener("change", () => {
  Array.from(formFile.files).forEach((file) => {
    if (file.size > 5300000) {
      badAnswer("Изображение больше 5 мб");
      return;
    }

    formFiles.push(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      formPreview.appendChild(createPreviewItem(e));
      formPreview.style.marginBottom = "15px";
    };

    reader.readAsDataURL(file);
  });
});

formPreview.addEventListener("click", (event) => {
  if (event.target.closest(".preview__item-delete")) {
    const item = event.target.closest(".preview__item");
    const index = Array.from(formPreview.children).indexOf(item);

    if (index !== -1) {
      formFiles.splice(index, 1);
    }
    item.remove();
    // console.log("Удалён элемент с индексом:", index);
  }
});

function createPreviewItem(e) {
  const formItem = document.createElement("li");
  formItem.classList.add("preview__item");

  const formImg = document.createElement("img");
  formImg.src = e.target.result;
  formImg.classList.add("preview__item-img");

  const formItemDelete = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  formItemDelete.classList.add("preview__item-delete");
  formItemDelete.setAttribute("viewBox", "0 0 24 24");

  const useEl = document.createElementNS("http://www.w3.org/2000/svg", "use");
  useEl.setAttribute("href", "#icon-delete");
  useEl.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    "#icon-delete"
  );

  formItemDelete.appendChild(useEl);

  formItem.appendChild(formImg);
  formItem.appendChild(formItemDelete);
  return formItem;
}

let formValidation = new JustValidate(form);
formValidation
  .addField("#formName", [
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
  .addField("#formTel", [
    {
      validator: () => {
        const digits = formTel.inputmask.unmaskedvalue();
        return digits.length >= 10;
      },
      errorMessage: "Введите телефон!",
    },
  ])
  .onSuccess(async () => {
    let formData = new FormData(form);
    formData.delete("file[]");
    formFiles.forEach((file) => {
      formData.append("file[]", file);
    });

    // if (await sendDataToMail(formData)) {
    //   goodAnswer("Всё прошло успешно!");
    // form.reset();
    // formFiles = [];
    // formPreview.innerHTML = "";
    // } else {
    //   badAnswer("Ошибка");
    // }

    try {
      const [mailResult, tgResult] = await Promise.all([
        sendDataToMail(formData),
        sendDataToTg(formData),
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
