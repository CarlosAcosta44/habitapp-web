import React from "react";
import { requireUserStrict } from "@/lib/auth/require-user";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";

export const metadata = {
  title: "Portal del Entrenador | HabitApp",
  description: "Monitoreo clínico y hábitos de clientes, gestión de plantillas de rutinas y recomendaciones personalizadas.",
};

export default async function EntrenadorLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const user = await requireUserStrict();
  const roleUpper = (user.nombrerol || "").toUpperCase();
  const isTrainerOrAdmin =
    roleUpper === "ENTRENADOR" ||
    roleUpper === "ADMINISTRADOR" ||
    roleUpper === "ADMIN" ||
    roleUpper === "TRAINER";

  // Pantalla 403: Acceso Denegado si el usuario no posee rol entrenador o administrador
  if (!isTrainerOrAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center relative border border-rose-500/20 bg-white dark:bg-[#111827] shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 mb-6 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">Acceso Restringido</h1>
          <p className="text-rose-500 font-semibold mb-2 uppercase tracking-widest text-xs">Error 403: Forbidden</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">
            Esta área del sistema está reservada exclusivamente para entrenadores certificados y administradores de HabitApp. Tu cuenta actual ({user.nombrerol || "Usuario"}) no posee los permisos correspondientes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link 
              href="/habitos" 
              className="w-full sm:w-auto px-6 py-3 bg-[#572de4] hover:bg-[#4823c9] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Mis Hábitos
            </Link>
            <form action={logoutAction} className="w-full sm:w-auto">
              <button 
                type="submit" 
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {children}
    </div>
  );
}
