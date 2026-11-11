import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle,
  EyeOff,
  Send
} from 'lucide-react';
import { AXES, GOVERNANCE_QUESTIONS, EVALUATION_SCALE_INFO } from '../data/governanceQuestions';
import { ScoreValue, SurveySubmission } from '../types';

interface EmployeeSurveyPortalProps {
  onSurveySubmitted: (submission: SurveySubmission) => void;
  initialDepartment?: string;
  survey?: import('../types').SurveyConfig;
}

export const EmployeeSurveyPortal: React.FC<EmployeeSurveyPortalProps> = ({
  onSurveySubmitted,
  initialDepartment = '',
  survey,
}) => {
  const currentQuestions = useMemo(() => {
    return survey ? survey.questions : GOVERNANCE_QUESTIONS;
  }, [survey]);

  const currentAxes = useMemo(() => {
    return survey ? survey.axes : AXES;
  }, [survey]);

  const maxSurveyScore = currentQuestions.length * 3;
  const [submitted, setSubmitted] = useState(false);

  // إجابات أسئلة الاستبيان
  const [answers, setAnswers] = useState<Record<number, { score: ScoreValue | null; notes: string }>>(() => {
    const init: Record<number, { score: ScoreValue | null; notes: string }> = {};
    currentQuestions.forEach(q => {
      init[q.id] = { score: null, notes: '' };
    });
    return init;
  });

  const [currentAxisIndex, setCurrentAxisIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentAxis = currentAxes[currentAxisIndex] || currentAxes[0];
  const axisQuestions = useMemo(() => {
    if (!currentAxis) return currentQuestions;
    return currentQuestions.filter(q => q.axisId === currentAxis.id);
  }, [currentAxis, currentQuestions]);

  // إحصائيات الإنجاز البسيطة
  const progressStats = useMemo(() => {
    let answered = 0;
    currentQuestions.forEach(q => {
      const a = answers[q.id];
      if (a && a.score !== null) {
        answered++;
      }
    });

    const percent = currentQuestions.length > 0 ? Math.round((answered / currentQuestions.length) * 100) : 0;
    return { answered, total: currentQuestions.length, percent };
  }, [answers, currentQuestions]);

  // اختيار درجة السؤال
  const handleScoreSelect = (questionId: number, score: ScoreValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        score,
      },
    }));
    setErrorMessage(null);
  };

  // كتابة ملاحظات
  const handleNotesChange = (questionId: number, notes: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        notes,
      },
    }));
  };

  // التنقل بين المحاور
  const handleNextAxis = () => {
    if (currentAxisIndex < currentAxes.length - 1) {
      setCurrentAxisIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevAxis = () => {
    if (currentAxisIndex > 0) {
      setCurrentAxisIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // إرسال الاستبيان
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من الإجابة عن جميع الأسئلة
    const missingQuestions = currentQuestions.filter(q => answers[q.id]?.score === null);
    if (missingQuestions.length > 0) {
      setErrorMessage(`يرجى الإجابة عن كافة الأسئلة (متبقي ${missingQuestions.length} سؤال بدون تقييم).`);
      const firstMissing = missingQuestions[0];
      const targetAxisIndex = currentAxes.findIndex(a => a.id === firstMissing.axisId);
      if (targetAxisIndex !== -1) {
        setCurrentAxisIndex(targetAxisIndex);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const finalAnswers: Record<number, { score: ScoreValue; notes: string }> = {};
    let totalScore = 0;

    currentQuestions.forEach(q => {
      const s = answers[q.id].score as ScoreValue;
      totalScore += s;
      finalAnswers[q.id] = {
        score: s,
        notes: answers[q.id].notes,
      };
    });

    const percentage = maxSurveyScore > 0 ? Math.round((totalScore / maxSurveyScore) * 100) : 0;
    let status: 'جيد' | 'متوسط' | 'ضعيف' = 'ضعيف';
    if (percentage >= 80) status = 'جيد';
    else if (percentage >= 60) status = 'متوسط';

    const newSubmission: SurveySubmission = {
      id: `sub-${Date.now()}`,
      surveyId: survey?.id || 'survey-gov-primary',
      createdAt: new Date().toISOString().split('T')[0],
      department: initialDepartment.trim() || 'مشاركة سرية (بدون اسم هيكل)',
      unit: 'تقييم مجهول الهوية',
      isAnonymous: true,
      answers: finalAnswers,
      totalScore,
      maxScore: maxSurveyScore,
      percentage,
      status,
    };

    onSurveySubmitted(newSubmission);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // شاشة الشكر والتأكيد بعد الإرسال
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Cairo',sans-serif]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>تم الحفظ بسرية تامة ومجهولة الهوية</span>
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              شكراً جزيلاً لمشاركتكم
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              تم استلام إجاباتكم بنجاح ومساهمتكم محفوظة بسرية مطلقة لدعم الحوكمة الرشيدة في المؤسسة.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-1">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>هويتك محمية 100%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              يمكنك إغلاق هذه الصفحة بأمان الآن.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-['Cairo',sans-serif]">
      {/* رأس الصفحة: اسم الاستبيان وشارة السرية فقط */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1 rounded-lg border border-white/20 shrink-0 shadow-2xs">
              <img 
                src="/assets/aistudio/mtc_01_7fae016b.png" 
                alt="وزارة تكنولوجيات الاتصال" 
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="bg-white p-1 rounded-lg border border-white/20 shrink-0 shadow-2xs">
              <img 
                src="/assets/aistudio/images_e920dc37.png" 
                alt="CERT" 
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                {survey?.title || 'استبيان الحوكمة والوقاية من الفساد'}
              </h1>
              <p className="text-[10px] text-indigo-200">
                وزارة تكنولوجيات الاتصال • CERT
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold shrink-0">
            <Lock className="w-3.5 h-3.5" />
            <span>سري ومحمي 100%</span>
          </div>
        </div>

        {/* شريط التقدم اللحظي */}
        <div className="w-full bg-slate-800/80 h-1.5">
          <div
            className="bg-emerald-500 h-1.5 transition-all duration-300"
            style={{ width: `${progressStats.percent}%` }}
          />
        </div>
      </header>

      {/* الأسئلة مباشرة دون أي بطاقات توضيحية مطولة أو حقول إدخال للهيكل */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* أزرار تنقل نظيفة وسريعة بين أجزاء الاستبيان */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {currentAxes.map((axis, idx) => {
              const qCount = axis.questionIds.length;
              const ansCount = axis.questionIds.filter(id => answers[id]?.score !== null).length;
              const isDone = ansCount === qCount;

              return (
                <button
                  key={axis.id}
                  type="button"
                  onClick={() => {
                    setCurrentAxisIndex(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    currentAxisIndex === idx
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{axis.shortTitle}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-500 font-bold shrink-0 mr-3 hidden sm:inline">
            {progressStats.answered} / {progressStats.total}
          </span>
        </div>

        {/* إشعار التنبيه إن وجد نقص */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-700 underline cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* قائمة الأسئلة المباشرة */}
        <div className="space-y-4">
          {axisQuestions.map(q => {
            const currentAnswer = answers[q.id];
            const currentScore = currentAnswer?.score;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 transition-all shadow-2xs ${
                  currentScore !== null ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                    {q.id}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.text}
                  </h3>
                </div>

                {/* خيارات التقييم الأربعة (السلم 0 إلى 3) مباشرة لكل سؤال */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {EVALUATION_SCALE_INFO.map(option => {
                    const isSelected = currentScore === option.score;

                    return (
                      <button
                        type="button"
                        key={option.score}
                        onClick={() => handleScoreSelect(q.id, option.score as ScoreValue)}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? option.score === 0
                              ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-400'
                              : option.score === 1
                              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400'
                              : option.score === 2
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400'
                              : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? option.activeBadge : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {option.score}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">
                              {option.label}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {option.shortDesc}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ملاحظات أو مقترحات الموظف */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={currentAnswer?.notes || ''}
                    onChange={e => handleNotesChange(q.id, e.target.value)}
                    placeholder="ملاحظة أو مقترح تحسين (اختياري)..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50 placeholder:text-slate-400"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* أزرار التنقل أو الإرسال النهائي */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4 shadow-sm">
          <button
            type="button"
            disabled={currentAxisIndex === 0}
            onClick={handlePrevAxis}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
              currentAxisIndex === 0
                ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            تمت الإجابة: {progressStats.answered} من {progressStats.total} سؤال
          </span>

          {currentAxisIndex < AXES.length - 1 ? (
            <button
              type="button"
              onClick={handleNextAxis}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال الاستبيان سرياً</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
