import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Syne:wght@600;700;800&display=swap');

  .cb-page {
    min-height: 100vh;
    background: linear-gradient(120deg, #141414 0%, #141414 46%, #F5F0E8 46%, #F5F0E8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
  }

  .cb-card {
    width: min(560px, 100%);
    border: 1px solid rgba(200, 184, 154, 0.45);
    background: rgba(245, 240, 232, 0.96);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
    padding: 28px;
  }

  .cb-kicker {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #8B6340;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .cb-kicker::before {
    content: '';
    width: 20px;
    height: 1px;
    background: #8B6340;
  }

  .cb-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    line-height: 1.1;
    letter-spacing: -1px;
    color: #141414;
    margin: 10px 0 6px;
  }

  .cb-title em {
    font-style: italic;
    color: #8B6340;
    font-weight: 600;
  }

  .cb-sub {
    color: #6e5f52;
    font-size: 14px;
    margin-bottom: 18px;
  }

  .cb-progress {
    height: 3px;
    background: #dbcdb8;
    overflow: hidden;
    position: relative;
  }

  .cb-progress::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 40%;
    background: #141414;
    animation: cbSlide 1.1s ease-in-out infinite;
  }

  @keyframes cbSlide {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(260%); }
  }
`;

function decodeRoleFromJwt(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(normalized));
    return decoded?.role || null;
  } catch (err) {
    return null;
  }
}

function roleDashboardPath(role) {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TECHNICIAN':
      return '/technician/dashboard';
    case 'MANAGER':
      return '/manager/dashboard';
    default:
      return '/user/dashboard';
  }
}

export default function AuthCallbackPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Extract the token from the URL (e.g., ?token=eyJhbG...)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const msg = params.get('msg');

    if (token) {
      // 2. Call the login function from AuthContext to save token to localStorage
      login(token);
      if (msg) {
        alert(msg);
      }

      // Redirect directly to the dashboard that matches the JWT role claim.
      const role = decodeRoleFromJwt(token);
      navigate(roleDashboardPath(role), { replace: true });
    } else {
      // 4. If no token is found, something went wrong, send back to login
      console.error("No token found in callback URL");
      navigate('/login', { replace: true });
    }
  }, [login, navigate]);

  return (
    <div className="cb-page">
      <style>{styles}</style>
      <div className="cb-card">
        <div className="cb-kicker">Authentication</div>
        <h1 className="cb-title">Preparing your <em>workspace</em>.</h1>
        <p className="cb-sub">We are finishing Google sign-in and routing you to the correct dashboard.</p>
        <div className="cb-progress" />
      </div>
    </div>
  );
}