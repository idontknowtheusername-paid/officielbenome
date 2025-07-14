import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

/**
 * @desc    Récupérer tous les articles de blog avec pagination et filtres
 * @route   GET /api/v1/blogs
 * @access  Public
 */
export const getAllBlogs = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Filtres
    const where = { status: 'published' };
    
    // Filtre par auteur
    if (req.query.author) {
      where.authorId = req.query.author;
    }
    
    // Filtre par catégorie
    if (req.query.category) {
      where.category = req.query.category;
    }
    
    // Filtre par mots-clés
    if (req.query.keywords) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.keywords}%` } },
        { content: { [Op.iLike]: `%${req.query.keywords}%` } }
      ];
    }

    // Tri
    let order = [['createdAt', 'DESC']];
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      order = [[parts[0], parts[1] === 'desc' ? 'DESC' : 'ASC']];
    }

    // Exécuter la requête
    const { count, rows: blogs } = await Blog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order,
      offset,
      limit
    });

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(StatusCodes.OK).json({
      success: true,
      count: blogs.length,
      total: count,
      totalPages,
      currentPage: page,
      hasNextPage,
      hasPreviousPage,
      data: blogs
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des articles de blog: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Récupérer un article de blog par son ID ou son slug
 * @route   GET /api/v1/blogs/:idOrSlug
 * @access  Public
 */
export const getBlogById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    
    // Vérifier si l'ID est un UUID valide ou un slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const where = isUUID 
      ? { id: idOrSlug, status: 'published' }
      : { slug: idOrSlug, status: 'published' };
    
    // Récupérer l'article avec l'auteur
    const blog = await Blog.findOne({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!blog) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Article non trouvé'
        }
      });
    }

    // Incrémenter le compteur de vues
    await blog.increment('viewCount');

    // Récupérer les articles similaires (même catégorie, exclure l'article actuel)
    const relatedBlogs = await Blog.findAll({
      where: {
        category: blog.category,
        id: { [Op.ne]: blog.id },
        status: 'published'
      },
      attributes: ['id', 'title', 'slug', 'excerpt', 'featuredImage', 'readTime'],
      order: [['createdAt', 'DESC']],
      limit: 3
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        ...blog.toJSON(),
        relatedBlogs: relatedBlogs.map(blog => blog.toJSON())
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'article: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Créer un nouvel article de blog
 * @route   POST /api/v1/blogs
 * @access  Private/Admin,Auteur
 */
export const createBlog = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Données invalides',
          details: errors.array()
        }
      });
    }

    const { title, content, excerpt, category, tags, status = 'draft' } = req.body;
    
    // Vérifier si l'utilisateur a le rôle nécessaire
    if (req.user.role !== 'admin' && req.user.role !== 'auteur') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Non autorisé à créer des articles de blog'
        }
      });
    }

    // Créer un slug à partir du titre
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
      .trim();

    // Vérifier si un article avec le même slug existe déjà
    const existingBlog = await Blog.findOne({ where: { slug } });
    if (existingBlog) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        error: {
          code: 'SLUG_EXISTS',
          message: 'Un article avec un titre similaire existe déjà'
        }
      });
    }

    // Créer l'article
    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      category,
      tags: Array.isArray(tags) ? tags : tags?.split(',').map(tag => tag.trim()),
      status,
      authorId: req.user.id,
      featuredImage: req.file ? req.file.path : null,
      readTime: Math.ceil(content.split(/\s+/).length / 200) // Estimation du temps de lecture
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Article créé avec succès',
      data: blog
    });
  } catch (error) {
    logger.error(`Erreur lors de la création de l'article: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Mettre à jour un article de blog
 * @route   PUT /api/v1/blogs/:id
 * @access  Private/Admin,Auteur
 */
export const updateBlog = async (req, res, next) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Données invalides', errors.array());
    }

    const { id } = req.params;
    const { title, content, excerpt, category, tags, status } = req.body;
    
    // Récupérer l'article existant
    let blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Article non trouvé');
    }

    // Vérifier les autorisations (admin ou auteur de l'article)
    if (req.user.role !== 'admin' && blog.author.toString() !== req.user.id) {
      throw new ForbiddenError('Non autorisé à modifier cet article');
    }

    // Mettre à jour les champs
    const updateFields = {};
    
    if (title && title !== blog.title) {
      // Générer un nouveau slug si le titre change
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Vérifier si le nouveau slug est déjà utilisé
      const existingBlog = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existingBlog) {
        throw new BadRequestError('Un article avec ce titre existe déjà');
      }
      
      updateFields.title = title;
      updateFields.slug = newSlug;
    }
    
    if (content) updateFields.content = content;
    if (excerpt) updateFields.excerpt = excerpt;
    if (category) updateFields.category = category;
    if (tags) {
      updateFields.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }
    if (status) updateFields.status = status;
    
    // Mettre à jour le temps de lecture si le contenu a changé
    if (content) {
      updateFields.readTime = Math.ceil(content.split(/\s+/).length / 200);
    }
    
    // Mettre à jour l'image mise en avant si une nouvelle image est fournie
    if (req.file) {
      try {
        // Supprimer l'ancienne image si elle existe
        if (blog.featuredImage?.publicId) {
          await deleteFromCloudinary(blog.featuredImage.publicId);
        }
        
        // Télécharger la nouvelle image
        const result = await uploadToCloudinary(req.file, 'blog');
        updateFields.featuredImage = {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format
        };
      } catch (uploadError) {
        logger.error(`Erreur lors de la mise à jour de l'image: ${uploadError.message}`);
        throw new Error("Échec de la mise à jour de l'image");
      }
    }
    
    // Mettre à jour l'article
    blog = await Blog.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Article mis à jour avec succès',
      data: blog
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de l'article: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Supprimer un article de blog
 * @route   DELETE /api/v1/blogs/:id
 * @access  Private/Admin,Auteur
 */
export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'article existant
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Article non trouvé');
    }

    // Vérifier les autorisations (admin ou auteur de l'article)
    if (req.user.role !== 'admin' && blog.author.toString() !== req.user.id) {
      throw new ForbiddenError('Non autorisé à supprimer cet article');
    }

    // Supprimer l'image associée si elle existe
    if (blog.featuredImage?.publicId) {
      try {
        await deleteFromCloudinary(blog.featuredImage.publicId);
      } catch (error) {
        logger.error(`Erreur lors de la suppression de l'image: ${error.message}`);
        // Ne pas arrêter le processus si la suppression de l'image échoue
      }
    }

    // Supprimer l'article
    await blog.remove();

    // Mettre à jour le compteur d'articles de l'auteur
    await User.findByIdAndUpdate(blog.author, { $inc: { postCount: -1 } });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Article supprimé avec succès',
      data: {}
    });
  } catch (error) {
    logger.error(`Erreur lors de la suppression de l'article: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Like/Unlike un article de blog
 * @route   POST /api/v1/blogs/:id/like
 * @access  Private
 */
export const toggleLikeBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Article non trouvé');
    }

    // Vérifier si l'utilisateur a déjà aimé l'article
    const alreadyLiked = blog.likes.some(like => like.user.toString() === userId);
    
    let message = '';
    
    if (alreadyLiked) {
      // Retirer le like
      blog.likes = blog.likes.filter(like => like.user.toString() !== userId);
      message = 'Like retiré avec succès';
    } else {
      // Ajouter le like
      blog.likes.push({ user: userId });
      message = 'Article aimé avec succès';
      
      // Envoyer une notification à l'auteur de l'article (sauf si c'est l'utilisateur lui-même)
      if (blog.author.toString() !== userId) {
        // Implémenter la logique de notification ici
        // await Notification.create({
        //   user: blog.author,
        //   type: 'like',
        //   content: `${req.user.username} a aimé votre article "${blog.title}"`,
        //   link: `/blog/${blog.slug}`,
        //   fromUser: userId
        // });
      }
    }
    
    await blog.save();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message,
      data: {
        likesCount: blog.likes.length,
        isLiked: !alreadyLiked
      }
    });
  } catch (error) {
    logger.error(`Erreur lors du like de l'article: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Ajouter un commentaire à un article de blog
 * @route   POST /api/v1/blogs/:id/comments
 * @access  Private
 */
export const addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Commentaire invalide', errors.array());
    }

    const { id } = req.params;
    const { content } = req.body;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Article non trouvé');
    }

    const comment = {
      user: req.user.id,
      content,
      name: req.user.username,
      avatar: req.user.avatar
    };

    blog.comments.unshift(comment);
    await blog.save();

    // Envoyer une notification à l'auteur de l'article (sauf si c'est l'utilisateur lui-même)
    if (blog.author.toString() !== req.user.id) {
      // Implémenter la logique de notification ici
      // await Notification.create({
      //   user: blog.author,
      //   type: 'comment',
      //   content: `${req.user.username} a commenté votre article "${blog.title}"`,
      //   link: `/blog/${blog.slug}#comments`,
      //   fromUser: req.user.id
      // });
    }

    // Récupérer le commentaire avec les informations de l'utilisateur
    const newComment = blog.comments[0];
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      data: newComment
    });
  } catch (error) {
    logger.error(`Erreur lors de l'ajout du commentaire: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Supprimer un commentaire
 * @route   DELETE /api/v1/blogs/:id/comments/:commentId
 * @access  Private/Admin,AuteurCommentaire,AuteurArticle
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Article non trouvé');
    }

    // Trouver le commentaire
    const commentIndex = blog.comments.findIndex(
      comment => comment._id.toString() === commentId
    );
    
    if (commentIndex === -1) {
      throw new NotFoundError('Commentaire non trouvé');
    }

    const comment = blog.comments[commentIndex];
    
    // Vérifier les autorisations (admin, auteur du commentaire ou auteur de l'article)
    const isAdmin = req.user.role === 'admin';
    const isCommentAuthor = comment.user.toString() === req.user.id;
    const isBlogAuthor = blog.author.toString() === req.user.id;
    
    if (!isAdmin && !isCommentAuthor && !isBlogAuthor) {
      throw new ForbiddenError('Non autorisé à supprimer ce commentaire');
    }

    // Supprimer le commentaire
    blog.comments.splice(commentIndex, 1);
    await blog.save();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Commentaire supprimé avec succès',
      data: {}
    });
  } catch (error) {
    logger.error(`Erreur lors de la suppression du commentaire: ${error.message}`);
    next(error);
  }
};
