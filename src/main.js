import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

import 'loaders.css/loaders.min.css';

import errorIcon from './img/error-icon.svg';

const formEl = document.querySelector('.form');
const loadMoreBtnEl = document.querySelector('.js-load-more');

const PER_PAGE = 15;

const toastErrorOptions = {
  position: 'topRight',
  backgroundColor: '#EF4040',
  messageColor: '#FAFAFB',
  iconColor: '#FAFAFB',
  close: true,
  closeOnEscape: true,
  closeOnClick: true,
  iconUrl: errorIcon,
  timeout: 5000,
  progressBar: true,
  progressBarColor: '#b51b1b',
};

let currentQuery = '';
let currentPage = 1;
let totalHits = 0;

hideLoadMoreButton();

formEl.addEventListener('submit', onFormSubmit);
loadMoreBtnEl.addEventListener('click', onLoadMoreClick);

async function onFormSubmit(evt) {
  evt.preventDefault();

  const form = evt.currentTarget;
  const query = form.elements['search-text'].value.trim();
  form.reset();

  if (!query) return;

  currentQuery = query;
  currentPage = 1;
  totalHits = 0;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    totalHits = data.totalHits;
    const images = data.hits;

    if (!images || images.length === 0) {
      iziToast.error({
        ...toastErrorOptions,
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }

    createGallery(images);

    if (currentPage * PER_PAGE >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        position: 'topRight',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      showLoadMoreButton();
    }
  } catch {
    iziToast.error({
      ...toastErrorOptions,
      message: 'Something went wrong. Please try again later.',
    });
  } finally {
    hideLoader();
  }
}

async function onLoadMoreClick() {
  currentPage += 1;

  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    const images = data.hits;

    createGallery(images);
    smoothScroll();

    if (currentPage * PER_PAGE >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        position: 'topRight',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      showLoadMoreButton();
    }
  } catch {
    iziToast.error({
      ...toastErrorOptions,
      message: 'Something went wrong. Please try again later.',
    });
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const firstCard = document.querySelector('.gallery-item');
  if (!firstCard) return;

  const { height } = firstCard.getBoundingClientRect();

  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}
