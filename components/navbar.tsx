'use client';

import React from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button"; // Button komponenti əlavə edildi
import { Kbd } from "@nextui-org/react";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  LinkedInIcon,
  GithubIcon,
  Logo,
  SearchIcon,
} from "@/components/icons";

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { clearToken } from '../app/store/authSlice';
import { useRouter } from 'next/navigation';

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
          {/* Search Icon-u (Desktop) - Button ilə */}
          <NavbarItem className="flex">
            <Button
              isIconOnly
              aria-label="Axtarış"
              variant="light" // Yalnız ikon olduğundan, arxa planı şəffaf olsun
              onClick={() => router.push('/search')}
            >
              <SearchIcon className="text-default-500" />
            </Button>
          </NavbarItem>

          <NavbarItem className="flex gap-2">
            {/* LinkedIn ikonu - Desktop */}
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
          {/* **DƏYİŞİKLİK BURADA:** Mobil görünüşdə SearchIcon - Button ilə */}
          <Button
            isIconOnly
            aria-label="Axtarış"
            variant="light"
            onClick={() => router.push('/search')}
          >
            <SearchIcon className="text-default-500" />
          </Button>
          {/* Mobil görünüşdə LinkedIn ikonu */}
          {/* <Link isExternal aria-label="LinkedIn" href={siteConfig.links.linkedin}>
            <LinkedInIcon className="text-default-500" />
          </Link> */}
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
          <NavbarMenuToggle />
        </NavbarContent>

        {/* Mobile Menu (açılanda görünür) */}
        <NavbarMenu>
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
            {/* Mobil menyuda LinkedIn linki */}
            <NavbarMenuItem>
              <Link
                isExternal
                aria-label="LinkedIn"
                href={siteConfig.links.linkedin}
                size="lg"
                color="foreground"
              >
                LinkedIn
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