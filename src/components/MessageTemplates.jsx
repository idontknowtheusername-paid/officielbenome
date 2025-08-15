import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  User
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

const MessageTemplates = ({ 
  onSelectTemplate, 
  listingInfo = null,
  className = '' 
}) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(getDefaultTemplates());
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    category: 'general',
    title: '',
    content: '',
    isFavorite: false
  });
  const [expandedCategories, setExpandedCategories] = useState(new Set(['general', 'inquiry']));

  // Templates par défaut organisés par catégorie
  function getDefaultTemplates() {
    return {
      inquiry: [
        {
          id: 'inquiry-1',
          title: 'Demande d\'information',
          content: 'Bonjour ! Je suis intéressé(e) par votre annonce. Pouvez-vous me donner plus de détails ?',
          isFavorite: true,
          isDefault: true
        },
        {
          id: 'inquiry-2',
          title: 'Question sur le prix',
          content: 'Bonjour ! Votre annonce m\'intéresse. Le prix est-il négociable ?',
          isFavorite: false,
          isDefault: true
        },
        {
          id: 'inquiry-3',
          title: 'Disponibilité',
          content: 'Bonjour ! Votre annonce est-elle toujours disponible ?',
          isFavorite: false,
          isDefault: true
        }
      ],
      appointment: [
        {
          id: 'appointment-1',
          title: 'Rendez-vous visite',
          content: 'Bonjour ! Serait-il possible de visiter ? Je suis disponible cette semaine.',
          isFavorite: true,
          isDefault: true
        },
        {
          id: 'appointment-2',
          title: 'Essai/Test',
          content: 'Bonjour ! Puis-je essayer/testez avant d\'acheter ?',
          isFavorite: false,
          isDefault: true
        }
      ],
      negotiation: [
        {
          id: 'negotiation-1',
          title: 'Proposition de prix',
          content: 'Bonjour ! Votre annonce m\'intéresse. Accepteriez-vous [PRIX] ?',
          isFavorite: false,
          isDefault: true
        },
        {
          id: 'negotiation-2',
          title: 'Échange possible',
          content: 'Bonjour ! Seriez-vous intéressé(e) par un échange ?',
          isFavorite: false,
          isDefault: true
        }
      ],
      general: [
        {
          id: 'general-1',
          title: 'Salutation',
          content: 'Bonjour ! Comment allez-vous ?',
          isFavorite: false,
          isDefault: true
        },
        {
          id: 'general-2',
          title: 'Merci',
          content: 'Merci pour votre réponse !',
          isFavorite: false,
          isDefault: true
        },
        {
          id: 'general-3',
          title: 'À bientôt',
          content: 'Merci, à bientôt !',
          isFavorite: false,
          isDefault: true
        }
      ]
    };
  }

  // Personnaliser les templates avec les infos de l'annonce
  useEffect(() => {
    if (listingInfo) {
      setTemplates(prev => ({
        ...prev,
        inquiry: prev.inquiry.map(template => ({
          ...template,
          content: template.content.replace(
            'votre annonce',
            `votre annonce "${listingInfo.title}"`
          )
        }))
      }));
    }
  }, [listingInfo]);

  // Ajouter un nouveau template
  const handleAddTemplate = () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir le titre et le contenu du template.",
        variant: "destructive"
      });
      return;
    }

    const template = {
      ...newTemplate,
      id: `custom-${Date.now()}`,
      isDefault: false
    };

    setTemplates(prev => ({
      ...prev,
      [template.category]: [...(prev[template.category] || []), template]
    }));

    // Sauvegarder dans le localStorage
    saveTemplatesToStorage();

    setNewTemplate({
      category: 'general',
      title: '',
      content: '',
      isFavorite: false
    });
    setShowAddForm(false);

    toast({
      title: "Template ajouté",
      description: "Votre template a été sauvegardé avec succès.",
    });
  };

  // Modifier un template
  const handleEditTemplate = (templateId, category) => {
    const template = templates[category].find(t => t.id === templateId);
    if (template && !template.isDefault) {
      setEditingTemplate({ ...template, category });
    }
  };

  // Sauvegarder les modifications
  const handleSaveEdit = () => {
    if (!editingTemplate.title.trim() || !editingTemplate.content.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir le titre et le contenu du template.",
        variant: "destructive"
      });
      return;
    }

    setTemplates(prev => ({
      ...prev,
      [editingTemplate.category]: prev[editingTemplate.category].map(t =>
        t.id === editingTemplate.id ? editingTemplate : t
      )
    }));

    saveTemplatesToStorage();
    setEditingTemplate(null);

    toast({
      title: "Template modifié",
      description: "Votre template a été mis à jour avec succès.",
    });
  };

  // Supprimer un template
  const handleDeleteTemplate = (templateId, category) => {
    const template = templates[category].find(t => t.id === templateId);
    if (template && !template.isDefault) {
      setTemplates(prev => ({
        ...prev,
        [category]: prev[category].filter(t => t.id !== templateId)
      }));

      saveTemplatesToStorage();

      toast({
        title: "Template supprimé",
        description: "Votre template a été supprimé avec succès.",
      });
    }
  };

  // Basculer le favori
  const handleToggleFavorite = (templateId, category) => {
    setTemplates(prev => ({
      ...prev,
      [category]: prev[category].map(t =>
        t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
      )
    }));

    saveTemplatesToStorage();
  };

  // Sauvegarder dans le localStorage
  const saveTemplatesToStorage = () => {
    try {
      localStorage.setItem('maximarket-message-templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Erreur sauvegarde templates:', error);
    }
  };

  // Charger depuis le localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('maximarket-message-templates');
      if (saved) {
        const savedTemplates = JSON.parse(saved);
        setTemplates(prev => ({ ...prev, ...savedTemplates }));
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  }, []);

  // Basculer l'expansion d'une catégorie
  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Sélectionner un template
  const handleSelectTemplate = (template) => {
    onSelectTemplate(template.content);
    setShowTemplates(false);
    
    toast({
      title: "Template sélectionné",
      description: "Le template a été ajouté à votre message.",
    });
  };

  // Obtenir l'icône de catégorie
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'inquiry': return <MessageSquare size={16} />;
      case 'appointment': return <Clock size={16} />;
      case 'negotiation': return <Star size={16} />;
      case 'general': return <User size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  // Obtenir le nom de catégorie
  const getCategoryName = (category) => {
    switch (category) {
      case 'inquiry': return 'Demandes';
      case 'appointment': return 'Rendez-vous';
      case 'negotiation': return 'Négociation';
      case 'general': return 'Général';
      default: return category;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton pour ouvrir les templates */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTemplates(!showTemplates)}
        className="flex items-center space-x-2"
      >
        <MessageSquare size={16} />
        <span>Templates</span>
        {showTemplates ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </Button>

      {/* Panneau des templates */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900">Templates de messages</h3>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="h-8 w-8 p-0"
                >
                  <Plus size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTemplates(false)}
                  className="h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Formulaire d'ajout */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 border-b border-gray-200 bg-blue-50"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie
                      </label>
                      <select
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="general">Général</option>
                        <option value="inquiry">Demandes</option>
                        <option value="appointment">Rendez-vous</option>
                        <option value="negotiation">Négociation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre
                      </label>
                      <Input
                        value={newTemplate.title}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Titre du template"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <Textarea
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Contenu du message"
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={handleAddTemplate}
                        className="flex-1"
                      >
                        <Save size={16} className="mr-1" />
                        Ajouter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Liste des templates */}
            <div className="overflow-y-auto max-h-64">
              {Object.entries(templates).map(([category, categoryTemplates]) => (
                <div key={category} className="border-b border-gray-100 last:border-b-0">
                  {/* En-tête de catégorie */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium text-gray-700">
                        {getCategoryName(category)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {categoryTemplates.length}
                      </span>
                    </div>
                    {expandedCategories.has(category) ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </button>

                  {/* Templates de la catégorie */}
                  <AnimatePresence>
                    {expandedCategories.has(category) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 pb-3 space-y-2"
                      >
                        {categoryTemplates
                          .sort((a, b) => (b.isFavorite ? 1 : -1))
                          .map((template) => (
                            <div
                              key={template.id}
                              className="group relative p-2 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                              onClick={() => handleSelectTemplate(template)}
                            >
                              {/* Actions sur hover */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                {!template.isDefault && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditTemplate(template.id, category);
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-blue-100"
                                    >
                                      <Edit3 size={12} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTemplate(template.id, category);
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                                    >
                                      <Trash2 size={12} />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(template.id, category);
                                  }}
                                  className={`h-6 w-6 p-0 ${
                                    template.isFavorite 
                                      ? 'text-yellow-600 hover:bg-yellow-100' 
                                      : 'text-gray-400 hover:bg-gray-100'
                                  }`}
                                >
                                  <Star size={12} className={template.isFavorite ? 'fill-current' : ''} />
                                </Button>
                              </div>

                              {/* Contenu du template */}
                              <div className="pr-16">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {template.title}
                                  </h4>
                                  {template.isDefault && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      Défaut
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {template.content}
                                </p>
                              </div>
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'édition */}
      <AnimatePresence>
        {editingTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Modifier le template
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <Input
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre du template"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenu du message"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1"
                  >
                    <Save size={16} className="mr-1" />
                    Sauvegarder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingTemplate(null)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageTemplates; 