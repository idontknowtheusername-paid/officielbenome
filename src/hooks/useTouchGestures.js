import { useState, useCallback, useRef } from 'react';

export const useTouchGestures = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onDoubleTap,
    minSwipeDistance = 50,
    minPinchDistance = 10,
    doubleTapDelay = 300
  } = options;

  const [touchState, setTouchState] = useState({
    startX: 0,
    startY: 0,
    startDistance: 0,
    startTime: 0,
    isPinching: false,
    isDoubleTap: false
  });

  const touchTimeoutRef = useRef(null);
  const doubleTapTimeoutRef = useRef(null);
  const lastTapTimeRef = useRef(0);

  // Calculer la distance entre deux points tactiles
  const getDistance = useCallback((touch1, touch2) => {
    return Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
  }, []);

  // Calculer l'angle de rotation
  const getAngle = useCallback((touch1, touch2) => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
  }, []);

  // Gérer le début du toucher
  const handleTouchStart = useCallback((e) => {
    const now = Date.now();
    const touches = Array.from(e.touches);

    if (touches.length === 2) {
      // Gesture à deux doigts (pinch/rotation)
      const distance = getDistance(touches[0], touches[1]);
      const angle = getAngle(touches[0], touches[1]);

      setTouchState(prev => ({
        ...prev,
        startDistance: distance,
        startAngle: angle,
        isPinching: true,
        startTime: now
      }));
    } else if (touches.length === 1) {
      // Gesture à un doigt
      const touch = touches[0];
      
      // Vérifier le double tap
      const timeSinceLastTap = now - lastTapTimeRef.current;
      if (timeSinceLastTap < doubleTapDelay) {
        setTouchState(prev => ({ ...prev, isDoubleTap: true }));
        onDoubleTap?.(touch);
        
        // Réinitialiser après le double tap
        setTimeout(() => {
          setTouchState(prev => ({ ...prev, isDoubleTap: false }));
        }, 100);
        return;
      }

      lastTapTimeRef.current = now;
      setTouchState(prev => ({
        ...prev,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: now,
        isPinching: false
      }));
    }
  }, [getDistance, getAngle, onDoubleTap, doubleTapDelay]);

  // Gérer le mouvement du toucher
  const handleTouchMove = useCallback((e) => {
    e.preventDefault(); // Empêcher le scroll pendant les gestes

    const touches = Array.from(e.touches);

    if (touchState.isPinching && touches.length === 2) {
      // Gesture de pinch/rotation en cours
      const currentDistance = getDistance(touches[0], touches[1]);
      const currentAngle = getAngle(touches[0], touches[1]);
      
      const distanceDelta = currentDistance - touchState.startDistance;
      const angleDelta = currentAngle - touchState.startAngle;

      if (Math.abs(distanceDelta) > minPinchDistance) {
        const scale = currentDistance / touchState.startDistance;
        onPinch?.({
          scale,
          distanceDelta,
          angleDelta,
          center: {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
          }
        });
      }
    }
  }, [touchState, getDistance, getAngle, minPinchDistance, onPinch]);

  // Gérer la fin du toucher
  const handleTouchEnd = useCallback((e) => {
    const touches = Array.from(e.changedTouches);
    
    if (touchState.isPinching) {
      // Fin du gesture de pinch
      setTouchState(prev => ({ ...prev, isPinching: false }));
      return;
    }

    if (touches.length === 1 && !touchState.isDoubleTap) {
      const touch = touches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      const deltaTime = Date.now() - touchState.startTime;
      
      // Vérifier la distance minimale et la vitesse
      const distance = Math.hypot(deltaX, deltaY);
      const velocity = distance / deltaTime;

      if (distance > minSwipeDistance && velocity > 0.3) {
        // Déterminer la direction du swipe
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        
        if (isHorizontal) {
          if (deltaX > 0) {
            onSwipeRight?.({ deltaX, deltaY, velocity, distance });
          } else {
            onSwipeLeft?.({ deltaX, deltaY, velocity, distance });
          }
        } else {
          if (deltaY > 0) {
            onSwipeDown?.({ deltaX, deltaY, velocity, distance });
          } else {
            onSwipeUp?.({ deltaX, deltaY, velocity, distance });
          }
        }
      }
    }

    // Réinitialiser l'état
    setTouchState(prev => ({
      ...prev,
      startX: 0,
      startY: 0,
      startDistance: 0,
      startTime: 0,
      isPinching: false
    }));
  }, [touchState, minSwipeDistance, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Gérer l'annulation du toucher
  const handleTouchCancel = useCallback(() => {
    setTouchState(prev => ({
      ...prev,
      startX: 0,
      startY: 0,
      startDistance: 0,
      startTime: 0,
      isPinching: false,
      isDoubleTap: false
    }));
  }, []);

  // Nettoyer les timeouts lors du démontage
  const cleanup = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    if (doubleTapTimeoutRef.current) {
      clearTimeout(doubleTapTimeoutRef.current);
    }
  }, []);

  // Retourner les gestionnaires d'événements
  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel
  };

  return {
    touchHandlers,
    touchState,
    cleanup
  };
};

// Hook spécialisé pour la galerie d'images
export const useGalleryTouchGestures = (onNext, onPrevious, onZoom) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZooming, setIsZooming] = useState(false);

  const handlePinch = useCallback(({ scale }) => {
    const newZoomLevel = Math.max(0.5, Math.min(3, scale));
    setZoomLevel(newZoomLevel);
    setIsZooming(true);
    onZoom?.(newZoomLevel);
  }, [onZoom]);

  const handleSwipeLeft = useCallback(() => {
    if (zoomLevel <= 1) {
      onNext?.();
    }
  }, [onNext, zoomLevel]);

  const handleSwipeRight = useCallback(() => {
    if (zoomLevel <= 1) {
      onPrevious?.();
    }
  }, [onPrevious, zoomLevel]);

  const { touchHandlers } = useTouchGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onPinch: handlePinch,
    minSwipeDistance: 30
  });

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setIsZooming(false);
    onZoom?.(1);
  }, [onZoom]);

  return {
    touchHandlers,
    zoomLevel,
    isZooming,
    resetZoom
  };
}; 