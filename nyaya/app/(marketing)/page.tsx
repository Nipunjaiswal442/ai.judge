"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <style dangerouslySetInnerHTML={{
        __html: `
        .landing-page {
          --navy-900: #061735;
          --navy-800: #0a1f44;
          --navy-700: #0f2e63;
          --navy-600: #1e3a8a;
          --navy-500: #2c4ba3;
          --navy-300: #6b7fbf;
          --gold: #c9a227;
          --gold-muted: #a88818;
          --ink: #0f172a;
          --muted: #475569;
          --muted-2: #64748b;
          --hairline: #e2e8f0;
          --surface: #ffffff;
          --surface-soft: #f8fafc;
          --surface-soft-2: #f1f5f9;
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--ink);
          background: var(--surface);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .landing-page .serif { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.01em; }
        .landing-page .mono { font-family: 'JetBrains Mono', monospace; }
        .landing-page .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

        /* ---------- NAV ---------- */
        .landing-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(6, 23, 53, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .nav-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.5rem; max-width: 1200px; margin: 0 auto;
        }
        .landing-logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
        .logo-mark {
          width: 32px; height: 32px; border-radius: 6px;
          background: linear-gradient(135deg, #1e3a8a, #0a1f44);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(201, 162, 39, 0.4);
        }
        .logo-mark span { color: var(--gold); font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; }
        .logo-text { color: #fff; font-family: 'Fraunces', serif; font-size: 1.4rem; font-weight: 500; }
        .logo-text .dev { color: rgba(255, 255, 255, 0.55); font-size: 0.85rem; margin-left: 0.3rem; font-family: 'Inter'; }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a {
          color: rgba(255, 255, 255, 0.75); text-decoration: none; font-size: 0.93rem;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #fff; }
        .nav-cta {
          background: #fff; color: var(--navy-800) !important;
          padding: 0.55rem 1.1rem; border-radius: 6px; font-weight: 500;
          transition: transform 0.15s;
          text-decoration: none;
        }
        .nav-cta:hover { transform: translateY(-1px); }
        .mobile-nav-toggle { display: none; }

        /* ---------- HERO ---------- */
        .landing-hero {
          position: relative;
          background: linear-gradient(135deg, #061735 0%, #0a1f44 45%, #1e3a8a 100%);
          color: #fff;
          padding: 5rem 0 7rem;
          overflow: hidden;
        }
        .landing-hero::before {
          content: ""; position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(201, 162, 39, 0.08), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(107, 127, 191, 0.12), transparent 50%);
          pointer-events: none;
        }
        .hero-chakra {
          position: absolute;
          right: -150px; bottom: -150px;
          width: 520px; height: 520px;
          opacity: 0.05;
          pointer-events: none;
        }
        .hero-inner { position: relative; z-index: 2; text-align: center; max-width: 820px; margin: 0 auto; padding: 0 1.5rem; }
        .pre-launch-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.35);
          color: var(--gold);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 500;
          margin-bottom: 2rem;
          letter-spacing: 0.02em;
        }
        .pre-launch-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 0 4px rgba(201, 162, 39, 0.2);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .hero-devanagari {
          font-family: 'Fraunces', serif;
          font-size: 1.8rem;
          color: rgba(201, 162, 39, 0.7);
          margin-bottom: 0.4rem;
          font-weight: 400;
        }
        .landing-hero h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
        }
        .hero-tagline {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.78);
          margin-bottom: 2rem;
          font-style: italic;
          font-family: 'Fraunces', serif;
        }
        .hero-description {
          font-size: 1.05rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 620px;
          margin: 0 auto 2.75rem;
          line-height: 1.7;
        }
        .hero-ctas {
          display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .landing-btn {
          padding: 0.9rem 1.75rem;
          border-radius: 8px;
          font-size: 0.98rem;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .btn-primary {
          background: #fff; color: var(--navy-800);
          border: 1px solid #fff;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255, 255, 255, 0.15); }
        .btn-secondary {
          background: transparent; color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .btn-secondary:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.5); }
        .btn-arrow { font-size: 1.1rem; transition: transform 0.2s; }
        .landing-btn:hover .btn-arrow { transform: translateX(3px); }

        .hero-status-row {
          display: flex; justify-content: center; gap: 2.5rem;
          flex-wrap: wrap;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .status-item { text-align: center; }
        .status-label {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.35rem;
        }
        .status-value {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        /* ---------- DISCLOSURE BANNER ---------- */
        .disclosure {
          background: #fffbeb;
          border-top: 1px solid #fde68a;
          border-bottom: 1px solid #fde68a;
          padding: 1rem 0;
        }
        .disclosure-inner {
          display: flex; align-items: flex-start; gap: 0.75rem;
          max-width: 900px; margin: 0 auto; padding: 0 1.5rem;
          font-size: 0.88rem;
          color: #78350f;
          line-height: 1.6;
        }
        .disclosure-icon {
          flex-shrink: 0;
          width: 20px; height: 20px;
          background: #f59e0b;
          color: #fff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem;
          font-weight: 600;
          margin-top: 1px;
        }
        .disclosure strong { color: #78350f; font-weight: 600; }

        /* ---------- SECTION BASE ---------- */
        section.landing-content { padding: 5.5rem 0; }
        section.landing-content.alt { background: var(--surface-soft); }
        .section-header { text-align: center; max-width: 720px; margin: 0 auto 3.5rem; }
        .landing-eyebrow {
          font-size: 0.78rem;
          color: var(--navy-600);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 500;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin-bottom: 1rem;
        }
        .section-desc {
          font-size: 1.08rem;
          color: var(--muted);
          line-height: 1.7;
        }

        /* ---------- PROBLEM SECTION ---------- */
        .problem-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
        }
        .problem-card {
          background: var(--surface);
          border: 1px solid var(--hairline);
          border-radius: 12px;
          padding: 2rem;
          transition: all 0.25s;
        }
        .problem-card:hover {
          border-color: var(--navy-300);
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(6, 23, 53, 0.08);
        }
        .problem-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, var(--navy-600), var(--navy-800));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem;
          color: #fff;
        }
        .problem-icon svg { width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 2; }
        .problem-card h3 {
          font-family: 'Fraunces', serif;
          font-size: 1.35rem;
          font-weight: 500;
          margin-bottom: 0.6rem;
          color: var(--ink);
        }
        .problem-card p {
          color: var(--muted);
          font-size: 0.95rem;
          line-height: 1.7;
        }

        /* ---------- HOW IT WORKS ---------- */
        .flow {
          max-width: 900px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 1rem;
        }
        .flow-step {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 1.5rem;
          padding: 2rem;
          background: var(--surface);
          border: 1px solid var(--hairline);
          border-radius: 12px;
          position: relative;
          transition: all 0.25s;
        }
        .flow-step:hover {
          border-color: var(--navy-300);
          box-shadow: 0 8px 24px rgba(6, 23, 53, 0.06);
        }
        .flow-number {
          font-family: 'Fraunces', serif;
          font-size: 2.75rem;
          font-weight: 500;
          color: var(--navy-600);
          line-height: 1;
          opacity: 0.9;
        }
        .flow-content h3 {
          font-family: 'Fraunces', serif;
          font-size: 1.35rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--ink);
        }
        .flow-content p {
          color: var(--muted);
          line-height: 1.7;
        }
        .flow-content .flow-who {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }
        .who-lawyer { background: rgba(30, 58, 138, 0.08); color: var(--navy-700); }
        .who-ai { background: rgba(201, 162, 39, 0.12); color: var(--gold-muted); }
        .who-judge { background: rgba(6, 23, 53, 0.08); color: var(--navy-900); }

        /* ---------- AUDIENCE SPLIT ---------- */
        .audience-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
        }
        .audience-card {
          background: linear-gradient(135deg, #061735 0%, #0a1f44 50%, #1e3a8a 100%);
          color: #fff;
          padding: 2.75rem;
          border-radius: 14px;
          position: relative;
          overflow: hidden;
        }
        .audience-card::before {
          content: ""; position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
        }
        .audience-card::after {
          content: ""; position: absolute;
          bottom: -60px; right: -60px;
          width: 200px; height: 200px;
          border: 1px solid rgba(201, 162, 39, 0.08);
          border-radius: 50%;
        }
        .audience-card .role-label {
          font-size: 0.75rem;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .audience-card h3 {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .audience-card .role-intro {
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 1.75rem;
          line-height: 1.7;
        }
        .feature-list { list-style: none; display: flex; flex-direction: column; gap: 0.85rem; position: relative; z-index: 2; padding-left: 0; }
        .feature-list li {
          display: flex; align-items: flex-start; gap: 0.75rem;
          font-size: 0.93rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
        }
        .check-icon {
          flex-shrink: 0;
          width: 18px; height: 18px;
          background: rgba(201, 162, 39, 0.2);
          border: 1px solid rgba(201, 162, 39, 0.5);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--gold);
          font-size: 0.7rem;
          margin-top: 2px;
        }

        /* ---------- TECH / PRINCIPLES ---------- */
        .principles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          margin-top: 3rem;
        }
        .principle {
          padding: 1.75rem;
          background: var(--surface);
          border: 1px solid var(--hairline);
          border-left: 3px solid var(--navy-600);
          border-radius: 8px;
        }
        .principle h4 {
          font-family: 'Fraunces', serif;
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--ink);
        }
        .principle p {
          font-size: 0.92rem;
          color: var(--muted);
          line-height: 1.7;
        }

        /* ---------- TECH STACK ---------- */
        .tech-stack {
          display: flex; flex-wrap: wrap;
          gap: 0.6rem; justify-content: center;
          max-width: 800px; margin: 2rem auto 0;
        }
        .tech-pill {
          background: var(--surface);
          border: 1px solid var(--hairline);
          padding: 0.55rem 1.1rem;
          border-radius: 100px;
          font-size: 0.87rem;
          color: var(--muted);
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s;
        }
        .tech-pill:hover {
          border-color: var(--navy-600);
          color: var(--navy-700);
          transform: translateY(-1px);
        }

        /* ---------- STATUS SECTION ---------- */
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          max-width: 900px;
          margin: 3rem auto 0;
        }
        .status-card {
          text-align: center;
          padding: 2rem 1.5rem;
          background: var(--surface);
          border: 1px solid var(--hairline);
          border-radius: 10px;
        }
        .status-card-number {
          font-family: 'Fraunces', serif;
          font-size: 2.4rem;
          font-weight: 500;
          color: var(--navy-700);
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .status-card-label {
          font-size: 0.85rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
        }
        .status-card-note {
          font-size: 0.78rem;
          color: var(--muted-2);
          margin-top: 0.6rem;
          font-style: italic;
        }

        /* ---------- CTA ---------- */
        .cta-section {
          background: linear-gradient(135deg, #061735 0%, #0a1f44 50%, #1e3a8a 100%);
          color: #fff;
          padding: 5rem 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: ""; position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 600px;
          border: 1px solid rgba(201, 162, 39, 0.05);
          border-radius: 50%;
          pointer-events: none;
        }
        .cta-section::after {
          content: ""; position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 900px; height: 900px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 50%;
          pointer-events: none;
        }
        .cta-inner { position: relative; z-index: 2; max-width: 720px; margin: 0 auto; padding: 0 1.5rem; }
        .cta-inner .landing-eyebrow { color: var(--gold); }
        .cta-inner h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(2.2rem, 4.5vw, 3rem);
          font-weight: 500;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
          color: #fff;
        }
        .cta-inner p {
          color: rgba(255, 255, 255, 0.75);
          font-size: 1.08rem;
          line-height: 1.7;
          margin-bottom: 2.25rem;
        }

        /* ---------- FOOTER ---------- */
        .landing-footer {
          background: var(--surface-soft);
          padding: 3rem 0 2rem;
          border-top: 1px solid var(--hairline);
        }
        .footer-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
        }
        .footer-brand .logo-text { color: var(--ink); }
        .footer-brand .logo-text .dev { color: var(--muted-2); }
        .footer-brand p {
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.7;
          max-width: 340px;
          margin-top: 1rem;
        }
        .footer-col h5 {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--ink);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.55rem; padding-left: 0; }
        .footer-col a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .footer-col a:hover { color: var(--navy-700); }
        .footer-bottom {
          max-width: 1200px; margin: 2.5rem auto 0; padding: 1.75rem 1.5rem 0;
          border-top: 1px solid var(--hairline);
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
          font-size: 0.82rem;
          color: var(--muted-2);
        }
        .footer-bottom a { color: var(--muted-2); text-decoration: none; }
        .footer-bottom a:hover { color: var(--navy-700); }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-links.active {
            display: flex; flex-direction: column;
            position: absolute; top: 100%; left: 0; right: 0;
            background: var(--navy-900);
            padding: 1.5rem;
            gap: 1.25rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .mobile-nav-toggle {
            display: flex; flex-direction: column; gap: 4px;
            background: transparent; border: none; cursor: pointer;
            padding: 0.5rem;
          }
          .mobile-nav-toggle span { width: 22px; height: 2px; background: #fff; border-radius: 2px; }
          .landing-hero { padding: 3.5rem 0 5rem; }
          .flow-step { grid-template-columns: 1fr; gap: 0.75rem; padding: 1.75rem; }
          .flow-number { font-size: 2rem; }
          .footer-inner { grid-template-columns: 1fr; gap: 2.5rem; }
          .audience-card { padding: 2rem; }
          section.landing-content { padding: 4rem 0; }
          .hero-status-row { gap: 1.5rem; }
        }
        `
      }} />

      <nav className="landing-nav">
        <div className="nav-inner">
          <a href="#" className="landing-logo">
            <div className="logo-mark"><span>न्</span></div>
            <span className="logo-text">Nyāya <span className="dev">/ न्याय</span></span>
          </a>
          <div className="nav-links" id="navLinks">
            <a href="#problem">The problem</a>
            <a href="#how">How it works</a>
            <a href="#audience">Who it's for</a>
            <a href="#principles">Principles</a>
            <Link href="/sign-in" className="nav-cta">Sign in</Link>
          </div>
          <button className="mobile-nav-toggle" onClick={() => document.getElementById('navLinks')?.classList.toggle('active')}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <header className="landing-hero">
        <svg className="hero-chakra" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="0.3">
          <circle cx="50" cy="50" r="48" />
          <circle cx="50" cy="50" r="6" fill="white" />
          <g>
            <line x1="50" y1="2" x2="50" y2="98" />
            <line x1="2" y1="50" x2="98" y2="50" />
            <line x1="16" y1="16" x2="84" y2="84" />
            <line x1="84" y1="16" x2="16" y2="84" />
            <line x1="32" y1="5" x2="68" y2="95" />
            <line x1="68" y1="5" x2="32" y2="95" />
            <line x1="5" y1="32" x2="95" y2="68" />
            <line x1="95" y1="32" x2="5" y2="68" />
            <line x1="24" y1="8" x2="76" y2="92" />
            <line x1="76" y1="8" x2="24" y2="92" />
            <line x1="8" y1="24" x2="92" y2="76" />
            <line x1="92" y1="24" x2="8" y2="76" />
          </g>
        </svg>

        <div className="hero-inner">
          <div className="pre-launch-badge">
            <span className="pre-launch-dot"></span>
            <span>Pre-launch · In active development · 0 users</span>
          </div>

          <div className="hero-devanagari">न्याय</div>
          <h1>Clarity for the bench.<br/>Structure for the bar.</h1>
          <p className="hero-tagline">An AI-assisted case analysis platform for Indian consumer disputes.</p>
          <p className="hero-description">
            Nyāya is a neutral case-structuring layer between lawyers and judges. It guides counsel on both sides through a structured question set, then generates an advisory analysis brief to help judges comprehend cases faster. It does not produce verdicts.
          </p>

          <div className="hero-ctas">
            <Link href="/sign-in?role=JUDGE" className="landing-btn btn-primary">
              Judge access
              <span className="btn-arrow">→</span>
            </Link>
            <Link href="/sign-in?role=LAWYER" className="landing-btn btn-secondary">
              Lawyer access
              <span className="btn-arrow">→</span>
            </Link>
          </div>

          <div className="hero-status-row">
            <div className="status-item">
              <div className="status-label">Stage</div>
              <div className="status-value">MVP in build</div>
            </div>
            <div className="status-item">
              <div className="status-label">Scope</div>
              <div className="status-value">Consumer disputes</div>
            </div>
            <div className="status-item">
              <div className="status-label">Pilot status</div>
              <div className="status-value">Seeking partners</div>
            </div>
          </div>
        </div>
      </header>

      <div className="disclosure">
        <div className="disclosure-inner">
          <div className="disclosure-icon">!</div>
          <div>
            <strong>Advisory tool — not a decision-maker.</strong> Nyāya produces structured analysis to assist human review. It does not render verdicts, replace legal counsel, or substitute for judicial reasoning. This is an independent academic/portfolio project by a VIT-AP student; it is not affiliated with any court, bar council, or government body.
          </div>
        </div>
      </div>

      <section className="landing-content" id="problem">
        <div className="container">
          <div className="section-header">
            <div className="landing-eyebrow">The problem</div>
            <h2 className="section-title">Consumer cases in India move slowly. The bottleneck is structure, not intent.</h2>
            <p className="section-desc">
              District consumer commissions are flooded. Lawyers submit unstructured pleadings; judges spend meaningful time synthesizing scattered arguments before they can decide. No neutral layer exists between the two.
            </p>
          </div>

          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3>Long disposal times</h3>
              <p>The Consumer Protection Act, 2019 targets disposal within statutory timelines. Public reporting suggests many commissions struggle to meet them. (Exact current figures vary by state and year — verify before citing.)</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              </div>
              <h3>Unstructured submissions</h3>
              <p>Each side files material in its own format. There's no enforced schema that ensures both have addressed the same core questions — limitation, jurisdiction, evidentiary basis, quantum of relief.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3>Judges carry the synthesis load</h3>
              <p>Reading long pleadings, identifying disputed facts, and locating applicable precedent is slow, manual work. A structured brief — clearly advisory — could compress that prep time meaningfully.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-content alt" id="how">
        <div className="container">
          <div className="section-header">
            <div className="landing-eyebrow">How it works</div>
            <h2 className="section-title">Four stages, one record.</h2>
            <p className="section-desc">
              Each stage produces a traceable artifact. Nothing the AI outputs is hidden from source — every claim links back to the underlying submission or precedent.
            </p>
          </div>

          <div className="flow">
            <div className="flow-step">
              <div className="flow-number">01</div>
              <div className="flow-content">
                <span className="flow-who who-lawyer">Complainant lawyer</span>
                <h3>File the case</h3>
                <p>Select the consumer dispute category, enter party details, specify relief sought. The system generates a case ID and invites opposing counsel via email.</p>
              </div>
            </div>

            <div className="flow-step">
              <div className="flow-number">02</div>
              <div className="flow-content">
                <span className="flow-who who-ai">Structured Q&A</span>
                <h3>Both sides answer guided questions</h3>
                <p>The AI asks each side category-specific questions drawn from a curated template. It checks for completeness and requests follow-ups where answers are vague. Documents attach per answer. Neither side sees the other's draft.</p>
              </div>
            </div>

            <div className="flow-step">
              <div className="flow-number">03</div>
              <div className="flow-content">
                <span className="flow-who who-ai">Analysis brief generated</span>
                <h3>Structured summary for the judge</h3>
                <p>Once both sides submit, the AI produces an eight-section brief: case summary, agreed facts, disputed facts, applicable law, relevant precedents (from a curated set — no fabrication), procedural flags, evidentiary gaps, and caveats.</p>
              </div>
            </div>

            <div className="flow-step">
              <div className="flow-number">04</div>
              <div className="flow-content">
                <span className="flow-who who-judge">Judge reviews</span>
                <h3>Human decision, fully informed</h3>
                <p>The judge reviews the brief, clicks through to source material, adds private notes, and acknowledges the case as reviewed. Nyāya produces no verdict and recommends no outcome. The judicial order remains entirely the judge's.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-content" id="audience">
        <div className="container">
          <div className="section-header">
            <div className="landing-eyebrow">Who it's for</div>
            <h2 className="section-title">Dual interface. One case record.</h2>
            <p className="section-desc">
              Lawyers and judges see different views of the same case. Each interface is designed for its user's workflow — not a single tool awkwardly serving both.
            </p>
          </div>

          <div className="audience-grid">
            <div className="audience-card">
              <div className="role-label">For lawyers</div>
              <h3>Prepare faster. Submit cleaner.</h3>
              <p className="role-intro">Guided questions mean nothing is missed. Your submission is already structured the way the bench prefers to read it.</p>
              <ul className="feature-list">
                <li><span className="check-icon">✓</span><span>Category-specific question templates curated from consumer case patterns</span></li>
                <li><span className="check-icon">✓</span><span>AI flags vague or incomplete answers before you submit</span></li>
                <li><span className="check-icon">✓</span><span>Document vault organized per question, not per case dump</span></li>
                <li><span className="check-icon">✓</span><span>Deadline tracker and opposing-side submission status</span></li>
              </ul>
            </div>

            <div className="audience-card">
              <div className="role-label">For judges</div>
              <h3>Comprehend first. Decide with clarity.</h3>
              <p className="role-intro">A structured advisory brief with clickable sources. You keep full authority over the case — the brief just gets you to the decision point faster.</p>
              <ul className="feature-list">
                <li><span className="check-icon">✓</span><span>Eight-section analysis brief, labeled advisory throughout</span></li>
                <li><span className="check-icon">✓</span><span>Every AI claim links to the raw lawyer submission or precedent</span></li>
                <li><span className="check-icon">✓</span><span>Private notes autosave per case</span></li>
                <li><span className="check-icon">✓</span><span>Confidence scores and caveats surfaced — not hidden</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-content alt" id="principles">
        <div className="container">
          <div className="section-header">
            <div className="landing-eyebrow">Design principles</div>
            <h2 className="section-title">Built with guardrails, not around them.</h2>
            <p className="section-desc">
              Legal AI fails badly when it's over-trusted. These principles are enforced in the product — not just stated in marketing.
            </p>
          </div>

          <div className="principles-grid">
            <div className="principle">
              <h4>No verdict generation</h4>
              <p>The word "verdict" appears nowhere in the product UI. Nyāya produces advisory briefs. Judicial reasoning remains with the judge.</p>
            </div>
            <div className="principle">
              <h4>Closed-set precedents</h4>
              <p>The AI may only cite from a curated, manually-reviewed precedent database. If no relevant match exists, it says so. No fabrication.</p>
            </div>
            <div className="principle">
              <h4>Every claim traceable</h4>
              <p>Every sentence in an analysis brief links back to its source — a lawyer submission or a precedent record. Sources are one click away.</p>
            </div>
            <div className="principle">
              <h4>Confidence, surfaced</h4>
              <p>The AI's self-reported uncertainty is a first-class UI element, not hidden in fine print. Low-confidence sections are visually distinct.</p>
            </div>
            <div className="principle">
              <h4>Human-in-the-loop</h4>
              <p>No case moves forward without explicit human acknowledgment at each stage. There is no autonomous path through the product.</p>
            </div>
            <div className="principle">
              <h4>Audit-first architecture</h4>
              <p>Every mutation is logged with user, timestamp, and entity. A full history is reconstructable for any case on demand.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-content" id="tech">
        <div className="container">
          <div className="section-header">
            <div className="landing-eyebrow">Under the hood</div>
            <h2 className="section-title">Modern stack. Nothing exotic.</h2>
            <p className="section-desc">
              Conventional, battle-tested infrastructure. No custom model training for v1 — the reasoning comes from a frontier LLM with strict retrieval guardrails.
            </p>
          </div>

          <div className="tech-stack">
            <span className="tech-pill">Next.js 15</span>
            <span className="tech-pill">TypeScript</span>
            <span className="tech-pill">Convex</span>
            <span className="tech-pill">Clerk</span>
            <span className="tech-pill">Tailwind CSS</span>
            <span className="tech-pill">shadcn/ui</span>
            <span className="tech-pill">DeepSeek V2 via NVIDIA NIM</span>
            <span className="tech-pill">Vector retrieval</span>
            <span className="tech-pill">Vercel</span>
          </div>
        </div>
      </section>

      <section className="landing-content alt">
        <div className="container">
          <div className="section-header">
            <div className="landing-eyebrow">Current status</div>
            <h2 className="section-title">Honest numbers.</h2>
            <p className="section-desc">
              Nothing here is inflated. Nyāya is pre-launch. These are the real figures as of today.
            </p>
          </div>

          <div className="status-grid">
            <div className="status-card">
              <div className="status-card-number">0</div>
              <div className="status-card-label">Active users</div>
              <div className="status-card-note">Pre-launch</div>
            </div>
            <div className="status-card">
              <div className="status-card-number">0</div>
              <div className="status-card-label">Cases processed</div>
              <div className="status-card-note">No live cases yet</div>
            </div>
            <div className="status-card">
              <div className="status-card-number">MVP</div>
              <div className="status-card-label">Product stage</div>
              <div className="status-card-note">In active build</div>
            </div>
            <div className="status-card">
              <div className="status-card-number">1</div>
              <div className="status-card-label">Case domain</div>
              <div className="status-card-note">Consumer disputes</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="waitlist">
        <div className="cta-inner">
          <div className="landing-eyebrow">Log In</div>
          <h2>Ready to try Nyāya?</h2>
          <p>Sign in to access your secure dashboard. Choose your designated role below.</p>
          <div className="cta-form" style={{ justifyContent: 'center' }}>
            <Link href="/sign-in?role=JUDGE" className="landing-btn btn-primary" style={{ minWidth: '180px', justifyContent: 'center' }}>Judge Access</Link>
            <Link href="/sign-in?role=LAWYER" className="landing-btn btn-secondary" style={{ minWidth: '180px', justifyContent: 'center' }}>Lawyer Access</Link>
          </div>
          <p className="cta-note mt-6">ADVISORY ONLY — NOT LEGAL ADVICE</p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="#" className="landing-logo">
              <div className="logo-mark"><span>न्</span></div>
              <span className="logo-text">Nyāya <span className="dev">/ न्याय</span></span>
            </a>
            <p>AI-assisted case analysis for Indian consumer disputes. An advisory tool — not a decision-maker. Independent academic project, not affiliated with any court or government body.</p>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <ul>
              <li><a href="#how">How it works</a></li>
              <li><a href="#audience">For lawyers</a></li>
              <li><a href="#audience">For judges</a></li>
              <li><a href="#principles">Principles</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Project</h5>
            <ul>
              <li><a href="#">About</a></li>
              <li><Link href="/sign-in">Sign In</Link></li>
              <li><a href="mailto:hello@example.com">Contact</a></li>
              <li><a href="#">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Nyāya · Built at VIT-AP University</div>
          <div><a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Legal disclaimer</a></div>
        </div>
      </footer>
    </div>
  );
}
