/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SurveyForm } from './components/SurveyForm';
import { SurveyManager } from './components/SurveyManager';
import { ActionPlanView } from './components/ActionPlanView';
import { GuideModal } from './components/GuideModal';
import { ShareSurveyModal } from './components/ShareSurveyModal';
import { EmployeeSurveyPortal } from './components/EmployeeSurveyPortal';
import { PortalLanding } from './components/PortalLanding';
import { INITIAL_SUBMISSIONS, DEFAULT_SURVEYS, PRIMARY_SURVEY_ID } from './data/governanceQuestions';
import { SurveySubmission, SurveyConfig } from './types';
import { CheckCircle2, X, QrCode } from 'lucide-react';

export default function App() {
  // التبويب النشط (يبدأ بالبوابة الرقمية ثلاثية الأبعاد)
  const [activeTab, setActiveTab] = useState<'portal' | 'dashboard' | 'survey' | 'builder' | 'action_plan' | 'guide'>('portal');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // إدارة قائمة الاستبيانات المتعددة وحفظها محلياً
  const [surveys, setSurveys] = useState<SurveyConfig[]>(() => {
    try {
      const saved = localStorage.getItem('governance_custom_surveys');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load surveys from localStorage', e);
    }
    return DEFAULT_SURVEYS;
  });

  // معرّف الاستبيان النشط المختار حالياً
  const [activeSurveyId, setActiveSurveyId] = useState<string>(() => {
    return DEFAULT_SURVEYS[0]?.id || PRIMARY_SURVEY_ID;
  });

  // التحقق من الرابط إذا كان قد تم فتحه من قِبل موظف عبر QR Code أو البريد الإلكتروني
  const [isEmployeePortalMode, setIsEmployeePortalMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'employee' && params.get('admin') !== 'true') {
        return true;
      }
    }
    return false;
  });

  const [urlSurveyId, setUrlSurveyId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('surveyId') || '';
    }
    return '';
  });

  const [urlDepartment, setUrlDepartment] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('dept') || '';
    }
    return '';
  });

  // حفظ واسترجاع الاستبيانات وتحديثها محلياً
  useEffect(() => {
    try {
      localStorage.setItem('governance_custom_surveys', JSON.stringify(surveys));
    } catch (e) {
      console.error('Failed to save surveys to localStorage', e);
    }
  }, [surveys]);

  // حفظ واسترجاع التقييمات المحفوظة
  const [submissions, setSubmissions] = useState<SurveySubmission[]>(() => {
    try {
      const saved = localStorage.getItem('governance_survey_submissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load submissions from localStorage', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  const [currentSubmissionId, setCurrentSubmissionId] = useState<string>(() => {
    return submissions[0]?.id || '';
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('governance_survey_submissions', JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save submissions to localStorage', e);
    }
  }, [submissions]);

  // الاستبيان النشط حالياً في لوحة الإدارة
  const activeSurvey = useMemo(() => {
    return surveys.find(s => s.id === activeSurveyId) || surveys[0];
  }, [surveys, activeSurveyId]);

  // استبيان الموظف المحدد عند فتح الرابط
  const employeeSurvey = useMemo(() => {
    if (urlSurveyId) {
      const found = surveys.find(s => s.id === urlSurveyId);
      if (found) return found;
    }
    return activeSurvey;
  }, [surveys, urlSurveyId, activeSurvey]);

  // استلام استبيان جديد مكتمل (من واجهة الموظف أو الإدارة)
  const handleSurveySubmitSuccess = (newSubmission: SurveySubmission) => {
    setSubmissions(prev => [newSubmission, ...prev]);
    setCurrentSubmissionId(newSubmission.id);
    setActiveTab('dashboard');
    setNotification('تم حفظ واعتماد استمارة الاستبيان بنجاح، وتحديث لوحة القيادة وخطة العمل.');

    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // إنشاء استبيان جديد
  const handleCreateSurvey = (newSurvey: SurveyConfig) => {
    setSurveys(prev => [newSurvey, ...prev]);
    setActiveSurveyId(newSurvey.id);
    setNotification(`تم إنشاء واعتماد الاستبيان الجديد: "${newSurvey.title}" بنجاح.`);
    setTimeout(() => setNotification(null), 5000);
  };

  // تعديل استبيان وتخصيص أسئلته
  const handleUpdateSurvey = (updatedSurvey: SurveyConfig) => {
    setSurveys(prev => prev.map(s => (s.id === updatedSurvey.id ? updatedSurvey : s)));
    setNotification(`تم تحديث وتخصيص أسئلة الاستبيان: "${updatedSurvey.title}".`);
    setTimeout(() => setNotification(null), 5000);
  };

  // حذف استبيان
  const handleDeleteSurvey = (surveyId: string) => {
    setSurveys(prev => prev.filter(s => s.id !== surveyId));
    if (activeSurveyId === surveyId) {
      const remaining = surveys.filter(s => s.id !== surveyId);
      if (remaining.length > 0) {
        setActiveSurveyId(remaining[0].id);
      }
    }
  };

  const activeSubmission = submissions.find(s => s.id === currentSubmissionId) || submissions[0];

  // عند مسح QR Code أو فتح الرابط المخصص للموظف: يظهر الاستبيان بمفرده تماماً دون أي عناصر أخرى
  if (isEmployeePortalMode) {
    return (
      <EmployeeSurveyPortal
        initialDepartment={urlDepartment}
        survey={employeeSurvey}
        onSurveySubmitted={newSub => {
          handleSurveySubmitSuccess(newSub);
        }}
      />
    );
  }

  // إذا كان التبويب النشط هو البوابة الرقمية ثلاثية الأبعاد
  if (activeTab === 'portal') {
    return (
      <>
        <PortalLanding
          onEnterDashboard={() => setActiveTab('dashboard')}
          onEnterSurvey={() => setActiveTab('survey')}
          onEnterBuilder={() => setActiveTab('builder')}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          surveysCount={surveys.length}
          submissionsCount={submissions.length}
        />
        <ShareSurveyModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          defaultDepartment={activeSubmission?.department || ''}
          survey={activeSurvey}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-['Cairo',sans-serif]">
      {/* شريط الملاحة العلوي */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        submissionsCount={submissions.length}
        surveysCount={surveys.length}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onSwitchToEmployeeMode={() => setIsEmployeePortalMode(true)}
      />

      {/* شريط الإشعار العلوي للنجاح */}
      {notification && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 py-3 shadow-md flex items-center justify-between sticky top-16 z-20 transition-all">
          <div className="max-w-7xl mx-auto flex items-center gap-2 w-full justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-white hover:text-emerald-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي حسب التبويب النشط */}
      <main className="flex-1 pb-16">
        {/* لوحة القيادة */}
        {activeTab === 'dashboard' && (
          <Dashboard
            submissions={submissions}
            currentSubmissionId={currentSubmissionId}
            onSelectSubmission={id => setCurrentSubmissionId(id)}
            onNavigateToSurvey={() => setActiveTab('survey')}
            onNavigateToActionPlan={() => setActiveTab('action_plan')}
            surveys={surveys}
            activeSurvey={activeSurvey}
            onSelectSurvey={id => setActiveSurveyId(id)}
            onOpenSurveyManager={() => setActiveTab('builder')}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}

        {/* إدارة وبناء الاستبيانات المتعددة وتخصيص واختيار الأسئلة */}
        {activeTab === 'builder' && (
          <SurveyManager
            surveys={surveys}
            activeSurveyId={activeSurveyId}
            onSelectSurvey={id => setActiveSurveyId(id)}
            onCreateSurvey={handleCreateSurvey}
            onUpdateSurvey={handleUpdateSurvey}
            onDeleteSurvey={handleDeleteSurvey}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onNavigateToSurvey={() => setActiveTab('survey')}
            onOpenShareModal={id => {
              setActiveSurveyId(id);
              setIsShareModalOpen(true);
            }}
            submissions={submissions}
          />
        )}

        {/* استمارة الاستبيان وتعبئتها */}
        {activeTab === 'survey' && (
          <SurveyForm
            survey={activeSurvey}
            onSubmitSuccess={handleSurveySubmitSuccess}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        )}

        {/* خطة العمل التصحيحية للاستبيان المختار */}
        {activeTab === 'action_plan' && activeSubmission && (
          <ActionPlanView
            submission={activeSubmission}
            survey={activeSurvey}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {/* دليل التقييم */}
        {activeTab === 'guide' && <GuideModal />}
      </main>

      {/* نافذة مشاركة الاستبيان عبر QR Code أو البريد الإلكتروني للاستبيان المختار */}
      <ShareSurveyModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        defaultDepartment={activeSubmission?.department || ''}
        survey={activeSurvey}
      />

      {/* تذييل الصفحة المؤسسي */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
            >
              لوحة القيادة
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setActiveTab('builder')}
              className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
            >
              إدارة وبناء الاستبيانات
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>مشاركة الاستبيان الحالي (QR Code / Email)</span>
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsEmployeePortalMode(true)}
              className="text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              معاينة واجهة الموظف
            </button>
          </div>
          <p className="font-semibold text-slate-700">
            منظومة التشخيص الأولي لتطبيق مبادئ الحوكمة والوقاية من الفساد • الجمهورية
          </p>
          <p className="text-slate-400">
            منصة متكاملة لبناء استبيانات الحوكمة وتخصيص الأسئلة والتحليل البياني للإدارة العليا
          </p>
        </div>
      </footer>
    </div>
  );
}
