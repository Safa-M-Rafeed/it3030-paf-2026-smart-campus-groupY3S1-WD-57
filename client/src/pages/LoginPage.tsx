import { useState } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Syne:wght@600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { height: 100%; }

  .sc-page {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    height: 100vh;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── LEFT ── */
  .sc-left {
    background: #141414;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 44px 52px;
    position: relative;
    overflow: hidden;
  }
  .sc-left::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      -55deg, transparent, transparent 80px,
      rgba(255,255,255,0.012) 80px, rgba(255,255,255,0.012) 81px
    );
    pointer-events: none;
  }
  .sc-ghost {
    position: absolute;
    bottom: -60px; left: -16px;
    font-family: 'Syne', sans-serif;
    font-size: 148px; font-weight: 800;
    color: rgba(255,255,255,0.028);
    line-height: 0.85; letter-spacing: -8px;
    pointer-events: none; user-select: none;
    white-space: nowrap;
  }
  .sc-topbar {
    display: flex; align-items: center; justify-content: space-between;
    position: relative; z-index: 2;
    animation: scFadeUp 0.5s ease both;
  }
  .sc-brand { display: flex; align-items: center; gap: 12px; }
  .sc-brand-box {
    width: 36px; height: 36px;
    background: #F5F0E8;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 900; color: #141414;
  }
  .sc-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,0.55);
    text-transform: uppercase;
  }
  .sc-brand-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #C8B89A;
    box-shadow: 0 0 10px rgba(200,184,154,0.6);
    animation: scPulse 2.5s ease-in-out infinite;
  }
  .sc-hero {
    flex: 1;
    display: flex; flex-direction: column; justify-content: center;
    padding: 48px 0 32px;
    position: relative; z-index: 2;
  }
  .sc-eyebrow {
    font-size: 11px; font-weight: 600;
    letter-spacing: 2.5px; color: #C8B89A;
    text-transform: uppercase;
    margin-bottom: 20px;
    display: flex; align-items: center; gap: 10px;
    animation: scFadeUp 0.5s 0.1s ease both;
  }
  .sc-eyebrow::before {
    content: ''; display: block;
    width: 24px; height: 1px; background: #C8B89A;
  }
  .sc-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(42px, 4vw, 58px);
    font-weight: 900; line-height: 1.02;
    letter-spacing: -1.5px; color: #FFFFFF;
    margin-bottom: 28px;
    animation: scFadeUp 0.5s 0.15s ease both;
  }
  .sc-headline em { font-style: italic; font-weight: 600; color: #C8B89A; }
  .sc-indent { display: block; padding-left: 48px; }
  .sc-desc {
    font-size: 14.5px; color: rgba(255,255,255,0.38);
    line-height: 1.75; max-width: 340px; font-weight: 300;
    animation: scFadeUp 0.5s 0.2s ease both;
  }
  .sc-modules { position: relative; z-index: 2; animation: scFadeUp 0.5s 0.25s ease both; }
  .sc-modules-hdr {
    font-size: 10px; font-weight: 600; letter-spacing: 2px;
    color: rgba(255,255,255,0.2); text-transform: uppercase;
    margin-bottom: 12px;
  }
  .sc-mod-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    transition: padding-left 0.2s;
    cursor: default;
  }
  .sc-mod-row:last-child { border-bottom: 1px solid rgba(255,255,255,0.06); }
  .sc-mod-row:hover { padding-left: 8px; }
  .sc-mod-row:hover .sc-mod-name { color: #fff; }
  .sc-mod-left { display: flex; align-items: center; gap: 12px; }
  .sc-mod-num {
    font-family: 'Playfair Display', serif;
    font-size: 11px; font-style: italic;
    color: rgba(255,255,255,0.2); width: 20px;
  }
  .sc-mod-name {
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.65);
    transition: color 0.2s;
  }
  .sc-mod-tag {
    font-size: 9px; font-weight: 700;
    letter-spacing: 1.5px; color: rgba(200,184,154,0.6);
    text-transform: uppercase;
    background: rgba(200,184,154,0.06);
    padding: 3px 8px;
    border: 1px solid rgba(200,184,154,0.12);
  }
  .sc-stats {
    display: flex;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 24px;
    position: relative; z-index: 2;
    animation: scFadeUp 0.5s 0.3s ease both;
  }
  .sc-stat { flex: 1; text-align: center; }
  .sc-stat + .sc-stat { border-left: 1px solid rgba(255,255,255,0.06); }
  .sc-stat-n {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; color: #fff;
  }
  .sc-stat-l { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 3px; letter-spacing: 0.5px; }

  /* ── RIGHT ── */
  .sc-right {
    background: #F5F0E8;
    display: flex; flex-direction: column;
    justify-content: center;
    padding: 44px 56px;
    position: relative; overflow: hidden;
  }
  .sc-deco {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(26,26,26,0.06);
    pointer-events: none;
  }
  .sc-deco-1 { width: 400px; height: 400px; top: -160px; right: -160px; }
  .sc-deco-2 { width: 600px; height: 600px; top: -260px; right: -260px; }
  .sc-deco-3 { width: 800px; height: 800px; top: -360px; right: -360px; }

  .sc-form-wrap {
    max-width: 380px; width: 100%;
    animation: scFadeUp 0.5s 0.2s ease both;
  }
  .sc-form-eyebrow {
    font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
    color: #B8967A; text-transform: uppercase;
    margin-bottom: 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .sc-form-eyebrow::before { content: ''; display: block; width: 20px; height: 1px; background: #B8967A; }
  .sc-form-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px; font-weight: 900;
    letter-spacing: -1px; color: #141414;
    margin-bottom: 4px; line-height: 1.1;
  }
  .sc-form-title em { font-style: italic; font-weight: 600; color: #8B6340; }
  .sc-form-sub {
    font-size: 14px; color: #9B8B7A;
    margin-bottom: 36px; font-weight: 300; line-height: 1.5;
  }

  /* Google button */
  .sc-btn-google {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 14px 20px;
    background: transparent;
    border: 1.5px solid #D4C9B5;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: #4A3728;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative; overflow: hidden;
    margin-bottom: 8px;
  }
  .sc-btn-google::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 0;
    background: #141414;
    transition: width 0.3s ease; z-index: 0;
  }
  .sc-btn-google:hover::before { width: 100%; }
  .sc-btn-google:hover { color: #F5F0E8; border-color: #141414; }
  .sc-btn-google:hover .sc-g-icon { filter: brightness(10); }
  .sc-g-icon { position: relative; z-index: 1; transition: filter 0.3s; }
  .sc-g-text { position: relative; z-index: 1; }

  .sc-or { display: flex; align-items: center; gap: 14px; margin: 20px 0; }
  .sc-or-line { flex: 1; height: 1px; background: #D4C9B5; }
  .sc-or-text { font-size: 11px; color: #C4B5A0; letter-spacing: 1px; font-weight: 500; }

  /* Tabs */
  .sc-tabs {
    display: flex;
    border-bottom: 2px solid #D4C9B5;
    margin-bottom: 28px;
  }
  .sc-tab {
    flex: 1; padding: 10px;
    background: transparent; border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: #9B8B7A; cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
  }
  .sc-tab.active { color: #141414; border-bottom-color: #141414; }
  .sc-tab:hover:not(.active) { color: #4A3728; }

  /* Fields */
  .sc-field { margin-bottom: 22px; }
  .sc-field-label {
    display: block;
    font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #9B8B7A; margin-bottom: 8px;
  }
  .sc-field-input {
    width: 100%; padding: 13px 0;
    background: transparent;
    border: none; border-bottom: 1.5px solid #D4C9B5;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; color: #141414;
    outline: none; transition: border-color 0.2s;
  }
  .sc-field-input::placeholder { color: #C4B5A0; }
  .sc-field-input:focus { border-bottom-color: #141414; }

  /* Primary button */
  .sc-btn-primary {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 16px 24px;
    background: #141414; border: none;
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: #F5F0E8; cursor: pointer;
    transition: color 0.3s;
    position: relative; overflow: hidden;
    margin-top: 8px;
  }
  .sc-btn-primary::before {
    content: '';
    position: absolute; inset: 0;
    background: #C8B89A;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .sc-btn-primary:hover::before { transform: translateX(0); }
  .sc-btn-primary:hover { color: #141414; }
  .sc-btn-primary span,
  .sc-btn-arrow { position: relative; z-index: 1; }
  .sc-btn-arrow { font-size: 18px; transition: transform 0.2s; }
  .sc-btn-primary:hover .sc-btn-arrow { transform: translateX(4px); }

  .sc-terms {
    margin-top: 20px;
    font-size: 11px; color: #B8A898; line-height: 1.6;
  }
  .sc-terms a { color: #8B6340; text-decoration: none; border-bottom: 1px solid rgba(139,99,64,0.3); }
  .sc-version {
    position: absolute; bottom: 24px; right: 24px;
    font-size: 10px; color: #C4B5A0; letter-spacing: 1px;
    font-family: 'DM Sans', sans-serif;
  }

  @keyframes scFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scPulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.5; transform: scale(0.8); }
  }
`;

export default function LoginPage() {
  const [tab, setTab] = useState('signin');
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sc-page">

        {/* ── LEFT PANEL ── */}
        <div className="sc-left">
          <div className="sc-ghost">SMART{'\n'}CAMPUS</div>

          <div className="sc-topbar">
            <div className="sc-brand">
              <div className="sc-brand-box">S</div>
              <div className="sc-brand-name">SmartCampus Hub</div>
            </div>
            <div className="sc-brand-dot" />
          </div>

          <div className="sc-hero">
            <div className="sc-eyebrow">IT3030 PAF Assignment 2026</div>
            <div className="sc-headline">
              Campus<br />
              <em>operations,</em>
              <span className="sc-indent">reimagined.</span>
            </div>
            <div className="sc-desc">
              A unified platform built for SLIIT — manage bookings, incidents,
              notifications, and analytics all from one intelligent hub.
            </div>
          </div>

          <div className="sc-modules">
            <div className="sc-modules-hdr">System Modules</div>
            {[
              { num: 'i.',   name: 'Facilities & Booking',  tag: 'Module A+B' },              { num: 'ii.',  name: 'Incident Ticketing',    tag: 'Module C'   },              { num: 'iii.', name: 'Notifications & OAuth', tag: 'Module D+E' },              { num: 'iv.',  name: 'Reports & Analytics',   tag: 'Module F'   },            ].map(m => (
              <div className="sc-mod-row" key={m.num}>
                <div className="sc-mod-left">
                  <span className="sc-mod-num">{m.num}</span>
                  <span className="sc-mod-name">{m.name}</span>
                </div>
                <span className="sc-mod-tag">{m.tag}</span>
              </div>
            ))}
          </div>

          <div className="sc-stats">
            {[['5','Members'],['35+','Endpoints'],['3','Roles'],['6','Modules']].map(([n,l]) => (
              <div className="sc-stat" key={l}>
                <div className="sc-stat-n">{n}</div>
                <div className="sc-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="sc-right">
          <div className="sc-deco sc-deco-1" />
          <div className="sc-deco sc-deco-2" />
          <div className="sc-deco sc-deco-3" />

          <div className="sc-form-wrap">
            <div className="sc-form-eyebrow">Secure Access</div>
            <div className="sc-form-title">
              Welcome<br /><em>back.</em>
            </div>
            <div className="sc-form-sub">
              Sign in to your campus account to continue.
            </div>

            {/* Google OAuth */}
            <button className="sc-btn-google" onClick={handleGoogle}>
              <svg className="sc-g-icon" width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="sc-g-text">Continue with Google</span>
            </button>

            <div className="sc-or">
              <div className="sc-or-line" />
              <span className="sc-or-text">OR</span>
              <div className="sc-or-line" />
            </div>

            {/* Tabs */}
            <div className="sc-tabs">
              <button
                className={`sc-tab ${tab === 'signin' ? 'active' : ''}`}
                onClick={() => setTab('signin')}
              >Sign in</button>
              <button
                className={`sc-tab ${tab === 'signup' ? 'active' : ''}`}
                onClick={() => setTab('signup')}
              >Sign up</button>
            </div>

            {/* Sign In */}
            {tab === 'signin' && (
              <div>
                <div className="sc-field">
                  <label className="sc-field-label">Email Address</label>
                  <input className="sc-field-input" type="email" placeholder="you@sliit.lk" />
                </div>
                <div className="sc-field">
                  <label className="sc-field-label">Password</label>
                  <input className="sc-field-input" type="password" placeholder="••••••••" />
                </div>
                <button className="sc-btn-primary" onClick={handleSubmit}>
                  <span>{loading ? 'Please wait...' : 'Sign in'}</span>
                  <span className="sc-btn-arrow">→</span>
                </button>
              </div>
            )}

            {/* Sign Up */}
            {tab === 'signup' && (
              <div>
                <div className="sc-field">
                  <label className="sc-field-label">Full Name</label>
                  <input className="sc-field-input" type="text" placeholder="Kasun Perera" />
                </div>
                <div className="sc-field">
                  <label className="sc-field-label">Email Address</label>
                  <input className="sc-field-input" type="email" placeholder="you@sliit.lk" />
                </div>
                <div className="sc-field">
                  <label className="sc-field-label">Password</label>
                  <input className="sc-field-input" type="password" placeholder="••••••••" />
                </div>
                <button className="sc-btn-primary" onClick={handleSubmit}>
                  <span>{loading ? 'Please wait...' : 'Create account'}</span>
                  <span className="sc-btn-arrow">→</span>
                </button>
              </div>
            )}

            <div className="sc-terms">
              By continuing you agree to our <a href="#">Terms of Service</a> and{' '}
              <a href="#">Privacy Policy</a>.
            </div>
          </div>

          <div className="sc-version">IT3030 · SLIIT · 2026</div>
        </div>

      </div>
    </>
  );
}