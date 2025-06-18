// components/common/WelcomeMessage.tsx
import React from 'react';
import { Image } from '@nextui-org/react';
import { LockClosedIcon } from '@heroicons/react/24/outline'; // Şifrələmə iconu üçün

export const WelcomeMessage: React.FC = () => {
  return (
    // Valideyn elementinden h-full ve flex-col ile gelmelidir
    <div className="flex flex-col items-center justify-center w-full h-full text-center p-8 bg-content1 dark:bg-gray-800">
      <Image
        src="/path/to/whatsapp-like-logo.svg" // Kendi logonuzu buraya yerleştirin
        alt="Welcome"
        width={150} // En
        height={150} // Hündürlük
        className="mb-6 opacity-70"
      />
      <h2 className="text-3xl font-semibold text-foreground dark:text-white mb-4">
        Sohbətlərə Xoş Gəlmisiniz!
      </h2>
      <p className="text-lg text-default-600 dark:text-default-400 max-w-md">
        Burada dostlarınızla və ailənizlə rahatlıqla əlaqə qura, şəkillər, videolar paylaşa bilərsiniz. Başlamaq üçün bir çata klikləyin və ya yeni bir çat yaradın!
      </p>
      <div className="mt-4 flex items-center text-sm text-default-500 dark:text-default-500">
        <LockClosedIcon className="h-4 w-4 mr-1" /> {/* Şifrələmə iconu */}
        <span>Mesajlarınız End-to-End şifrələnib.</span>
      </div>
    </div>
  );
};