import { enableValidation, validationConfig } from "./validate.js";

const initialCards = [
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Golden Gate bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
];

const profileEditBtn = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const editModal = document.querySelector("#edit-modal");
const cardModal = document.querySelector("#add-card-modal");
const previewModal = document.querySelector("#preview-modal");

// Optimized form selection using document.forms
const editFormElement = document.forms["edit-profile-form"];
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// Optimized form selection using document.forms
const cardForm = document.forms["card-form"];
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const cardCaptionInput = cardModal.querySelector("#card-caption-input");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");

function getCardElement(data) {
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

  cardDeleteBtn.addEventListener("click", () => cardElement.remove());
  cardLikeBtn.addEventListener("click", () =>
    cardLikeBtn.classList.toggle("card__like-btn_liked")
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

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", closeModalByEscape);
  modal.addEventListener("mousedown", closeModalByOverlayClick);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", closeModalByEscape);
  modal.removeEventListener("mousedown", closeModalByOverlayClick);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  profileName.textContent = editModalNameInput.value;
  profileDescription.textContent = editModalDescriptionInput.value;
  closeModal(editModal);
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const inputValues = {
    name: cardCaptionInput.value,
    link: cardLinkInput.value,
  };

  if (!inputValues.name || !inputValues.link) {
    alert("Please fill out both the image link and caption fields.");
    return;
  }

  renderCard(inputValues);
  closeModal(cardModal);
  cardForm.reset();
  toggleButtonState(
    [cardCaptionInput, cardLinkInput], // Use pre-selected inputs
    evt.submitter, // Use the submit button that triggered the event
    settings
  );
}

profileEditBtn.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings);
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => closeModal(editModal));
cardModalBtn.addEventListener("click", () => openModal(cardModal));
cardModalCloseBtn.addEventListener("click", () => closeModal(cardModal));
previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

initialCards.forEach((item) => renderCard(item, "append"));

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

enableValidation(validationConfig);
