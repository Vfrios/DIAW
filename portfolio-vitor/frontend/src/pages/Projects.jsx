import { ExternalLink } from 'lucide-react';

// formata "2026-03" como "mar. de 2026" / "Mar 2026"
function formatDate(value, lang) {
  const [y, m] = value.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export default function Projects({ data, lang, t }) {
  // timeline: do mais antigo para o mais recente
  const projects = [...data.projects].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section>
      <h1 className="h1">{t.projectsTitle}</h1>
      <p className="intro">{t.projectsIntro}</p>

      <ol className="timeline">
        {projects.map((p) => (
          <li key={p.id}>
            <time dateTime={p.date}>{formatDate(p.date, lang)}</time>
            <div className="tl-body">
              <h2>{p.name}</h2>
              <p>{p.description[lang]}</p>
              <ul className="chips small">
                {p.technologies.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
              {p.image && <img src={p.image} alt={`${p.name}`} loading="lazy" />}
              <div className="links">
                <a className="link" href={p.repository} target="_blank" rel="noreferrer">
                  {t.repo} <ExternalLink size={16} />
                </a>
                {p.demo && (
                  <a className="link" href={p.demo} target="_blank" rel="noreferrer">
                    {t.demo} <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
