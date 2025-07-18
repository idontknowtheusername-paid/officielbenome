
export const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const textLength = content.split(/\s+/).length;
  return Math.ceil(textLength / wordsPerMinute);
};

export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};