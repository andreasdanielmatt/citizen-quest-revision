async function fetchConfig(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    return response.json();
  } catch (err) {
    throw new Error(`Error fetching configuration from ${url}: ${err.message}`);
  }
}

module.exports = fetchConfig;
