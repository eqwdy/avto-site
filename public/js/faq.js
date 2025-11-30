const faqItems = document.querySelectorAll(".faq__item");
faqItems.forEach((item) => {
  item.addEventListener("click", () => {
    faqItems.forEach((anotherItem) => {
      if (anotherItem !== item) {
        if (anotherItem.classList.contains("active")) {
          anotherItem.classList.remove("active");
          changeSubtitleHeight(
            anotherItem,
            anotherItem.querySelector(".faq__item-subtitle")
          );
        }
      }
    });
    item.classList.toggle("active");
    const currentSubtitle = item.querySelector(".faq__item-subtitle");
    changeSubtitleHeight(item, currentSubtitle);
  });
});

function changeSubtitleHeight(item, subtitle) {
  if (item.classList.contains("active")) {
    subtitle.style.maxHeight = subtitle.scrollHeight + "px";
  } else {
    subtitle.style.maxHeight = 0;
  }
}
