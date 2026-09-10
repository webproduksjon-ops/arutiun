document.addEventListener("DOMContentLoaded", function () {
  const reviewForm = document.getElementById("review-form");
  const reviewsContainer = document.getElementById("latest-reviews");
  
  window.forms = {};
  siteKey = '6Lc6pJIqAAAAAACrWn2PKtK38yPKrf0RjsxAG7e3';
  
  function onloadCallback() {
    const captchaItems = document.querySelectorAll('.kw-recaptcha');
    
    captchaItems.forEach(function(item) {
      if (!item.hasAttribute('data-rendered')) {
        try {
          var widgetID = grecaptcha.render(item.id, {
            'sitekey': siteKey
          });
          window.forms[item.id] = widgetID;
          item.setAttribute('data-rendered', 'true');
        } catch (e) {
          console.log('Капча уже отрисована для: ' + item.id);
        }
      }
    });
  }
  
  window.onloadCallback = onloadCallback;

  if(reviewForm) {
      reviewForm.addEventListener("submit", function (event) {
        event.preventDefault();
        
        const captchaItemId = this.querySelector('.kw-recaptcha').id;
        const captchaWidgetID = window.forms[captchaItemId];
        const captchaResponse = grecaptcha.getResponse(captchaWidgetID);
        
        if (!captchaResponse.length) {
          this.querySelector('.g-text-danger').textContent = '* Вы не прошли проверку "Я не робот"';
          return;
        } else {
          this.querySelector('.g-text-danger').textContent = '';
        }
        
        const name = document.getElementById("name").value.trim();
        const review = document.getElementById("review").value.trim();
        const rating = document.querySelector('input[name="rating3"]:checked');
        const gRecaptcha = reviewForm.querySelector('[name="g-recaptcha-response"]');

        if (!review) {
          toastr.error("Пожалуйста, введите ваш отзыв.");
          return;
        }

        if (!rating || rating.value === "0") {
          toastr.error("Пожалуйста, выберите рейтинг.");
          return;
        }

        const reviewData = {
          name: name,
          review: review,
          rating: rating.value,
          date: new Date().toLocaleDateString(),
          'g-recaptcha-response' : gRecaptcha.value
        };

        fetch("php/Reviews/SendReview.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reviewData),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              addReviewToPage(reviewData);
              reviewForm.reset();
              toastr.success("Ваш отзыв успешно добавлен!");
              grecaptcha.reset(captchaWidgetID);
            } else {
              toastr.error("Ошибка при сохранении отзыва");
            }
          });
      });
  }

  function addReviewToPage(reviewData) {
    const reviewElement = document.createElement("div");
    reviewElement.classList.add("reviews-item");
    reviewElement.innerHTML = `
                <div class="review-content">
                    <div class="review-stars">
                        <span class="review-rating">${getRatingText(
                          reviewData.rating
                        )}</span>
                        ${getStarsHtml(reviewData.rating)}
                    </div>
                    <p class="reviewer"><span class="reviewer-name">${
                      reviewData.name
                    }</span> от <span class="review-date">${
      reviewData.date
    }</span></p>
                    <p class="reviewer-text">${reviewData.review}</p>
                </div>
            `;
    reviewsContainer.prepend(reviewElement);
  }

  function getRatingText(rating) {
    switch (parseInt(rating)) {
      case 1:
        return "Очень плохо";
      case 2:
        return "Плохо";
      case 3:
        return "Нормально";
      case 4:
        return "Хорошо";
      case 5:
        return "Отлично";
      default:
        return "";
    }
  }

  function getStarsHtml(rating) {
    let starsHtml = "";
    for (let i = 0; i < rating; i++) {
      starsHtml += '<i class="rating__icon rating__icon--star fa fa-star"></i>';
    }
    for (let i = rating; i < 5; i++) {
      starsHtml +=
        '<i class="rating__icon rating__icon--star fa fa-star-o"></i>';
    }
    return starsHtml;
  }

  if(reviewsContainer) {
      fetch("php/Reviews/GetReviews.php")
        .then((response) => response.json())
        .then((reviews) => {
          reviews.forEach((reviewData) => addReviewToPage(reviewData));
        });
  }
});

const feedbackForm = document.getElementById("feedbackForm");

if(feedbackForm) {
  feedbackForm.addEventListener("submit", function (event) {
    event.preventDefault(); 
    
    const captchaItemId = feedbackForm.querySelector('.kw-recaptcha').id;
    const captchaWidgetID = window.forms[captchaItemId];
    const captchaResponse = grecaptcha.getResponse(captchaWidgetID);
    
    if (!captchaResponse.length) {
      this.querySelector('.g-text-danger').textContent = '* Вы не прошли проверку "Я не робот"';
      return;
    } else {
      this.querySelector('.g-text-danger').textContent = '';
    }

    const name = document.getElementById("userName").value.trim();
    const age = document.getElementById("userAge").value.trim();
    const city = document.getElementById("userCity").value.trim();
    const contactMethod = document.getElementById("contactMethod").value;
    const whatsappPhone = document.getElementById("whatsappPhone");
    const telegramUsername = document.getElementById("telegramUsername");
    const userProblem = document.getElementById("userProblem").value.trim();

    if (name.length < 2 || !/[a-zA-Zа-яА-Я]{2,}/.test(name)) {
      alert("Введите минимум две буквы в поле «Имя».");
      return;
    }

    if (age.length < 2 || !/^\d{2,}$/.test(age)) {
      alert("Введите минимум две цифры в поле «Возраст».");
      return;
    }

    if (city.length < 2 || !/[a-zA-Zа-яА-Я]{2,}/.test(city)) {
      alert("Введите минимум две буквы в поле «Город».");
      return;
    }

    if (contactMethod === "") {
      alert("Укажите куда вам удобнее написать.");
      return;
    }

    if (contactMethod === "whatsapp") {
      const phoneValue = whatsappPhone.value.trim();
      if (phoneValue.length < 6 || !/^\+?\d{6,}$/.test(phoneValue)) {
        alert("Введите минимум 6 цифр в поле «WhatsApp».");
        return;
      }
    }

    if (contactMethod === "telegram") {
      const usernameValue = telegramUsername.value.trim();
      if (usernameValue.length < 3) {
        alert("Введите минимум 3 символа в поле «Telegram».");
        return;
      }
    }

    const formData = new FormData(this);

    // Блокируем кнопку, чтобы не нажать дважды
    const submitBtn = this.querySelector('input[type="submit"]');
    let originalText = "Оставить заявку";
    if(submitBtn) {
        originalText = submitBtn.value;
        submitBtn.value = "Отправка...";
        submitBtn.disabled = true;
    }

    fetch("php/Consultation/SendForm.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((result) => {
        
        // Разблокируем кнопку
        if(submitBtn) {
            submitBtn.value = originalText;
            submitBtn.disabled = false;
        }

        if (result.trim() === "success") {
        
          
          showPopup();
          document.getElementById("feedbackForm").reset(); 
          grecaptcha.reset(captchaWidgetID); 

          const feedbackPopup = document.getElementById("feedbackModal");
          const feedbackOverlay = document.getElementById("feedbackOverlay");
          if(feedbackPopup && feedbackOverlay) {
              feedbackPopup.classList.remove("show");
              feedbackPopup.classList.remove("expanded");
              feedbackOverlay.style.display = "none";
          }
        } else {
          alert("Ответ сервера: " + result);
          grecaptcha.reset(captchaWidgetID); 
        }
      })
      .catch((error) => {
        if(submitBtn) {
            submitBtn.value = originalText;
            submitBtn.disabled = false;
        }
        console.error("Ошибка:", error);
        alert("Произошла ошибка сети. Проверьте консоль браузера.");
      });
  });
}

const whatsappEl = document.getElementById("whatsappPhone");
if(whatsappEl) {
    whatsappEl.addEventListener("focus", function () {
      if (this.value === "") {
        this.value = "+"; 
      }
    });

    whatsappEl.addEventListener("input", function () {
      if (!this.value.startsWith("+")) {
        this.value = "+" + this.value.replace(/[^0-9]/g, ""); 
      }
    });
}

const telegramEl = document.getElementById("telegramUsername");
if(telegramEl) {
    telegramEl.addEventListener("focus", function () {
        if (this.value === "") {
          this.value = "@"; 
        }
      });

    telegramEl.addEventListener("input", function () {
        if (!this.value.startsWith("@")) {
          this.value = "@" + this.value.replace(/[^a-zA-Z0-9_]/g, ""); 
        }
      });
}

function showPopup() {
  const popup = document.getElementById("popupOverlay");
  if(popup) {
      popup.style.display = "flex";

      setTimeout(() => {
        popup.style.display = "none";
      }, 3000); 
  }
}