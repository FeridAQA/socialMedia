// app/profile/[userId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PostGrid } from '@/components/profile/PostGrid';
import { PostModal } from '@/components/profile/PostModal';

import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { useUserPosts, UserPost } from '@/hooks/useUserPosts';

import { Spinner, Button } from '@nextui-org/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store'; // Doğru yolu qeyd edin
import { useRouter } from 'next/navigation';


export default function OtherUserProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const profileUserId = params.userId;

  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // useUserProfile hook-u URL-dəki `profileUserId`-dən istifadə etsin
  const { user, loading: userLoading, error: userError, refetch: refetchUser } = useUserProfile({
    userId: profileUserId,
    enabled: isAuthenticated && !!userToken && !!profileUserId
  });

  // useUserPosts hook-unu da URL-dəki `profileUserId`-dən istifadə etsin
  // GİZLİ PROFİL MƏNTİQİ ÜÇÜN isPrivate və followStatus ötürülür
  const { posts, loading: postsLoading, error: postsError, refetch: refetchPosts, hasMore } = useUserPosts({
    userId: profileUserId,
    page: currentPage,
    limit: 10,
    enabled: isAuthenticated && !!userToken && !!profileUserId,
    isPrivate: user?.isPrivate, // BURADA user obyektindən isPrivate ötürülür
    followStatus: user?.followStatus // BURADA user obyektindən followStatus ötürülür
  });

  useEffect(() => {
    if (!isAuthenticated && !userToken && !userLoading && !postsLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, userToken, userLoading, postsLoading, router]);

  // `profileUserId` dəyişdikdə post səhifəsini sıfırla və postları sıfırla
  useEffect(() => {
    setCurrentPage(0);
    // useUserPosts hook-u özü userId, isPrivate, followStatus dəyişəndə daxili post state-ini sıfırlayır.
    // Lakin, əmin olmaq üçün refetchPosts() da çağırıla bilər.
  }, [profileUserId]);


  const handlePostClick = (post: UserPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !postsLoading && !postsError) { // Xəta yoxdursa və daha çox varsa yüklə
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleFollowToggle = () => {
    console.log("Follow/Unfollow action for user:", user?.id);
    // Buraya API çağırışı gələcək (izləmə/izləmədən çıxma)
    // Məsələn: dispatch(followUser(user.id));
    // Sonra refetchUser() ilə profili yeniləyin ki, `followStatus` dəyişikliyi görünsün.
    // Həmçinin, refetchPosts() da çağırıla bilər ki, postlar yenidən yüklənsin (əgər gizlidirsə açılsa).
  };

  const handleEditProfile = () => {
    console.log("Edit Profile action.");
    // Digər istifadəçinin profilində redaktə düyməsi olmaz
  };

  if (userLoading) { // postsLoading-i buradan çıxardım, çünki useUserPosts öz daxilində gizli profil üçün loading-i tez bitirə bilər.
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
    postsCount: posts.length, // Çəkilən postların sayını əlavə edirik (bu `posts` artıq düzgün gələn postlardır)
  };

  const isCurrentUser = !!currentUser && user.id === currentUser.id;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <ProfileHeader
        user={userWithPostsCount}
        isCurrentUser={isCurrentUser}
        onFollowToggle={handleFollowToggle}
        onEditProfile={handleEditProfile}
      />
      <div className="mt-8">
        {postsLoading && posts.length === 0 && !postsError ? ( // postsError yoxdursa loading spinner göstər
          <div className="flex justify-center items-center h-48">
            <Spinner />
            <p className="ml-2 text-default-500">Postlar yüklənir...</p>
          </div>
        ) : postsError ? (
          <div className="text-center text-danger-500 p-4">
            {/* Şəkildəki stilə uyğun olaraq mesajı göstər */}
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
            {/* Digər istifadəçinin profilində post paylaş düyməsi olmaz */}
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