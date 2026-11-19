"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ShieldAlert, Sparkles } from "lucide-react";

export function AdminSubNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Panel de Control",
      href: "/admin",
      icon: LayoutDashboard,
      isActive: pathname === "/admin",
      badge: "En vivo",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    },
    {
      name: "Gestión de Usuarios y Roles",
      href: "/admin/usuarios",
      icon: Users,
      isActive: pathname === "/admin/usuarios",
      badge: "CU35",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
    },
    {
      name: "Centro de Moderación",
      href: "/admin/moderacion",
      icon: ShieldAlert,
      isActive: pathname === "/admin/moderacion",
      badge: "Cola Prioritaria",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    },
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto gap-4">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all
                  ${
                    tab.isActive
                      ? "bg-[#572de4] text-white shadow-[0_4px_14px_rgba(87,45,228,0.3)]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${tab.isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                <span>{tab.name}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold hidden md:inline-block ${
                      tab.isActive ? "bg-white/20 text-white" : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Gobernanza Institucional</span>
        </div>
      </div>
    </div>
  );
}

