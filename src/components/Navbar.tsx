import React from 'react';
import { 
  ShieldCheck, 
  ClipboardList, 
  BarChart3, 
  FileSpreadsheet, 
  HelpCircle,
  Lock,
  QrCode,
  Share2,
  Users,
  Layers,
  Home
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'portal' | 'dashboard' | 'survey' | 'builder' | 'action_plan' | 'guide';
  onSelectTab: (tab: 'portal' | 'dashboard' | 'survey' | 'builder' | 'action_plan' | 'guide') => void;
  submissionsCount: number;
  surveysCount: number;
  onOpenShareModal: () => void;
  onSwitchToEmployeeMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  submissionsCount,
  surveysCount,
  onOpenShareModal,
  onSwitchToEmployeeMode,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* الشعارين واسم المنظومة */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('portal')}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
              title="العودة للبوابة الرقمية الرئيسية"
            >
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                <img 
                  src="/assets/aistudio/mtc_01_7fae016b.png" 
                  alt="وزارة تكنولوجيات الاتصال" 
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                <img 
                  src="/assets/aistudio/images_e920dc37.png" 
                  alt="CERT" 
                  className="h-7 w-auto object-contain"
                />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">
                  منظومة الحوكمة والوقاية من الفساد
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <Lock className="w-2.5 h-2.5" />
                  CERT • MTC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                وزارة تكنولوجيات الاتصال • مركز الدراسات والبحوث للاتصالات
              </p>
            </div>
          </div>

          {/* روابط وأزرار التبديل والمشاركة */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 sm:gap-1.5">
              {/* زر البوابة الرقمية الرئيسية */}
              <button
                onClick={() => onSelectTab('portal')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'portal'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="بوابة الدخول الرقمية التفاعلية 3D"
              >
                <Home className="w-4 h-4" />
                <span className="hidden lg:inline">البوابة الرقمية</span>
              </button>
              {/* لوحة القيادة في الأول كما طلب المستخدم */}
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>لوحة القيادة</span>
                {submissionsCount > 0 && (
                  <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {submissionsCount}
                  </span>
                )}
              </button>

              {/* إدارة وبناء الاستبيانات المتعددة */}
              <button
                onClick={() => onSelectTab('builder')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'builder'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden md:inline">إدارة وبناء الاستبيانات</span>
                <span className="md:hidden">الاستبيانات</span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {surveysCount}
                </span>
              </button>

              {/* استمارة الاستبيان */}
              <button
                onClick={() => onSelectTab('survey')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'survey'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden md:inline">استمارة التقييم</span>
                <span className="md:hidden">تعبئة</span>
              </button>

              {/* خطة العمل */}
              <button
                onClick={() => onSelectTab('action_plan')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'action_plan'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">خطة العمل</span>
              </button>

              {/* دليل التقييم */}
              <button
                onClick={() => onSelectTab('guide')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="دليل المعايير والسلم التقييمي"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden lg:inline">الدليل</span>
              </button>
            </nav>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* زر مشاركة الاستبيان مع الموظفين (QR Code ورابط) */}
            <button
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="مشاركة رابط أو QR Code مع موظفي الإدارة"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة مع الموظفين</span>
              <span className="sm:hidden">مشاركة</span>
            </button>

            {/* زر معاينة واجهة الموظف */}
            <button
              onClick={onSwitchToEmployeeMode}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="معاينة واجهة الموظف المستقلة (وضع الهاتف/QR)"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
