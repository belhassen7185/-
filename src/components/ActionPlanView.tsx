import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  UserCheck, 
  Edit3, 
  Plus, 
  Save, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { GOVERNANCE_QUESTIONS, AXES } from '../data/governanceQuestions';
import { ActionPlanItem, SurveySubmission, ScoreValue } from '../types';

interface ActionPlanViewProps {
  submission: SurveySubmission;
  onNavigateToDashboard: () => void;
  survey?: import('../types').SurveyConfig;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({
  submission,
  onNavigateToDashboard,
  survey,
}) => {
  const currentQuestions = useMemo(() => {
    return survey ? survey.questions : GOVERNANCE_QUESTIONS;
  }, [survey]);

  const currentAxes = useMemo(() => {
    return survey ? survey.axes : AXES;
  }, [survey]);

  // توليد بنود خطة العمل تلقائياً من النقاط الحاصلة على 0 أو 1
  const initialPlanItems = useMemo<ActionPlanItem[]>(() => {
    const items: ActionPlanItem[] = [];

    currentQuestions.forEach(q => {
      const ans = submission.answers[q.id];
      if (ans && (ans.score === 0 || ans.score === 1)) {
        const axis = currentAxes.find(a => a.id === q.axisId);
        items.push({
          questionId: q.id,
          questionText: q.text,
          score: ans.score,
          axisTitle: axis?.shortTitle || '',
          deficiency: `نقص ملحوظ أو غياب في تطبيق: ${q.text.replace('هل ', '').replace('؟', '')}`,
          risk: q.riskIfZeroOrOne,
          priority: q.defaultPriority,
          correctiveAction: q.correctiveAction,
          responsible: q.responsibleEntity,
          deadline: q.deadline,
          indicator: q.indicator,
          userNotes: ans.notes,
        });
      }
    });

    return items;
  }, [submission, currentQuestions, currentAxes]);

  const [planItems, setPlanItems] = useState<ActionPlanItem[]>(initialPlanItems);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // تحديث حقل معين في البند
  const handleItemChange = (index: number, field: keyof ActionPlanItem, value: any) => {
    setPlanItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // تصدير كملف CSV قابل للفتح في Excel
  const handleExportCSV = () => {
    const headers = [
      'رقم السؤال',
      'المحور',
      'المؤشر',
      'التقييم',
      'النقيصة المرصودة',
      'الخطر المحتمل',
      'درجة الأولوية',
      'الإجراء التصحيحي المستوجب',
      'المسؤول عن التنفيذ',
      'الأجل الزمني',
      'مؤشر التحقق والإنجاز',
      'ملاحظات الميدان',
    ];

    const rows = planItems.map(item => [
      `"${item.questionId}"`,
      `"${item.axisTitle}"`,
      `"${item.questionText.replace(/"/g, '""')}"`,
      `"${item.score === 0 ? 'غير موجود (0)' : 'جزئي (1)'}"`,
      `"${item.deficiency.replace(/"/g, '""')}"`,
      `"${item.risk.replace(/"/g, '""')}"`,
      `"${item.priority}"`,
      `"${item.correctiveAction.replace(/"/g, '""')}"`,
      `"${item.responsible.replace(/"/g, '""')}"`,
      `"${item.deadline}"`,
      `"${item.indicator.replace(/"/g, '""')}"`,
      `"${(item.userNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `خطة_العمل_التصحيحية_${submission.department}_${submission.createdAt}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // إحصائيات الأولويات
  const priorityStats = useMemo(() => {
    const high = planItems.filter(i => i.priority === 'مرتفع').length;
    const med = planItems.filter(i => i.priority === 'متوسط').length;
    const low = planItems.filter(i => i.priority === 'منخفض').length;
    return { high, med, low, total: planItems.length };
  }, [planItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* رأس الصفحة والشريط التعريفي */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>النموذج الرسمي: تحويل نتائج الاستمارة إلى خطة عمل تصحيحية</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            خطة العمل التنفيذية لمعالجة النقائص ومخاطر الحوكمة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مستخرجة آلياً للهيكل: <span className="font-bold text-slate-800">{submission.department}</span> بتاريخ {submission.createdAt}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة الخطة</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير إلى Excel / CSV</span>
          </button>

          <button
            onClick={onNavigateToDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            <span>العودة للوحة القيادة</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإحصاء السريع للأولويات */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">إجمالي الإجراءات التصحيحية</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{priorityStats.total}</span>
          <span className="text-[11px] text-slate-400">إجراء ملزم للهياكل المعنية</span>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 shadow-2xs">
          <span className="text-xs text-rose-800 font-semibold block">أولوية مرتفعة (عاجل)</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{priorityStats.high}</span>
          <span className="text-[11px] text-rose-600 font-medium">مخاطر تشغيلية أو قانونية جسيمة</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-2xs">
          <span className="text-xs text-amber-800 font-semibold block">أولوية متوسطة</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{priorityStats.med}</span>
          <span className="text-[11px] text-amber-600 font-medium">تحسين المساطر والشفافية</span>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 shadow-2xs">
          <span className="text-xs text-blue-800 font-semibold block">أولوية عادية / منخفضة</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{priorityStats.low}</span>
          <span className="text-[11px] text-blue-600 font-medium">متابعة روتينية وتطويرية</span>
        </div>
      </div>

      {/* نموذج الإيضاح المؤسسي كما ورد في صفحة 3 و 4 من الملف */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-2 text-xs text-indigo-950">
        <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>منهجية معالجة النتائج المعتمدة في الوثيقة الرسمية:</span>
        </div>
        <p className="leading-relaxed">
          «المعدل العام وحده لا يكفي. يجب تحليل كل سؤال حصل على 0 أو 1 لتحديد النقائص والمخاطر. مثلاً إذا كانت الإجابة عن السؤال 17: (هل أدلة الإجراءات محينة؟ → 0)، فلا نكتفي بكتابة نقص في التحيين، بل نحولها إلى: النقيصة + الخطر المحتمل + درجة الأولوية + الإجراء التصحيحي + المسؤول + الأجل + المؤشر».
        </p>
      </div>

      {/* جدول خطة العمل التفصيلية */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {planItems.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">لا توجد نقائص أو مخاطر مسجلة في هذا التقييم</h3>
            <p className="text-xs text-slate-500">كافة الإجابات نالت تقييماً 2 أو 3 مطابقاً لمتطلبات الحوكمة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-12">ع</th>
                  <th className="py-3.5 px-4">النقيصة</th>
                  <th className="py-3.5 px-4">الخطر المحتمل</th>
                  <th className="py-3.5 px-4 w-28">درجة الأولوية</th>
                  <th className="py-3.5 px-4">الإجراء التصحيحي</th>
                  <th className="py-3.5 px-4">المسؤول</th>
                  <th className="py-3.5 px-4 w-28">الأجل</th>
                  <th className="py-3.5 px-4">المؤشر</th>
                  <th className="py-3.5 px-4 w-16">تعديل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {planItems.map((item, idx) => {
                  const isEditing = editingIndex === idx;

                  return (
                    <tr
                      key={item.questionId}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/70'}
                    >
                      {/* رقم السؤال والدرجة */}
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap align-top">
                        <div className="flex flex-col items-center">
                          <span>{item.questionId}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold mt-1 ${
                              item.score === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.score}
                          </span>
                        </div>
                      </td>

                      {/* النقيصة */}
                      <td className="py-3 px-4 text-slate-800 font-semibold align-top min-w-[160px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.deficiency}
                            onChange={e => handleItemChange(idx, 'deficiency', e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded-md"
                          />
                        ) : (
                          <div>
                            <div>{item.deficiency}</div>
                            {item.userNotes && (
                              <div className="text-[11px] text-slate-500 mt-1 italic bg-amber-50/80 p-1 rounded border border-amber-200/50">
                                قرينة/ملاحظة الموظف: {item.userNotes}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* الخطر المحتمل */}
                      <td className="py-3 px-4 text-rose-700 font-medium align-top min-w-[170px]">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={item.risk}
                            onChange={e => handleItemChange(idx, 'risk', e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded-md"
                          />
                        ) : (
                          item.risk
                        )}
                      </td>

                      {/* درجة الأولوية */}
                      <td className="py-3 px-4 whitespace-nowrap align-top">
                        {isEditing ? (
                          <select
                            value={item.priority}
                            onChange={e => handleItemChange(idx, 'priority', e.target.value)}
                            className="text-xs p-1 border border-slate-300 rounded-md"
                          >
                            <option value="مرتفع">مرتفع</option>
                            <option value="متوسط">متوسط</option>
                            <option value="منخفض">منخفض</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                              item.priority === 'مرتفع'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : item.priority === 'متوسط'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {item.priority}
                          </span>
                        )}
                      </td>

                      {/* الإجراء التصحيحي */}
                      <td className="py-3 px-4 text-indigo-900 font-medium align-top min-w-[200px]">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={item.correctiveAction}
                            onChange={e => handleItemChange(idx, 'correctiveAction', e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded-md"
                          />
                        ) : (
                          item.correctiveAction
                        )}
                      </td>

                      {/* المسؤول */}
                      <td className="py-3 px-4 text-slate-700 font-medium align-top min-w-[130px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.responsible}
                            onChange={e => handleItemChange(idx, 'responsible', e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded-md"
                          />
                        ) : (
                          item.responsible
                        )}
                      </td>

                      {/* الأجل */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap align-top">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.deadline}
                            onChange={e => handleItemChange(idx, 'deadline', e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded-md"
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.deadline}
                          </span>
                        )}
                      </td>

                      {/* المؤشر */}
                      <td className="py-3 px-4 text-slate-700 align-top min-w-[150px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.indicator}
                            onChange={e => handleItemChange(idx, 'indicator', e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded-md"
                          />
                        ) : (
                          item.indicator
                        )}
                      </td>

                      {/* زر الحفظ أو التعديل */}
                      <td className="py-3 px-4 text-center align-top whitespace-nowrap">
                        {isEditing ? (
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                            title="حفظ التعديل"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingIndex(idx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                            title="تعديل هذا البند"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
