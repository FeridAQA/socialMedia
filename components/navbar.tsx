// components/navbar.tsx
'use client'; // Client komponenti olmalıdır

import React from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd"; // Kbd HeroUI-den
import { Link } from "@heroui/link"; // Link HeroUI-den
import { Input } from "@heroui/input"; // Input HeroUI-den
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  LinkedInIcon,
  GithubIcon,
  Logo,
  // SearchIcon, // SearchIcon artıq SearchComponent içindədir, burdan silirik
} from "@/components/icons";

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { clearToken } from '../app/store/authSlice';
import { useRouter } from 'next/navigation';

import { SearchComponent } from '@/components/search/SearchComponent'; // Yeni yaradılan SearchComponenti import edin

export const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(clearToken());
    router.push('/');
  };

  // searchInput sabitini artıq burda ehtiyac yoxdur, SearchComponent istifadə edəcəyik.
  // const searchInput = ( /* ... */ );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* Navbar Brand and Main Nav Items */}
      <NavbarContent className="basis-1/5 lg:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">My Social Media</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          <NavbarItem>
            <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium",
              )}
              color="foreground"
              href="/"
            >
              Ana Səhifə
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium",
              )}
              color="foreground"
              href="/profile"
            >
              Profil
            </NextLink>
          </NavbarItem>
        </ul>
      </NavbarContent>

      {/* Social Icons, Theme Switch, Login/Logout Button (desktop) */}
      <NavbarContent
        className="hidden lg:flex basis-1/5 lg:basis-full"
        justify="end"
      >
        {/* Axtarış komponentini bura əlavə edirik */}
        <NavbarItem className="flex"> {/* Desktopda həmişə görünsün */}
          <SearchComponent />
        </NavbarItem>

        <NavbarItem className="flex gap-2">
          <Link isExternal aria-label="LinkedIn" href={siteConfig.links.linkedin}>
            <LinkedInIcon className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="flex">
          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              className="text-sm font-normal text-default-600 bg-default-100"
              variant="flat"
            >
              Logout
            </Button>
          ) : (
            <NextLink href="/login">
              <Button
                className="text-sm font-normal text-default-600 bg-default-100"
                variant="flat"
              >
                Login
              </Button>
            </NextLink>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu Toggle and Social Icons (visible on screens smaller than 1024px) */}
      <NavbarContent className="lg:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile Menu (açılanda görünür) */}
      <NavbarMenu>
        {/* Mobil menyudakı searchInput-u da SearchComponent ilə əvəz edirik */}
        <div className="mx-4 mt-2">
          <SearchComponent />
        </div>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <NavbarMenuItem>
            <Link
              color="foreground"
              href="/"
              size="lg"
            >
              Ana Səhifə
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              color="foreground"
              href="/profile" // Profil linki mobil menyuda
              size="lg"
            >
              Profil
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            {isAuthenticated ? (
              <Link
                onClick={handleLogout}
                color="danger"
                href="#"
                size="lg"
              >
                Logout
              </Link>
            ) : (
              <Link
                color="primary"
                href="/login"
                size="lg"
              >
                Login
              </Link>
            )}
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};