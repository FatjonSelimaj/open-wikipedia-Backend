// services/wikipediaService.ts
import axios from 'axios';

export const searchWikipedia = async (query: string, lang: string = 'en') => {
  const response = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
    params: {
      action: 'query',
      format: 'json',
      list: 'search',
      srsearch: query,
      origin: '*'
    }
  });
  return response.data.query.search;
};

export const getWikipediaArticle = async (title: string, lang: string = 'en') => {
  const response = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
    params: {
      action: 'parse',
      format: 'json',
      page: title,
      prop: 'text',
      origin: '*'
    }
  });
  return response.data.parse;
};
