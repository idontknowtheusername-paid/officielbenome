
import { generateId } from '@/lib/utils';
import { initialBlogPostsContent } from '@/lib/data/blogPostsContent';
import { calculateReadingTime, generateSlug } from '@/lib/data/blog-utils';

let blogPosts = localStorage.getItem('blogPosts') 
  ? JSON.parse(localStorage.getItem('blogPosts'))
  : initialBlogPostsContent.map(post => ({
      ...post,
      readingTime: `${calculateReadingTime(post.content)} min`,
      author: post.author || { name: "Benome Admin", avatar: "benome-admin-avatar" },
      slug: post.slug || generateSlug(post.title),
      id: post.id || generateId(),
      publishedAt: post.publishedAt || new Date().toISOString()
    }));

const persistBlogPosts = () => {
  localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
};

export const getBlogPosts = () => {
  return [...blogPosts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
};

export const getBlogPostByIdOrSlug = (idOrSlug) => {
  return blogPosts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
};

export const getRelatedBlogPosts = (currentPost) => {
  if (!currentPost) return [];
  return blogPosts
    .filter(p =>
      p.id !== currentPost.id &&
      (p.category === currentPost.category ||
       (p.tags && currentPost.tags && p.tags.some(tag => currentPost.tags.includes(tag))))
    )
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 3);
};

export const addBlogPost = (post) => {
  const newPost = {
    ...post,
    id: generateId(),
    author: post.author || { name: "Benome Admin", avatar: "benome-admin-avatar" },
    publishedAt: new Date().toISOString(),
    readingTime: `${calculateReadingTime(post.content)} min`,
    slug: post.slug || generateSlug(post.title)
  };
  blogPosts.unshift(newPost);
  persistBlogPosts();
  return newPost;
};

export const updateBlogPost = (updatedPost) => {
  const index = blogPosts.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
    blogPosts[index] = {
      ...blogPosts[index],
      ...updatedPost,
      readingTime: `${calculateReadingTime(updatedPost.content)} min`,
      slug: updatedPost.slug || generateSlug(updatedPost.title)
    };
    persistBlogPosts();
    return blogPosts[index];
  }
  return null;
};

export const deleteBlogPost = (postId) => {
  const index = blogPosts.findIndex(p => p.id === postId);
  if (index !== -1) {
    blogPosts.splice(index, 1);
    persistBlogPosts();
    return true;
  }
  return false;
};

export const getUniqueBlogCategories = () => {
  return [...new Set(blogPosts.map(post => post.category).filter(Boolean))];
};

export const getUniqueBlogTags = () => {
  const allTags = blogPosts.flatMap(post => post.tags || []);
  return [...new Set(allTags.filter(Boolean))];
};
