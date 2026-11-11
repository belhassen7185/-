import React, { useState, useMemo } from 'react';
import { 
  FolderPlus, 
  Settings2, 
  QrCode, 
  BarChart3, 
  ClipboardList, 
  Check, 
  Trash2, 
  Edit3, 
  Plus, 
  Layers, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AXES, GOVERNANCE_QUESTIONS } from '../data/governanceQuestions';
import { SurveyConfig, Question, SurveySubmission } from '../types';

interface SurveyManagerProps {
  surveys: SurveyConfig[];
  activeSurveyId: string;
  onSelectSurvey: (surveyId: string) => void;
  onCreateSurvey: (newSurvey: SurveyConfig) => void;
  onUpdateSurvey: (updatedSurvey: SurveyConfig) => void;
  onDeleteSurvey: (surveyId: string) => void;
  onNavigateToDashboard: () => void;
  onNavigateToSurvey: () => void;
  onOpenShareModal: (surveyId: string) => void;
  submissions: SurveySubmission[];
}

export const SurveyManager: React.FC<SurveyManagerProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  onCreateSurvey,
  onUpdateSurvey,
  onDeleteSurvey,
  onNavigateToDashboard,
  onNavigateToSurvey,
  onOpenShareModal,
  submissions,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);

  // حقول محرر الاستبيان
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('الحوكمة والرقابة');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [activeFilterAxis, setActiveFilterAxis] = useState<number | 'all'>('all');

  // حقول إضافة سؤال مخصص جديد
  const [showAddCustomQuestion, setShowAddCustomQuestion] = useState(false);
  const [customQuestionText, setCustomQuestionText] = useState('');
  const [customAxisId, setCustomAxisId] = useState(1);
  const [customRisk, setCustomRisk] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [customResponsible, setCustomResponsible] = useState('');
  const [customDeadline, setCustomDeadline] = useState('شهرين');
  const [customIndicator, setCustomIndicator] = useState('');
  const [customPriority, setCustomPriority] = useState<'مرتفع' | 'متوسط' | 'منخفض'>('مرتفع');

  // أسئلة مخصصة إضافية تم إنشاؤها
  const [customQuestionsPool, setCustomQuestionsPool] = useState<Question[]>([]);

  // فتح المحرر لإنشاء استبيان جديد
  const handleOpenCreateModal = () => {
    setEditingSurveyId(null);
    setTitle('');
    setDescription('');
    setCategory('الحوكمة والرقابة العامة');
    // افتراضياً نحدد جميع أسئلة الاستبيان التشخيصي المعتمد لسهولة البدء
    setSelectedQuestionIds(GOVERNANCE_QUESTIONS.map(q => q.id));
    setIsEditorOpen(true);
  };

  // فتح المحرر لتعديل استبيان وتخصيص أسئلته
  const handleOpenEditModal = (survey: SurveyConfig) => {
    setEditingSurveyId(survey.id);
    setTitle(survey.title);
    setDescription(survey.description);
    setCategory(survey.category);
    setSelectedQuestionIds(survey.questions.map(q => q.id));
    setIsEditorOpen(true);
  };

  // تبديل اختيار سؤال معين
  const handleToggleQuestion = (id: number) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  // تحديد / إلغاء تحديد جميع أسئلة محور معين
  const handleToggleAxisQuestions = (axisId: number) => {
    const axisQIds = GOVERNANCE_QUESTIONS.filter(q => q.axisId === axisId).map(q => q.id);
    const allSelected = axisQIds.every(id => selectedQuestionIds.includes(id));

    if (allSelected) {
      setSelectedQuestionIds(prev => prev.filter(id => !axisQIds.includes(id)));
    } else {
      setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...axisQIds])));
    }
  };

  // إضافة سؤال مخصص جديد إلى القائمة
  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestionText.trim()) return;

    const newQuestionId = 1000 + Date.now() % 10000;
    const newQ: Question = {
      id: newQuestionId,
      text: customQuestionText.trim(),
      axisId: customAxisId,
      riskIfZeroOrOne: customRisk.trim() || 'مخاطر إدارية أو تجاوز في الصلاحيات.',
      correctiveAction: customAction.trim() || 'وضع تدابير وقائية ورقابية عاجلة.',
      responsibleEntity: customResponsible.trim() || 'المصالح المعنية ووحدة الحوكمة',
      deadline: customDeadline.trim() || '3 أشهر',
      indicator: customIndicator.trim() || 'نسبة المعالجة والامتثال',
      defaultPriority: customPriority,
      isCustom: true,
    };

    setCustomQuestionsPool(prev => [...prev, newQ]);
    setSelectedQuestionIds(prev => [...prev, newQuestionId]);

    // تفريغ الحقول
    setCustomQuestionText('');
    setCustomRisk('');
    setCustomAction('');
    setCustomResponsible('');
    setShowAddCustomQuestion(false);
  };

  // حفظ الاستبيان (جديد أو معدل)
  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (selectedQuestionIds.length === 0) {
      alert('يرجى اختيار سؤال واحد على الأقل للاستبيان.');
      return;
    }

    // تجميع كافة الأسئلة (الأساسية + المخصصة)
    const allAvailable = [...GOVERNANCE_QUESTIONS, ...customQuestionsPool];
    const finalQuestions = allAvailable.filter(q => selectedQuestionIds.includes(q.id));

    // استنتاج المحاور المستخدمة
    const usedAxisIds = Array.from(new Set(finalQuestions.map(q => q.axisId)));
    const finalAxes = AXES.filter(a => usedAxisIds.includes(a.id)).map(a => ({
      ...a,
      questionIds: finalQuestions.filter(q => q.axisId === a.id).map(q => q.id),
    }));

    if (editingSurveyId) {
      const existing = surveys.find(s => s.id === editingSurveyId);
      if (existing) {
        const updated: SurveyConfig = {
          ...existing,
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          axes: finalAxes,
          questions: finalQuestions,
        };
        onUpdateSurvey(updated);
      }
    } else {
      const newSurvey: SurveyConfig = {
        id: `survey-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || 'استبيان حوكمي مخصص للمؤسسة.',
        category: category.trim() || 'حوكمة داخلية',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'نشط',
        axes: finalAxes,
        questions: finalQuestions,
      };
      onCreateSurvey(newSurvey);
    }

    setIsEditorOpen(false);
  };

  // دمج الأسئلة المتاحة
  const allQuestionsPool = useMemo(() => {
    return [...GOVERNANCE_QUESTIONS, ...customQuestionsPool];
  }, [customQuestionsPool]);

  // تصفية بنك الأسئلة المعروض
  const filteredBankQuestions = useMemo(() => {
    if (activeFilterAxis === 'all') return allQuestionsPool;
    return allQuestionsPool.filter(q => q.axisId === activeFilterAxis);
  }, [allQuestionsPool, activeFilterAxis]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* رأس إدارة الاستبيانات */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Settings2 className="w-3.5 h-3.5" />
            <span>نظام إدارة وبناء الاستبيانات المتعددة</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            استبيانات الحوكمة والنزاهة المؤسسية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            أنشئ استبيانات متعددة، خصّص الأسئلة وفق احتياجات كل إدارة، وشارك الروابط ورموز QR بسهولة.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء استبيان جديد</span>
          </button>

          <button
            onClick={onNavigateToDashboard}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>العودة للوحة القيادة</span>
          </button>
        </div>
      </div>

      {/* شبكة بطاقات الاستبيانات المتوفرة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map(survey => {
          const isActive = survey.id === activeSurveyId;
          const surveySubmissions = submissions.filter(s => s.surveyId === survey.id);
          const maxPoints = survey.questions.length * 3;

          return (
            <div
              key={survey.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between space-y-5 transition-all shadow-2xs relative ${
                isActive
                  ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* الشارات والتاريخ */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {survey.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        الاستبيان النشط حالياً
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{survey.createdAt}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {survey.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {survey.description}
                </p>

                {/* إحصائيات الاستبيان */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">الأسئلة</span>
                    <span className="text-sm font-extrabold text-slate-800">{survey.questions.length}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">المحاور</span>
                    <span className="text-sm font-extrabold text-slate-800">{survey.axes.length}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">التقييمات</span>
                    <span className="text-sm font-extrabold text-indigo-600">{surveySubmissions.length}</span>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات للبطاقة */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectSurvey(survey.id);
                      onNavigateToDashboard();
                    }}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>لوحة القيادة</span>
                  </button>

                  <button
                    onClick={() => onOpenShareModal(survey.id)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="مشاركة عبر QR Code ورابط"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>مشاركة</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => handleOpenEditModal(survey)}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>تخصيص واختيار الأسئلة</span>
                  </button>

                  {surveys.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف الاستبيان: "${survey.title}"؟`)) {
                          onDeleteSurvey(survey.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                      title="حذف الاستبيان"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* نافذة بناء وتخصيص الاستبيان والأسئلة (Modal Editor) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* رأس النافذة */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingSurveyId ? 'تخصيص أسئلة وإعدادات الاستبيان' : 'إنشاء استبيان حوكمة جديد'}
                </h2>
                <p className="text-xs text-indigo-200">
                  حدد عنوان الاستبيان واختر الأسئلة التي تناسب أهداف التقييم من بنك الأسئلة المعتمد
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* جسم النافذة */}
            <form onSubmit={handleSaveSurvey} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* البيانات العامة للاستبيان */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    عنوان الاستبيان <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="مثال: استبيان تقييم الحوكمة والنزاهة 2026..."
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    التصنيف / المجال
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="مثال: صفقات، موارد بشرية، شفافية..."
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    وصف مختصر للهدف من الاستبيان
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="وضح للموظفين أو الإدارة نطاق هذا الاستبيان..."
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* قسم اختيار وتخصيص الأسئلة */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      حرية اختيار الأسئلة من بنك الحوكمة المعتمد:
                    </h3>
                    <p className="text-xs text-slate-500">
                      تم تحديد <span className="font-bold text-indigo-600">{selectedQuestionIds.length}</span> سؤالاً (الحد الأقصى للنقاط: {selectedQuestionIds.length * 3} نقطة)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQuestionIds(allQuestionsPool.map(q => q.id))}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      تحديد الكل (30)
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedQuestionIds([])}
                      className="text-xs text-slate-500 font-bold hover:underline"
                    >
                      إلغاء التحديد
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomQuestion(!showAddCustomQuestion)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة سؤال مخصص</span>
                    </button>
                  </div>
                </div>

                {/* نموذج إضافة سؤال مخصص جديد */}
                {showAddCustomQuestion && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>إضافة سؤال تقييمي جديد خاص بمؤسستك:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddCustomQuestion(false)}
                        className="text-xs text-emerald-700"
                      >
                        إلغاء
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={customQuestionText}
                          onChange={e => setCustomQuestionText(e.target.value)}
                          placeholder="نص السؤال (مثال: هل توجد آلية معلنة لتقييم الموردين بعد انتهاء العقد؟)..."
                          className="w-full text-xs p-2.5 rounded-lg border border-emerald-300 bg-white"
                        />
                      </div>
                      <div>
                        <select
                          value={customAxisId}
                          onChange={e => setCustomAxisId(Number(e.target.value))}
                          className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white"
                        >
                          {AXES.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          value={customPriority}
                          onChange={e => setCustomPriority(e.target.value as any)}
                          className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white"
                        >
                          <option value="مرتفع">درجة الأولوية: مرتفع</option>
                          <option value="متوسط">درجة الأولوية: متوسط</option>
                          <option value="منخفض">درجة الأولوية: منخفض</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={customRisk}
                          onChange={e => setCustomRisk(e.target.value)}
                          placeholder="الخطر المحتمل عند التقييم بـ 0 أو 1..."
                          className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={customAction}
                          onChange={e => setCustomAction(e.target.value)}
                          placeholder="الإجراء التصحيحي المستوجب..."
                          className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomQuestion}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                    >
                      إضافة السؤال إلى الاستبيان
                    </button>
                  </div>
                )}

                {/* شريط الفلترة حسب المحاور */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveFilterAxis('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer ${
                      activeFilterAxis === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    عرض الكل ({allQuestionsPool.length})
                  </button>
                  {AXES.map(a => {
                    const countInAxis = allQuestionsPool.filter(q => q.axisId === a.id).length;
                    const selectedInAxis = allQuestionsPool.filter(
                      q => q.axisId === a.id && selectedQuestionIds.includes(q.id)
                    ).length;

                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setActiveFilterAxis(a.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer ${
                          activeFilterAxis === a.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{a.shortTitle}</span>
                        <span className="text-[10px] px-1 bg-white/20 rounded-full">
                          {selectedInAxis}/{countInAxis}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* قائمة الأسئلة مع خانات الاختيار (Checkboxes) */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                  {filteredBankQuestions.map(q => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    const axis = AXES.find(a => a.id === q.axisId);

                    return (
                      <div
                        key={q.id}
                        onClick={() => handleToggleQuestion(q.id)}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-indigo-300 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded">
                              سؤال #{q.id} • {axis?.shortTitle}
                            </span>
                            {q.isCustom && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                                مخصص
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-snug">
                            {q.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* زر الحفظ */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingSurveyId ? 'حفظ التعديلات واعتماد الأسئلة' : 'إنشاء وحفظ الاستبيان'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
