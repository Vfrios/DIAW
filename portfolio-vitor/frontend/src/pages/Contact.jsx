import { useState } from 'react';
import { Github, Linkedin, Mail, MessageCircle } from 'lucide-react';

// "5531998402110" -> "(31) 99840-2110"
function formatPhone(raw) {
  const d = raw.replace(/\D/g, '').replace(/^55/, '');
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : raw;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact({ data, t }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const f = t.form;

  const channels = [
    { icon: Mail, label: 'E-mail', value: data.links.email, href: `mailto:${data.links.email}` },
    { icon: Linkedin, label: 'LinkedIn', value: 'vitor-rios-dev', href: data.links.linkedin },
    { icon: Github, label: 'GitHub', value: 'Vfrios', href: data.links.github },
  ];
  if (data.links.whatsapp) {
    channels.push({
      icon: MessageCircle,
      label: 'WhatsApp',
      value: formatPhone(data.links.whatsapp),
      href: `https://wa.me/${data.links.whatsapp.replace(/\D/g, '')}`,
    });
  }

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function validate() {
    const err = {};
    if (form.name.trim().length < 2) err.name = f.errName;
    if (!EMAIL_RE.test(form.email.trim())) err.email = f.errEmail;
    if (form.message.trim().length < 10) err.message = f.errMessage;
    return err;
  }

  async function submit(e) {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <section>
      <h1 className="h1">{t.contactTitle}</h1>
      <p className="intro">{t.contactIntro}</p>

      <div className="contact">
        <ul className="channels">
          {channels.map(({ icon: Icon, label, value, href }) => (
            <li key={label}>
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                <Icon size={22} />
                <span>
                  <strong>{label}</strong>
                  <small>{value}</small>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <form onSubmit={submit} noValidate>
          <label>
            {f.name}
            <input name="name" value={form.name} onChange={change} maxLength={100} autoComplete="name" aria-invalid={!!errors.name} />
            {errors.name && <span className="err">{errors.name}</span>}
          </label>
          <label>
            {f.email}
            <input name="email" type="email" value={form.email} onChange={change} maxLength={200} autoComplete="email" aria-invalid={!!errors.email} />
            {errors.email && <span className="err">{errors.email}</span>}
          </label>
          <label>
            {f.message}
            <textarea name="message" rows={6} value={form.message} onChange={change} maxLength={3000} aria-invalid={!!errors.message} />
            {errors.message && <span className="err">{errors.message}</span>}
          </label>

          <button type="submit" className="btn" disabled={status === 'sending'}>
            {status === 'sending' ? f.sending : f.send}
          </button>

          <p className={`feedback ${status}`} role="status" aria-live="polite">
            {status === 'sent' && f.sent}
            {status === 'error' && f.errServer}
          </p>
        </form>
      </div>
    </section>
  );
}
