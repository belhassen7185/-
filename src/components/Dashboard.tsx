import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  FileText, 
  ArrowUpRight, 
  Printer, 
  ChevronDown,
  PieChart as PieChartIcon,
  Compass,
  Layers,
  Settings2,
  QrCode
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { AXES, GOVERNANCE_QUESTIONS, EVALUATION_SCALE_INFO } from '../data/governanceQuestions';
import { SurveySubmission, ScoreValue, SurveyConfig } from '../types';

interface DashboardProps {
  submissions: SurveySubmission[];
  currentSubmissionId?: string;
  onSelectSubmission: (id: string) => void;
  onNavigateToSurvey: () => void;
  onNavigateToActionPlan: () => void;
  surveys?: SurveyConfig[];
  activeSurvey?: SurveyConfig;
  onSelectSurvey?: (id: string) => void;
  onOpenSurveyManager?: () => void;
  onOpenShareModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  submissions,
  currentSubmissionId,
  onSelectSubmission,
  onNavigateToSurvey,
  onNavigateToActionPlan,
  surveys = [],
  activeSurvey,
  onSelectSurvey,
  onOpenSurveyManager,
  onOpenShareModal,
}) => {
  const [chartViewMode, setChartViewMode] = useState<'radar' | 'bar'>('radar');

  const currentQuestions = useMemo(() => {
    return activeSurvey ? activeSurvey.questions : GOVERNANCE_QUESTIONS;
  }, [activeSurvey]);

  const currentAxes = useMemo(() => {
    return activeSurvey ? activeSurvey.axes : AXES;
  }, [activeSurvey]);

  // الاستبيان المختار للعرض التفصيلي
  const activeSubmission = useMemo(() => {
    if (!submissions.length) return null;
    if (currentSubmissionId) {
      return submissions.find(s => s.id === currentSubmissionId) || submissions[0];
    }
    return submissions[0];
  }, [submissions, currentSubmissionId]);

  // حساب تفاصيل المحاور للاستبيان النشط ومقارنتها
  const axisBreakdown = useMemo(() => {
    if (!activeSubmission) return [];

    return currentAxes.map(axis => {
      const qIds = axis.questionIds;
      let axisPoints = 0;
      let maxPoints = qIds.length * 3;
      let criticalQuestionsCount = 0;

      qIds.forEach(qid => {
        const answer = activeSubmission.answers[qid];
        const score = answer ? answer.score : 0;
        axisPoints += score;
        if (score === 0 || score === 1) {
          criticalQuestionsCount++;
        }
      });

      const percentage = maxPoints > 0 ? Math.round((axisPoints / maxPoints) * 100) : 0;

      let status = 'ضعيف';
      let color = '#ef4444';
      let textColor = 'text-rose-700';

      if (percentage >= 80) {
        status = 'ممتاز';
        color = '#10b981';
        textColor = 'text-emerald-700';
      } else if (percentage >= 60) {
        status = 'متوسط';
        color = '#f59e0b';
        textColor = 'text-amber-700';
      }

      return {
        ...axis,
        points: axisPoints,
        maxPoints,
        percentage,
        criticalQuestionsCount,
        status,
        color,
        textColor,
      };
    });
  }, [activeSubmission, currentAxes]);

  // بيانات مخطط الرادار (Radar Chart)
  const radarChartData = useMemo(() => {
    if (!axisBreakdown.length) return [];
    return axisBreakdown.map(axis => ({
      axisName: axis.shortTitle,
      امتثال: axis.percentage,
      المعيار_المثالي: 100,
      المتوسط_المؤسسي: 75,
    }));
  }, [axisBreakdown]);

  // بيانات مخطط الدائرة النسبية (Pie Chart) لتوزيع درجات سلم التقييم (0, 1, 2, 3)
  const scoreDistributionPieData = useMemo(() => {
    if (!activeSubmission) return [];
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };

    currentQuestions.forEach(q => {
      const ans = activeSubmission.answers[q.id];
      if (ans && ans.score !== null && ans.score !== undefined) {
        counts[ans.score as ScoreValue]++;
      }
    });

    return [
      {
        name: '0 - غير موجود (خطر)',
        value: counts[0],
        color: '#e11d48', // rose-600
        desc: 'ثغرات حرجة تتطلب إجراء تصحيحي عاجل',
      },
      {
        name: '1 - موجود جزئياً (متذبذب)',
        value: counts[1],
        color: '#d97706', // amber-600
        desc: 'تطبيق غير منتظم يحتاج مأسسة',
      },
      {
        name: '2 - موجود ومطبق',
        value: counts[2],
        color: '#2563eb', // blue-600
        desc: 'ممارسات مستقرة ومرضية',
      },
      {
        name: '3 - مطبق وموثق دورياً',
        value: counts[3],
        color: '#059669', // emerald-600
        desc: 'أفضل الممارسات الحوكمية',
      },
    ].filter(item => item.value > 0);
  }, [activeSubmission, currentQuestions]);

  // بيانات المقارنة بين الإدارات في حال وجود أكثر من استبيان
  const departmentsComparisonData = useMemo(() => {
    return submissions.map(sub => ({
      name: sub.department.length > 20 ? sub.department.substring(0, 18) + '...' : sub.department,
      fullName: sub.department,
      score: sub.totalScore,
      percentage: sub.percentage,
      status: sub.status,
    }));
  }, [submissions]);

  // استخراج قائمة النقائص الحرجة (الأسئلة الحاصلة على 0 أو 1)
  const criticalItems = useMemo(() => {
    if (!activeSubmission) return [];

    const items: Array<{
      question: (typeof currentQuestions)[0];
      score: ScoreValue;
      notes: string;
      axisTitle: string;
    }> = [];

    currentQuestions.forEach(q => {
      const ans = activeSubmission.answers[q.id];
      if (ans && (ans.score === 0 || ans.score === 1)) {
        const axis = currentAxes.find(a => a.id === q.axisId);
        items.push({
          question: q,
          score: ans.score,
          notes: ans.notes,
          axisTitle: axis?.shortTitle || '',
        });
      }
    });

    return items;
  }, [activeSubmission, currentQuestions, currentAxes]);

  if (!activeSubmission) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">لا توجد تقييمات مسجلة بعد</h2>
        <p className="text-sm text-slate-500">قم بتعبئة أول استبيان للاطلاع على الرسوم البيانية والتحليلات الإدارية.</p>
        <button
          onClick={onNavigateToSurvey}
          className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
        >
          البدء بتعبئة الاستبيان
        </button>
      </div>
    );
  }

  const maxSurveyScore = currentQuestions.length * 3;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* شريط اختيار وإدارة الاستبيانات المتعددة وحرية تخصيص الأسئلة */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-indigo-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/60 border border-indigo-400/40 flex items-center justify-center text-white shrink-0">
            <Layers className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-300">الاستبيان المعروض حالياً:</span>
              <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                {currentQuestions.length} سؤال • {currentAxes.length} محاور
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={activeSurvey?.id}
                onChange={e => onSelectSurvey && onSelectSurvey(e.target.value)}
                className="text-xs sm:text-sm font-extrabold bg-indigo-800/90 hover:bg-indigo-700/90 text-white rounded-xl px-3 py-1.5 border border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer max-w-xs sm:max-w-md truncate"
              >
                {surveys.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSurveyManager && (
            <button
              onClick={onOpenSurveyManager}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>إدارة وتخصيص الأسئلة</span>
            </button>
          )}

          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>مشاركة هذا الاستبيان (QR Code)</span>
            </button>
          )}
        </div>
      </div>

      {/* رأس لوحة القيادة التنفيذية */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>لوحة القيادة والمتابعة للإدارة العليا</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            التحليل الإحصائي والبياني لمؤشرات الحوكمة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            متابعة نسب الامتثال عبر الرسوم البيانية التفاعلية (Radar & Pie Charts) ورصد المخاطر
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* اختيار التقييم المعروض */}
          <div className="relative">
            <select
              value={activeSubmission.id}
              onChange={e => onSelectSubmission(e.target.value)}
              className="appearance-none text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 pl-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {submissions.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.department} - {sub.createdAt} ({sub.totalScore}/{maxSurveyScore})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5 pointer-events-none" />
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير</span>
          </button>

          <button
            onClick={onNavigateToActionPlan}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>خطة العمل التصحيحية</span>
          </button>
        </div>
      </div>

      {/* بطاقات المؤشرات الرقمية الرئيسية (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* مجموع النقاط */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>مجموع النقاط المحصلة</span>
            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-full font-bold">الحد الأقصى {maxSurveyScore}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activeSubmission.totalScore}</span>
            <span className="text-slate-400 text-xs">/ {maxSurveyScore} نقطة</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>النسبة المئوية العامة:</span>
            <span className="font-extrabold text-slate-800">{activeSubmission.percentage}%</span>
          </div>
        </div>

        {/* تصنيف الحوكمة */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>مستوى الحوكمة المعتمد</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-lg text-sm font-extrabold border ${
                activeSubmission.status === 'جيد'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : activeSubmission.status === 'متوسط'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              مستوى {activeSubmission.status}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {activeSubmission.status === 'جيد' && 'المنظومة موجودة ومطبقة بشكل جيد (72 - 90)'}
            {activeSubmission.status === 'متوسط' && 'توجد آليات ولكن تحتاج إلى تحسين (54 - 71)'}
            {activeSubmission.status === 'ضعيف' && 'نقائص جوهرية تستوجب تدابير عاجلة (0 - 53)'}
          </div>
        </div>

        {/* الأسئلة الحرجة 0 و 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>النقائص والمخاطر الحرجة</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{criticalItems.length}</span>
            <span className="text-slate-400 text-xs">سؤال بدرجة (0 أو 1)</span>
          </div>
          <div className="text-xs text-rose-700 font-semibold">
            تُحول تلقائياً إلى خطة عمل تصحيحية
          </div>
        </div>

        {/* بيانات الاستبيان الحالي */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>الهيكل المقيم والتاريخ</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xs font-bold text-slate-800 line-clamp-1">
            {activeSubmission.department}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span className="line-clamp-1">{activeSubmission.unit}</span>
            <span className="shrink-0">{activeSubmission.createdAt}</span>
          </div>
        </div>
      </div>

      {/* قسم الرسوم البيانية التفاعلية Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الرسم الأول: مخطط الرادار (Radar Chart) أو المخطط الشريطي لمقارنة المحاور */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  مخطط الرادار الحوكمي (Radar Chart)
                </h3>
                <p className="text-[11px] text-slate-500">نسبة الامتثال في المحاور الستة مقارنة بالمعدل المستهدف</p>
              </div>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartViewMode('radar')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartViewMode === 'radar' ? 'bg-white shadow-2xs text-indigo-700 font-bold' : 'text-slate-600'
                }`}
              >
                رادار شبكي
              </button>
              <button
                onClick={() => setChartViewMode('bar')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartViewMode === 'bar' ? 'bg-white shadow-2xs text-indigo-700 font-bold' : 'text-slate-600'
                }`}
              >
                أعمدة بيانية
              </button>
            </div>
          </div>

          {/* محتوى الرسم البياني الأول */}
          <div className="w-full h-72 sm:h-80 flex items-center justify-center">
            {chartViewMode === 'radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="axisName" 
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Radar
                    name="نسبة الامتثال (%)"
                    dataKey="امتثال"
                    stroke="#4f46e5"
                    fill="#6366f1"
                    fillOpacity={0.45}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'نسبة الامتثال']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      direction: 'rtl',
                      border: 'none',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={radarChartData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="axisName" 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'نسبة الامتثال']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      direction: 'rtl',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="امتثال" name="نسبة الامتثال (%)" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>المعدل المطلوب لتحقيق مستوى الحوكمة الجيد: <strong>80% فأعلى</strong></span>
            <span className="font-bold text-indigo-600">6 محاور استراتيجية</span>
          </div>
        </div>

        {/* الرسم الثاني: المخطط الدائري (Pie Chart / Donut) لتوزيع إجابات سلم التقييم */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                توزيع إجابات سلم التقييم (Pie Chart)
              </h3>
              <p className="text-[11px] text-slate-500">
                نسبة الأسئلة الثلاثين حسب درجات السلم المعتمدة (0، 1، 2، 3)
              </p>
            </div>
          </div>

          {/* محتوى المخطط الدائري */}
          <div className="w-full h-72 sm:h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistributionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                >
                  {scoreDistributionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} أسئلة (${Math.round((Number(value) / 30) * 100)}%)`,
                    item.payload.desc,
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                    direction: 'rtl',
                    border: 'none',
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-rose-50 p-2 rounded-lg border border-rose-100 text-rose-800">
              <span className="font-bold block">مجموع المخاطر (0 و 1):</span>
              <span>{criticalItems.length} مؤشرات تستوجب خطة عمل</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-emerald-800">
              <span className="font-bold block">المؤشرات المطابقة (2 و 3):</span>
              <span>{30 - criticalItems.length} مؤشرات مطبقة وموثقة</span>
            </div>
          </div>
        </div>
      </div>

      {/* رسم إضافي لمقارنة الإدارات إذا كان هناك أكثر من استبيان */}
      {submissions.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  مقارنة مؤشرات الحوكمة بين الإدارات والمصالح
                </h3>
                <p className="text-[11px] text-slate-500">تحليل مقارن لمجموع الدرجات من 90 عبر مختلف الاستبيانات المحفوظة</p>
              </div>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold">
              {submissions.length} استبيانات محفوظة
            </span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentsComparisonData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={[0, 90]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} / 90 نقطة`, 'النتيجة']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                    direction: 'rtl',
                    border: 'none',
                  }}
                />
                <Bar dataKey="score" name="مجموع النقاط (من 90)" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* تفكيك النتائج التفصيلي لكل محور من المحاور الستة */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              تفصيل نسب الامتثال لكل محور من المحاور الستة
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              بيانات رقمية ونوعية تبرز نقاط القوة وفرص التطوير المؤسسي
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> ممتاز (≥ 80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> متوسط (60 - 79%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> يحتاج معالجة (&lt; 60%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {axisBreakdown.map(axis => (
            <div
              key={axis.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{axis.title}</span>
                <span className={`text-xs font-extrabold ${axis.textColor}`}>
                  {axis.percentage}% ({axis.points} / {axis.maxPoints})
                </span>
              </div>

              {/* شريط التقدم اللوني */}
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${axis.percentage}%`, backgroundColor: axis.color }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>{axis.description}</span>
                {axis.criticalQuestionsCount > 0 && (
                  <span className="text-rose-600 font-bold shrink-0 mr-2">
                    {axis.criticalQuestionsCount} ثغرات حرجة
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* مصفوفة رصد النقاط الحرجة (الأسئلة الحاصلة على 0 أو 1) */}
      <div className="bg-white rounded-2xl border border-rose-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                سجل النقائص والمخاطر الحرجة المرصودة (تقييم 0 و 1)
              </h2>
              <p className="text-xs text-slate-500">
                وفق قاعدة الملف: «المعدل العام لا يكفي، يجب تفكيك كل سؤال حصل على 0 أو 1»
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToActionPlan}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            <span>تحويلها إلى خطة عمل تنفيذية</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {criticalItems.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
            <h4 className="font-bold text-sm">ممتاز! لا توجد أي نقائص حرجة (0 أو 1) في هذا التقييم</h4>
            <p className="text-xs text-emerald-700">كافة مؤشرات الحوكمة مطبقة بصفة مستقرة ودورية.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">رقم السؤال</th>
                  <th className="py-3 px-4">المحور</th>
                  <th className="py-3 px-4">نص المؤشر الحوكمي</th>
                  <th className="py-3 px-4">الدرجة</th>
                  <th className="py-3 px-4">الخطر المحتمل</th>
                  <th className="py-3 px-4">الإجراء التصحيحي المستوجب</th>
                  <th className="py-3 px-4">الأولوية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalItems.map(item => (
                  <tr key={item.question.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">#{item.question.id}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{item.axisTitle}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs">{item.question.text}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-extrabold ${
                          item.score === 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.score === 0 ? '0 (غير موجود)' : '1 (جزئي/غير منتظم)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-rose-700 font-medium max-w-xs">
                      {item.question.riskIfZeroOrOne}
                    </td>
                    <td className="py-3 px-4 text-indigo-700 font-medium max-w-xs">
                      {item.question.correctiveAction}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.question.defaultPriority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
