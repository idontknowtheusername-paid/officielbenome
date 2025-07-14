import { StatusCodes } from 'http-status-codes';
import Project from '../models/Project.js';
import logger from '../config/logger.js';

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: projects
    });
  } catch (err) {
    logger.error('Erreur lors de la récupération des projets:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des projets'
      }
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Projet non trouvé'
        }
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: project
    });
  } catch (err) {
    logger.error('Erreur lors de la récupération du projet:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération du projet'
      }
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: project
    });
  } catch (err) {
    logger.error('Erreur lors de la création du projet:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la création du projet'
      }
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Projet non trouvé'
        }
      });
    }
    
    await project.update(req.body);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: project
    });
  } catch (err) {
    logger.error('Erreur lors de la mise à jour du projet:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la mise à jour du projet'
      }
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Projet non trouvé'
        }
      });
    }
    
    await project.destroy();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
  } catch (err) {
    logger.error('Erreur lors de la suppression du projet:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la suppression du projet'
      }
    });
  }
};
