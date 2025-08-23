import React from 'react';
import AIDAProfile from '@/components/ui/AIDAProfile';

const AssistantAvatar = ({ size = 'default', className = '' }) => {
  return (
    <AIDAProfile 
      size={size} 
      showStatus={true}
      className={className}
    />
  );
};

export default AssistantAvatar;
