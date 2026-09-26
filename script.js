// Каждая карточка раскрывает только своё описание.
document.querySelectorAll(".tariff-details-toggle").forEach(button => {
    const details = document.getElementById(button.getAttribute("aria-controls"));
    button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(expanded));
        button.textContent = expanded ? "Скрыть" : "Подробнее";
        details.hidden = !expanded;
    });
});

// Время занятий: можно выбрать несколько вариантов и дописать свой.
const timeSelect = document.querySelector(".time-select");
const timeValue = document.querySelector("#time-value");
const customTime = document.querySelector(".time-select__custom");

timeSelect.addEventListener("input", () => {
    const selected = Array.from(timeSelect.querySelectorAll("input:checked"), input => input.value);
    if (customTime.value.trim()) selected.push(customTime.value.trim());
    timeValue.textContent = selected.join(", ") || "Выберите время";
    timeValue.title = timeValue.textContent;
});

document.addEventListener("click", event => {
    if (!timeSelect.contains(event.target)) timeSelect.open = false;
});

timeSelect.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        timeSelect.open = false;
        timeSelect.querySelector("summary").focus();
    }
    if (event.key === "Enter" && event.target === customTime) event.preventDefault();
});

// Получатель настроен в Web3Forms и определяется публичным access_key.
const applicationForm = document.querySelector("#application");
applicationForm.addEventListener("submit", async event => {
    event.preventDefault();
    const button = applicationForm.querySelector(".form__submit");
    if (button.disabled) return;
    if (!applicationForm.reportValidity()) return;

    const status = applicationForm.querySelector(".form__status");
    const fields = new FormData(applicationForm);
    const times = fields.getAll("time");
    if (customTime.value.trim()) times.push(customTime.value.trim());
    const payload = {
        access_key: "ca27f373-12e1-4f94-96d3-bfea5b1443d5",
        subject: "Новая заявка на занятия — Agadzhanova English",
        from_name: "Agadzhanova English",
        name: fields.get("name").trim(),
        "VK или Telegram": fields.get("social").trim(),
        "Удобное время занятий": times.join(", ") || "Не указано",
        "Уровень английского": fields.get("level").trim() || "Не указан",
        "Предыдущий опыт занятий": fields.get("experience").trim() || "Не указан",
        "Цели занятий": fields.get("target").trim() || "Не указаны",
    };

    button.disabled = true;
    button.textContent = "Отправляем…";
    applicationForm.setAttribute("aria-busy", "true");
    status.textContent = "Отправляем вашу заявку…";
    status.dataset.state = "pending";
    status.hidden = false;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
            throw new Error(response.status === 429
                ? "Слишком много заявок. Попробуйте отправить чуть позже."
                : "Не удалось отправить заявку. Попробуйте ещё раз позже.");
        }
        applicationForm.reset();
        timeValue.textContent = "Выберите время";
        timeValue.removeAttribute("title");
        timeSelect.open = false;
        status.dataset.state = "success";
        status.textContent = "Спасибо! Заявка отправлена. Я свяжусь с вами в VK или Telegram.";
    } catch (error) {
        status.dataset.state = "error";
        status.textContent = error.name === "AbortError" || error instanceof TypeError
            ? "Не удалось получить подтверждение отправки. Проверьте соединение. Данные сохранены в форме."
            : error.message;
    } finally {
        clearTimeout(timeout);
        button.disabled = false;
        button.textContent = "Оставить заявку";
        applicationForm.removeAttribute("aria-busy");
    }
});

// Сохраняем исходный порядок: loop переставляет слайды в DOM.
const certificateImages = Array.from(document.querySelectorAll(".certificate"));

function loadCertificates(swiper) {
    const count = certificateImages.length;
    for (const offset of [0, -1, 1]) {
        const image = certificateImages[(swiper.realIndex + offset + count) % count];
        if (image?.dataset.src) {
            image.src = image.dataset.src;
            image.removeAttribute("data-src");
        }
    }
}

const certificatesSwiper = new Swiper(".certificates-swiper", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    on: {
        init: loadCertificates,
        realIndexChange: loadCertificates,
    },
    navigation: {
        nextEl: ".certificates-swiper .swiper-button-next",
        prevEl: ".certificates-swiper .swiper-button-prev",
    },

    pagination: {
        el: ".certificates-swiper .swiper-pagination",
        clickable: true,
    },
});

// В обоих блоках показываем по три карточки, как в desktop-макете.
document.querySelectorAll(".stories-swiper").forEach(slider => {
    new Swiper(slider, {
        slidesPerView: 3,
        slidesPerGroup: 3,
        spaceBetween: 24,
        grabCursor: true,
        keyboard: { enabled: true, onlyInViewport: true },
        pagination: {
            el: slider.querySelector(".swiper-pagination"),
            clickable: true,
            renderBullet: (index, className) =>
                `<button type="button" class="${className}" aria-label="Страница ${index + 1}"></button>`,
        },
        a11y: { enabled: true, slideLabelMessage: "Карточка {{index}} из {{slidesLength}}" },
    });
});

document.querySelectorAll(".hero .button").forEach(button => {
    button.addEventListener("click", () => {
        applicationForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});
