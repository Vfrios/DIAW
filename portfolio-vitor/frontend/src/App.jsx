import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';
import { ui } from './i18n.js';
import About from './pages/About.jsx';
import Projects from './pages/Projects.jsx';
import Experiences from './pages/Experiences.jsx';
import Contact from './pages/Contact.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'pt');
  const location = useLocation();
  const t = ui[lang];

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  // Volta ao topo ao trocar de página.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const pages = [
    { to: '/', key: 'about' },
    { to: '/projetos', key: 'projects' },
    { to: '/experiencias', key: 'experiences' },
    { to: '/contato', key: 'contact' },
  ];

  return (
    <div className="shell">
      <aside className="side">
        <div className="side-top">
          <NavLink to="/" className="brand" aria-label="Vitor Rios">
            <span>Vitor</span>
            <span>Rios</span>
          </NavLink>
        </div>

        <div className="side-body">
          <p className="side-role">{data ? data.role[lang] : ''}</p>

          <nav aria-label={t.menu}>
            <ul className="nav">
              {pages.map((p) => (
                <li key={p.to}>
                  <NavLink to={p.to} end={p.to === '/'}>
                    {t.nav[p.key]}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="side-foot">
            <div className="lang" role="group" aria-label="Idioma / Language">
              <button className={lang === 'pt' ? 'on' : ''} onClick={() => setLang('pt')} aria-pressed={lang === 'pt'}>
                PT
              </button>
              <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>
                EN
              </button>
            </div>
            {data && (
              <div className="social">
                <a href={`mailto:${data.links.email}`} aria-label="E-mail"><Mail size={20} /></a>
                <a href={data.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
                <a href={data.links.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={20} /></a>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="main">
        <main className="content">
          {error && <p className="state">{t.loadError}</p>}
          {!error && !data && <p className="state">{t.loading}</p>}
          {data && (
            <Routes>
              <Route path="/" element={<About data={data} lang={lang} t={t} />} />
              <Route path="/projetos" element={<Projects data={data} lang={lang} t={t} />} />
              <Route path="/experiencias" element={<Experiences data={data} lang={lang} t={t} />} />
              <Route path="/contato" element={<Contact data={data} lang={lang} t={t} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} Vitor Rios</span>
          <span>{t.footer}</span>
        </footer>
      </div>
    </div>
  );
}
