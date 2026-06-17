import { HelpArticle } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function unwrapArticlesPayload(payload: unknown): HelpArticle[] {
  if (Array.isArray(payload)) {
    return payload as HelpArticle[];
  }

  if (payload && typeof payload === 'object') {
    const body = payload as {
      data?: unknown;
      articles?: unknown;
      items?: unknown;
    };

    if (Array.isArray(body.data)) {
      return body.data as HelpArticle[];
    }

    if (body.data && typeof body.data === 'object') {
      return unwrapArticlesPayload(body.data);
    }

    if (Array.isArray(body.articles)) {
      return body.articles as HelpArticle[];
    }

    if (Array.isArray(body.items)) {
      return body.items as HelpArticle[];
    }
  }

  throw new Error('Help articles response was not in the expected format.');
}

function unwrapArticlePayload(payload: unknown): HelpArticle {
  if (payload && typeof payload === 'object') {
    const body = payload as {
      data?: unknown;
      article?: unknown;
      id?: unknown;
    };

    if (body.data && typeof body.data === 'object') {
      return body.data as HelpArticle;
    }

    if (body.article && typeof body.article === 'object') {
      return body.article as HelpArticle;
    }

    if (typeof body.id === 'string') {
      return body as HelpArticle;
    }
  }

  throw new Error('Help article response was not in the expected format.');
}

async function request(path: string): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}${path}`);
  } catch (error) {
    throw new Error('Help articles are temporarily unavailable.');
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error('Help articles returned an invalid response.');
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : 'Unable to load help articles.';

    throw new Error(message);
  }

  return payload;
}

export async function fetchHelpArticles(params?: {
  q?: string;
  category?: string;
}): Promise<HelpArticle[]> {
  const query = new URLSearchParams();

  if (params?.q?.trim()) {
    query.set('q', params.q.trim());
  }

  if (params?.category?.trim()) {
    query.set('category', params.category.trim());
  }

  const payload = await request(`/api/help-articles${query.toString() ? `?${query}` : ''}`);

  return unwrapArticlesPayload(payload);
}

export async function fetchHelpArticleById(id: string): Promise<HelpArticle> {
  const payload = await request(`/api/help-articles/${encodeURIComponent(id)}`);

  return unwrapArticlePayload(payload);
}
