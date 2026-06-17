const express = require('express');

const router = express.Router();

function getRagServiceUrl() {
  return (process.env.RAG_SERVICE_URL || 'http://localhost:8000').replace(/\/+$/, '');
}

async function requestHelpArticles(path, queryParams) {
  if (typeof fetch !== 'function') {
    throw new Error('Native fetch is not available in this Node.js runtime.');
  }

  const url = new URL(`${getRagServiceUrl()}${path}`);

  if (queryParams) {
    ['q', 'category'].forEach((key) => {
      const value = queryParams[key];
      if (typeof value === 'string' && value.trim()) {
        url.searchParams.set(key, value.trim());
      }
    });
  }

  const response = await fetch(url, {
    headers: {
      'X-API-Key': process.env.RAG_INTERNAL_API_KEY || ''
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`RAG help articles request failed with ${response.status}: ${body}`);
  }

  return response.json();
}

router.get('/', async (req, res) => {
  try {
    const payload = await requestHelpArticles('/knowledge/help-articles', req.query);
    res.json(payload);
  } catch (error) {
    console.error('Unable to load help articles from RAG service:', error);
    res.status(502).json({
      error: 'Unable to load help articles'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const payload = await requestHelpArticles(
      `/knowledge/help-articles/${encodeURIComponent(req.params.id)}`
    );
    res.json(payload);
  } catch (error) {
    console.error('Unable to load help article from RAG service:', error);
    res.status(502).json({
      error: 'Unable to load help articles'
    });
  }
});

module.exports = router;
