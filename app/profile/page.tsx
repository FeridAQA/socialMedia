// app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PostGrid } from '@/components/profile/PostGrid';
import { PostModal } from '@/components/profile/PostModal';

// useUserProfile və UserProfile tipini ayrı fayldan import edin
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
// useUserPosts və UserPost tipini ayrı fayldan import edin
import { useUserPosts, UserPost } from '@/hooks/useUserPosts';

import { Spinner, Button } from '@nextui-org/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { useRouter } from 'next/navigation';
import { clearToken } from '../store/authSlice';


export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);

  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const { user, loading: userLoading, error: userError, refetch: refetchUser } = useUserProfile({
    enabled: isAuthenticated && !!userToken
  });

  const { posts, loading: postsLoading, error: postsError, refetch: refetchPosts, hasMore } = useUserPosts({
    page: currentPage,
    limit: 10,
    enabled: isAuthenticated && !!userToken
  });

  useEffect(() => {
    if (!isAuthenticated && !userToken && !userLoading && !postsLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, userToken, userLoading, postsLoading, router]);


  const handlePostClick = (post: UserPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  const handleLoadMore = () => {
    console.log("Load more posts...");
  };

  const handleFollowToggle = () => {
    console.log("Follow/Unfollow action.");
  };

  const handleEditProfile = () => {
    console.log("Edit Profile action.");
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

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <ProfileHeader
        user={userWithPostsCount}
        isCurrentUser={true}
        onFollowToggle={handleFollowToggle}
        onEditProfile={handleEditProfile}
      />
      <div className="mt-8">
        {postsLoading && posts.length === 0 ? (
          <div className="flex justify-center items-center h-48">
            <Spinner />
            <p className="ml-2 text-default-500">Postlar yüklənir...</p>
          </div>
        ) : postsError ? (
          <div className="text-center text-danger-500 p-4">
            <p>{postsError}</p>
            <Button onClick={refetchPosts} color="primary" variant="flat" className="mt-4">Yenidən cəhd et</Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-default-500 p-4">
            <p>Hələ heç bir post yoxdur.</p>
            {isAuthenticated && !postsLoading && (
                <Button onClick={() => router.push('/upload')} color="primary" variant="flat" className="mt-4">İlk postunu paylaş</Button>
            )}
          </div>
        ) : (
          <>
            <PostGrid posts={posts} onPostClick={handlePostClick} />
            {/* Səhifələmə və ya Infinite Scroll üçün bura düymə əlavə edə bilərsiniz */}
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