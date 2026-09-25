import { ChevronDown, Search, Command as CommandIcon, Activity, LayoutDashboard, User } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { BhuSetuMark } from "@/components/brand/BhuSetuLogo";
import { flatNavItems } from "@/lib/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileMenu } from "./MobileMenu";

export function TopBar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = flatNavItems.find((i) => i.to === pathname);
  const breadcrumb = current?.label ?? "Overview";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:px-6">
      <Link to="/" className="lg:hidden" aria-label="BHOO-MITRA AI home">
        <BhuSetuMark className="h-7 w-7" />
      </Link>

      <div className="min-w-0 flex-1 flex items-center gap-2">
        <p className="label-technical hidden lg:block text-muted-foreground">BHOO-MITRA AI <span className="mx-1">/</span></p>
        <h1 className="truncate font-display text-sm font-bold text-ivory lg:text-base flex items-center gap-2">
          {current?.icon && <current.icon className="h-4 w-4 text-primary" />}
          {breadcrumb}
        </h1>
      </div>

      <button
        type="button"
        onClick={onOpenCommand}
        className="hidden h-9 w-72 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 md:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search parcels, sources, conflicts...</span>
        <kbd className="ml-auto flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 font-mono text-[0.625rem]">
          <CommandIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <button
        type="button"
        onClick={onOpenCommand}
        aria-label="Search"
        className="grid h-9 w-9 place-items-center rounded-md border border-border/70 bg-surface text-muted-foreground transition-colors hover:text-ivory md:hidden"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* System Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="hidden items-center gap-1.5 rounded-md border border-border/70 bg-surface px-2.5 py-1.5 xl:flex transition-colors hover:border-primary/40">
            <Activity className="h-3.5 w-3.5 text-verified" />
            <span className="label-technical text-verified">SYSTEM OPERATIONAL</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
           <DropdownMenuLabel className="pb-2">
              <p className="text-sm font-bold text-ivory">SYSTEM STATUS</p>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-saffron/40 bg-saffron/10 px-2 py-0.5">
                 <span className="h-1.5 w-1.5 rounded-full bg-saffron badge-pulse" />
                 <span className="text-[10px] font-bold text-saffron uppercase">Synthetic Demo Environment</span>
              </div>
           </DropdownMenuLabel>
           <DropdownMenuSeparator />
           <div className="grid gap-2 p-2 text-xs">
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Data ingestion</span><span className="text-verified">Operational</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Spatial engine</span><span className="text-verified">Operational</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Conflict engine</span><span className="text-verified">Operational</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Evidence engine</span><span className="text-verified">Operational</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">3D engine</span><span className="text-primary">Ready</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">AI assistant</span><span className="text-ai">Ready</span></div>
           </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationPanel />

      {/* User Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-border/70 bg-surface px-1.5 py-1 transition-colors hover:border-primary/40"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-accent text-[0.625rem] font-bold text-ivory">
                AR
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="space-y-1">
            <p className="text-sm font-semibold text-ivory">Administrator</p>
            <p className="text-xs text-muted-foreground">Role: Land Records Officer</p>
            <p className="label-technical text-saffron">Environment: Synthetic Demo</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-muted-foreground hover:text-ivory">Profile</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-muted-foreground hover:text-ivory">Preferences</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="cursor-pointer text-muted-foreground hover:text-ivory">System Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-conflict focus:bg-conflict/10 focus:text-conflict">Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="lg:hidden">
        <MobileMenu triggerVariant="icon" />
      </div>
    </header>
  );
}
