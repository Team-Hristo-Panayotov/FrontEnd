const TITLE_MIN = 10;
const TITLE_MAX = 200;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 1000;
const SENT_KEY = "suggestionBoxSent";

const form = document.getElementById("suggestion-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const titleCounter = document.getElementById("title-counter");
const descriptionCounter = document.getElementById("description-counter");
const submitButton = document.getElementById("submit-button");
const successMessage = document.getElementById("success-message");

let isSending = false;

function wasAlreadySent() {
    try {
        return localStorage.getItem(SENT_KEY) === "true";
    } catch {
        return false;
    }
}

function rememberSent() {
    try {
        localStorage.setItem(SENT_KEY, "true");
    } catch {
        // Storage can be blocked (private mode); the form is still locked for this page.
    }
}

function showSuccess() {
    form.hidden = true;
    successMessage.hidden = false;
}

function updateCounter(input, counter, min, max) {
    const length = input.value.trim().length;
    counter.textContent = `${length} / ${max}`;
    counter.classList.toggle("invalid", length > 0 && (length < min || length > max));
}

function setError(fieldName, message) {
    const error = document.getElementById(`${fieldName}-error`);
    error.textContent = message;
    error.closest(".field").classList.toggle("has-error", message !== "");
}

function validateType() {
    const selected = form.querySelector('input[name="type"]:checked');
    setError("type", selected ? "" : "Изберете тип на заявката.");
    return Boolean(selected);
}

function validateText(input, fieldName, label, min, max) {
    const length = input.value.trim().length;
    let message = "";

    if (length === 0) {
        message = `Полето „${label}“ е задължително.`;
    } else if (length < min) {
        message = `Минимум ${min} символа (още ${min - length}).`;
    } else if (length > max) {
        message = `Максимум ${max} символа.`;
    }

    setError(fieldName, message);
    return message === "";
}

function validateTitle() {
    return validateText(titleInput, "title", "Заглавие", TITLE_MIN, TITLE_MAX);
}

function validateDescription() {
    return validateText(descriptionInput, "description", "Описание", DESCRIPTION_MIN, DESCRIPTION_MAX);
}

// Stand-in for the real API call until the back-end endpoint exists.
function sendRequest(data) {
    console.log("Sending:", data);
    return new Promise(resolve => setTimeout(resolve, 800));
}

titleInput.addEventListener("input", () => {
    updateCounter(titleInput, titleCounter, TITLE_MIN, TITLE_MAX);
    if (titleInput.closest(".field").classList.contains("has-error")) validateTitle();
});

descriptionInput.addEventListener("input", () => {
    updateCounter(descriptionInput, descriptionCounter, DESCRIPTION_MIN, DESCRIPTION_MAX);
    if (descriptionInput.closest(".field").classList.contains("has-error")) validateDescription();
});

titleInput.addEventListener("blur", () => titleInput.value && validateTitle());
descriptionInput.addEventListener("blur", () => descriptionInput.value && validateDescription());
form.querySelectorAll('input[name="type"]').forEach(radio => radio.addEventListener("change", validateType));

form.addEventListener("submit", async event => {
    event.preventDefault();

    // Block double clicks and a second submit after success.
    if (isSending || wasAlreadySent()) return;

    const isValid = [validateType(), validateTitle(), validateDescription()].every(Boolean);
    if (!isValid) {
        form.querySelector(".has-error input, .has-error textarea")?.focus();
        return;
    }

    isSending = true;
    submitButton.disabled = true;
    submitButton.classList.add("loading");
    submitButton.querySelector(".submit-text").textContent = "Изпращане...";

    await sendRequest({
        type: form.querySelector('input[name="type"]:checked').value,
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim()
    });

    rememberSent();
    showSuccess();
});

if (wasAlreadySent()) {
    showSuccess();
}
