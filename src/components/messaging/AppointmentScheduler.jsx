import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  X, 
  Clock, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  Edit,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const AppointmentScheduler = ({ 
  onAppointmentCreate, 
  onClose, 
  isOpen = false,
  existingAppointments = [],
  availableSlots = [],
  timezone = 'Europe/Paris'
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  
  const { toast } = useToast();

  // Générer les dates disponibles
  const generateAvailableDates = useCallback(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push({
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('fr-FR', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          }),
          isToday: i === 0
        });
      }
    }
    return dates;
  }, []);

  // Créer le rendez-vous
  const createAppointment = useCallback(async () => {
    if (!selectedDate || !selectedTime || !title.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const appointment = {
        id: Date.now().toString(),
        date: selectedDate,
        time: selectedTime,
        duration,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        timezone,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onAppointmentCreate) {
        onAppointmentCreate(appointment);
      }
      
      toast({
        title: "Rendez-vous créé !",
        description: `Le rendez-vous "${title}" a été planifié avec succès.`,
        duration: 5000,
      });
      
      onClose();
      
    } catch (err) {
      setError('Erreur lors de la création du rendez-vous. Veuillez réessayer.');
    } finally {
      setIsCreating(false);
    }
  }, [selectedDate, selectedTime, duration, title, description, location, timezone, onAppointmentCreate, onClose, toast]);

  const handleClose = useCallback(() => {
    setSelectedDate('');
    setSelectedTime('');
    setDuration(60);
    setTitle('');
    setDescription('');
    setLocation('');
    setError(null);
    setStep(1);
    onClose();
  }, [onClose]);

  const availableDates = generateAvailableDates();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-card border border-border rounded-lg overflow-hidden max-w-4xl w-full mx-4 max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Planifier un rendez-vous
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Contenu principal */}
            <div className="p-4 space-y-4">
              <h4 className="font-medium">Sélectionnez une date et une heure</h4>
              
              {/* Sélection de date */}
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableDates.map((dateInfo) => (
                    <Button
                      key={dateInfo.date}
                      variant={selectedDate === dateInfo.date ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDate(dateInfo.date)}
                      className={`h-12 ${dateInfo.isToday ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">
                          {dateInfo.label.split(' ')[0]}
                        </div>
                        <div className="font-medium">
                          {dateInfo.label.split(' ')[1]}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sélection d'heure */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium mb-2">Heure</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="h-10"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Détails du rendez-vous */}
              {selectedDate && selectedTime && (
                <div className="space-y-4">
                  <h4 className="font-medium">Détails du rendez-vous</h4>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Titre *</label>
                    <Input
                      placeholder="Titre du rendez-vous"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      placeholder="Description du rendez-vous..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Lieu</label>
                    <Input
                      placeholder="Adresse ou lieu"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Erreurs */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive mb-2">Erreur</h4>
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer avec actions */}
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
              <div className="text-sm text-muted-foreground">
                Rendez-vous
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button
                  onClick={createAppointment}
                  disabled={isCreating || !selectedDate || !selectedTime || !title.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Créer le rendez-vous
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentScheduler;
