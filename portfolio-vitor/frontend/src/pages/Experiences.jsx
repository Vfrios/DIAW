export default function Experiences({ data, lang, t }) {
  return (
    <section>
      <h1 className="h1">{t.experiencesTitle}</h1>
      <p className="intro">{t.experiencesIntro}</p>

      <ul className="exp">
        {data.experiences.map((e) => (
          <li key={e.id}>
            <p className="exp-period">{e.period[lang]}</p>
            <div>
              <h2>{e.organization}</h2>
              <p className="exp-title">{e.title[lang]}</p>
              <p>{e.description[lang]}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
