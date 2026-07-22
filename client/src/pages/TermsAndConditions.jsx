import { useEffect } from 'react';
import { ShieldAlert, FileText, Scale, UserCheck, Video, Cpu, AlertTriangle, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'acceptance',
      icon: UserCheck,
      title: '1. Acceptance of Terms & Eligibility',
      content: (
        <>
          <p>
            By accessing or using the <strong>ViewFlow</strong> video streaming platform, mobile web interfaces, or associated APIs (collectively, the "Platform"), you enter into a legally binding agreement with ViewFlow Inc.
          </p>
          <p className="mt-2">
            You affirm that you are at least 13 years of age (or the minimum legal age in your jurisdiction). If you are under 18, you must have parental or guardian consent to use this Platform.
          </p>
        </>
      ),
    },
    {
      id: 'accounts',
      icon: Scale,
      title: '2. User Accounts & Security',
      content: (
        <>
          <p>
            To access features such as video uploading, channel creation, commenting, and subscribing, you must create a ViewFlow account using email OTP verification or authorized Google OAuth 2.0.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-brand-muted">
            <li>You are responsible for maintaining the confidentiality of your credentials.</li>
            <li>You agree to provide accurate, up-to-date registration information.</li>
            <li>ViewFlow reserves the right to suspend or terminate accounts that engage in fraudulent login attempts or impersonation.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'content',
      icon: Video,
      title: '3. Video Uploads, Licensing & Copyright',
      content: (
        <>
          <p>
            You retain ownership of the videos, thumbnails, and media content you upload to ViewFlow. However, by uploading content to our Platform:
          </p>
          <div className="my-3 p-4 rounded-2xl bg-brand-card/80 border border-brand-border text-xs leading-relaxed">
            <strong>Worldwide License Grant:</strong> You grant ViewFlow a non-exclusive, worldwide, royalty-free license to host, stream, display, reformat, and distribute your content across our global delivery infrastructure.
          </div>
          <p>
            You represent and warrant that your uploads do not infringe upon any third-party copyright, trademark, privacy, or intellectual property rights. Repeated copyright violations will result in permanent account termination under DMCA policies.
          </p>
        </>
      ),
    },
    {
      id: 'ai-services',
      icon: Cpu,
      title: '4. Gemini AI Assistant & Generated Content',
      content: (
        <>
          <p>
            ViewFlow incorporates Google Gemini AI to offer real-time video summaries, recommendation assistance, search queries, and content moderation.
          </p>
          <p className="mt-2">
            AI-generated responses are provided for informational and navigational purposes. While we strive for high precision, ViewFlow does not guarantee the complete accuracy of machine-generated video transcripts or automated responses.
          </p>
        </>
      ),
    },
    {
      id: 'prohibited',
      icon: AlertTriangle,
      title: '5. Prohibited Conduct & Community Rules',
      content: (
        <>
          <p>When using ViewFlow, you strictly agree NOT to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-brand-muted">
            <li>Upload hate speech, explicit violence, harassment, or illegal content.</li>
            <li>Use automated bots, scrapers, or exploits to manipulate video view counts, likes, or subscriber metrics.</li>
            <li>Attempt to bypass rate limits, access control lists, or private streaming endpoints.</li>
            <li>Distribute malware, phishing links, or unauthorized advertising spam in comment sections.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'termination',
      icon: ShieldAlert,
      title: '6. Account Suspension & Platform Modifications',
      content: (
        <>
          <p>
            ViewFlow reserves the right to modify, suspend, or discontinue any feature, API endpoint, or service component at any time without prior notice. We may terminate or restrict access to users who violate these Terms of Service.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-10 px-4 md:px-12 max-w-[1200px] mx-auto select-none">
      {/* Top Header */}
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-text mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-brand-card via-brand-bg to-brand-card border border-brand-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-primary text-xs font-bold">
              <FileText size={14} /> Legal Documentation
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-brand-text tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs md:text-sm text-brand-muted font-medium">
              Effective Date: July 2026 • Version 2.4
            </p>
          </div>
          <a
            href="mailto:pg9810487@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-card hover:bg-brand-border border border-brand-border text-xs font-bold text-brand-text transition-all self-start md:self-auto shrink-0"
          >
            Legal Inquiry <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Table of Contents */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-5 rounded-2xl bg-brand-card/80 border border-brand-border backdrop-blur-md space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-text border-l-2 border-brand-primary pl-2">
              On this page
            </h3>
            <nav className="flex flex-col space-y-1">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="text-xs text-brand-muted hover:text-brand-primary font-semibold py-1.5 px-2 rounded-lg hover:bg-brand-primary/10 transition-all"
                >
                  {sec.title.split('.')[1]}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Sections Content */}
        <div className="lg:col-span-3 space-y-6">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                id={sec.id}
                className="p-6 md:p-8 rounded-3xl bg-brand-card/60 border border-brand-border backdrop-blur-sm space-y-4 hover:border-brand-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-brand-primary/15 text-brand-primary border border-brand-primary/20">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-brand-text">{sec.title}</h2>
                </div>
                <div className="text-xs md:text-sm text-brand-muted leading-relaxed font-medium">
                  {sec.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
