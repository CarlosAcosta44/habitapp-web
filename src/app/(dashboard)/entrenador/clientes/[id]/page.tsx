import React from "react";
import { getCoachClientProgressAction, getCoachRoutinesAction } from "@/actions/coach.actions";
import { CoachClientDetailInteractive } from "@/components/coach/CoachClientDetailInteractive";

interface CoachClientPageProps {
  readonly params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "Detalle y Progreso del Cliente | HabitApp",
  description: "Auditoría individual y supervisión clínica de hábitos, racha y constancia del pupilo.",
};

export default async function CoachClientDetailPage({
  params,
}: CoachClientPageProps) {
  const { id } = await params;

  // Fetch real client progress and available routines
  const [progressRes, routinesRes] = await Promise.all([
    getCoachClientProgressAction(id),
    getCoachRoutinesAction(),
  ]);

  const clientData = progressRes.success && progressRes.data ? progressRes.data : { userId: id };
  const routines = routinesRes.success && routinesRes.data ? routinesRes.data : [];

  return (
    <CoachClientDetailInteractive
      clientId={id}
      clientData={clientData}
      availableRoutines={routines}
    />
  );
}
