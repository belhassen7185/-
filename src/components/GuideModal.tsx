import React from 'react';
import { ShieldCheck, BookOpen, CheckCircle2, AlertTriangle, Layers, Target } from 'lucide-react';
import { AXES, EVALUATION_SCALE_INFO } from '../data/governanceQuestions';

export const GuideModal: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
          <BookOpen className="w-4 h-4" />
          <span>الدليل المرجعي لاستغلال الاستمارة وتفسير النتائج</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          منهجية التشخيص الأولي لتطبيق مبادئ الحوكمة والوقاية من الفساد
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          تم إعداد هذا الاستبيان كأداة تشخيصية داخلية تتيح لمصالح وإدارات المؤسسة قياس مدى جاهزيتها وامتثالها لمبادئ الحوكمة الرشيدة، والوقاية الاستباقية من مخاطر الفساد عبر إشراك الأعوان والموظفين بسرية وأمان.
        </p>
      </div>

      {/* معايير سلم التقييم */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <span>سُلّم التقييم المعتمد (من 0 إلى 3)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EVALUATION_SCALE_INFO.map(s => (
            <div key={s.score} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                  {s.score}
                </span>
                <span className="font-bold text-slate-900 text-sm">{s.label}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{s.shortDesc}</p>
              {s.isAlert && (
                <div className="text-[11px] text-rose-700 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>تنبيه: يُلزم النظام إدراج هذا السؤال ضمن خطة العمل التصحيحية التلقائية</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* مستويات الحوكمة وتفسير النتائج */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>مستويات الحوكمة وتفسير مجموع النقاط (الحد الأقصى 90 نقطة)</span>
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">النتيجة (النقاط)</th>
                <th className="py-3 px-4">مستوى الحوكمة</th>
                <th className="py-3 px-4">التفسير الإداري والتنفيذي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-emerald-50/40">
                <td className="py-3.5 px-4 font-extrabold text-emerald-800 text-sm">72 – 90</td>
                <td className="py-3.5 px-4 font-bold text-emerald-800">جيد</td>
                <td className="py-3.5 px-4 text-emerald-950">المنظومة موجودة ومطبقة بشكل جيد وفعال مع استقرار الإجراءات والتوثيق.</td>
              </tr>
              <tr className="bg-amber-50/40">
                <td className="py-3.5 px-4 font-extrabold text-amber-800 text-sm">54 – 71</td>
                <td className="py-3.5 px-4 font-bold text-amber-800">متوسط</td>
                <td className="py-3.5 px-4 text-amber-950">توجد آليات ولكن تحتاج إلى تحسين ومأسسة وتدقيق دوري لضمان الانتظام.</td>
              </tr>
              <tr className="bg-rose-50/40">
                <td className="py-3.5 px-4 font-extrabold text-rose-800 text-sm">0 – 53</td>
                <td className="py-3.5 px-4 font-bold text-rose-800">ضعيف</td>
                <td className="py-3.5 px-4 text-rose-950">توجد نقائص جوهرية تستوجب إجراءات عاجلة وتدخلاً مباشراً من الإدارة العامة.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* المحاور الستة */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>المحاور الستة للاستبيان (30 مؤشراً)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AXES.map(axis => (
            <div key={axis.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{axis.title}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                  {axis.questionIds.length} أسئلة
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{axis.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
