let currentImageFile = null;

// ------------------------------
// Convert image → Base64
// ------------------------------
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

// ------------------------------
// Upload Base64 → /api/upload
// ------------------------------
async function uploadImageBase64(base64) {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64 })
  });

  return await res.json();
}

// ------------------------------
// Handle image selection
// ------------------------------
document.getElementById("imageInput").addEventListener("change", async function (event) {
  const file = event.target.files[0];
  if (!file) return;

  currentImageFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("imagePreview").src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// ------------------------------
// When user clicks "Analyze"
// ------------------------------
document.getElementById("analyzeBtn").addEventListener("click", async function () {
  if (!currentImageFile) {
    alert("Please select an image first.");
    return;
  }

  // Convert image → base64
  const base64 = await toBase64(currentImageFile);

  // Send to backend
  const result = await uploadImageBase64(base64);

  console.log("📌 RESULT:", result);

  // Display the result
  document.getElementById("resultText").innerText =
    result?.predictions?.[0]?.class || "No prediction";
});
