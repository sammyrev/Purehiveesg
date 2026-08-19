/* eslint-disable @next/next/no-img-element -- Exact Figma exports retain their intrinsic SVG and raster layering. */
import Link from "next/link";
import styles from "./page.module.css";

const navigationItems = [
  { label: "Problem", href: "#problem" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Programme", href: "#programme" },
];

const outlineHexagons = [1, 2, 3, 4];

export default function Home() {
  return (
    <main className={styles.home}>
      <header className={styles.header}>
        <nav className={styles.navigation} aria-label="Main navigation">
          <Link className={styles.logo} href="/" aria-label="PureHive ESG home">
            <img
              src="/assets/purehive-logo.svg"
              alt="PureHive ESG"
              width={171}
              height={32}
            />
          </Link>

          <div className={styles.menu}>
            {navigationItems.map(({ label, href }) => (
              <a className={styles.menuItem} href={href} key={label}>
                {label}
              </a>
            ))}
          </div>

          <a className={styles.createAccount} href="#create-account">
            <img
              src="/assets/arrow-forward-circle.svg"
              alt=""
              aria-hidden="true"
              width={12}
              height={12}
            />
            <span>Create account</span>
          </a>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.torus} aria-hidden="true">
          <img className={styles.torusBase} src="/assets/hero/torus-base.png" alt="" />
          <div className={styles.torusColor} />
          <img className={styles.torusSpec} src="/assets/hero/torus-spec.png" alt="" />
        </div>

        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle} id="hero-title">
            <span>Turn everyday service</span>
            <span>
              delivery into <em>structured,</em>
            </span>
            <span className={styles.gradientText}>audit-ready evidence</span>
          </h1>
          <p className={styles.heroDescription}>
            Structured ESG and compliance evidence for cleaning SMEs
            <br />
            captured as the work happens, not reconstructed at audit time.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#become-a-partner">
              <img src="/assets/hero/arrow-forward-circle.svg" alt="" aria-hidden="true" />
              <span>Become a Founding Partner</span>
            </a>
            <a className={styles.secondaryAction} href="#how-it-works">
              See how it works
            </a>
          </div>
        </div>

        <div className={styles.visualStage} aria-hidden="true">
          <img className={styles.leftConnector} src="/assets/hero/connector-left.png" alt="" />
          <img className={styles.rightConnector} src="/assets/hero/connector-right.png" alt="" />

          <div className={`${styles.profileBadge} ${styles.founderBadge}`}>
            <img className={styles.profileRing} src="/assets/hero/portrait-ring-small.svg" alt="" />
            <img className={styles.profileImage} src="/assets/hero/portrait-founder-small.png" alt="" />
          </div>

          <div className={`${styles.profileBadge} ${styles.teamBadge}`}>
            <img className={styles.profileRing} src="/assets/hero/portrait-ring-small.svg" alt="" />
            <img className={styles.profileImage} src="/assets/hero/portrait-team.jpeg" alt="" />
          </div>

          <div className={`${styles.visualCard} ${styles.auditCard}`}>
            <img src="/assets/hero/card-audit.svg" alt="" />
            <span>Audit trail</span>
          </div>
          <div className={`${styles.visualCard} ${styles.evidenceCard}`}>
            <img src="/assets/hero/card-evidence.svg" alt="" />
            <span>Evidence captured</span>
          </div>
          <div className={`${styles.visualCard} ${styles.liveCard}`}>
            <img src="/assets/hero/card-live.svg" alt="" />
            <div className={styles.liveCardContent}>
              <span className={styles.liveLabel}>Live capture</span>
              <span className={styles.activeStatus}>
                <img src="/assets/hero/check-circle.svg" alt="" />
                Active
              </span>
            </div>
          </div>

          <div className={styles.hexagons}>
            <img className={styles.filledHexagon} src="/assets/hero/hex-filled.svg" alt="" />
            {outlineHexagons.map((hexagon) => (
              <img key={hexagon} src="/assets/hero/hex-outline.svg" alt="" />
            ))}
          </div>
          <p className={styles.visualCaption}>
            Every scan becomes a structured, timestamped cell
          </p>
        </div>
      </section>
    </main>
  );
}
