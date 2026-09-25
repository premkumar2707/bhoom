import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { navGroups } from "@/lib/navigation";
import { BhuSetuMark } from "@/components/brand/BhuSetuLogo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out lg:flex",
        collapsed ? "w-16" : "w-[248px]"
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
        <Link to="/" aria-label="BHOO-MITRA AI home" className="flex items-center gap-3 overflow-hidden">
          <BhuSetuMark className="h-8 w-8 shrink-0" />
          <div className={cn("leading-none transition-opacity duration-300", collapsed ? "opacity-0 w-0" : "opacity-100")}>
            <div className="font-display text-[1.0625rem] font-extrabold tracking-tight text-ivory">
              BHOO-MITRA <span className="text-primary">AI</span>
            </div>
          </div>
        </Link>
      </div>

      <nav className="scrollbar-slim flex-1 overflow-y-auto px-3 py-4 overflow-x-hidden">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            {!collapsed && (
               <p className="label-technical px-2 pb-2 transition-opacity duration-300 opacity-100">{group.title}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Tooltip delayDuration={collapsed ? 0 : 1000}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.to}
                          className={cn(
                            "group relative flex items-center rounded-md px-2.5 py-2 text-[0.8125rem] font-medium transition-all duration-300",
                            active
                              ? "bg-sidebar-accent text-ivory"
                              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                            collapsed ? "justify-center" : "gap-2.5"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1.5 bottom-1.5 -left-1 w-[2px] rounded-full bg-primary transition-all duration-300",
                              active ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <item.icon
                            className={cn(
                              "h-5 w-5 shrink-0 transition-colors",
                              active ? "text-primary" : "text-muted-foreground",
                            )}
                          />
                          {!collapsed && (
                             <span className="truncate transition-opacity duration-300">{item.label}</span>
                          )}
                          {!collapsed && item.badge ? (
                            <span className="ml-auto rounded-full bg-conflict/15 px-1.5 py-0.5 font-mono text-[0.625rem] font-bold text-conflict">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right" className="font-semibold">{item.label} <span className="block font-normal text-muted-foreground">{item.hint}</span></TooltipContent>}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex flex-col border-t border-border p-3 gap-3">
        <button 
           onClick={() => setCollapsed(!collapsed)} 
           className={cn("flex items-center text-muted-foreground hover:text-ivory transition-colors", collapsed ? "justify-center" : "justify-between px-2")}
           title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
           {!collapsed && <span className="text-xs font-medium">Collapse</span>}
           {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        {!collapsed && (
           <div className="flex items-center gap-2 px-2 transition-opacity duration-300">
             <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-verified badge-pulse" />
             <span className="label-technical truncate">Demo environment</span>
           </div>
        )}
      </div>
    </aside>
  );
}
