import axios from 'axios';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

interface WikipediaArticle {
  title: string;
  content: string;
}

export const searchWikipedia = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get(WIKIPEDIA_API_URL, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*',
      },
    });

    if (response.data?.query?.search) {
      return response.data.query.search;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    throw new Error('Failed to search Wikipedia');
  }
};

export const getWikipediaArticle = async (title: string, lang: string): Promise<WikipediaArticle> => {
  try {
    const response = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
      params: {
        action: 'parse',
        page: title,
        format: 'json',
        origin: '*',
      },
    });

    if (response.data?.parse?.text) {
      const content = response.data.parse.text['*'];
      return {
        title: response.data.parse.title,
        content,
      };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching Wikipedia article:', error);
    throw new Error('Failed to fetch Wikipedia article');
  }
};
