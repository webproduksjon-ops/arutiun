// Selectors
const modal = document.getElementById("modal");
const scrollUp = document.querySelector(".scroll-up");
const burgerMenu = document.querySelector(".burger-menu");
const menu = document.querySelector(".menu");
const reviewToggleButton = document.getElementById("show-review");
const contactsButton = document.querySelector(".contacts");

// Helper Functions
const toggleClass = (element, className) => element.classList.toggle(className);

const smoothScroll = (id, parent = null) => {
  if (parent?.classList.contains("menu-toggle")) {
    toggleClass(parent, "menu-toggle");
    toggleClass(burgerMenu, "open");
  }

  const targetElement =id === "header" ? document.body : document.getElementById(id);
  targetElement.scrollIntoView({ behavior: "smooth" });
};

const addScrollListener = (triggerHeight, element, styleProp, value) => {
  window.addEventListener("scroll", () => {
    element.style[styleProp] = window.scrollY > triggerHeight ? value : 0;
  });
};

// Menu Navigation (Event Delegation)
document.addEventListener("click", (event) => {
  const { id, classList } = event.target;

  if (classList.contains("menu-item")) {
    const targetId = event.target.getAttribute("data-target");
    smoothScroll(targetId, menu);
  } else if (id === "show-review") {
    document.getElementById("more-reviews").classList.toggle("display-flex");
  } else if (classList.contains("burger-menu")) {
    toggleClass(burgerMenu, "open");
    toggleClass(menu, "menu-toggle");
  } else if (classList.contains("contacts")) {
    modal.style.display = "flex";
  }
});

// Scroll Up Button
scrollUp.addEventListener("click", () => smoothScroll("autor-info"));

// Modal Close on Outside Click
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

function modalClose(modal) {
  if (modal) {
    modal.style.display = "none";
  } else {
    console.error("Modal element is null or undefined");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const closeButton = document.getElementById("closeModalButton");

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      modalClose(modal);
    });
  } else {
    console.error("Close button element not found");
  }
});

// Scroll Behavior for "Scroll-Up"
addScrollListener(400, scrollUp, "opacity", 1);

//Podatj zajvku
function toggleDropdown() {
  const dropdown = document.getElementById("issuesDropdown");
  dropdown.classList.toggle("open");
}

function updateSelected() {
  const checkboxes = document.querySelectorAll(
    '.checkbox-list input[type="checkbox"]'
  );
  const selected = [];

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selected.push(checkbox.value);
    }
  });

  const header = document.getElementById("dropdownHeader");
  if (selected.length > 0) {
    header.textContent = selected.join(", ");
  } else {
    header.textContent = "Что вас беспокоит?";
  }
}

document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("issuesDropdown");
  const isClickInside = dropdown.contains(event.target);

  if (!isClickInside) {
    dropdown.classList.remove("open");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const feedbackOverlay = document.getElementById("feedbackOverlay");
  const feedbackPopup = document.getElementById("feedbackModal");
  const closeFeedback = document.getElementById("closeFeedback");
  const expandButton = document.getElementById("expandForm");
  const reviewsSection = document.querySelector("#reviews");
  const contactShortcut = document.querySelector(".contact-shortcut");
  const contactMethod = document.getElementById("contactMethod");
  const telegramUsernameField = document.getElementById(
    "telegramUsernameField"
  );
  const whatsappPhoneField = document.getElementById("whatsappPhoneField");

  let feedbackOpened = false;

  function openFeedbackPopup() {
    feedbackOverlay.style.display = "block";

    setTimeout(() => {
      feedbackPopup.classList.add("show");
      feedbackPopup.classList.add("expanded");
    }, 10);

    feedbackOpened = true;
  }

  closeFeedback.onclick = function () {
    feedbackPopup.classList.remove("show");
    feedbackPopup.classList.remove("expanded");
    sessionStorage.setItem("feedbackClosed", "true");
  };

  window.onclick = function (event) {
    if (event.target === feedbackOverlay) {
      feedbackPopup.classList.remove("expanded");
      feedbackPopup.classList.remove("show");
      sessionStorage.setItem("feedbackClosed", "true");
    }
  };

  // if (!sessionStorage.getItem("feedbackClosed")) {
  //   window.addEventListener("scroll", function () {
  //     const reviewsPosition =
  //       reviewsSection.getBoundingClientRect().top;
  //     const viewportHeight = window.innerHeight;

  //     if (reviewsPosition < viewportHeight && !feedbackOpened) {
  //       openFeedbackPopup();
  //       sessionStorage.setItem("feedbackClosed", "true");
  //     }
  //   });
  // }

  if (contactShortcut) {
    contactShortcut.onclick = function () {
      openFeedbackPopup(true);
    };
  }

  contactMethod.addEventListener("change", function () {
    if (contactMethod.value === "telegram") {
      telegramUsernameField.style.display = "block";
      whatsappPhoneField.style.display = "none";
      whatsappPhoneField.removeAttribute("required"); // Убираем атрибут required с WhatsApp поля
      telegramUsernameField
        .querySelector("input")
        .setAttribute("required", "required"); // Делаем поле Telegram обязательным
    } else if (contactMethod.value === "whatsapp") {
      whatsappPhoneField.style.display = "block";
      telegramUsernameField.style.display = "none";
      telegramUsernameField.querySelector("input").removeAttribute("required"); // Убираем атрибут required с Telegram поля
      whatsappPhoneField.setAttribute("required", "required"); // Делаем поле WhatsApp обязательным
    } else {
      telegramUsernameField.style.display = "none";
      whatsappPhoneField.style.display = "none";
      telegramUsernameField.querySelector("input").removeAttribute("required"); // Убираем обязательность с обоих полей
      whatsappPhoneField.removeAttribute("required");
    }
    });
});