// components/navbar.tsx
'use client';

import React from "react";
import {
  Navbar as HeroUINavbar, // HeroUI Navbar
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar"; // @heroui/navbar-dan @nextui-org/navbar-a dəyişdirildi.
// NOTE: Sizin `heroui` paketləriniz NextUI kimi görünür. Əgər `heroui` əslində NextUI-dırsa, importları `nextui-org/react` və ya `nextui-org/navbar` kimi düzəldin.
// Hazırki kodunuzda `nextui-org/navbar` kimi dəyişdim, çünki bu tipik NextUI istifadəsinə uyğundur.
import { Button } from "@nextui-org/button"; // @heroui/button-dan @nextui-org/button-a dəyişdirildi
import { Kbd } from "@nextui-org/react"; // @heroui/kbd-dan @nextui-org/react-a dəyişdirildi (Kbd adətən NextUI-dən gəlir)
import { Link } from "@nextui-org/link"; // @heroui/link-dan @nextui-org/link-ə dəyişdirildi
import { Input } from "@nextui-org/input"; // @heroui/input-dan @nextui-org/input-a dəyişdirildi
import { link as linkStyles } from "@nextui-org/theme"; // @heroui/theme-dən @nextui-org/theme-ə dəyişdirildi
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  LinkedInIcon,
  GithubIcon,
  Logo,
  SearchIcon, // SearchIcon importunu geri qaytarın
} from "@/components/icons";

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store'; // Yolunuzu dəqiqləşdirin
import { clearToken } from '../app/store/authSlice';
import { useRouter } from 'next/navigation';

// import { SearchComponent } from '@/components/search/SearchComponent'; // Bunu silirik
import { SafetyWarning } from "./common/SafetyWarning";

export const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(clearToken());
    router.push('/');
  };

  return (
    <>
      {/* <SafetyWarning /> */}

      <HeroUINavbar maxWidth="xl" position="sticky">
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

        <NavbarContent
          className="hidden lg:flex basis-1/5 lg:basis-full"
          justify="end"
        >
          {/* Search Icon-u buraya əlavə edirik */}
          <NavbarItem className="flex">
            <NextLink href="/search" passHref> {/* /search səhifəsinə yönləndirir */}
              <Link color="foreground" aria-label="Axtarış"> {/* Link komponentini istifadə edirik */}
                <SearchIcon className="text-default-500" />
              </Link>
            </NextLink>
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
          {/* Mobil menyuda da SearchIcon */}
          <NextLink href="/search" passHref>
              <Link color="foreground" aria-label="Axtarış">
                <SearchIcon className="text-default-500" />
              </Link>
            </NextLink>
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
          <NavbarMenuToggle />
        </NavbarContent>

        {/* Mobile Menu (açılanda görünür) */}
        <NavbarMenu>
          {/* Mobil menyudakı searchInput-u silirik, çünki artıq ayrıca səhifəyə yönləndirəcəyik */}
          {/* <div className="mx-4 mt-2">
            <SearchComponent />
          </div> */}
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
                href="/profile"
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
    </>
  );
};