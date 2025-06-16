// components/profile/ProfileHeader.tsx
'use client';

import React from 'react';
import { Avatar, Button } from '@nextui-org/react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import { UserProfile } from '@/hooks/useUserProfile'; // Buradan import edin

// UserProfile interfeysini dəqiqləşdirin
// Bu interfeys, `hooks/useUserProfile.ts` faylındakı UserProfile ilə eyni olmalıdır.
// Əgər həqiqətən `hooks/useUserProfile.ts` faylındakı tipi import edirsinizsə,
// bu interfeysin yenidən təyininə ehtiyac yoxdur. Sadəcə, mövcud tipə `postsCount` əlavə edin.
// `isFollowing` propu isə API-dan gəlmədiyi üçün burada opsional (?) və ya müvəqqəti əlavə edilə bilər.

// UserProfile tipini yenidən təyin etmirik, sadəcə import edirik və istifadə edirik.
// hooks/useUserProfile.ts faylındakı UserProfile interfeysini yeniləyin:
/*
export interface UserProfile {
  id: number;
  // ... digər sahələr
  bio: string | null;
  followerCount: number;
  followedCount: number;
  isPrivate: boolean;
  birthDate: string;
  gender: string;
  // ... digər sahələr
  profilePicture: string | null; // Avatar URL-i
  postsCount?: number; // Frontenddə əlavə etdiyimiz üçün opsional edək
  isFollowing?: boolean; // Opsional edək, yalnız başqa profillər üçün
}
*/

interface ProfileHeaderProps {
  user: UserProfile;
  isCurrentUser: boolean;
  onFollowToggle?: () => void;
  onEditProfile?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isCurrentUser,
  onFollowToggle,
  onEditProfile,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6 bg-content1 rounded-lg shadow-sm">
      <div className="flex-shrink-0">
        <Avatar
          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.userName}&background=random`}
          alt={`${user.userName}'s avatar`}
          className="w-32 h-32 text-large md:w-40 md:h-40"
          color="primary"
          radius="full"
        />
      </div>

      <div className="flex flex-col items-center md:items-start text-center md:text-left flex-grow">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <h2 className="text-3xl font-semibold text-foreground">{user.userName}</h2>
          {isCurrentUser ? (
            <Button
              variant="bordered"
              color="default"
              startContent={<PencilSquareIcon className="w-4 h-4" />}
              onClick={onEditProfile}
              className="mt-2 md:mt-0"
            >
              Profili Redaktə Et
            </Button>
          ) : (
            <Button
              // isFollowing propu UserProfile-da yoxdursa, default dəyər verin
              variant={user.isFollowing ? "bordered" : "solid"} // `isFollowing` mövcud deyil, əlavə olunmalıdır
              color={user.isFollowing ? "default" : "primary"}
              startContent={!user.isFollowing && <UserPlusIcon className="w-4 h-4" />}
              onClick={onFollowToggle}
              className="mt-2 md:mt-0"
            >
              {user.isFollowing ? 'İzlənilir' : 'İzlə'}
            </Button>
          )}
        </div>

        <p className="text-xl text-default-500 mt-2">{user.firstName} {user.lastName}</p>
        <p className="text-default-700 mt-2 max-w-lg">{user.bio || "Bio əlavə edilməyib."}</p>

        <div className="flex gap-8 mt-6">
          <div className="flex flex-col items-center">
            {/* postsCount-u UserProfile-a əlavə etsək, burada `user.postsCount` istifadə edə bilərik. */}
            {/* Və ya əgər page.tsx-də posts.length-dən gəlirsə, o zaman parentdən prop olaraq ötürün. */}
            <span className="font-bold text-xl">{user.postsCount ?? 0}</span> {/* Nullish coalescing operatoru */}
            <span className="text-default-500 text-sm">Post</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-xl">{user.followerCount}</span>
            <span className="text-default-500 text-sm">İzləyici</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-xl">{user.followedCount}</span>
            <span className="text-default-500 text-sm">İzlənilən</span>
          </div>
        </div>
      </div>
    </div>
  );
};