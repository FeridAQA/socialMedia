// components/profile/PostGrid.tsx
'use client';

import React from 'react';
import { Card, CardBody, Image } from '@nextui-org/react';
// UserPost tipini yeni yerindən import edin
import { UserPost } from '@/hooks/useUserPosts';
import { HeartIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';

interface PostGridProps {
  posts: UserPost[];
  onPostClick?: (post: UserPost) => void;
}

export const PostGrid: React.FC<PostGridProps> = ({ posts, onPostClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {posts.map((post) => (
        <Card
          shadow="sm"
          key={post.id}
          isPressable
          onPress={() => onPostClick && onPostClick(post)}
          className="relative group overflow-hidden"
        >
          <CardBody className="overflow-visible p-0">
            <Image
              shadow="sm"
              radius="lg"
              width="100%"
              alt={post.description || "Post image"}
              className="w-full object-cover h-[300px] sm:h-[250px] md:h-[200px] transition-transform duration-300 group-hover:scale-105"
              src={post.images.length > 0 ? post.images[0].url : '/path/to/default-image.jpg'}
            />
          </CardBody>
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-4 text-white">
              <span className="flex items-center gap-1 font-bold text-lg">
                <HeartIcon className="w-6 h-6" /> {post.likes.length}
              </span>
              <span className="flex items-center gap-1 font-bold text-lg">
                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" /> {0}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};