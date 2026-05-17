"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NavLinks } from "./nav-config";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-full w-64 flex-col border-r border-white/5 bg-sidebar/90 backdrop-blur-2xl lg:w-72">
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-6 transition-opacity hover:opacity-90"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-primary to-cyan-500 shadow-xl shadow-primary/30 ring-1 ring-white/10">
          <Compass className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate bg-gradient-to-r from-white to-white/70 bg-clip-text text-base font-bold tracking-tight text-transparent">
            Career Compass
          </p>
          <p className="truncate text-xs font-medium text-muted-foreground">
            Pivot · Build · Ship
          </p>
        </div>
      </Link>
      <Separator className="bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <ScrollArea className="flex-1">
        <NavLinks pathname={pathname} />
      </ScrollArea>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/5 to-transparent" />
    </aside>
  );
}
