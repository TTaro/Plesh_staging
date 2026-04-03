/*
* Palo Alto Theme
*
* Use this file to add custom Javascript to Palo Alto.  Keeping your custom
* Javascript in this fill will make it easier to update Palo Alto. In order
* to use this file you will need to open layout/theme.liquid and uncomment
* the custom.js script import line near the bottom of the file.
*/


(function() {
  // Add custom code below this line

  const getCollectionSortConfig = () => {
    const collectionRoot = document.querySelector('[data-collection]');
    const filters = document.querySelector('[data-collection-filters][data-s-d]');

    if (!collectionRoot || !filters || !filters.dataset.sD) {
      return null;
    }

    const collectionPath = new URL(collectionRoot.dataset.collection, window.location.origin).pathname.replace(/\/$/, '');

    return {
      collectionPath,
      defaultSort: filters.dataset.sD
    };
  };

  const sanitizeCollectionSortUrl = (input) => {
    const config = getCollectionSortConfig();

    if (!config || !input) {
      return input;
    }

    const rawUrl = typeof input === 'string' ? input : input.url;
    const url = new URL(rawUrl, window.location.origin);
    const normalizedPath = url.pathname.replace(/\/$/, '');
    const isCollectionRequest = normalizedPath === config.collectionPath || normalizedPath.indexOf(config.collectionPath + '/') === 0;
    const sortBy = url.searchParams.get('sort_by');
    const hasEmptySort = url.searchParams.has('sort_by') && sortBy === '';
    const shouldRemoveSort = hasEmptySort || sortBy === 'manual' || sortBy === config.defaultSort;

    if (!isCollectionRequest || !shouldRemoveSort) {
      return input;
    }

    url.searchParams.delete('sort_by');

    const sanitizedUrl = url.pathname + url.search + url.hash;

    if (typeof input === 'string') {
      return sanitizedUrl;
    }

    return new Request(sanitizedUrl, input);
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = function(resource, init) {
    return originalFetch(sanitizeCollectionSortUrl(resource), init);
  };

  const originalPushState = window.history.pushState.bind(window.history);
  window.history.pushState = function(state, unused, url) {
    const nextUrl = typeof url === 'string' ? sanitizeCollectionSortUrl(url) : url;

    return originalPushState(state, unused, nextUrl);
  };

  const originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.replaceState = function(state, unused, url) {
    const nextUrl = typeof url === 'string' ? sanitizeCollectionSortUrl(url) : url;

    return originalReplaceState(state, unused, nextUrl);
  };

  const initialSanitizedUrl = sanitizeCollectionSortUrl(window.location.href);
  const currentRelativeUrl = window.location.pathname + window.location.search + window.location.hash;

  if (typeof initialSanitizedUrl === 'string' && initialSanitizedUrl !== currentRelativeUrl) {
    window.history.replaceState(window.history.state, '', initialSanitizedUrl);
  }







  // ^^ Keep your scripts inside this IIFE function call to
  // avoid leaking your variables into the global scope.
})();
