import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  QrCode, 
  Mail, 
  Link2, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone, 
  Share2,
  FileText
} from 'lucide-react';

interface ShareSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDepartment?: string;
  survey?: import('../types').SurveyConfig;
}

export const ShareSurveyModal: React.FC<ShareSurveyModalProps> = ({
  isOpen,
  onClose,
  defaultDepartment = '',
  survey,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'link' | 'email' | 'poster'>('qr');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedDept, setSelectedDept] = useState(defaultDepartment);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // إعداد الرابط الخاص بمشاركة الموظفين للاستبيان المختار
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : 'https://ais-dev-lia7rouchcjx24sc42np3u-541792125323.europe-west2.run.app';

  const surveyUrl = `${baseUrl}?mode=employee${survey ? `&surveyId=${encodeURIComponent(survey.id)}` : ''}${selectedDept ? `&dept=${encodeURIComponent(selectedDept)}` : ''}`;

  const surveyTitle = survey?.title || 'استبيان تقييم الحوكمة والوقاية من الفساد';

  // نص البريد الإلكتروني الجاهز للإرسال للموظفين
  const emailSubject = `دعوة للمشاركة في الاستبيان السري: ${surveyTitle}`;
  const emailBody = `الزميلات والزملاء الأعزاء،

تحية طيبة وبعد،

في إطار تكريس مبادئ الحوكمة الرشيدة، والشفافية المؤسسية، والوقاية الاستباقية من شبهات ومخاطر الفساد، ندعوكم للمشاركة في «${surveyTitle}».

🔒 ضمان السرية التامة:
- هذا الاستبيان سري ومجهول الهوية بنسبة 100%.
- لا يتم تسجيل أي أسماء أو بريد إلكتروني أو بيانات تعريفية شخصية.
- الهدف الحصري هو رصد النقائص الإجرائية وتحويلها إلى خطة عمل تصحيحية ترتقي بمرفقنا المشترك.

📱 للمشاركة الفورية، يرجى الضغط على الرابط التالي:
${surveyUrl}

أو يمكنكم مسح رمز الاستجابة السريعة (QR Code) المرفق بكاميرا الهاتف المحمول.

شاكرين لكم مساهمتكم الفاعلة في بناء بيئة عمل نزيهة وشفافة.

مع فائق التقدير والاحترام،
إدارة الحوكمة والرقابة الداخلية`;

  // نسخ الرابط
  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // نسخ نص الإيميل
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // فتح تطبيق البريد الإلكتروني
  const handleOpenMailto = () => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');
  };

  // تحميل صورة QR Code بصيغة PNG
  const handleDownloadQR = () => {
    const canvas = document.getElementById('survey-qrcode-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_استبيان_الحوكمة_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // طباعة ملصق الإعلان الداخلي (Poster)
  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* رأس النافذة المنبثقة */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/50 border border-indigo-400/40 flex items-center justify-center text-white">
              <Share2 className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">مشاركة الاستبيان مع موظفي المؤسسة</h2>
              <p className="text-xs text-indigo-200">عبر رمز الاستجابة السريعة (QR Code) أو رابط البريد الإلكتروني السري</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* أشرطة التبويب الأربعة */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-6 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>رمز QR Code للهاتف</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'link'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>رابط مباشر للموظفين</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'email'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>دعوة بريد إلكتروني جاهزة</span>
          </button>

          <button
            onClick={() => setActiveTab('poster')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'poster'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>ملصق مطبوع للمكاتب</span>
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* تبويب رمز QR Code */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="p-5 bg-white rounded-2xl border-2 border-indigo-100 shadow-md inline-block relative group" ref={qrRef}>
                <QRCodeCanvas
                  id="survey-qrcode-canvas"
                  value={surveyUrl}
                  size={210}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
                <div className="mt-2 text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>امسح الرمز بكاميرا الهاتف المحمول</span>
                </div>
              </div>

              <div className="space-y-1 max-w-md">
                <h3 className="font-bold text-slate-900 text-sm">استبيان فوري ومباشر على الهاتف الذكي</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  يستطيع الموظف فتح الاستبيان مباشرة من هاتفه الشخصي للإجابة في أي وقت وبسرية مطلقة دون الحاجة لتسجيل دخول.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full max-w-md">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الرمز كصورة (PNG)</span>
                </button>

                <button
                  onClick={() => setActiveTab('poster')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>معاينة ملصق التعليق</span>
                </button>
              </div>
            </div>
          )}

          {/* تبويب الرابط المباشر */}
          {activeTab === 'link' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  الرابط المباشر للاستبيان (مخصص للموظفين):
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 break-all select-all">
                    {surveyUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* خيارات الفلترة المسبقة للهيكل إن وجدت */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  تحديد اسم الهيكل / الإدارة مسبقاً في الرابط (اختياري):
                </span>
                <input
                  type="text"
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  placeholder="مثال: الإدارة المالية، مصلحة المشتريات..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[11px] text-slate-500">
                  عند تحديد الهيكل، سيتم ملء حقل الإدارة تلقائياً للموظف لتسهيل الفرز الإحصائي لاحقاً.
                </p>
              </div>

              {/* زر التجربة المباشرة */}
              <a
                href={surveyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <span>تجربة فتح الرابط في نافذة جديدة كما سيراه الموظف</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* تبويب دعوة البريد الإلكتروني */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  موضوع الرسالة (Subject):
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800">
                  {emailSubject}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  نص الدعوة الرسمية (Body):
                </label>
                <textarea
                  readOnly
                  rows={8}
                  value={emailBody}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-slate-700 leading-relaxed focus:outline-none select-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCopyEmail}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    copiedEmail
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم نسخ نص الرسالة بالكامل</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ نص الرسالة للموظفين</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenMailto}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>إرسال عبر برنامج البريد</span>
                </button>
              </div>
            </div>
          )}

          {/* تبويب ملصق التعليق المكتبي (Poster) */}
          {activeTab === 'poster' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>إعلان استبيان الحوكمة والوقاية من الفساد</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">
                    رأيك يهمنا لبناء مؤسسة نزيهة وشفافة
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    امسح رمز الاستجابة السريعة (QR Code) بكاميرا هاتفك للمشاركة في استبيان الحوكمة المؤسسية بسرية وأمان تام
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm inline-block">
                  <QRCodeCanvas
                    value={surveyUrl}
                    size={180}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 max-w-xs mx-auto">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">مشاركة مجهولة الهوية 100% دون جمع أي بيانات شخصية</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handlePrintPoster}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الملصق الآن (A4)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* تذييل النافذة */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام محمي ومشفر وفق أفضل ممارسات الحوكمة الرشيدة</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
