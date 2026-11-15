import React from 'react';

const EmptyState = ({ icon = '📭', title, description }) => (
  <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-gray-300">
    <div className="text-5xl mb-3">{icon}</div>
    <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
    {description && <p className="text-gray-500 text-sm max-w-sm mx-auto">{description}</p>}
  </div>
);

export default EmptyState;
