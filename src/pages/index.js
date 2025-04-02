import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  toggleButtonState,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "eb9bb101-c854-4169-9f87-c5a28a8b7a33",
    "Content-Type": "application/json",
  },
});

// DOM Elements
const profileEditBtn = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

const editModal = document.querySelector("#edit-modal");
const cardModal = document.querySelector("#add-card-modal");
const previewModal = document.querySelector("#preview-modal");
const avatarModal = document.querySelector("#avatar-modal");
const deleteModal = document.querySelector("#delete-modal");

const editFormElement = document.forms["edit-profile-form"];
const cardForm = document.forms["card-form"];
const avatarForm = document.forms["avatar-form"];
const deleteForm = document.forms["delete-form"];

const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteModalCancelBtn = deleteModal.querySelector(".modal__cancel-btn");

const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const cardCaptionInput = cardModal.querySelector("#card-caption-input");
const avatarUrlInput = avatarModal.querySelector("#avatar-url-input");

const avatarEditLink = document.querySelector(".profile__edit-avatar-link");
const avatarContainer = document.querySelector(".profile__avatar-container");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const previewModalImage = document.querySelector(".modal__image");
const previewModalCaption = document.querySelector(".modal__caption");

// Variables for delete functionality
let selectedCard = null;
let selectedCardId = null;
let userId = null; // Store the current user's ID

// Load initial data from API
function loadInitialData() {
  api
    .getAppInfo()
    .then(({ user, cards }) => {
      console.log("API User Data:", user);
      console.log("API Cards Data:", cards);
      userId = user._id; // Store the current user's ID
      profileName.textContent = user.name;
      profileDescription.textContent = user.about;
      profileAvatar.src = user.avatar;
      cardsList.innerHTML = ""; // Clear existing cards
      cards.forEach((item) => renderCard(item, "append"));
    })
    .catch((err) => console.error("Failed to load initial data:", err));
}

// Card creation function
function getCardElement(data) {
  console.log("Creating card with data:", data); // Debug: Log card data
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  // Check if the current user has liked the card
  const isLiked = data.likes && data.likes.some((like) => like._id === userId);
  console.log(`Card ${data._id} isLiked: ${isLiked}`); // Debug: Log initial like state
  if (isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  cardDeleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data)
  );
  cardLikeBtn.addEventListener(
    "click",
    handleLikeClick.bind(null, cardLikeBtn, data)
  );
  cardImageEl.addEventListener("click", () => {
    previewModalImage.src = data.link;
    previewModalImage.alt = data.name;
    previewModalCaption.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function renderCard(item, method = "prepend") {
  const cardElement = getCardElement(item);
  cardsList[method](cardElement);
}

// Modal functions
function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", closeModalByEscape);
  modal.addEventListener("mousedown", closeModalByOverlayClick);
  avatarContainer.classList.remove("profile__avatar-container--active");
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", closeModalByEscape);
  modal.removeEventListener("mousedown", closeModalByOverlayClick);
  avatarContainer.classList.remove("profile__avatar-container--active");
}

// Form handlers with "Saving..." state
function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";
  const name = editModalNameInput.value;
  const about = editModalDescriptionInput.value;
  api
    .editUserInfo({ name, about })
    .then((user) => {
      profileName.textContent = user.name;
      profileDescription.textContent = user.about;
      closeModal(editModal);
    })
    .catch((err) => console.error("Failed to update profile:", err))
    .finally(() => (submitBtn.textContent = originalText));
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";
  const name = cardCaptionInput.value;
  const link = cardLinkInput.value;
  api
    .addCard({ name, link })
    .then((card) => {
      renderCard(card);
      closeModal(cardModal);
      cardForm.reset();
      toggleButtonState([cardCaptionInput, cardLinkInput], submitBtn, settings);
    })
    .catch((err) => console.error("Failed to add card:", err))
    .finally(() => (submitBtn.textContent = originalText));
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";
  const avatarUrl = avatarUrlInput.value;
  api
    .updateAvatar(avatarUrl)
    .then((user) => {
      profileAvatar.src = user.avatar;
      closeModal(avatarModal);
    })
    .catch((err) => console.error("Failed to update avatar:", err))
    .finally(() => (submitBtn.textContent = originalText));
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";
  api
    .removeCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
      selectedCard = null;
      selectedCardId = null;
    })
    .catch((err) => console.error("Failed to delete card:", err))
    .finally(() => (submitBtn.textContent = originalText));
}

function handleLikeClick(likeBtn, data) {
  const isLiked = likeBtn.classList.contains("card__like-btn_liked");
  console.log(`Like button clicked, isLiked: ${isLiked}, Card ID: ${data._id}`); // Debug
  const method = isLiked ? api.removeLike.bind(api) : api.addLike.bind(api);
  method(data._id)
    .then((updatedCard) => {
      console.log("Like update response:", updatedCard); // Debug
      const newIsLiked =
        updatedCard.likes &&
        updatedCard.likes.some((like) => like._id === userId);
      likeBtn.classList.toggle("card__like-btn_liked", newIsLiked);
    })
    .catch((err) => console.error("Failed to update like:", err));
}

// Event listeners
profileEditBtn.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings);
  openModal(editModal);
});

cardModalBtn.addEventListener("click", () => openModal(cardModal));
avatarEditLink.addEventListener("click", (evt) => {
  evt.preventDefault();
  avatarUrlInput.value = profileAvatar.src;
  resetValidation(avatarForm, settings);
  openModal(avatarModal);
});

editModalCloseBtn.addEventListener("click", () => closeModal(editModal));
cardModalCloseBtn.addEventListener("click", () => closeModal(cardModal));
previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));
avatarModalCloseBtn.addEventListener("click", () => closeModal(avatarModal));
deleteModalCloseBtn.addEventListener("click", () => closeModal(deleteModal));
deleteModalCancelBtn.addEventListener("click", () => closeModal(deleteModal));

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

// Touch events for avatar
avatarContainer.addEventListener("touchstart", (evt) => {
  avatarContainer.classList.toggle("profile__avatar-container--active");
});
document.addEventListener("touchstart", (evt) => {
  if (!avatarContainer.contains(evt.target)) {
    avatarContainer.classList.remove("profile__avatar-container--active");
  }
});

function closeModalByEscape(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) closeModal(openedModal);
  }
}

function closeModalByOverlayClick(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

// Initialize
loadInitialData();
enableValidation(settings);
