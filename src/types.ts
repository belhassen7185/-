export type ScoreValue = 0 | 1 | 2 | 3;

export interface Question {
  id: number;
  text: string;
  axisId: number;
  riskIfZeroOrOne: string;
  correctiveAction: string;
  responsibleEntity: string;
  deadline: string;
  indicator: string;
  defaultPriority: 'مرتفع' | 'متوسط' | 'منخفض';
  isCustom?: boolean;
}

export interface Axis {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  questionIds: number[];
}

export interface SurveyConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  status: 'نشط' | 'مسودة' | 'مغلق';
  axes: Axis[];
  questions: Question[];
}

export interface SurveySubmission {
  id: string;
  surveyId: string;
  createdAt: string;
  department: string;
  unit: string;
  officialName?: string;
  isAnonymous: boolean;
  answers: Record<number, { score: ScoreValue; notes: string }>;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: 'جيد' | 'متوسط' | 'ضعيف';
}

export interface ActionPlanItem {
  questionId: number;
  questionText: string;
  score: ScoreValue;
  axisTitle: string;
  deficiency: string;
  risk: string;
  priority: 'مرتفع' | 'متوسط' | 'منخفض';
  correctiveAction: string;
  responsible: string;
  deadline: string;
  indicator: string;
  userNotes?: string;
}
