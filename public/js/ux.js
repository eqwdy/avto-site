document.querySelectorAll(".input-effect").forEach((el) => {
  el.style.maxHeight =
    el.querySelector(".input-effect__input").offsetHeight + "px";
});

class AwesomeSelect {
  _selectedClass = "_selected";
  _openedClass = "_opened";

  constructor(el) {
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    if (!(this.el instanceof HTMLSelectElement)) {
      throw new Error("Element is undefined");
    }

    this.$wrapper = document.createElement("div");
    this.$wrapper.classList.add("awesome-select");

    this.$button = document.createElement("button");
    this.$button.classList.add("awesome-select__button");
    this.$button.setAttribute("type", "button");
    this.$button.setAttribute("aria-haspopup", "listbox");
    this.$button.setAttribute("aria-expanded", "false");
    this.$button.setAttribute("aria-controls", `${this.el.id}-list`);

    const labelEl = document.querySelector(`label[for="${this.el.id}"]`);
    const labelText =
      labelEl?.textContent.trim() ||
      this.el.getAttribute("name") ||
      this.el.id ||
      "Выбор значения";
    this.$button.setAttribute("aria-label", `Выбор: ${labelText}`);

    this.$button.textContent = this.el.options[this.defaultIndex].text;
    this.$button.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggle();
    });
    this.$wrapper.append(this.$button);

    this.$list = document.createElement("ul");
    this.$list.classList.add("awesome-select__list");
    this.$list.id = `${this.el.id}-list`;
    this.$list.setAttribute("role", "listbox");
    this.$list.setAttribute("aria-labelledby", this.$list.id);

    // create Elements
    Array.from(this.el.options).forEach((option) => {
      const index = option.index;
      if (index === 0) return;

      const item = document.createElement("li");
      item.classList.add("awesome-select__item");
      item.textContent = option.text;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", this.defaultIndex === index);
      item.title = option.text;
      item.dataset.index = String(index);

      if (this.defaultIndex === index) {
        item.classList.add(this._selectedClass);
      }

      item.addEventListener("click", () => {
        this.el.selectedIndex = index;
        this.el.dispatchEvent(new Event("change"));
      });

      this.$list.append(item);
    });

    this.$wrapper.append(this.$list);

    this.el.after(this.$wrapper);
    this.el.style.display = "none";

    // sync
    this.update(this.el.selectedIndex);

    this.el.form?.addEventListener("reset", () => {
      this.el.selectedIndex = this.defaultIndex;
      this.el.dispatchEvent(new Event("change"));
    });

    this.el.addEventListener("change", () => this.update());

    document.addEventListener("click", (e) => {
      if (!this.$wrapper.contains(e.target) && this.isOpened) {
        this.close();
      }
    });
  }

  open() {
    this.$wrapper.classList.add(this._openedClass);
    this.$button.setAttribute("aria-expanded", "true");
    Array.from(document.querySelectorAll(".awesome-select"))
      .filter(
        (el) => el.classList.contains(this._openedClass) && el !== this.$wrapper
      )
      .forEach((el) => el.classList.remove(this._openedClass));
  }

  close() {
    this.$button.setAttribute("aria-expanded", "false");
    this.$wrapper.classList.remove(this._openedClass);
  }

  toggle() {
    this.isOpened ? this.close() : this.open();
  }

  update(index = this.el.selectedIndex) {
    const option = this.el.options[index];
    this.$button.textContent = option.text || option.value;

    this.$list.querySelectorAll("li").forEach((el) => {
      const liIndex = Number(el.dataset.index);
      const isSelected = liIndex === index && index !== 0;
      el.classList.toggle(this._selectedClass, isSelected);
      el.setAttribute("aria-selected", isSelected);
    });
    this.close();
  }

  get defaultIndex() {
    const index = Array.from(this.el.options).findIndex(
      (option) => option.defaultSelected
    );
    return index > -1 ? index : 0;
  }

  get isOpened() {
    return this.$wrapper.classList.contains(this._openedClass);
  }
}

new AwesomeSelect("#formTransmission");
new AwesomeSelect("#formEngine");
