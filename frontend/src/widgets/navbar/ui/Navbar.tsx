"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  Music,
  Ticket,
  Settings,
  LayoutDashboard,
  Moon,
  Sun,
} from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Separator,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui";
import { useAuthStore } from "@/features/auth";
import { ROUTES, APP_NAME } from "@/shared/config";
import { cn } from "@/shared/lib";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const authState = useAuthStore();
  
  // Prevent hydration mismatch by only using client state after mount
  const isAuthenticated = mounted ? !!authState.user && !!authState.token : false;
  const isAdmin = mounted ? authState.user?.role === "admin" : false;
  const user = mounted ? authState.user : null;
  const logout = authState.logout;

  // Handle scroll for floating navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize theme on mount to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(initialDark);
    
    // Initial DOM setup if requested dark mode
    if (initialDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Update DOM class safely
  useEffect(() => {
    if (!mounted) return;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark, mounted]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  };
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const navLinks = isAuthenticated
    ? [
        { href: ROUTES.CONCERTS, label: "Concerts", icon: Music },
        { href: ROUTES.RESERVATIONS_ME, label: "My Tickets", icon: Ticket },
        ...(isAdmin
          ? [
              { href: ROUTES.ADMIN_CONCERTS, label: "Manage", icon: Settings },
              {
                href: ROUTES.ADMIN_RESERVATIONS,
                label: "Dashboard",
                icon: LayoutDashboard,
              },
            ]
          : []),
      ]
    : [];

  const isActiveLink = (href: string) => pathname === href;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg"
          : "bg-white dark:bg-slate-900",
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <span className="font-heading">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActiveLink(link.href)
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full gap-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" className="rounded-full">
                    Sign In
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button className="rounded-full bg-cta hover:bg-cta-hover text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 font-heading">
                    <Music className="w-5 h-5 text-primary" />
                    {APP_NAME}
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 mt-6">
                  {isAuthenticated ? (
                    <>
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      {/* Nav Links */}
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                              isActiveLink(link.href)
                                ? "bg-primary text-white"
                                : "hover:bg-muted text-foreground",
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            {link.label}
                          </Link>
                        );
                      })}

                      <Separator />

                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={ROUTES.LOGIN}
                        onClick={() => setIsOpen(false)}
                      >
                        <Button variant="outline" className="w-full rounded-lg">
                          Sign In
                        </Button>
                      </Link>
                      <Link
                        href={ROUTES.REGISTER}
                        onClick={() => setIsOpen(false)}
                      >
                        <Button className="w-full rounded-lg bg-cta hover:bg-cta-hover text-white">
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
