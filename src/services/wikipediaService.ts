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

export const getWikipediaArticle = async (title, lang) => {
  const response = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
    params: {
      action: 'parse',
      page: title,
      format: 'json',
      origin: '*',
    },
  });

  const articleData = response.data.parse;

  // Convert internal Wikipedia links to local links
  const content = articleData.text['*'].replace(/href="\/wiki\/([^"]+)"/g, 'href="/articles/$1"');

  return {
    title: articleData.title,
    content,
  };
};

