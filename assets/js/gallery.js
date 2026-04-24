/* Gallery & Kvartirniki page interactions */

// Back button with fallback to homepage
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '/';
  }
}

// Toggle participants visibility
function toggleParticipants(button) {
  var container = button.parentElement.previousElementSibling;
  var isExpanded = container.classList.contains('show');
  var hiddenCount = button.getAttribute('data-hidden-count');

  if (isExpanded) {
    container.classList.remove('show');
    button.textContent = '\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451 ' + hiddenCount + ' \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432 \u25BC';
    button.classList.remove('btn-collapse');
    button.classList.add('btn-expand');
  } else {
    container.classList.add('show');
    button.textContent = '\u0421\u043A\u0440\u044B\u0442\u044C \u25B2';
    button.classList.remove('btn-expand');
    button.classList.add('btn-collapse');
  }
}

// Toggle photos visibility
function togglePhotos(button) {
  var photosGrid = document.getElementById('photosGrid');
  var isExpanded = photosGrid.classList.contains('expanded');
  var hiddenCount = button.getAttribute('data-hidden-count');

  if (isExpanded) {
    photosGrid.classList.remove('expanded');
    button.textContent = '\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451 ' + hiddenCount + ' \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u25BC';
    button.classList.remove('btn-collapse');
    button.classList.add('btn-expand');
    button.setAttribute('data-expanded', 'false');
    photosGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    photosGrid.classList.add('expanded');
    button.textContent = '\u0421\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438 \u25B2';
    button.classList.remove('btn-expand');
    button.classList.add('btn-collapse');
    button.setAttribute('data-expanded', 'true');
  }
}

// Modal gallery
var currentPhotoIndex = 0;
var photos = [];
var isAnimating = false;

function getPhotos() {
  if (!photos.length) {
    var photosContainer = document.getElementById('photosGrid');
    if (photosContainer) {
      photos = JSON.parse(photosContainer.getAttribute('data-photos'));
    }
  }
  return photos;
}

function updateCounter() {
  var allPhotos = getPhotos();
  var caption = document.getElementById('modalCaption');
  if (caption) {
    caption.textContent = (currentPhotoIndex + 1) + ' / ' + allPhotos.length;
  }
}

function openModal(index) {
  var allPhotos = getPhotos();
  if (!allPhotos.length) return;

  currentPhotoIndex = index;
  var modal = document.getElementById('photoModal');
  var modalImg = document.getElementById('modalImage');

  modal.classList.add('modal-open');
  modal.setAttribute('aria-hidden', 'false');
  modalImg.src = allPhotos[currentPhotoIndex];
  modalImg.alt = '\u0424\u043E\u0442\u043E ' + (currentPhotoIndex + 1) + ' \u0438\u0437 ' + allPhotos.length;
  updateCounter();

  document.body.style.overflow = 'hidden';
  modal.focus();

  // Entrance animation
  modalImg.classList.remove('modal-fade-in');
  modalImg.classList.add('modal-fade-out');
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      modalImg.classList.remove('modal-fade-out');
      modalImg.classList.add('modal-fade-in');
    });
  });

  preloadAdjacentImages(currentPhotoIndex);
}

function closeModal() {
  var modal = document.getElementById('photoModal');
  modal.classList.remove('modal-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'auto';
}

function changePhoto(direction) {
  var allPhotos = getPhotos();
  if (!allPhotos.length || isAnimating) return;

  isAnimating = true;
  var modalImg = document.getElementById('modalImage');

  // Fade out current
  modalImg.classList.remove('modal-fade-in');
  modalImg.classList.add('modal-fade-out');

  setTimeout(function() {
    currentPhotoIndex += direction;
    if (currentPhotoIndex >= allPhotos.length) {
      currentPhotoIndex = 0;
    } else if (currentPhotoIndex < 0) {
      currentPhotoIndex = allPhotos.length - 1;
    }

    modalImg.src = allPhotos[currentPhotoIndex];
    modalImg.alt = '\u0424\u043E\u0442\u043E ' + (currentPhotoIndex + 1) + ' \u0438\u0437 ' + allPhotos.length;
    updateCounter();

    // Fade in new
    modalImg.classList.remove('modal-fade-out');
    modalImg.classList.add('modal-fade-in');
    isAnimating = false;

    preloadAdjacentImages(currentPhotoIndex);
  }, 200);
}

// Preload only adjacent images (prev + next) instead of all
function preloadAdjacentImages(index) {
  var allPhotos = getPhotos();
  if (!allPhotos.length) return;

  var indices = [
    (index - 1 + allPhotos.length) % allPhotos.length,
    (index + 1) % allPhotos.length
  ];

  indices.forEach(function(i) {
    var img = new Image();
    img.src = allPhotos[i];
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  var modal = document.getElementById('photoModal');
  if (!modal) return;

  // Close on overlay click
  var overlay = modal.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  // Also close if clicking the image wrap area (but not the image itself)
  var imageWrap = document.getElementById('modalImageWrap');
  if (imageWrap) {
    imageWrap.addEventListener('click', function(e) {
      if (e.target === imageWrap) {
        closeModal();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!modal.classList.contains('modal-open')) return;

    switch (e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowLeft':
        changePhoto(-1);
        break;
      case 'ArrowRight':
        changePhoto(1);
        break;
    }
  });

  // Touch swipe support
  var touchStartX = 0;
  var touchStartY = 0;
  var touchDeltaX = 0;
  var swiping = false;

  modal.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDeltaX = 0;
      swiping = true;
    }
  }, { passive: true });

  modal.addEventListener('touchmove', function(e) {
    if (!swiping || e.touches.length !== 1) return;
    var dx = e.touches[0].clientX - touchStartX;
    var dy = e.touches[0].clientY - touchStartY;

    // Only track horizontal swipes
    if (Math.abs(dx) > Math.abs(dy)) {
      touchDeltaX = dx;
      e.preventDefault();
    }
  }, { passive: false });

  modal.addEventListener('touchend', function() {
    if (!swiping) return;
    swiping = false;

    var threshold = 50;
    if (touchDeltaX > threshold) {
      changePhoto(-1); // swipe right = previous
    } else if (touchDeltaX < -threshold) {
      changePhoto(1); // swipe left = next
    }
    touchDeltaX = 0;
  }, { passive: true });
});
