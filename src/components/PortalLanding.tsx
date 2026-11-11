import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  ShieldCheck, 
  Lock, 
  BarChart3, 
  ClipboardList, 
  QrCode, 
  Layers, 
  ArrowLeft, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Eye, 
  FileCheck2, 
  Users, 
  Building2,
  ExternalLink
} from 'lucide-react';

interface PortalLandingProps {
  onEnterDashboard: () => void;
  onEnterSurvey: () => void;
  onEnterBuilder: () => void;
  onOpenShareModal: () => void;
  surveysCount: number;
  submissionsCount: number;
}

export const PortalLanding: React.FC<PortalLandingProps> = ({
  onEnterDashboard,
  onEnterSurvey,
  onEnterBuilder,
  onOpenShareModal,
  surveysCount,
  submissionsCount,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'admin' | 'employee'>('admin');
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // إعداد مشهد Three.js ثلاثي الأبعاد تفاعلي ورائع
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // كشف مواصفات الشاشة
    const width = container.clientWidth;
    const height = container.clientHeight;

    // إنشاء المشهد والكاميرا
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.035);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // مجموعة الأشكال ثلاثية الأبعاد المركزية
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 1. القلب البلوري الهندسي (Icosahedron Core)
    const coreGeometry = new THREE.IcosahedronGeometry(3.6, 1);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // tech cyan / blue
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.75,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(coreMesh);

    // 2. شبكة الإطار الخارجي المتوهج (Wireframe Cage)
    const wireframeGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    coreGroup.add(wireframeMesh);

    // 3. الحلقات المدارية الثلاثية المتداخلة (الحوكمة، الشفافية، الرقابة)
    const ringsGroup = new THREE.Group();
    coreGroup.add(ringsGroup);

    const ringColors = [0x0284c7, 0xc8102e, 0x10b981]; // أزرق، قرمزي تونسي، أخضر زمردي
    const rings: THREE.Mesh[] = [];

    ringColors.forEach((col, idx) => {
      const radius = 5.2 + idx * 0.9;
      const ringGeo = new THREE.TorusGeometry(radius, 0.06, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.9,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = (idx * Math.PI) / 3;
      ringMesh.rotation.y = (idx * Math.PI) / 4;
      ringsGroup.add(ringMesh);
      rings.push(ringMesh);
    });

    // 4. حقل الجزيئات المتطايرة (Particle Constellation)
    const particlesCount = 380;
    const positions = new Float32Array(particlesCount * 3);
    const particleColors = new Float32Array(particlesCount * 3);

    const pColor1 = new THREE.Color(0x38bdf8);
    const pColor2 = new THREE.Color(0xef4444);
    const pColor3 = new THREE.Color(0x34d399);

    for (let i = 0; i < particlesCount; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);
      const distance = 7 + Math.random() * 18;

      positions[i * 3] = distance * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = distance * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = distance * Math.cos(theta);

      const chosenColor = i % 3 === 0 ? pColor1 : i % 3 === 1 ? pColor2 : pColor3;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // الإضاءة المشهدية
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc8102e, 2.0);
    dirLight2.position.set(-15, -10, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x06b6d4, 3, 30);
    pointLight.position.set(0, 0, 8);
    scene.add(pointLight);

    // تفاعل حركة الفأرة
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      targetX = (x / rect.width) * 0.8;
      targetY = -(y / rect.height) * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // التجاوب مع تغيير حجم الشاشة
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // حلقة الحركة والأنيميشن (Animation Loop)
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // حركة دوران ثلاثية الأبعاد متناسقة
      coreMesh.rotation.y = elapsedTime * 0.25;
      coreMesh.rotation.x = elapsedTime * 0.15;

      wireframeMesh.rotation.y = -elapsedTime * 0.2;
      wireframeMesh.rotation.z = elapsedTime * 0.1;

      rings.forEach((ring, i) => {
        const speed = (i + 1) * 0.3;
        ring.rotation.x += 0.005 * speed;
        ring.rotation.y += 0.008 * speed;
      });

      particlesMesh.rotation.y = elapsedTime * 0.05;
      particlesMesh.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;

      // تتبع الفأرة بمرونة (Smooth Damping)
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      coreGroup.rotation.y = mouseX * 0.6;
      coreGroup.rotation.x = -mouseY * 0.6;
      coreGroup.position.x = mouseX * 2;
      coreGroup.position.y = mouseY * 2;

      renderer.render(scene, camera);
    };

    animate();

    // التنظيف عند إلغاء التركيب
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      coreGeometry.dispose();
      coreMaterial.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      rings.forEach(r => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onEnterDashboard();
  };

  return (
    <div className="relative min-h-screen bg-radial from-slate-900 via-slate-950 to-slate-950 text-white overflow-x-hidden font-['Cairo',sans-serif] select-none flex flex-col justify-between">
      {/* مشهد Three.js ثلاثي الأبعاد في الخلفية */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 z-0 pointer-events-none opacity-85"
      />

      {/* خلفية تدرجات ضوئية عصرية */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-red-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-sky-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* رأس الصفحة المؤسسي الراقي مع شعار الوزارة والمؤسسة */}
      <header className="relative z-10 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* شعار وزارة تكنولوجيات الاتصال التونسية */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl shadow-md border border-white/20 shrink-0">
              <img 
                src="/assets/aistudio/mtc_01_7fae016b.png" 
                alt="وزارة تكنولوجيات الاتصال" 
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-[11px] font-bold text-slate-300 block tracking-tight">الجمهورية التونسية</span>
              <span className="text-xs sm:text-sm font-extrabold text-white block">وزارة تكنولوجيات الاتصال</span>
              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider block">Ministère des Technologies de la Communication</span>
            </div>
          </div>

          {/* العنوان المركزي للبوابة */}
          <div className="text-center hidden md:block">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>المنظومة الرقمية للنزاهة والحوكمة المؤسسية</span>
            </span>
          </div>

          {/* شعار مركز الدراسات والبحوث للاتصالات CERT */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-left">
              <span className="text-xs sm:text-sm font-extrabold text-white block">مركز الدراسات والبحوث للاتصالات</span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Centre d'Études et de Recherche des Télécommunications</span>
            </div>
            <div className="bg-white p-1.5 rounded-xl shadow-md border border-white/20 shrink-0">
              <img 
                src="/assets/aistudio/images_e920dc37.png" 
                alt="CERT" 
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي للبوابة الرقمية */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 my-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* الجانب الأيمن: النص التعريفي الاستراتيجي والرسالة المؤسسية */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 via-sky-600/20 to-emerald-600/20 border border-white/15 text-xs font-bold shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>بوابة التشخيص الأولي لمبادئ الحوكمة والوقاية من الفساد</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              منظومة الحوكمة الرشيدة <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-red-400 bg-clip-text text-transparent">
                والنزاهة الرقمية المؤسسية
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              منصة متطورة تكرس مقاييس الحوكمة والشفافية الرقابية تحت إشراف وزارة تكنولوجيات الاتصال، تتيح لإطارات وأعوان مركز الدراسات والبحوث للاتصالات (CERT) المشاركة في التقييم الدوري بنزاهة وسرية تامة، وتحويل مؤشرات الأداء إلى خطط عمل تصحيحية فورية وموثقة.
            </p>

            {/* المزايا الرئيسية الثلاث */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1 hover:border-sky-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-white">6 محاور استراتيجية</h4>
                <p className="text-[11px] text-slate-400">تقييم شامل من 30 مؤشراً وفق المعايير الإدارية والرقابية المعتمدة.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1 hover:border-emerald-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-white">سرية مشفرة 100%</h4>
                <p className="text-[11px] text-slate-400">حماية تامة لهوية المستجيبين والأعوان لضمان مصداقية التشخيص.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1 hover:border-red-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 mb-1">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-white">خطة عمل تصحيحية</h4>
                <p className="text-[11px] text-slate-400">تحويل النقائص تلقائياً إلى إجراءات ملزمة بآجال ومسؤوليات محددة.</p>
              </div>
            </div>

            {/* إحصائيات سريعة حية */}
            <div className="flex items-center gap-6 pt-3 text-xs text-slate-400 border-t border-white/10 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>المنظومة نشطة ومحدثة</span>
              </div>
              <div>
                <span>الاستبيانات المتاحة: </span>
                <strong className="text-white font-extrabold">{surveysCount} استبيانات</strong>
              </div>
              <div>
                <span>إجمالي التقييمات المسجلة: </span>
                <strong className="text-white font-extrabold">{submissionsCount} تقييم</strong>
              </div>
            </div>
          </div>

          {/* الجانب الأيسر: بطاقة الدخول الرقمية التفاعلية */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-600 via-sky-500 to-emerald-500" />

              {/* اختيار مسار الدخول: الإدارة أو الموظف */}
              <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>دخول الإدارة والقيادة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('employee')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'employee'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>بوابة الموظف (الاستبيان)</span>
                </button>
              </div>

              {/* محتوى مسار الإدارة */}
              {activeTab === 'admin' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>فضاء الإدارة العامة وخلية الحوكمة والرقابة</span>
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      ولوج لوحة القيادة التنفيذية والتحليل
                    </h3>
                    <p className="text-xs text-slate-400">
                      متابعة المؤشرات الحوكمية، الرسوم البيانية، استخراج خطط العمل وتخصيص الاستبيانات
                    </p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-3.5 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>الدخول المباشر إلى لوحة القيادة</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={onEnterBuilder}
                        className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>بناء الاستبيانات</span>
                      </button>

                      <button
                        type="button"
                        onClick={onOpenShareModal}
                        className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                        <span>مشاركة الـ QR Code</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* محتوى مسار الموظف */}
              {activeTab === 'employee' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>مشاركة مجهولة الهوية ومحمية بالكامل</span>
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      المشاركة في استبيان الحوكمة
                    </h3>
                    <p className="text-xs text-slate-400">
                      الإدلاء برأيك بحرية وأمان تام دون جمع أي أسماء أو بيانات شخصية لتشخيص النقائص بموضوعية
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={onEnterSurvey}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>بدء تعبئة الاستبيان سرياً</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={onOpenShareModal}
                      className="w-full py-2.5 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>مسح رمز QR للمشاركة عبر الهاتف الذكي</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ميثاق الحماية والضمان المؤسسي */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Lock className="w-3 h-3" />
                  بروتوكول تشفير وحماية البيانات
                </span>
                <span>CERT • تونس</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* تذييل الصفحة المؤسسي */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>الجمهورية التونسية • وزارة تكنولوجيات الاتصال • مركز الدراسات والبحوث للاتصالات (CERT)</span>
          <span className="text-[11px] text-slate-500">منظومة الحوكمة الرشيدة والوقاية من الفساد © 2026</span>
        </div>
      </footer>
    </div>
  );
};
