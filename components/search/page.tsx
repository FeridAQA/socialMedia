// app/search/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@nextui-org/input"; // NextUI Input
import { Spinner, Avatar, Card, CardBody, Link as NextUILink } from '@nextui-org/react'; // NextUI komponentləri
import { SearchIcon } from "@/components/icons";
import { debounce } from 'lodash';
import api from '@/services/api'; // API servisi
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store'; // Doğru yolu qeyd edin

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
  } | null; // Backend cavabına uyğunlaşdırıldı
  followStatus: string; // Backend cavabına uyğunlaşdırıldı
}

export default function SearchPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userToken = useSelector((state: RootState) => state.auth.token);

  // Axtarış API çağırışını debounse edirik
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) { // 2 simvoldan qısa axtarış etmə
        setSearchResults([]);
        setSearchLoading(false);
        setSearchError(null);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);
      try {
        const response = await api.get<SearchUserResult[]>(`/user/search`, {
          params: { searchParam: term },
          // Headers `api` instance-da idarə olunursa buraya lazım deyil.
          // Əgər API instansiyası tokeni əlavə etmirsə:
          // headers: { 'Authorization': `Bearer ${userToken}` }
        });
        setSearchResults(response.data);
      } catch (err: any) {
        console.error('Failed to search users:', err);
        setSearchError(err.response?.data?.message || 'İstifadəçilər axtarılarkən xəta baş verdi.');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500), // 500ms gecikmə
    []
  );

  // searchTerm dəyişəndə debounced axtarışı çağır
  useEffect(() => {
    // Yalnız autentifikasiya olunmuş user-lər axtarış edə bilsin
    if (isAuthenticated && !!userToken) {
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("Axtarış üçün daxil olun.");
    }
    
    // Cleanup funksiyası: komponent unmount olanda debounce-ı ləğv edir
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch, isAuthenticated, userToken]);

  const handleUserClick = (userId: number) => {
    router.push(`/profile/${userId}`); // İstifadəçinin profil səhifəsinə yönləndir
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
        autoFocus // Səhifə yüklənəndə avtomatik fokuslanma
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
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((user) => (
              <Card 
                key={user.id} 
                isPressable 
                onPress={() => handleUserClick(user.id)} 
                className="bg-content1 hover:bg-content2 transition-colors"
              >
                <CardBody className="flex flex-row items-center gap-4 p-4">
                  <Avatar 
                    src={user.profilePicture?.url || `https://ui-avatars.com/api/?name=${user.userName}&background=random`} 
                    size="md" 
                    className="flex-shrink-0"
                  />
                  <div className="flex flex-col flex-grow">
                    <p className="font-semibold text-lg">{user.userName}</p>
                    {user.firstName && <p className="text-small text-default-500">{user.firstName} {user.lastName}</p>}
                    {/* Gizli profil indikatoru */}
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
                  {/* İstifadəçinin özü olub-olmadığını göstərmək üçün followStatus istifadə edə bilərsiniz, lakin axtarış nəticəsində bu lazım deyil */}
                  {/* `followStatus` burada istifadə edilmir, çünki axtarış yalnız istifadəçiləri tapır. */}
                </CardBody>
              </Card>
            ))}
          </div>
        ) : searchTerm.length >= 2 ? (
            <div className="text-center text-default-500 py-8">
                <p>Heç bir nəticə tapılmadı.</p>
            </div>
        ) : (
            <div className="text-center text-default-400 py-8">
                <p>Axtarışa başlamaq üçün ən azı 2 simvol daxil edin.</p>
            </div>
        )}
      </div>
    </div>
  );
}