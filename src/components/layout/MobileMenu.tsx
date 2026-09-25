import { Menu } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navGroups } from "@/lib/navigation";
import { BhuSetuLogo } from "@/components/brand/BhuSetuLogo";
import { cn } from "@/lib/utils";

/** Full navigation drawer for mobile / tablet. */
export function MobileMenu({
  triggerVariant = "tab",
  badge,
}: {
  triggerVariant?: "tab" | "icon";
  badge?: number;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sheet>
      <SheetTrigger asChild>
        {triggerVariant === "icon" ? (
          <button
            type="button"
            aria-label="Open navigation menu"
            className="grid h-9 w-9 place-items-center rounded-md border border-border/70 bg-surface text-muted-foreground transition-colors hover:text-ivory"
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="More — open navigation menu"
            className="relative flex h-full min-w-16 flex-col items-center justify-center gap-1 text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[0.625rem] font-medium">More</span>
            {badge ? (
              <span className="absolute top-1.5 right-3 h-1.5 w-1.5 rounded-full bg-conflict" />
            ) : null}
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[290px] border-border bg-sidebar p-0">
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <BhuSetuLogo />
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)] px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="label-technical px-2 pb-2">{group.title}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-ivory"
                            : "text-muted-foreground hover:bg-sidebar-accent/50",
                        )}
                      >
                        <item.icon
                          className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")}
                        />
                        {item.label}
                        {item.badge ? (
                          <span className="ml-auto rounded-full bg-conflict/15 px-1.5 py-0.5 font-mono text-[0.625rem] font-bold text-conflict">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
