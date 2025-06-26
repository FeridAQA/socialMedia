// components/common/SafetyWarning.tsx
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export const SafetyWarning = () => {
  return (
    <div className="bg-yellow-500 dark:bg-yellow-700 text-white dark:text-gray-100 p-3 text-center font-medium flex items-center justify-center gap-2">
      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-800 dark:text-yellow-200" />
      <span className="text-[14px]  md:text-[20px]">
        Məxfi məlumatlarınızı daxil "etməməyiniz" tələb olunur.
      </span>
    </div>
  );
};
