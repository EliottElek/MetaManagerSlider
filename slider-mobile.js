class CarouselMobile {
  /**
   * This callback type is called `requestCallback` and is displayed as a global symbol.
   *
   * @callback moveCallback
   * @param {number} index
   */

  /**
   * @param {HTMLElement} element
   * @param {Object} options
   * @param {Object} [options.slidesToScroll=1] Nombre d'éléments à faire défiler
   * @param {Object} [options.slidesVisible=1] Nombre d'éléments visible dans un slide
   * @param {boolean} [options.loop=false] Doit-t-on boucler en fin de carousel
   * @param {boolean} [options.infinite=false]
   * @param {boolean} [options.pagination=false]
   * @param {boolean} [options.navigation=true]
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = Object.assign(
      {},
      {
        slidesToScroll: 1,
        slidesVisible: 1,
        loop: false,
        pagination: false,
        navigation: true,
        infinite: false,
      },
      options
    );
    if (this.options.loop && this.options.infinite) {
      throw new Error(
        "Un carousel ne peut être à la fois en boucle et en infinie"
      );
    }
    let children = [].slice.call(element.children);
    this.isMobile = false;
    this.currentItem = 0;
    this.moveCallbacks = [];
    this.offset = 0;
    this.animationDuration = 0.3;
    // Modification du DOM
    this.root = this.createDivWithClass("carousel__mobile");
    this.container = this.createDivWithClass("carousel__container__mobile");
    this.root.setAttribute("tabindex", "0");
    this.root.appendChild(this.container);
    this.element.appendChild(this.root);
    this.items = children.map((child) => {
      let item = this.createDivWithClass("carousel__item__mobile");
      item.appendChild(child);
      return item;
    });
    if (this.options.infinite) {
      this.offset = this.options.slidesVisible + this.options.slidesToScroll;
      if (this.offset > children.length) {
        console.error(
          "Vous n'avez pas assez d'élément dans le carousel",
          element
        );
      }
      this.items = [
        ...this.items
          .slice(this.items.length - this.offset)
          .map((item) => item.cloneNode(true)),
        ...this.items,
        ...this.items.slice(0, this.offset).map((item) => item.cloneNode(true)),
      ];
      this.gotoItem(this.offset, false);
    }
    this.items.forEach((item) => this.container.appendChild(item));

    if (this.options.navigation) {
      this.createNavigation();
    }
    if (this.options.pagination) {
      this.createPagination();
    }

    // Evenements
    this.moveCallbacks.forEach((cb) => cb(this.currentItem));
    if (this.options.infinite) {
      this.container.addEventListener(
        "transitionend",
        this.resetInfinite.bind(this)
      );
    }
    this.setStyle();
    this.container.offsetHeight; // force repaint
  }

  /**
   * Applique les bonnes dimensions aux éléments du carousel
   */
  setStyle() {
    let ratio = this.items.length / this.slidesVisible;
    this.container.style.width = ratio * 100 + "%";
    this.items.forEach((item) => {
      item.classList.add("active_item");
    });
    this.items.forEach(
      (item) => (item.style.width = 100 / this.slidesVisible / ratio + "%")
    );
    const index = this.currentItem;
    this.items[index]
      .getElementsByClassName("item__image")[0]
      .classList.add("active_image_mobile");
    this.items[index]
      .getElementsByClassName("item__content__mobile")[0]
      .classList.add("active_item");
    this.items[index].style.transition = `${this.animationDuration}s ease!important`;
    // this.items[index].style.transform = `translate3d(0, -20%, 0)`;
    this.container.offsetHeight; // force repaint
    this.container.offsetHeight; // force repaint
  }

  /**
   * Crée les flêches de navigation dans le DOM
   */
  createNavigation() {
    let nextButton = document.getElementById("carousel__next__mobile");
    let prevButton = document.getElementById("carousel__prev__mobile");
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;

    const gestureZone = document.getElementById("carousel__mobile");

    gestureZone.addEventListener(
      "touchstart",
      function (event) {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
      },
      false
    );

    gestureZone.addEventListener(
      "touchend",
      function (event) {
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleGesture();
      },
      false
    );

    const handleGesture = () => {
      if (touchendX <= touchstartX - 50) {
        this.next();
      }

      if (touchendX >= touchstartX + 50) {
        this.prev();
      }
    };
    nextButton.addEventListener("click", this.next.bind(this));
    prevButton.addEventListener("click", this.prev.bind(this));
    if (this.options.loop === true) {
      return;
    }
    // this.onMove((index) => {
    //   if (index === 0 || index === 1) {
    //     prevButton.classList.add("carousel__prev--hidden");
    //   } else {
    //     prevButton.classList.remove("carousel__prev--hidden");
    //   }
    //   if (this.items[this.currentItem + this.slidesVisible] === undefined) {
    //     nextButton.classList.add("carousel__next--hidden");
    //   } else {
    //     nextButton.classList.remove("carousel__next--hidden");
    //   }
    // });
  }

  /**
   * Crée la pagination dans le DOM
   */
  createPagination() {
    let pagination = this.createDivWithClass("carousel__pagination");
    let buttons = [];
    this.element.appendChild(pagination);
    for (
      let i = 0;
      i < this.items.length - 2 * this.offset;
      i = i + this.options.slidesToScroll
    ) {
      let button = this.createDivWithClass("carousel__pagination__button");
      button.addEventListener("click", () => this.gotoItem(i + this.offset));
      pagination.appendChild(button);
      buttons.push(button);
    }
    this.onMove((index) => {
      let count = this.items.length - 2 * this.offset;
      let activeButton =
        buttons[
          Math.floor(
            ((index - this.offset) % count) / this.options.slidesToScroll
          )
        ];
      if (activeButton) {
        buttons.forEach((button) =>
          button.classList.remove("carousel__pagination__button--active")
        );
        activeButton.classList.add("carousel__pagination__button--active");
      }
    });
  }

  /**
   *
   */
  next() {
    this.gotoItem(this.currentItem + this.slidesToScroll);
  }

  prev() {
    this.gotoItem(this.currentItem - this.slidesToScroll);
  }

  /**
   * Déplace le carousel vers l'élément ciblé
   * @param {number} index
   * @param {boolean} [animation = true]
   */
  gotoItem(index, animation = true) {
    if (index < 0) {
      if (this.options.loop) {
        index = this.items.length - this.slidesVisible;
      } else {
        return;
      }
    } else if (
      index >= this.items.length ||
      (this.items[this.currentItem + this.slidesVisible] === undefined &&
        index > this.currentItem)
    ) {
      if (this.options.loop) {
        index = 0;
      } else {
        return;
      }
    }
    let translateX = (index * -100) / this.items.length;
    if (animation === false) {
      this.container.style.transition = "none";
    }
    this.container.style.transform = "translate3d(" + translateX + "%, 0, 0)";
    this.container.offsetHeight; // force repaint
    if (animation === false) {
      this.container.style.transition = "";
    }
    this.currentItem = index;
    this.items.forEach((item) => {
      item.classList.remove("active_item");
      item
        .getElementsByClassName("item__image")[0]
        .classList.remove("active_image_mobile");
      item
        .getElementsByClassName("item__content__mobile")[0]
        ?.classList.remove("active_item");
      item.style.transform = `translate3d(0, 0, 0)`;
    });
    //pour l'item du milieu, on ajoute les classes correspondantes
    this.items[index].classList.add("active_item");
    this.items[index].getElementsByClassName("item__image")[0].animate(
      [
        // keyframes
        { opacity: 0.5 },
        { opacity: 1 },
      ],
      {
        // timing options
        duration: 300,
        iterations: 1,
      }
    );
    this.items[index]
      .getElementsByClassName("item__content__mobile")[0]
      .animate(
        [
          // keyframes
          { opacity: 0 },
          { opacity: 1 },
        ],
        {
          // timing options
          duration: 300,
          iterations: 1,
        }
      );
    this.items[index]
      .getElementsByClassName("item__image")[0]
      .classList.add("active_image_mobile");
    this.items[index]
      .getElementsByClassName("item__content__mobile")[0]
      .classList.add("active_item");
    this.items[index].style.transition = `${this.animationDuration}s ease!important`;
    // this.items[index].style.transform = `translate3d(0, -20%, 0)`;
    this.container.offsetHeight; // force repaint

    this.moveCallbacks.forEach((cb) => cb(index));
  }

  /**
   * Déplace le container pour donner l'impression d'un slide infini
   */
  resetInfinite() {
    if (this.currentItem <= this.options.slidesToScroll) {
      this.gotoItem(
        this.currentItem + (this.items.length - 2 * this.offset),
        false
      );
    } else if (this.currentItem >= this.items.length - this.offset) {
      this.gotoItem(
        this.currentItem - (this.items.length - 2 * this.offset),
        false
      );
    }
  }

  /**
   * Rajoute un écouteur qui écoute le déplacement du carousel
   * @param {moveCallback} cb
   */
  onMove(cb) {
    this.moveCallbacks.push(cb);
  }
  /**
   * Helper pour créer une div avec une classe
   * @param {string} className
   * @returns {HTMLElement}
   */
  createDivWithClass(className) {
    let div = document.createElement("div");
    div.setAttribute("class", className);
    return div;
  }

  /**
   * @returns {number}
   */
  get slidesToScroll() {
    return this.isMobile ? 1 : this.options.slidesToScroll;
  }

  /**
   * @returns {number}
   */
  get slidesVisible() {
    return this.isMobile ? 1 : this.options.slidesVisible;
  }
}

let onReadyMobile = function () {
  new CarouselMobile(document.querySelector("#carousel__mobile"), {
    slidesVisible: 1,
    slidesToScroll: 1,
    pagination: true,
  });
};

if (document.readyState !== "loading") {
  onReadyMobile();
}
document.addEventListener("DOMContentLoaded", onReadyMobile);
