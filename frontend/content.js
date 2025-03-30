// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanPage') {
    // Scan the page for product information
    const productInfo = scanPageForProduct();
    sendResponse({ productInfo });
  }
});

// Function to scan the page for product information
function scanPageForProduct() {
  // This is a basic implementation - you can enhance it based on specific websites
  const productInfo = {
    name: document.querySelector('h1')?.textContent,
    price: document.querySelector('[data-price]')?.textContent,
    images: Array.from(document.querySelectorAll('img')).map(img => img.src),
    description: document.querySelector('[data-description]')?.textContent
  };

  return productInfo;
} 