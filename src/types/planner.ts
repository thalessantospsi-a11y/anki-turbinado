export interface DailyTimeDistribution {
  availableMinutes: number;
  reviewMinutes: number;
  reviewCardsTarget: number;
  newCardsMinutes: number;
  newCardsTarget: number;
  questionsMinutes: number;
  questionsTarget: number;
}

export interface DayForecast {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Seg 23/09"
  dueCount: number;
  isOverloaded: boolean;
}

export interface WorkloadForecastReport {
  days: DayForecast[];
  totalForecasted: number;
  peakDay: DayForecast | null;
  overloadWarnings: string[];
  recommendedMaxNewPerDay: number;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface DailyStudyGoal {
  targetMinutes: number;
  targetReviews: number;
  targetNewCards: number;
  targetQuestions: number;
  completedReviews: number;
  completedQuestions: number;
  completedMinutes: number;
}
