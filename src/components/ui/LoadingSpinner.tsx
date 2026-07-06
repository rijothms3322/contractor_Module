import React from 'react';

/** Simple loading spinner used in async UI components */
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);
