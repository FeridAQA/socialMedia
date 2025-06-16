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
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme"; // HeroUI-nin link stilləri
import NextLink from "next/link";
import clsx from "clsx"; // Sinifləri birləşdirmək üçün

import { siteConfig } from "@/config/site"; // siteConfig import
import { ThemeSwitch } from "@/components/theme-switch"; // ThemeSwitch import
import {
  LinkedInIcon, // Yeni LinkedIn ikonu
  GithubIcon,
  Logo,
  SearchIcon, // Search icon hələ də mobil menyuda istifadə olunur
} from "@/components/icons"; // Yeni ikonları import edin

import { useSelector, useDispatch } from 'react-redux'; // Redux Hook'ları
import { RootState } from '../app/store'; // RootState tipini import edin
import { clearToken } from '../app/store/authSlice'; // clearToken action'u
import { useRouter } from 'next/navigation'; // Yönləndirmə üçün

export const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(clearToken());
    router.push('/'); // Logout olduqdan sonra ana səhifəyə yönləndir
  };

  const searchInput = (
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
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* Navbar Brand and Main Nav Items */}
      <NavbarContent className="basis-1/5 lg:basis-full" justify="start"> {/* sm:basis-full -> lg:basis-full */}
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">My Social Media</p>
          </NextLink>
        </NavbarBrand>
        {/* Sadəcə Ana Səhifə linki - 1024px-dən böyük ekranlarda görünür */}
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
              href="/profile" // Profil səhifəsinə keçid
            >
              Profil
            </NextLink>
          </NavbarItem>
        </ul>
      </NavbarContent>

      {/* Social Icons, Theme Switch, Login/Logout Button (visible on 1024px and larger screens) */}
      <NavbarContent
        className="hidden lg:flex basis-1/5 lg:basis-full" // sm:flex -> lg:flex
        justify="end"
      >
        <NavbarItem className="flex gap-2"> {/* sm:flex -> flex (lg'də həmişə görünür) */}
          {/* LinkedIn Icon */}
          <Link isExternal aria-label="LinkedIn" href={siteConfig.links.linkedin}>
            <LinkedInIcon className="text-default-500" />
          </Link>
          {/* Github Icon */}
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          {/* Theme Switch */}
          <ThemeSwitch />
        </NavbarItem>
        {/* Login/Logout Button - 1024px-dən böyük ekranlarda görünür */}
        <NavbarItem className="flex"> {/* md:flex -> flex (lg'də həmişə görünür) */}
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
      <NavbarContent className="lg:hidden basis-1 pl-4" justify="end"> {/* sm:hidden -> lg:hidden */}
        {/* Github Icon (mobile) */}
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        {/* Theme Switch (mobile) */}
        <ThemeSwitch />
        {/* Hamburger Menu Toggle - 1024px-dən kiçik ekranlarda görünür */}
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile Menu (açılanda görünür) */}
      <NavbarMenu>
        {/* Axtarış inputu mobil menyuda */}
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {/* Mobil Menyu - Ana Səhifə */}
          <NavbarMenuItem>
            <Link
              color="foreground"
              href="/"
              size="lg"
            >
              Ana Səhifə
            </Link>
          </NavbarMenuItem>
          {/* Mobil Menyu - Login/Logout */}
          <NavbarMenuItem>
            {isAuthenticated ? (
              <Link
                onClick={handleLogout}
                color="danger" // Logout üçün fərqli rəng
                href="#"
                size="lg"
              >
                Logout
              </Link>
            ) : (
              <Link
                color="primary" // Login üçün rəng
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