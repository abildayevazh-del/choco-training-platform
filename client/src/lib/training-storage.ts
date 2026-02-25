const STORAGE_KEY = "sr_training_progress";
const POINTS_KEY = "points";
const PROGRESS_VERSION_KEY = "sr_progress_version";
const CURRENT_VERSION = "3";

export interface ModuleStepProgress {
  videoWatched?: boolean;
  documentRead?: boolean;
  testPassed?: boolean;
  simulatorPassed?: boolean;
}

export interface TrainingProgress {
  points: number;
  completedBlocks: string[];
  quizScores: Record<string, number>;
  achievements: string[];
  currentModule: string | null;
  currentBlockIndex: number;
  certificatesEarned: string[];
  startedAt: string | null;
  lastActivityAt: string | null;
  moduleSteps: Record<string, ModuleStepProgress>;
}

const defaultProgress: TrainingProgress = {
  points: 0,
  completedBlocks: [],
  quizScores: {},
  achievements: [],
  currentModule: null,
  currentBlockIndex: 0,
  certificatesEarned: [],
  startedAt: null,
  lastActivityAt: null,
  moduleSteps: {},
};

export function getPoints(): number {
  const stored = localStorage.getItem(POINTS_KEY);
  return stored ? parseInt(stored, 10) || 0 : 0;
}

export function setPoints(amount: number): number {
  localStorage.setItem(POINTS_KEY, String(amount));
  return amount;
}

export function getTrainingProgress(): TrainingProgress {
  try {
    const version = localStorage.getItem(PROGRESS_VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(POINTS_KEY);
      localStorage.setItem(PROGRESS_VERSION_KEY, CURRENT_VERSION);
      return { ...defaultProgress };
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    const points = getPoints();
    if (saved) {
      return { ...defaultProgress, ...JSON.parse(saved), points };
    }
    return { ...defaultProgress, points };
  } catch (e) {
    console.error("Failed to load training progress:", e);
  }
  return { ...defaultProgress, points: getPoints() };
}

export function saveTrainingProgress(progress: Partial<TrainingProgress>): TrainingProgress {
  const current = getTrainingProgress();
  const updated = { 
    ...current, 
    ...progress, 
    lastActivityAt: new Date().toISOString() 
  };
  if (!updated.startedAt) {
    updated.startedAt = new Date().toISOString();
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save training progress:", e);
  }
  return updated;
}

export function addPoints(amount: number): number {
  const currentPoints = getPoints();
  const newPoints = currentPoints + amount;
  setPoints(newPoints);
  return newPoints;
}

export function completeBlock(blockId: string, quizScore: number): TrainingProgress {
  const current = getTrainingProgress();
  const completedBlocks = current.completedBlocks.includes(blockId)
    ? current.completedBlocks
    : [...current.completedBlocks, blockId];
  
  return saveTrainingProgress({
    completedBlocks,
    quizScores: { ...current.quizScores, [blockId]: quizScore },
  });
}

export function saveModuleStep(moduleId: string, step: Partial<ModuleStepProgress>): TrainingProgress {
  const current = getTrainingProgress();
  const existing = current.moduleSteps[moduleId] || {};
  return saveTrainingProgress({
    moduleSteps: {
      ...current.moduleSteps,
      [moduleId]: { ...existing, ...step },
    },
  });
}

export function getModuleProgress(moduleId: string, hasVideo: boolean, hasDocument: boolean, hasTest: boolean, hasSimulator?: boolean): number {
  const current = getTrainingProgress();
  const steps = current.moduleSteps[moduleId] || {};
  const totalSteps: string[] = [];
  const doneSteps: string[] = [];
  if (hasVideo) { totalSteps.push("video"); if (steps.videoWatched) doneSteps.push("video"); }
  if (hasDocument) { totalSteps.push("document"); if (steps.documentRead) doneSteps.push("document"); }
  if (hasSimulator) { totalSteps.push("simulator"); if (steps.simulatorPassed) doneSteps.push("simulator"); }
  if (hasTest) { totalSteps.push("test"); if (steps.testPassed) doneSteps.push("test"); }
  if (totalSteps.length === 0) return 0;
  return Math.round((doneSteps.length / totalSteps.length) * 100);
}

export function unlockAchievement(achievementId: string): TrainingProgress {
  const current = getTrainingProgress();
  if (current.achievements.includes(achievementId)) {
    return current;
  }
  return saveTrainingProgress({
    achievements: [...current.achievements, achievementId],
  });
}

export function earnCertificate(moduleId: string): TrainingProgress {
  const current = getTrainingProgress();
  if (current.certificatesEarned.includes(moduleId)) {
    return current;
  }
  return saveTrainingProgress({
    certificatesEarned: [...current.certificatesEarned, moduleId],
  });
}

export function resetProgress(): TrainingProgress {
  localStorage.removeItem(STORAGE_KEY);
  return { ...defaultProgress };
}

export function getLevel(points: number): { level: number; name: string; progress: number } {
  const levels = [
    { level: 1, name: "Новичок", minPoints: 0 },
    { level: 2, name: "Ученик", minPoints: 50 },
    { level: 3, name: "Специалист", minPoints: 100 },
    { level: 4, name: "Эксперт", minPoints: 150 },
    { level: 5, name: "Мастер", minPoints: 200 },
  ];
  
  let currentLevel = levels[0];
  let nextLevel = levels[1];
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].minPoints) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
      break;
    }
  }
  
  const pointsInLevel = points - currentLevel.minPoints;
  const pointsForNextLevel = nextLevel.minPoints - currentLevel.minPoints;
  const progress = pointsForNextLevel > 0 ? (pointsInLevel / pointsForNextLevel) * 100 : 100;
  
  return {
    level: currentLevel.level,
    name: currentLevel.name,
    progress: Math.min(progress, 100),
  };
}
