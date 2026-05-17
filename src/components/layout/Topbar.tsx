"use client";

import { useTheme } from "next-themes";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { CommandPalette } from "./CommandPalette";
import { DreamListModeToggle } from "@/components/dream-list/DreamListModeToggle";
import { NavLinks } from "./nav-config";
import type { DreamListMode } from "@/lib/dream-list-types";

function titleFromPath(pathname: string) {
  if (pathname === "/") return "Dashboard";
  const seg = pathname.split("/").filter(Boolean);
  return seg
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" · ");
}

export function Topbar({ dreamListMode }: { dreamListMode: DreamListMode }) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [openSearch, setOpenSearch] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpenSearch(true);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const crumbs = pathname === "/" ? ["Dashboard"] : pathname.split("/").filter(Boolean);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-background/70 px-4 backdrop-blur-xl md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Sheet open={mobileNav} onOpenChange={setMobileNav}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw,320px)] p-0">
              <SheetHeader className="border-b border-white/10 p-4 text-left">
                <SheetTitle>Navigate</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-5rem)]">
                <NavLinks
                  pathname={pathname}
                  onNavigate={() => setMobileNav(false)}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 flex-1">
          <Breadcrumb>
            <BreadcrumbList className="text-xs md:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {crumbs.map((c, i) => (
                <Fragment key={`${c}-${i}`}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {i === crumbs.length - 1 ? (
                      <BreadcrumbPage className="font-medium capitalize">
                        {c.replace(/-/g, " ")}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={`/${crumbs.slice(0, i + 1).join("/")}`}
                        className="capitalize"
                      >
                        {c.replace(/-/g, " ")}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-1 truncate text-lg font-semibold tracking-tight md:text-xl">
            {titleFromPath(pathname)}
          </h1>
        </div>
        </div>
        <div className="flex items-center gap-2">
          <DreamListModeToggle mode={dreamListMode} />
          <Button
            variant="outline"
            className="hidden h-9 gap-2 rounded-full border-white/10 bg-white/5 text-muted-foreground md:inline-flex"
            onClick={() => setOpenSearch(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Search</span>
            <kbd className="pointer-events-none hidden rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] sm:inline">
              ⌘K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpenSearch(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Sun className="h-4 w-4 scale-100 dark:scale-0" />
                <Moon className="absolute inset-0 m-auto h-4 w-4 scale-0 dark:scale-100" />
                <span className="sr-only">Theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <CommandPalette open={openSearch} onOpenChange={setOpenSearch} />
    </>
  );
}
