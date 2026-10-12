export default function About({ data, lang, t }) {
  return (
    <section>
      <h1 className="hero">{data.headline[lang]}</h1>
      <p className="lead">{data.about[lang]}</p>

      <dl className="facts">
        {data.facts.map((f) => (
          <div key={f.label.en}>
            <dt>{f.label[lang]}</dt>
            <dd>{f.value[lang]}</dd>
          </div>
        ))}
      </dl>

      <h2 className="h2">{t.skills}</h2>
      <ul className="chips">
        {data.skills.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
}
