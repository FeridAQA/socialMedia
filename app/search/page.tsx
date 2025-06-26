// app/search/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@nextui-org/input";
import { Spinner, Avatar, Card, CardBody, Link as NextUILink } from '@nextui-org/react';
import { SearchIcon } from "@/components/icons";
import { debounce } from 'lodash';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export interface SearchUserResult {
  id: number;
  firstName: string | null;
  lastName: string | null;
  userName: string;
  isPrivate: boolean;
  profilePicture: {
    id: number;
    updatedAt: string;
    createdAt: string;
    filename: string;
    url: string;
  } | null;
  followStatus: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!isAuthenticated || !userToken) {
        setSearchResults([]);
        setSearchLoading(false);
        setSearchError("Axtarış üçün daxil olun.");
        return;
      }

      setSearchLoading(true);
      setSearchError(null);
      try {
        const response = await api.get<SearchUserResult[]>(`/user/search`, {
          params: { searchParam: term },
        });
        setSearchResults(response.data);
      } catch (err: any) {
        console.error('Failed to search users:', err);
        setSearchError(err.response?.data?.message || 'İstifadəçilər axtarılarkən xəta baş verdi.');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [isAuthenticated, userToken]
  );

  useEffect(() => {
    if (searchTerm.length === 0) {
        setSearchResults([]);
        setSearchLoading(false);
        setSearchError(null);
        return;
    }

    debouncedSearch(searchTerm);
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handleUserClick = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-[calc(100vh-100px)]">
      <h1 className="text-3xl font-bold mb-6 text-center">İstifadəçi Axtarışı</h1>
      <Input
        aria-label="Search users"
        classNames={{
          inputWrapper: "bg-default-100",
          input: "text-lg",
        }}
        placeholder="İstifadəçi adı ilə axtar..."
        startContent={
          <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        autoFocus
      />

      <div className="mt-6">
        {searchLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="lg" /> <p className="ml-2 text-default-500">Axtarılır...</p>
          </div>
        ) : searchError ? (
          <div className="text-center text-danger-500 py-8">
            <p>{searchError}</p>
          </div>
        ) : searchTerm.length === 0 ? (
            <div className="text-center text-default-400 py-8">
                <p>İstifadəçi axtarmaq üçün daxil edin.</p>
            </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((user) => (
              <Card
                key={user.id}
                isPressable
                onPress={() => handleUserClick(user.id)}
                className="bg-content1 hover:bg-content2 transition-colors w-full" // BURADA DƏYİŞİKLİK
              >
                <CardBody className="flex flex-row items-center gap-4 p-4 "> {/* Min-h-ni hələlik saxlayıram, çünki bu, hündürlüyün də sabit qalmasına kömək edir */}
                  <Avatar
                    src={user.profilePicture?.url || `https://ui-avatars.com/api/?name=${user.userName}&background=random`}
                    size="md"
                    className="flex-shrink-0"
                  />
                  <div className="flex flex-col flex-grow  justify-center">
                    <p className="font-semibold text-lg truncate">{user.userName}</p>
                    {user.firstName && <p className="text-small text-default-500 truncate">{user.firstName} {user.lastName}</p>}
                    {user.isPrivate && (
                        <span className="text-xs text-default-400 flex items-center gap-1 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Gizli Profil
                        </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
            <div className="text-center text-default-500 py-8">
                <p>Heç bir nəticə tapılmadı.</p>
            </div>
        )}
      </div>
    </div>
  );
}