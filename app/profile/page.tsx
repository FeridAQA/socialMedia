// app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PostGrid } from '@/components/profile/PostGrid';
import { PostModal } from '@/components/profile/PostModal';

import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { useUserPosts, UserPost } from '@/hooks/useUserPosts';

import { Spinner, Button } from '@nextui-org/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store'; // Doğru yolu qeyd edin
import { useRouter } from 'next/navigation';
import { clearToken } from '../store/authSlice';


export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user); // Cari autentifikasiya olunmuş istifadəçi məlumatı

  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // useUserProfile hook-u cari istifadəçinin profilini çəkir (userId ötürülmür)
  const { user, loading: userLoading, error: userError, refetch: refetchUser } = useUserProfile({
    enabled: isAuthenticated && !!userToken
  });

  // useUserPosts hook-u üçün currentUser?.id istifadə olunur
  // ÇOX VACİB: currentUser?.id-nin string olduğuna əmin olun, əgər numberdirsə .toString() istifadə edin
  const { posts, loading: postsLoading, error: postsError, refetch: refetchPosts, hasMore } = useUserPosts({
    userId: currentUser?.id?.toString() || '', // BURADA DÜZƏLİŞ: currentUser.id-ni ötürürük
    page: currentPage,
    limit: 10,
    enabled: isAuthenticated && !!userToken && !!currentUser?.id, // Yalnız ID varsa enabled olsun
    isPrivate: user?.isPrivate, // Cari userin profil məlumatı ilə isPrivate ötürülür
    followStatus: user?.followStatus // Cari userin profil məlumatı ilə followStatus ötürülür
  });

  useEffect(() => {
    if (!isAuthenticated && !userToken && !userLoading && !postsLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, userToken, userLoading, postsLoading, router]);

  // Səhifə dəyişəndə postları yeniləmək
  useEffect(() => {
    if (isAuthenticated && !!userToken && !!currentUser?.id) {
      refetchPosts(); // currentUser.id dəyişəndə postları yenidən çək
    }
  }, [currentPage, isAuthenticated, userToken, currentUser?.id, refetchPosts]);


  const handlePostClick = (post: UserPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !postsLoading && !postsError) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleFollowToggle = () => {
    console.log("Follow/Unfollow action. (Self profile, should not be callable)");
    // Bu funksiya öz profilinizdə çağrılmamalıdır.
    // Əgər ProfileHeader-də 'follow' düyməsi isCurrentUser true olanda gizlidirsə, bu hissəyə düşməyəcək.
  };

  const handleEditProfile = () => {
    console.log("Edit Profile action.");
    // Redaktə səhifəsinə yönləndirmə
    // router.push('/settings/profile');
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
        <p className="ml-2 text-default-500">Profil yüklənir...</p>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-danger-500 p-4">
        <p>{userError || "Profil məlumatları tapılmadı və ya yüklənərkən xəta baş verdi."}</p>
        <Button onClick={refetchUser} color="primary" variant="flat" className="mt-4">Yenidən cəhd et</Button>
      </div>
    );
  }

  const userWithPostsCount = {
    ...user,
    postsCount: posts.length, // Çəkilən postların sayını əlavə edirik
  };

  // Öz profilimizdə isCurrentUser həmişə true olacaq
  const isCurrentUser = true;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <ProfileHeader
        user={userWithPostsCount}
        isCurrentUser={isCurrentUser}
        onFollowToggle={handleFollowToggle}
        onEditProfile={handleEditProfile}
      />
      <div className="mt-8">
        {postsLoading && posts.length === 0 && !postsError ? (
          <div className="flex justify-center items-center h-48">
            <Spinner />
            <p className="ml-2 text-default-500">Postlar yüklənir...</p>
          </div>
        ) : postsError ? (
          <div className="text-center text-danger-500 p-4">
             {postsError === "This account is private. Follow to see their photos and videos." ? (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg text-white">
                    <span className="text-6xl mb-4">🔒</span>
                    <h3 className="text-2xl font-bold mb-2">This account is private</h3>
                    <p className="text-gray-400">Follow to see their photos and videos.</p>
                </div>
            ) : (
                <>
                    <p>{postsError}</p>
                    <Button onClick={refetchPosts} color="primary" variant="flat" className="mt-4">Yenidən cəhd et</Button>
                </>
            )}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-default-500 p-4">
            <p>Hələ heç bir post yoxdur.</p>
            {isCurrentUser && !postsLoading && ( // Yalnız öz profilimizdə post paylaş düyməsini göstər
              <Button onClick={() => router.push('/upload')} color="primary" variant="flat" className="mt-4">İlk postunu paylaş</Button>
            )}
          </div>
        ) : (
          <>
            <PostGrid posts={posts} onPostClick={handlePostClick} />
            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button onClick={handleLoadMore} isLoading={postsLoading} color="primary" variant="flat">
                  Daha çox yüklə
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <PostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        post={selectedPost}
        user={user}
      />
    </div>
  );
}