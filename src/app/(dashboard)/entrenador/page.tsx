import React from "react";
import { getCoachClientsAction, getCoachRoutinesAction } from "@/actions/coach.actions";
import { CoachDashboardInteractive } from "@/components/coach/CoachDashboardInteractive";

export const metadata = {
  title: "Portal del Entrenador | HabitApp",
  description: "Monitoreo clínico y hábitos de clientes, gestión de plantillas de rutinas y recomendaciones.",
};

export default async function EntrenadorDashboardPage() {
  // Fetch real data directly from the API through server actions
  const [clientsResult, routinesResult] = await Promise.all([
    getCoachClientsAction(),
    getCoachRoutinesAction(),
  ]);

  const clients = clientsResult.success && clientsResult.data ? clientsResult.data : [];
  const routines = routinesResult.success && routinesResult.data ? routinesResult.data : [];

  return (
    <CoachDashboardInteractive 
      initialClients={clients} 
      initialRoutines={routines} 
    />
  );
}
