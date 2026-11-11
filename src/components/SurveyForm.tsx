import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Lock, 
  Building2, 
  Calendar, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Info, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { AXES, EVALUATION_SCALE_INFO, GOVERNANCE_QUESTIONS } from '../data/governanceQuestions';
import { ScoreValue, SurveySubmission } from '../types';

interface SurveyFormProps {
  onSubmitSuccess: (submission: SurveySubmission) => void;
  onNavigateToDashboard?: () => void;
  onOpenShareModal?: () => void;
  survey?: import('../types').SurveyConfig;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ 
  onSubmitSuccess, 
  onNavigateToDashboard, 
  onOpenShareModal,
  survey 
}) => {
  const currentQuestions = useMemo(() => {
    return survey ? survey.questions : GOVERNANCE_QUESTIONS;
  }, [survey]);

  const currentAxes = useMemo(() => {
    return survey ? survey.axes : AXES;
  }, [survey]);

  // بيانات الهيكل والإدارة
  const [department, setDepartment] = useState('الإدارة العامة / إدارة التخطيط والحوكمة');
  const [unit, setUnit] = useState('مصلحة متابعة برامج النزاهة والرقابة');
  const [officialName, setOfficialName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [assessmentDate, setAssessmentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // إجابات الأسئلة وملاحظاتها
  const [answers, setAnswers] = useState<Record<number, { score: ScoreValue | null; notes: string }>>(() => {
    const initial: Record<number, { score: ScoreValue | null; notes: string }> = {};
    const qs = survey ? survey.questions : GOVERNANCE_QUESTIONS;
    qs.forEach(q => {
      initial[q.id] = { score: null, notes: '' };
    });
    return initial;
  });

  // التبويب النشط (المحور المحدد أو عرض الكل)
  const [selectedAxisId, setSelectedAxisId] = useState<number | 'all'>('all');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // تحديث درجة السؤال
  const handleScoreChange = (questionId: number, score: ScoreValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        score,
      },
    }));
    setSubmitError(null);
  };

  // تحديث ملاحظات السؤال
  const handleNotesChange = (questionId: number, notes: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        notes,
      },
    }));
  };

  const maxSurveyScore = currentQuestions.length * 3;

  // الحسابات الإحصائية الآنية
  const stats = useMemo(() => {
    let answeredCount = 0;
    let totalScore = 0;
    let criticalCount = 0; // أسئلة 0 و 1

    currentQuestions.forEach(q => {
      const a = answers[q.id];
      if (a && a.score !== null) {
        answeredCount++;
        totalScore += a.score;
        if (a.score === 0 || a.score === 1) {
          criticalCount++;
        }
      }
    });

    const completionRate = currentQuestions.length > 0 ? Math.round((answeredCount / currentQuestions.length) * 100) : 0;
    const scorePercentage = maxSurveyScore > 0 ? Math.round((totalScore / maxSurveyScore) * 100) : 0;

    let statusText: 'جيد' | 'متوسط' | 'ضعيف' = 'ضعيف';
    let statusColor = 'text-rose-600 bg-rose-50 border-rose-200';
    let statusDesc = 'توجد نقائص جوهرية تستوجب إجراءات عاجلة';

    if (scorePercentage >= 80) {
      statusText = 'جيد';
      statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      statusDesc = 'المنظومة موجودة ومطبقة بشكل جيد';
    } else if (scorePercentage >= 60) {
      statusText = 'متوسط';
      statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
      statusDesc = 'توجد آليات ولكن تحتاج إلى تحسين';
    }

    return {
      answeredCount,
      totalCount: currentQuestions.length,
      completionRate,
      totalScore,
      scorePercentage,
      criticalCount,
      statusText,
      statusColor,
      statusDesc,
      maxScore: maxSurveyScore,
    };
  }, [answers, currentQuestions, maxSurveyScore]);

  // ملء نموذج تجريبي واقعي للاختبار الفوري
  const handleFillDemo = () => {
    const demoAnswers: Record<number, { score: ScoreValue | null; notes: string }> = {};
    const sampleScores: Record<number, ScoreValue> = {
      1: 2, 2: 2, 3: 2, 4: 1, 5: 1,
      6: 2, 7: 3, 8: 2, 9: 1, 10: 2,
      11: 1, 12: 1, 13: 2, 14: 2, 15: 0,
      16: 2, 17: 0, 18: 1, 19: 2, 20: 2,
      21: 2, 22: 3, 23: 2, 24: 2,
      25: 1, 26: 2, 27: 1, 28: 2, 29: 2, 30: 1,
    };

    currentQuestions.forEach(q => {
      const s = sampleScores[q.id] ?? 2;
      let note = '';
      if (q.id === 17) note = 'أدلة الإجراءات قديمة ومتقادمة منذ 3 سنوات وتحتاج تحيين فوري.';
      if (q.id === 15) note = 'لم يتم بعد حصر وتحديث سجل مخاطر الفساد بالهيكل.';
      if (q.id === 9) note = 'ضرورة اعتماد استمارة تصريح كتابية لتفادي شبهات تضارب المصالح.';
      demoAnswers[q.id] = { score: s, notes: note };
    });

    setAnswers(demoAnswers);
    setSubmitError(null);
  };

  // تفريغ النموذج
  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في تفريغ جميع الإجابات؟')) {
      const resetState: Record<number, { score: ScoreValue | null; notes: string }> = {};
      currentQuestions.forEach(q => {
        resetState[q.id] = { score: null, notes: '' };
      });
      setAnswers(resetState);
      setSubmitError(null);
    }
  };

  // إرسال النموذج وحفظه
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من اكتمال الإجابات
    const missingQuestions = currentQuestions.filter(q => answers[q.id]?.score === null);
    if (missingQuestions.length > 0) {
      setSubmitError(`يرجى الإجابة عن جميع الأسئلة للاكتمال الإحصائي. تبقى (${missingQuestions.length}) سؤالاً بدون تقييم.`);
      const firstMissing = missingQuestions[0];
      setSelectedAxisId(firstMissing.axisId);
      return;
    }

    const finalAnswers: Record<number, { score: ScoreValue; notes: string }> = {};
    currentQuestions.forEach(q => {
      finalAnswers[q.id] = {
        score: answers[q.id].score as ScoreValue,
        notes: answers[q.id].notes,
      };
    });

    const newSubmission: SurveySubmission = {
      id: `sub-${Date.now()}`,
      surveyId: survey?.id || 'survey-gov-primary',
      createdAt: assessmentDate,
      department: department.trim() || 'الإدارة العامة',
      unit: unit.trim() || 'مصلحة الحوكمة',
      officialName: isAnonymous ? undefined : officialName.trim(),
      isAnonymous,
      answers: finalAnswers,
      totalScore: stats.totalScore,
      maxScore: maxSurveyScore,
      percentage: stats.scorePercentage,
      status: stats.statusText,
    };

    onSubmitSuccess(newSubmission);
  };

  // تصفية الأسئلة المعروضة
  const filteredQuestions = useMemo(() => {
    return currentQuestions.filter(q => {
      if (selectedAxisId !== 'all' && q.axisId !== selectedAxisId) {
        return false;
      }
      if (filterAlertOnly) {
        const s = answers[q.id]?.score;
        return s === 0 || s === 1;
      }
      return true;
    });
  }, [selectedAxisId, filterAlertOnly, answers, currentQuestions]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* رأس الصفحة والشعار التعريفي */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>الوثيقة الرسمية: استمارة التشخيص الأولي لتطبيق مبادئ الحوكمة والوقاية من الفساد</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              استبيان تقييم الحوكمة المؤسسية والنزاهة
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              أداة قياس دورية وموثوقة لجمع آراء وتقييمات الموظفين بسرية تامة، بهدف تشخيص مكامن الخلل وتحويل النقائص إلى خطة عمل تصحيحية فورية ترتقي بالأداء المؤسسي.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>مشاركة مع الموظفين (QR Code / Email)</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>تعبئة نموذج تجريبي جاهز</span>
            </button>
            {onNavigateToDashboard && (
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>عرض لوحة تحكم النتائج</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* بطاقة ميثاق السرية وبيانات الهيكل الإداري */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">بيانات التقييم والتعريف بالهيكل</h2>
              <p className="text-xs text-slate-500">تُحدد هذه البيانات مجال تطبيق الاستبيان وتصنيف المؤشرات إدارياً</p>
            </div>
          </div>

          {/* تبديل وضع السرية وحماية الهوية */}
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Lock className={`w-4 h-4 ${isAnonymous ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-700">
                {isAnonymous ? 'مشاركة سرية ومجهولة الهوية بالكامل' : 'مشاركة مصرحة بالاسم'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                isAnonymous ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnonymous ? '-translate-x-6' : '-translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الهيكل / الإدارة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="مثال: الإدارة العامة، إدارة الصفقات..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              المصلحة / القسم <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="مثال: مصلحة الرقابة والمشتريات..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              المسؤول / القائم بالتقييم
            </label>
            <div className="relative">
              <input
                type="text"
                disabled={isAnonymous}
                value={isAnonymous ? 'محمي ومجهول الهوية (سري)' : officialName}
                onChange={e => setOfficialName(e.target.value)}
                placeholder="الاسم واللقب أو الرتبة"
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 ${
                  isAnonymous ? 'bg-slate-100 text-slate-500 cursor-not-allowed italic' : 'bg-white'
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تاريخ التقييم <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={assessmentDate}
                onChange={e => setAssessmentDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* تنبيه حماية السرية والحوكمة الرشيدة */}
        <div className="flex items-start gap-3 bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">ضمان السرية التامة واستقلالية الرأي:</strong>
            هذا الاستبيان مصمم وفق معايير الحوكمة الرشيدة لمكافحة الفساد وتشخيص النقائص بموضوعية. لا يتم ربط التقييمات بأي تتبع شخصي للموظف عند اختيار الوضع السري.
          </div>
        </div>
      </div>

      {/* دليل سلم التقييم المعتمد في الملف الرسمي (0 - 3) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>طريقة التقييم: يتم تقييم كل سؤال وفق السلم التالي (0 إلى 3 نقاط):</span>
          </div>
          <span className="text-xs text-slate-500">الحد الأقصى الإجمالي = 30 سؤالاً × 3 = 90 نقطة</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EVALUATION_SCALE_INFO.map(item => (
            <div
              key={item.score}
              className={`p-3.5 rounded-xl border bg-white flex items-start gap-3 shadow-2xs ${
                item.score === 0 || item.score === 1 ? 'border-amber-200' : 'border-slate-200'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                  item.score === 0
                    ? 'bg-rose-600 text-white'
                    : item.score === 1
                    ? 'bg-amber-500 text-white'
                    : item.score === 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {item.score}
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-900 block">{item.label}</span>
                <span className="text-slate-500 block">{item.shortDesc}</span>
                {item.isAlert && (
                  <span className="text-[11px] text-rose-600 font-medium inline-block mt-1">
                    * يُحول تلقائياً لخطة عمل تصحيحية
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* لوحة التحكم المرحلية بالأقسام وشريط التقدم */}
      <div className="sticky top-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-sm font-bold text-slate-800">
              نسبة اكتمال الإجابات:
              <span className="mr-2 text-indigo-600 font-extrabold">{stats.completionRate}%</span>
              <span className="text-xs text-slate-500 mr-1 font-normal">
                ({stats.answeredCount} من {stats.totalCount} سؤال)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* مؤشر النتيجة اللحظية */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-600">المجموع الحالي:</span>
              <span className="font-extrabold text-slate-900">{stats.totalScore} / 90</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${stats.statusColor}`}>
                {stats.statusText}
              </span>
            </div>

            {/* مؤشر النقاط الحرجة 0 أو 1 */}
            {stats.criticalCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterAlertOnly(!filterAlertOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterAlertOnly
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{stats.criticalCount} نقاط حرجة (0 و 1)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              title="تفريغ الاستمارة"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* شريط التقدم المرئي */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>

        {/* أزرار التنقل بين المحاور الستة */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedAxisId('all')}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedAxisId === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع المحاور (30 سؤال)
          </button>

          {AXES.map(axis => {
            const axisQuestions = GOVERNANCE_QUESTIONS.filter(q => q.axisId === axis.id);
            const answeredInAxis = axisQuestions.filter(q => answers[q.id]?.score !== null).length;
            const isCompleted = answeredInAxis === axisQuestions.length;

            return (
              <button
                key={axis.id}
                type="button"
                onClick={() => setSelectedAxisId(axis.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedAxisId === axis.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{axis.shortTitle}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    selectedAxisId === axis.id
                      ? 'bg-indigo-700 text-white'
                      : isCompleted
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {answeredInAxis}/{axisQuestions.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* رسالة الخطأ عند عدم اكتمال التقييم */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-xs font-bold text-rose-700 underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* قائمة الأسئلة */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">لا توجد أسئلة تطابق معيار التصفية المحدد</h3>
            <p className="text-xs text-slate-500">قم بإلغاء فلترة النقاط الحرجة أو اختيار محور آخر</p>
            <button
              type="button"
              onClick={() => {
                setFilterAlertOnly(false);
                setSelectedAxisId('all');
              }}
              className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              عرض جميع الأسئلة
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const currentAnswer = answers[q.id];
            const currentScore = currentAnswer?.score;
            const isZeroOrOne = currentScore === 0 || currentScore === 1;
            const currentAxis = AXES.find(a => a.id === q.axisId);

            return (
              <div
                key={q.id}
                id={`q-${q.id}`}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 space-y-5 shadow-2xs ${
                  currentScore !== null
                    ? isZeroOrOne
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : 'border-slate-200 hover:border-slate-300'
                    : 'border-slate-200'
                }`}
              >
                {/* رأس السؤال */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center border border-indigo-100">
                        {q.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {currentAxis?.shortTitle}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {q.text}
                    </h3>
                  </div>

                  {currentScore !== null && (
                    <div className="shrink-0">
                      {isZeroOrOne ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          نقيصة تستوجب إجراء تصحيحي
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          مطبق ومطابق للمبادئ
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* خيارات التقييم الأربعة (السلم 0 - 3) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {EVALUATION_SCALE_INFO.map(option => {
                    const isSelected = currentScore === option.score;

                    return (
                      <button
                        type="button"
                        key={option.score}
                        onClick={() => handleScoreChange(q.id, option.score as ScoreValue)}
                        className={`relative p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between h-full ${
                          isSelected
                            ? option.score === 0
                              ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-2 ring-rose-400'
                              : option.score === 1
                              ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-400'
                              : option.score === 2
                              ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-400'
                              : 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-400'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? option.activeBadge
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {option.score}
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>

                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                            {option.label}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {option.shortDesc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* تفاصيل الخطر والإجراء التلقائي عند التقييم بـ 0 أو 1 (مأخوذ مباشرة من منهجية الملف) */}
                {isZeroOrOne && (
                  <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-200/90 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>تحديد الخطر المحتمل والإجراء الاستباقي (نموذج خطة العمل):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <span className="font-semibold text-amber-900">الخطر المحتمل: </span>
                        <span>{q.riskIfZeroOrOne}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-amber-900">الإجراء التصحيحي المقترح: </span>
                        <span>{q.correctiveAction}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* حقل الملاحظات والقرائن الميدانية */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    الملاحظات، الأدلة والقرائن، أو مقترحات التحسين (اختياري):
                  </label>
                  <textarea
                    rows={2}
                    value={currentAnswer?.notes || ''}
                    onChange={e => handleNotesChange(q.id, e.target.value)}
                    placeholder="دوّن هنا أي شواهد إدارية، رقم مذكرة، أو مقترح عملي ملموس يعزز التقييم..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            );
          })
        )}

        {/* شريط الإجراءات النهائي */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-sm">
            <span className="font-bold text-slate-800">الحالة الإجمالية: </span>
            <span className="text-slate-600 font-medium">
              تمت الإجابة عن {stats.answeredCount} من أصل 30 سؤالاً ({stats.completionRate}%)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedAxisId !== 'all' && selectedAxisId < 6 && (
              <button
                type="button"
                onClick={() => setSelectedAxisId((selectedAxisId as number) + 1)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>الانتقال للمحور التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد الاستبيان واستخراج خطة العمل</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
