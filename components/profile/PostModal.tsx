// components/profile/PostModal.tsx
'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Image, Avatar } from '@nextui-org/react';
import { UserPost, UserProfile } from '@/hooks/useUserProfile'; // Buradan import edin
import { HeartIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: UserPost | null;
  user: UserProfile; // Postun sahibinin məlumatları (bu halda cari user)
}

// React.C yerinə React.FC istifadə edin və prop tipini göstərin
export const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, post, user }) => {
  if (!post) return null;

  return (
    <Modal
      size="3xl"
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      placement="center"
    >
      <ModalContent>
        {/* onClick handler üçün onClose funksiyasını birbaşa istifadə edə bilərsiniz */}
        {/* {(onClose) => ( ... ) } - Bu NextUI Modal-ın render prop funksiyasıdır, lakin sizin use case-inizdə birbaşa onClose-u prop-lardan istifadə etmək daha yaxşıdır.
            Əgər ModalContent daxilində "close" düyməsi yaratmaq istəyirsinizsə, o zaman render prop olaraq `onClose` ala bilərsiniz.
            Mən propdan gələn `onClose` istifadə etməyi məsləhət görürəm. */}
          <div className="flex flex-col md:flex-row h-[80vh]">
            <div className="flex-1 flex items-center justify-center p-2 bg-black-alpha-900 rounded-l-lg md:rounded-l-none">
              <Image
                src={post.imageUrl}
                alt={post.caption}
                className="max-h-full max-w-full object-contain rounded-md"
              />
            </div>

            <div className="w-full md:w-80 flex flex-col p-4 bg-content1 rounded-r-lg shadow-lg">
              <ModalHeader className="flex flex-col gap-1 border-b pb-2">
                <div className="flex items-center gap-2">
                  <Avatar src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.userName}&background=random`} size="sm" />
                  <span className="font-bold text-lg">{user.userName}</span>
                </div>
              </ModalHeader>
              <ModalBody className="flex-grow overflow-y-auto">
                <p className="text-sm">
                  <span className="font-bold">{user.userName}</span> {post.caption}
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <span className="flex items-center gap-1">
                    <HeartIcon className="w-5 h-5 text-red-500" /> {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-blue-500" /> {post.commentsCount}
                  </span>
                </div>

                <div className="mt-4 text-default-500 text-sm">
                  <p>Şərhlər burada olacaq...</p>
                </div>
              </ModalBody>
              <ModalFooter className="border-t pt-2">
                <Button color="danger" variant="light" onPress={onClose}> {/* Buradakı onPress də `onClose` istifadə edir */}
                  Bağla
                </Button>
              </ModalFooter>
            </div>
          </div>
      </ModalContent>
    </Modal>
  );
};