document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('url-input');
  const fetchBtn = document.getElementById('fetch-btn');
  const loadingIndicator = document.getElementById('loading-indicator');
  const resultsSection = document.getElementById('results-section');
  const htmlOutput = document.getElementById('html-output');
  const copyBtn = document.getElementById('copy-btn');
  const toggleWrapBtn = document.getElementById('toggle-wrap');
  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const contentType = document.getElementById('content-type');
  const charCount = document.getElementById('char-count');
  const lineCount = document.getElementById('line-count');

  // Initialize highlight.js
  hljs.highlightAll();

  // Fetch HTML code
  fetchBtn.addEventListener('click', async function() {
    const url = urlInput.value.trim();

    if (!url) {
      showError('Please enter a URL');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      showError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    // Show loading indicator
    loadingIndicator.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    errorMessage.classList.add('hidden');

    try {
      const response = await fetch('/api/fetch-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch HTML');
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      // Display the HTML code with syntax highlighting
      htmlOutput.textContent = data.html;
      hljs.highlightElement(htmlOutput);

      // Update metadata
      contentType.textContent = data.contentType || 'text/html';
      charCount.textContent = `${data.html.length} characters`;
      lineCount.textContent = `${data.html.split('\n').length} lines`;

      resultsSection.classList.remove('hidden');
    } catch (error) {
      console.error('Error fetching HTML:', error);
      showError(error.message);
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', function() {
    const text = htmlOutput.textContent;
    navigator.clipboard.writeText(text).then(() => {
      // Show feedback
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
      copyBtn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
      copyBtn.classList.add('bg-green-600');

      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('bg-green-600');
        copyBtn.classList.add('bg-gray-700', 'hover:bg-gray-600');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showError('Failed to copy to clipboard');
    });
  });

  // Toggle text wrapping
  toggleWrapBtn.addEventListener('click', function() {
    htmlOutput.classList.toggle('whitespace-pre-wrap');
    htmlOutput.classList.toggle('whitespace-pre');

    if (htmlOutput.classList.contains('whitespace-pre-wrap')) {
      toggleWrapBtn.innerHTML = '<i class="fas fa-text-width mr-1"></i> Disable Wrap';
    } else {
      toggleWrapBtn.innerHTML = '<i class="fas fa-text-width mr-1"></i> Enable Wrap';
    }
  });

  // Error display function
  function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    loadingIndicator.classList.add('hidden');
  }

  // Allow pressing Enter to fetch
  urlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      fetchBtn.click();
    }
  });

  // Auto-select URL on focus for easy editing
  urlInput.addEventListener('focus', function() {
    this.select();
  });
});
