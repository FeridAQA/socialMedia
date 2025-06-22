// components/common/SafetyWarning.tsx
import React from 'react';
import { ExclamationTriangleIcon  } from '@heroicons/react/24/solid'; // Veya NextUI'den bir icon

export const SafetyWarning: React.FC = () => {
  return (
    <div className="bg-yellow-500 dark:bg-yellow-700 text-white dark:text-gray-100 p-3 text-center text-sm font-medium flex items-center justify-center gap-2">
      <ExclamationTriangleIcon  className="h-5 w-5 text-yellow-800 dark:text-yellow-200" />
      <span>
        Təhlükəsizlik tədbirlərinə görə saytda məxfi məlumatlarınızı daxil "etməməyiniz" tələb olunur.
      </span>
    </div>
  );
};