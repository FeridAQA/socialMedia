// components/search/SearchComponent.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@heroui/input"; // HeroUI Input
import { Kbd } from "@heroui/kbd";
// Avatar, Spinner NextUI-dən gəlir.
// Dropdown, DropdownTrigger, DropdownMenu, DropdownItem NextUI-dən gəlir.
// Link NextUI-dən gəlir (sizin HeroUI-Link ilə qarışmasın deyə)
import { Avatar, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { SearchIcon } from "@/components/icons"; // Sizin custom SearchIconunuz
import { debounce } from 'lodash';
import api from '@/services/api'; // API servisi
import { useRouter } from 'next/navigation';

export interface SearchUserResult {
  id: number;
  firstName: string | null;
  lastName: string | null;
  userName: string;
  isPrivate: boolean;
  profilePicture: string | null;
  followStatus: string;
}

export const SearchComponent: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        setIsSearchDropdownOpen(false); // Axtarış termi qısa olduqda dropdownı bağla
        return;
      }

      setSearchLoading(true);
      setSearchError(null);
      setIsSearchDropdownOpen(true); // Axtarış başlayanda dropdownı aç
      try {
        const response = await api.get<SearchUserResult[]>(`/user/search`, {
          params: { searchParam: term },
        });
        setSearchResults(response.data);
      } catch (err) {
        console.error('Failed to search users:', err);
        setSearchError('İstifadəçilər axtarılarkən xəta baş verdi.');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    // Cleanup: komponent unmount olanda və ya searchTerm dəyişəndə debounce-ı ləğv et
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handleSearchItemClick = (userId: number, username: string) => {
    console.log(`Navigating to chat with user: ${username} (ID: ${userId})`);
    setIsSearchDropdownOpen(false);
    setSearchTerm('');
    router.push(`/chat?userId=${userId}`);
  };

  return (
    // Dropdown-ı Input-un valideyn elementi kimi əhatə edin
    // Bu, DropdownTrigger-in Input-a birbaşa bağlanmasına imkan verir.
    <Dropdown
      isOpen={isSearchDropdownOpen}
      onOpenChange={setIsSearchDropdownOpen}
      placement="bottom-start" // Nəticələrin Input-un sol alt küncündən başlamasını təmin edir
      backdrop="transparent" // Fonu şəffaf edə bilərsiniz
      className="p-0 border-none shadow-lg" // Özəl stil əlavə edin
    >
      <DropdownTrigger>
        {/* Input komponenti DropdownTrigger rolunu oynayır */}
        <Input
          aria-label="Search"
          classNames={{
            inputWrapper: "bg-default-100",
            input: "text-sm",
          }}
          endContent={
            <Kbd className="hidden lg:inline-block" keys={["command"]}>
              K
            </Kbd>
          }
          labelPlacement="outside"
          placeholder="Axtarış..."
          startContent={
            <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
          }
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // Input fokuslananda və ya dəyəri dəyişəndə dropdownın vəziyyətini idarə et
          onFocus={() => {
            if (searchTerm.length >= 2 || searchResults.length > 0) {
              setIsSearchDropdownOpen(true);
            }
          }}
          // onBlur-u birbaşa Dropdown-ın onOpenChange-i idarə edir,
          // lakin DropdownMenu daxilində klikləmələri işlətmək üçün kiçik bir gecikmə saxlamaq olar
          // Hazırda NextUI Dropdown'ı input fokusdan çıxanda özü idarə edir.
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Axtarış nəticələri"
        // DropdownMenu-nun genişliyini Input-un genişliyinə uyğun tənzimləyin
        // Burada NextUI DropdownMenu öz-özünə triggerin genişliyinə uyğunlaşmalıdır.
        // Lakin əgər ehtiyac olarsa: style={{ minWidth: 'var(--nextui-input-width)' }} kimi bir şey istifadə etmək olar.
        className="max-h-60 overflow-y-auto w-full min-w-[200px] sm:min-w-[250px]"
        onAction={(key) => {
          const selectedUser = searchResults.find(user => user.id.toString() === key);
          if (selectedUser) {
            handleSearchItemClick(selectedUser.id, selectedUser.userName);
          }
        }}
      >
        {searchLoading ? (
          <DropdownItem key="loading" textValue="Axtarılır...">
            <div className="flex items-center justify-center py-2">
              <Spinner size="sm" /> <span className="ml-2">Axtarılır...</span>
            </div>
          </DropdownItem>
        ) : searchError ? (
          <DropdownItem key="error" textValue="Xəta">
            <p className="text-danger text-center py-2">{searchError}</p>
          </DropdownItem>
        ) : searchResults.length > 0 ? (
          searchResults.map((user) => (
            <DropdownItem
              key={user.id.toString()}
              textValue={user.userName}
              startContent={<Avatar src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.userName}&background=random`} size="sm" />}
            >
              {user.userName}
              {user.firstName && ` (${user.firstName} ${user.lastName || ''})`}
            </DropdownItem>
          ))
        ) : (
          <DropdownItem key="no-results" textValue="Nəticə tapılmadı">
            Heç bir nəticə tapılmadı.
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};