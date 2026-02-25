const ANALYTICS_KEY = "training_events";

export interface TrainingEvent {
  type: "course_start" | "module_complete" | "quiz_result" | "certificate_earned";
  timestamp: string;
  data: Record<string, unknown>;
}

function getEvents(): TrainingEvent[] {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEvent(event: TrainingEvent): void {
  const events = getEvents();
  events.push(event);
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  console.log(`[Analytics] ${event.type}:`, event.data);
}

export function trackCourseStart(role: string, product: string): void {
  saveEvent({
    type: "course_start",
    timestamp: new Date().toISOString(),
    data: { role, product }
  });
}

export function trackModuleComplete(moduleId: string, timeSpent: number): void {
  saveEvent({
    type: "module_complete",
    timestamp: new Date().toISOString(),
    data: { module_id: moduleId, time_spent: timeSpent }
  });
}

export function trackQuizResult(correct: boolean, moduleId?: string): void {
  saveEvent({
    type: "quiz_result",
    timestamp: new Date().toISOString(),
    data: { correct, module_id: moduleId }
  });
}

export function trackCertificateEarned(role?: string): void {
  saveEvent({
    type: "certificate_earned",
    timestamp: new Date().toISOString(),
    data: { role }
  });
}

export function getAllEvents(): TrainingEvent[] {
  return getEvents();
}

export function clearEvents(): void {
  localStorage.removeItem(ANALYTICS_KEY);
}
