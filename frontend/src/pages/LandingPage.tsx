import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';

// Public marketing page rebuilt from the mockup. Sections in order:
// 1. Hero with photo + "Soins & Bien-Être" title
// 2. "Nos expertises — Ce que nous offrons" (3 service cards)
// 3. "Une médecine avec âme" (clinic story + KPI strip)
// 4. "Notre équipe" (3 dark-themed staff portraits)
// 5. "Dossiers patients, modernisés" (mock dashboard preview)
// 6. "Prenons contact" (contact form + clinic info)
// 7. Footer
//
// We pack everything in one file for the demo; in a real project each
// section would be its own component.
export function LandingPage() {
  return (
    <>
      {/* === HERO === */}
      <section
        style={{
          background: 'var(--color-cream)',
          paddingBottom: 'var(--space-10)',
        }}
      >
        <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
          {/* Hero photo placeholder — in production you'd use a real <img>. */}
          <div
            style={{
              height: 360,
              background: 'linear-gradient(120deg, #c9b58c, #6b8e6e)',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: 'var(--space-6)',
            }}
          >
            <p
              style={{
                color: 'var(--color-text-on-ink)',
                fontSize: 'var(--fs-xs)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                textAlign: 'right',
              }}
            >
              Clinique<br />Vétérinaire<br />Moderne
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <h1
              style={{
                fontSize: 'var(--fs-3xl)',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              Soins &amp; Bien-Être
            </h1>
            <p
              style={{
                marginTop: 'var(--space-3)',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
                fontSize: 'var(--fs-sm)',
                textTransform: 'uppercase',
              }}
            >
              Soins vétérinaires pour faire votre animal se sentir bien
            </p>
            <div style={{ marginTop: 'var(--space-6)' }}>
              <a href="#contact">
                <Button variant="secondary">Prendre un rendez-vous</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* === SERVICES === */}
      <section id="services" style={{ padding: 'var(--space-12) 0', background: 'var(--color-warm)' }}>
        <div className="container">
          <p
            style={{
              fontSize: 'var(--fs-xs)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            Nos expertises
          </p>
          <h2
            style={{
              fontSize: 'var(--fs-3xl)',
              fontStyle: 'italic',
              marginTop: 'var(--space-3)',
              marginBottom: 'var(--space-6)',
            }}
          >
            Ce que nous <em>offrons</em>
          </h2>
          <p style={{ maxWidth: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
            Une équipe de vétérinaires passionnés, dédiée au bien-être de vos compagnons à quatre
            pattes — du premier vaccin aux soins les plus complexes.
          </p>

          {/* 3-column grid of service cards. */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {[
              { num: '01', title: 'Médecine préventive', text: 'Vaccinations, bilans annuels, conseils nutritionnels.' },
              { num: '02', title: 'Chirurgie',           text: 'Stérilisations, urgences, chirurgie orthopédique.' },
              { num: '03', title: 'Suivi & soins',       text: 'Dossier numérique, traitements en cours, vaccinations à jour.' },
            ].map((s) => (
              <article
                key={s.num}
                style={{
                  background: 'var(--color-cream)',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-soft)',
                }}
              >
                <p style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  {s.num}
                </p>
                <h3 style={{ fontStyle: 'italic', marginTop: 'var(--space-2)', fontSize: 'var(--fs-xl)' }}>
                  {s.title}
                </h3>
                <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)' }}>
                  {s.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* === CLINIC STORY + KPI STRIP === */}
      <section id="clinique" style={{ padding: 'var(--space-12) 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'center' }}>
          <div
            style={{
              height: 380,
              background: 'linear-gradient(160deg, #e8d5a8, #6b8e6e)',
              borderRadius: 'var(--radius-md)',
            }}
          />
          <div>
            <p style={{ fontSize: 'var(--fs-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
              La clinique
            </p>
            <h2 style={{ fontSize: 'var(--fs-3xl)', fontStyle: 'italic', marginTop: 'var(--space-3)' }}>
              Une médecine avec <em>âme</em>
            </h2>
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
              Fondée en 2015, VetCare est bien plus qu'une clinique. C'est un espace de confiance où
              chaque animal est traité avec le même soin qu'un membre de la famille.
            </p>

            {/* KPI strip — 4 cells matching the mockup numbers. */}
            <div
              style={{
                marginTop: 'var(--space-6)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--space-4)',
              }}
            >
              {[
                { k: '+ 1200', v: 'Patients actifs' },
                { k: '8',      v: 'Vétérinaires' },
                { k: '98 %',   v: 'Satisfaction' },
                { k: '7j/7',   v: 'Urgences' },
              ].map((kpi) => (
                <div key={kpi.v}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-2xl)' }}>{kpi.k}</p>
                  <p style={{ fontSize: 'var(--fs-xs)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                    {kpi.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === STAFF (dark) === */}
      <section id="equipe" style={{ background: 'var(--color-ink)', color: 'var(--color-text-on-ink)', padding: 'var(--space-12) 0' }}>
        <div className="container">
          <p style={{ fontSize: 'var(--fs-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-light)' }}>
            Notre équipe
          </p>
          <div
            style={{
              marginTop: 'var(--space-8)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-6)',
              textAlign: 'center',
            }}
          >
            {[
              { role: 'Chirurgien principal',    name: 'Dr. James Brown' },
              { role: 'Médecine interne',        name: 'Dra. Margie Simpson' },
              { role: 'Dermatologie & NAC',      name: 'Dr. Louis XIV' },
            ].map((m) => (
              <article key={m.name}>
                <p style={{ fontSize: 'var(--fs-xs)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{m.role}</p>
                <div
                  style={{
                    height: 200,
                    margin: 'var(--space-4) 0',
                    background: 'var(--color-ink-soft)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <h3 style={{ fontStyle: 'italic', fontSize: 'var(--fs-xl)' }}>{m.name}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* === DASHBOARD PREVIEW === */}
      <section id="dossiers" style={{ padding: 'var(--space-12) 0', background: 'var(--color-warm)' }}>
        <div className="container">
          <p style={{ fontSize: 'var(--fs-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Gestion numérique
          </p>
          <h2 style={{ fontSize: 'var(--fs-3xl)', fontStyle: 'italic', marginTop: 'var(--space-3)' }}>
            Dossiers patients, <em>modernisés</em>
          </h2>
          <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
            Notre plateforme interne permet aux vétérinaires de consulter, ajouter et gérer tous
            les dossiers médicaux depuis un seul espace sécurisé et intuitif.
          </p>
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Link to="/login">
              <Button>Accéder à l'espace pro</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* === CONTACT === */}
      <section id="contact" style={{ background: 'var(--color-ink)', color: 'var(--color-text-on-ink)', padding: 'var(--space-12) 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
          <div>
            <p style={{ fontSize: 'var(--fs-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-light)' }}>
              Rendez-vous
            </p>
            <h2 style={{ fontSize: 'var(--fs-3xl)', fontStyle: 'italic', marginTop: 'var(--space-3)' }}>
              Prenons <em>contact</em>
            </h2>
            <dl style={{ marginTop: 'var(--space-6)', fontSize: 'var(--fs-sm)' }}>
              <dt style={dtStyle}>Adresse</dt>
              <dd style={ddStyle}>12 Rue des Animaux Heureux<br />75011 Paris, France</dd>
              <dt style={dtStyle}>Téléphone</dt>
              <dd style={ddStyle}>+33 1 42 00 00 00</dd>
              <dt style={dtStyle}>Email</dt>
              <dd style={ddStyle}>contact@vetcare.fr</dd>
              <dt style={dtStyle}>Horaires</dt>
              <dd style={ddStyle}>Lundi — Vendredi : 8h — 20h<br />Samedi : 9h — 18h</dd>
            </dl>
          </div>

          {/* Contact form — pure static here; submitting it would POST to a
              future /api/contact endpoint that we haven't scoped in the cahier. */}
          <form
            onSubmit={(e) => { e.preventDefault(); alert('Demande envoyée'); }}
            style={{ display: 'grid', gap: 'var(--space-4)' }}
          >
            {[
              'Votre nom complet', 'Email', "Nom de l'animal",
              'Type de consultation', 'Message',
            ].map((label) => (
              <label key={label} style={{ display: 'block' }}>
                <span style={{ fontSize: 'var(--fs-xs)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-on-ink)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  {label}
                </span>
                <input
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--color-text-on-ink)',
                    color: 'var(--color-text-on-ink)',
                    padding: 'var(--space-2) 0',
                  }}
                />
              </label>
            ))}
            <Button type="submit" variant="primary">Envoyer</Button>
          </form>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer
        style={{
          padding: 'var(--space-6) 0',
          background: 'var(--color-cream)',
          textAlign: 'center',
          fontSize: 'var(--fs-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        © 2026 VetCare — Clinique vétérinaire moderne. Tous droits réservés.
      </footer>
    </>
  );
}

const dtStyle: React.CSSProperties = {
  fontSize: 'var(--fs-xs)',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-light)',
  marginTop: 'var(--space-3)',
};
const ddStyle: React.CSSProperties = { marginTop: 'var(--space-1)' };