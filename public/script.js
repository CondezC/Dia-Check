// Navigation and smooth scrolling
document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.getElementById("navMenu");

  menuToggle.addEventListener('click', function () {
    navMenu.classList.toggle('show');
  });

  // Smooth scroll for internal nav on same page
  document.querySelectorAll("#navMenu a[data-target]").forEach((menuItem) => {
    menuItem.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      navMenu.classList.remove("show");
    });
  });

  // Hash scroll
  const hash = window.location.hash;
  if (hash) {
    const sectionId = hash.substring(1);
    const targetSection = document.getElementById(sectionId);

    if (targetSection) {
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }

  // Feature cards click handling
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-target');
      const actionType = card.getAttribute('data-action');
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (actionType === 'capture') {
        document.getElementById('startCameraBtn').click();
      } else if (actionType === 'upload') {
        document.getElementById('uploadBtn').click();
      }
    });
  });
});

// Image upload and camera functionality
document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById('imageInput');
  const placeholder = document.getElementById('previewPlaceholder');
  const analyzeBtn = document.getElementById('analyzeImageBtn');
  const tryAgainBtn = document.getElementById('tryAgainBtn');
  const resultsBox = document.getElementById('resultsSection');
  const videoPrev = document.getElementById('videoPreview');
  const imagePrev = document.getElementById('imagePreview');
  const startBtn = document.getElementById('startCameraBtn');
  const captureBtn = document.getElementById('captureBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');

  let stream = null;
  let currentImageFile = null;
  let currentAnalysis = null;

  tryAgainBtn.style.display = 'none';

  // Image modal
  const imageModal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const modalClose = document.querySelector('.modal-close');

  imagePrev.addEventListener('click', () => {
    if (imagePrev.src) openFullscreen(imagePrev.src);
  });

  modalClose.addEventListener('click', () => {
    imageModal.style.display = 'none';
  });

  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) imageModal.style.display = 'none';
  });

  // Custom modals
  const successModal = document.getElementById('successModal');
  const errorModal = document.getElementById('errorModal');
  const errorMessage = document.getElementById('errorMessage');
  const closeSuccessModal = document.getElementById('closeSuccessModal');
  const closeErrorModal = document.getElementById('closeErrorModal');

  closeSuccessModal.addEventListener('click', () => {
    successModal.style.display = 'none';
  });

  closeErrorModal.addEventListener('click', () => {
    errorModal.style.display = 'none';
    tryAgainBtn.click();
  });

  [successModal, errorModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });

  imageInput.addEventListener('change', e => fileSelected(e.target.files[0]));

  uploadBtn.addEventListener('click', () => {
    imageInput.click();
    stopCamera();
    videoPrev.style.display = 'none';
    imagePrev.style.display = 'none';
    placeholder.style.display = 'block';
    captureBtn.style.display = 'none';
    tryAgainBtn.style.display = 'none';
  });

  async function fileSelected(file) {
    if (!file) return;
    currentImageFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      imagePrev.src = e.target.result;
      imagePrev.style.display = 'block';
      placeholder.style.display = 'none';
      analyzeBtn.disabled = false;
      resultsBox.style.display = 'none';
      tryAgainBtn.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  startBtn.addEventListener('click', async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: 'environment' } } });
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
    }

    videoPrev.srcObject = stream;
    videoPrev.style.display = 'block';
    startBtn.style.display = 'none';
    captureBtn.style.display = 'inline-flex';
    placeholder.style.display = 'none';
    analyzeBtn.disabled = true;
    imagePrev.style.display = 'none';
    currentImageFile = null;
    tryAgainBtn.style.display = 'none';
  });

  captureBtn.addEventListener('click', () => {
    captureBtn.style.display = 'none';
    const canvas = document.createElement('canvas');
    canvas.width = videoPrev.videoWidth;
    canvas.height = videoPrev.videoHeight;
    canvas.getContext('2d').drawImage(videoPrev, 0, 0);
    canvas.toBlob(blob => {
      currentImageFile = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      const reader = new FileReader();
      reader.onload = e => {
        imagePrev.src = e.target.result;
        imagePrev.style.display = 'block';
        videoPrev.style.display = 'none';
        startBtn.style.display = 'inline-flex';
        analyzeBtn.disabled = false;
        tryAgainBtn.style.display = 'none';
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg');

    stopCamera();
  });

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  tryAgainBtn.addEventListener('click', () => {
    resetUploadState();
  });

  function resetUploadState() {
    currentImageFile = null;
    currentAnalysis = null;

    resultsBox.style.display = 'none';

    imagePrev.style.display = 'none';
    videoPrev.style.display = 'none';
    placeholder.style.display = 'block';

    analyzeBtn.disabled = true;
    analyzeBtn.style.display = 'inline-flex';
    tryAgainBtn.style.display = 'none';

    startBtn.style.display = 'inline-flex';
    captureBtn.style.display = 'none';

    stopCamera();
    imageInput.value = '';
  }

  analyzeBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    uploadBtn.disabled = true;
    captureBtn.disabled = true;
    analyzeBtn.disabled = true;
    resultsBox.style.display = 'none';
    loadingSpinner.style.display = 'flex';

    let formData = new FormData();
    if (currentImageFile) {
      formData.append('image', currentImageFile);
      if (currentAnalysis && currentAnalysis?.disease_type?.toLowerCase() !== 'healthy' &&
        currentAnalysis?.annotated_image_url && currentAnalysis?.annotated_image_url !== imagePrev.src) {
        window.appendToHistory(currentAnalysis);
      }
      await process(formData);
    }
  });

  async function process(formData) {
    try {
      const uploadURL = "/api/upload";
      const res = await fetch(uploadURL, { method: 'POST', body: formData });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      currentAnalysis = await res.json();

      /* ---------------------------------------------------
         🔥 FIX ADDED HERE — MAP ROBOFLOW → FRONTEND FIELDS
      ----------------------------------------------------*/
      currentAnalysis.disease_type = currentAnalysis.top || "Unknown";
      currentAnalysis.confidence_score = (currentAnalysis.confidence || 0) * 100;

      const descriptions = {
        "diabetes": "This document indicates a high likelihood of diabetes.",
        "no diabetes": "This document shows no signs of diabetes.",
        "healthy": "This document appears healthy with no issues.",
      };

      currentAnalysis.description =
        descriptions[currentAnalysis.disease_type.toLowerCase()] ||
        "No description available.";

      const prescriptions = {
        "diabetes": "- Monitor blood sugar daily.\n- Schedule a clinic visit.\n- Maintain diet and exercise.",
        "no diabetes": "- Maintain healthy diet.\n- Regular yearly check-ups.",
        "healthy": "- No action needed.",
      };

      currentAnalysis.prescription =
        prescriptions[currentAnalysis.disease_type.toLowerCase()] ||
        "No prescription available.";

      const mitigations = {
        "diabetes": "- Reduce sugar intake.\n- Exercise regularly.\n- Follow medication plan.",
        "no diabetes": "- Maintain healthy lifestyle to prevent diabetes.",
        "healthy": "- Continue maintaining your good health habits.",
      };

      currentAnalysis.mitigation_strategies =
        mitigations[currentAnalysis.disease_type.toLowerCase()] ||
        "No mitigation steps available.";
      /* ---------------------------------------------------
         END FIX
      ----------------------------------------------------*/

      if (currentAnalysis.annotated_image_url) {
        imagePrev.src = currentAnalysis.annotated_image_url;
      } else {
        currentAnalysis.annotated_image_url = imagePrev.src;
      }

      imagePrev.style.display = 'block';

      document.getElementById('diseaseType').innerText = currentAnalysis.disease_type;
      document.getElementById('confidenceScore').innerText =
        Math.round(currentAnalysis.confidence_score) + "%";
      document.getElementById('diseaseDescription').innerText = currentAnalysis.description;

      const prescriptionList = document.getElementById('prescription');
      prescriptionList.innerHTML = '';
      if (currentAnalysis.prescription) {
        currentAnalysis.prescription
          .split('\n')
          .filter(item => item.trim() !== '')
          .forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.trim();
            prescriptionList.appendChild(li);
          });
      }

      const mitigationList = document.getElementById('mitigation');
      mitigationList.innerHTML = '';
      if (currentAnalysis.mitigation_strategies) {
        currentAnalysis.mitigation_strategies
          .split('\n')
          .filter(item => item.trim() !== '')
          .forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.trim();
            mitigationList.appendChild(li);
          });
      }

      resultsBox.style.display = 'block';

      startBtn.disabled = false;
      uploadBtn.disabled = false;
      captureBtn.disabled = false;
      analyzeBtn.disabled = false;
      analyzeBtn.style.display = 'none';
      tryAgainBtn.style.display = 'inline-flex';

      loadingSpinner.style.display = 'none';
      successModal.style.display = 'flex';

      resultsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      console.error('Analysis error:', err);

      errorMessage.textContent =
        'Failed to analyze the document. Please check your connection and try again.';
      errorModal.style.display = 'flex';

      imagePrev.style.display = 'block';
      resultsBox.style.display = 'none';
      startBtn.disabled = false;
      uploadBtn.disabled = false;
      captureBtn.disabled = false;
      analyzeBtn.disabled = false;
      loadingSpinner.style.display = 'none';
    }
  }

  window.openFullscreen = function (src) {
    modalImg.src = src;
    imageModal.style.display = 'flex';
  };
});

// History functionality
document.addEventListener("DOMContentLoaded", function () {
  const historyList = document.getElementById('historyList');
  const noHistoryMessage = document.getElementById('noHistoryMessage');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const PAGE_SIZE = 10;

  let currentPage = 1;
  let totalItems = 0;
  let loadedItems = 0;
  let loadedList = [];

  async function loadNextPage() {
    try {
      const historyURL = `/api/history?page=${currentPage}&limit=${PAGE_SIZE}`;
      const response = await fetch(historyURL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const { data, total } = await response.json();

      if (!data || data.length === 0) {
        if (loadedItems === 0) noHistoryMessage.style.display = 'block';
        loadMoreBtn.style.display = 'none';
        return;
      }

      noHistoryMessage.style.display = 'none';
      totalItems = total;

      data.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
        <div class="history-item-header">
          <div class="history-details">
            <strong>Date:</strong>
            ${new Date(item.created_at).toLocaleString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: 'numeric', minute: '2-digit', hour12: true
            })}<br>
            <strong>Disease:</strong> ${item.disease_type}<br>
            <strong>Confidence:</strong> ${Math.round(item.confidence_score)}%
          </div>
          <button class="btn view-details-btn">View Details</button>
        </div>
        <div class="history-expanded-details">
          <img src="${item.annotated_image_url}"
            onclick="openFullscreen('${item.annotated_image_url}')"
            style="cursor: pointer; max-height:200px; border:1px solid #888; border-radius: 8px;">
          <div class="history-item-content">
            <p><strong>Description:</strong> ${item.description}</p>
            <p><strong>Prescription:</strong> ${item.prescription}</p>
            <p><strong>Mitigation:</strong> ${item.mitigation_strategies}</p>
          </div>
        </div>
        `;

        const detailsBtn = historyItem.querySelector('.view-details-btn');
        const expandedDetails = historyItem.querySelector('.history-expanded-details');

        detailsBtn.addEventListener('click', () => {
          expandedDetails.classList.toggle("open");
          detailsBtn.innerText =
            expandedDetails.classList.contains("open") ? "Hide Details" : "View Details";
        });

        historyList.appendChild(historyItem);
        loadedList.push(item);
      });

      loadedItems += data.length;
      currentPage++;

      loadMoreBtn.style.display = loadedItems < totalItems ? 'block' : 'none';

    } catch (err) {
      console.error('Failed to load history:', err);
      noHistoryMessage.style.display = 'block';
      loadMoreBtn.style.display = 'none';
    }
  }

  loadNextPage();

  loadMoreBtn.addEventListener('click', () => loadNextPage());

  window.appendToHistory = function (entry) {
    if (loadedList.some(item => item.id === entry.id)) return;

    loadedList.pop();
    loadedList.unshift(entry);

    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
    <div class="history-item-header">
      <div class="history-details">
        <strong>Date:</strong>
        ${new Date(entry.created_at).toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: 'numeric', minute: '2-digit', hour12: true
        })}<br>
        <strong>Disease:</strong> ${entry.disease_type}<br>
        <strong>Confidence:</strong> ${Math.round(entry.confidence_score)}%
      </div>
      <button class="btn view-details-btn">View Details</button>
    </div>
    <div class="history-expanded-details">
      <img src="${entry.annotated_image_url}"
        onclick="openFullscreen('${entry.annotated_image_url}')"
        style="cursor: pointer; max-height:200px; border:1px solid #888; border-radius: 8px;">
      <div class="history-item-content">
        <p><strong>Description:</strong> ${entry.description}</p>
        <p><strong>Prescription:</strong> ${entry.prescription}</p>
        <p><strong>Mitigation:</strong> ${entry.mitigation_strategies}</p>
      </div>
    </div>
    `;

    const detailsBtn = historyItem.querySelector('.view-details-btn');
    const expandedDetails = historyItem.querySelector('.history-expanded-details');

    detailsBtn.addEventListener('click', () => {
      expandedDetails.classList.toggle("open");
      detailsBtn.innerText =
        expandedDetails.classList.contains("open") ? "Hide Details" : "View Details";
    });

    historyList.insertBefore(historyItem, historyList.firstChild);
    historyList.removeChild(historyList.lastChild);

    totalItems++;
    loadMoreBtn.style.display = loadedItems < totalItems ? 'block' : 'none';
  };
});
