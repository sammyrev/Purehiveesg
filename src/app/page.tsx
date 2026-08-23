/* eslint-disable @next/next/no-img-element -- Exact Figma exports retain their intrinsic SVG and raster layering. */
"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import styles from "./page.module.css";

const navigationItems = [
  { label: "Problem", href: "#problem" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Programme", href: "#programme" },
];

const heroHexagons = [1, 2, 3, 4, 5];
const hexagonStepMs = 850;

const companySizeOptions = ["1–10", "11–50", "51–200", "201–500", "500+"];
const regionOptions = ["United Kingdom", "Ireland", "Europe", "Rest of world"];
const publicSectorOptions = [
  "Yes",
  "No",
  "Not yet, but we plan to",
];
const timeSpentOptions = [
  "Under 2 hours a week",
  "2–5 hours a week",
  "5–10 hours a week",
  "10+ hours a week",
  "Mainly around tenders or audits",
];
const evidenceOptions = [
  "Spreadsheets / Excel",
  "Paper / printed files",
  "WhatsApp / messaging",
  "Shared drives / folders",
  "Existing software",
  "Other",
];
const interestOptions = ["Interview", "Pilot", "Product updates"];

type WaitlistSelectId = "companySize" | "region" | "publicSector" | "timeSpent";

export default function Home() {
  const [activeHexagons, setActiveHexagons] = useState(1);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [companySize, setCompanySize] = useState("");
  const [region, setRegion] = useState("");
  const [publicSector, setPublicSector] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [evidenceMethods, setEvidenceMethods] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [openSelect, setOpenSelect] = useState<WaitlistSelectId | null>(null);
  const selectListId = useId();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setMotionEnabled(!mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!motionEnabled) return;

    const interval = window.setInterval(() => {
      setActiveHexagons((current) => (current >= heroHexagons.length ? 0 : current + 1));
    }, hexagonStepMs);

    return () => window.clearInterval(interval);
  }, [motionEnabled]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const mediaQuery = window.matchMedia("(min-width: 1025px)");
    const onViewportChange = () => {
      if (mediaQuery.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    mediaQuery.addEventListener("change", onViewportChange);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      mediaQuery.removeEventListener("change", onViewportChange);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!openSelect) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`[data-waitlist-select="${openSelect}"]`)) {
        setOpenSelect(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSelect(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openSelect]);

  const toggleChoice = (value: string, current: string[], setCurrent: (next: string[]) => void) => {
    setCurrent(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const renderSelect = (
    id: WaitlistSelectId,
    name: string,
    label: string,
    icon: string,
    value: string,
    placeholder: string,
    options: string[],
    onSelect: (next: string) => void,
  ) => {
    const isOpen = openSelect === id;
    const labelId = `${id}-label`;
    const listId = `${selectListId}-${id}`;

    return (
      <div className={styles.waitlistField}>
        <span id={labelId}>{label}</span>
        <div
          className={`${styles.waitlistDropdown} ${isOpen ? styles.waitlistDropdownOpen : ""}`}
          data-waitlist-select={id}
        >
          <input type="hidden" name={name} value={value} />
          <button
            className={styles.waitlistInputWrap}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-labelledby={labelId}
            onClick={() => setOpenSelect(isOpen ? null : id)}
          >
            <img src={icon} alt="" />
            <span className={value ? styles.waitlistDropdownValue : styles.waitlistDropdownPlaceholder}>
              {value || placeholder}
            </span>
            <img className={styles.waitlistSelectArrow} src="/assets/waitlist/icon-arrow-down.svg" alt="" />
          </button>
          {isOpen ? (
            <ul className={styles.waitlistDropdownList} id={listId} role="listbox" aria-labelledby={labelId}>
              {options.map((option) => (
                <li key={option} role="presentation">
                  <button
                    className={`${styles.waitlistDropdownOption} ${
                      value === option ? styles.waitlistDropdownOptionActive : ""
                    }`}
                    type="button"
                    role="option"
                    aria-selected={value === option}
                    onClick={() => {
                      onSelect(option);
                      setOpenSelect(null);
                    }}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    );
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className={styles.home}>
      <header className={`${styles.header} ${menuOpen ? styles.headerMenuOpen : ""}`}>
        <nav className={styles.navigation} aria-label="Main navigation">
          <Link className={styles.logo} href="/" aria-label="PureHive ESG home" onClick={closeMenu}>
            <img
              src="/assets/purehive-logo.svg"
              alt="PureHive ESG"
              width={256}
              height={48}
            />
          </Link>

          <div className={styles.menu}>
            {navigationItems.map(({ label, href }) => (
              <a className={styles.menuItem} href={href} key={label} onClick={closeMenu}>
                {label}
              </a>
            ))}
          </div>

          <a className={styles.createAccount} href="#create-account" onClick={closeMenu}>
            <img
              src="/assets/arrow-forward-circle.svg"
              alt=""
              aria-hidden="true"
              width={12}
              height={12}
            />
            <span>Create account</span>
          </a>

          <button
            className={styles.menuToggle}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.menuToggleBar} />
            <span className={styles.menuToggleBar} />
            <span className={styles.menuToggleBar} />
          </button>
        </nav>

        <div
          className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
          id="mobile-navigation"
          hidden={!menuOpen}
        >
          <div className={styles.mobileMenuLinks}>
            {navigationItems.map(({ label, href }) => (
              <a className={styles.mobileMenuItem} href={href} key={label} onClick={closeMenu}>
                {label}
              </a>
            ))}
          </div>
          <a className={styles.mobileCreateAccount} href="#create-account" onClick={closeMenu}>
            <img
              src="/assets/arrow-forward-circle.svg"
              alt=""
              aria-hidden="true"
              width={12}
              height={12}
            />
            <span>Create account</span>
          </a>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`${styles.torus} ${styles.leftTorus}`} aria-hidden="true">
          <img className={styles.torusBase} src="/assets/hero/torus-base.png" alt="" />
          <div className={styles.torusColor} />
          <img className={styles.torusSpec} src="/assets/hero/torus-spec.png" alt="" />
        </div>
        <div className={`${styles.torus} ${styles.topRightTorus}`} aria-hidden="true">
          <img className={styles.torusBase} src="/assets/hero/torus-base.png" alt="" />
          <div className={styles.torusColor} />
          <img className={styles.torusSpec} src="/assets/hero/torus-spec.png" alt="" />
        </div>

        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle} id="hero-title">
            <span>Turn everyday service </span>
            <span>
              delivery into <em>structured,</em>{" "}
            </span>
            <span className={styles.gradientText}>audit-ready evidence</span>
          </h1>
          <p className={styles.heroDescription}>
            Structured ESG and compliance evidence for cleaning SMEs{" "}
            <br className={styles.heroDescriptionBreak} />
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

          <div className={styles.heroMobileVisual} aria-hidden="true">
            <div className={styles.heroMobileStage}>
              <div className={`${styles.heroMobileFolder} ${styles.heroMobileFolderAudit}`}>
                <span className={styles.heroMobileTab}>Audit trail</span>
              </div>
              <div className={`${styles.heroMobileFolder} ${styles.heroMobileFolderEvidence}`}>
                <span className={styles.heroMobileTab}>Evidence captured</span>
              </div>
              <div className={`${styles.heroMobileFolder} ${styles.heroMobileFolderLive}`}>
                <span className={styles.heroMobileLiveTitle}>Live capture</span>
                <div className={styles.heroMobileHexRow}>
                  {heroHexagons.map((hexagon, index) => (
                    <svg
                      className={`${styles.heroMobileHex} ${index < activeHexagons ? styles.heroMobileHexFilled : ""}`}
                      viewBox="0 0 72 82"
                      key={hexagon}
                    >
                      <polygon
                        className={styles.heroMobileHexShape}
                        points="36 3 69 21.5 69 60.5 36 79 3 60.5 3 21.5"
                      />
                    </svg>
                  ))}
                </div>
                <p className={styles.heroMobileCaption}>
                  Every scan becomes a structured, timestamped cell
                </p>
              </div>
            </div>
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
            {heroHexagons.map((hexagon, index) => (
              <span className={styles.hexagon} key={hexagon}>
                <img className={styles.hexagonOutline} src="/assets/hero/hex-outline.svg" alt="" />
                <img
                  className={`${styles.hexagonFill} ${index < activeHexagons ? styles.hexagonFillActive : ""}`}
                  src="/assets/hero/hex-filled.svg"
                  alt=""
                />
              </span>
            ))}
          </div>
          <p className={styles.visualCaption}>
            Every scan becomes a structured, timestamped cell
          </p>
        </div>
      </section>

      <section className={styles.pressureSection} id="problem" aria-labelledby="pressure-title">
        <div className={styles.pressureIntro}>
          <h2 className={styles.pressureTitle} id="pressure-title">
            Cleaning SMEs are{" "}
            <br className={styles.pressureBreak} />
            <span>under new pressure</span>
          </h2>
          <p className={styles.pressureDescription}>
            Procurement expectations have changed faster{" "}
            <br className={styles.pressureBreak} />
            than the tools most teams use to keep up.
          </p>
        </div>

        <div className={styles.pressureTopGrid}>
          <article className={`${styles.pressureCard} ${styles.pressureCardBlue}`}>
            <span className={styles.pressureNumber}>01</span>
            <div className={styles.pressureCardCopy}>
              <h3>Tenders are<br />changing</h3>
              <p>Social value and ESG are now<br />scored alongside price.</p>
            </div>
          </article>

          <div className={styles.pressurePhotoWrap}>
            <div className={styles.pressurePhotoFrame}>
              <img src="/assets/pressure/pressure-workers.png" alt="Cleaner holding a clipboard" />
            </div>
          </div>

          <article className={`${styles.pressureCard} ${styles.pressureCardPeach}`}>
            <span className={styles.pressureNumber}>02</span>
            <div className={styles.pressureCardCopy}>
              <h3>Evidence is<br />demanded</h3>
              <p>Required throughout delivery,<br />not just at bid stage.</p>
            </div>
          </article>
        </div>

        <div className={styles.pressureBottomGrid}>
          <div className={styles.pressurePhotoWrap}>
            <div className={styles.pressurePhotoFrame}>
              <img src="/assets/pressure/pressure-woman.png" alt="Cleaning team reviewing a tablet" />
            </div>
          </div>

          <article className={`${styles.pressureCard} ${styles.pressureCardBlue}`}>
            <span className={styles.pressureNumber}>03</span>
            <div className={styles.pressureCardCopy}>
              <h3>Manual chaos</h3>
              <p>Spreadsheets, folders, and<br />WhatsApp photos don&apos;t hold up.</p>
            </div>
          </article>

          <article className={`${styles.pressureCard} ${styles.pressureCardBlue}`}>
            <span className={styles.pressureNumber}>04</span>
            <div className={styles.pressureCardCopy}>
              <h3>Audit risk</h3>
              <p>Reviews and inspections create<br />scramble and exposure.</p>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.phaseSection} id="how-it-works" aria-labelledby="phase-title">
        <div className={styles.phaseTorus} aria-hidden="true">
          <img className={styles.phaseTorusBase} src="/assets/phases/phase-base.png" alt="" />
          <div className={styles.phaseTorusColor} />
          <img className={styles.phaseTorusSpec} src="/assets/phases/phase-spec.png" alt="" />
        </div>
        <img className={styles.phaseSpecGlow} src="/assets/phases/phase-spec-glow.png" alt="" aria-hidden="true" />

        <h2 className={styles.phaseTitle} id="phase-title">
          <span>Phase 1: built to be</span>
          <span>simple, not clever</span>
        </h2>
        <p className={styles.phaseSubtitle}>No hardware to install, no new habits to learn.</p>
        <a className={`${styles.primaryAction} ${styles.phaseAction}`} href="#become-a-partner">
          <img src="/assets/hero/arrow-forward-circle.svg" alt="" aria-hidden="true" />
          <span>Become a Founding Partner</span>
        </a>

        <div className={styles.phaseTimeline} aria-label="PureHive process phases">
          <img className={`${styles.phaseLine} ${styles.phaseLineOne}`} src="/assets/phases/phase-line-one.svg" alt="" />
          <img className={`${styles.phaseLine} ${styles.phaseLineTwo}`} src="/assets/phases/phase-line-two.svg" alt="" />

          <div className={`${styles.phasePoint} ${styles.phasePointOne}`}><img src="/assets/phases/phase-dot-one.svg" alt="" /></div>
          <div className={`${styles.phasePoint} ${styles.phasePointTwo}`}><img src="/assets/phases/phase-dot-two.svg" alt="" /></div>
          <div className={`${styles.phasePoint} ${styles.phasePointThree}`}><img src="/assets/phases/phase-dot-one.svg" alt="" /></div>

          <span className={`${styles.phaseNumber} ${styles.phaseNumberOne}`}>01</span>
          <span className={`${styles.phaseNumber} ${styles.phaseNumberTwo}`}>02</span>
          <span className={`${styles.phaseNumber} ${styles.phaseNumberThree}`}>03</span>

          <div className={`${styles.phaseStepCopy} ${styles.phaseStepOne}`}>
            <h3>Log activity as it happens</h3>
            <p>Scan, tag, or check in on site, fits into the existing shift.</p>
          </div>
          <div className={`${styles.phaseStepCopy} ${styles.phaseStepTwo}`}>
            <h3>Evidence is structured automatically</h3>
            <p>Each entry becomes a timestamped, categorised audit trail.</p>
          </div>
          <div className={`${styles.phaseStepCopy} ${styles.phaseStepThree}`}>
            <h3>Export when you need it</h3>
            <p>PDF or Excel, ready for tenders, audits, or client requests.</p>
          </div>
        </div>

        <aside className={styles.phaseFuture} aria-label="Future phases">
          <div className={styles.phaseFutureHeading}>Future phases</div>
          <ul>
            <li>Optional IoT integration,</li>
            <li>AI-assisted ESG analysis,</li>
            <li>and enhanced verification</li>
          </ul>
          <p>These might be added as the pilot<br />validates what&apos;s needed.</p>
        </aside>
      </section>

      <section className={styles.audienceSection} id="programme" aria-labelledby="audience-title">
        <div className={`${styles.audienceTorus} ${styles.audienceTorusRight}`} aria-hidden="true">
          <img className={styles.audienceTorusBase} src="/assets/audience/audience-base.png" alt="" />
          <div className={styles.audienceTorusColor} />
          <img className={styles.audienceTorusSpec} src="/assets/audience/audience-spec.png" alt="" />
        </div>
        <div className={`${styles.audienceTorus} ${styles.audienceTorusLeft}`} aria-hidden="true">
          <img className={styles.audienceTorusBase} src="/assets/audience/audience-base.png" alt="" />
          <div className={styles.audienceTorusColor} />
          <img className={styles.audienceTorusSpec} src="/assets/audience/audience-spec.png" alt="" />
        </div>

        <h2 className={styles.audienceTitle} id="audience-title">
          <span>Built for cleaning leaders, </span>
          <span>not compliance departments</span>
        </h2>
        <img
          className={styles.audienceFeature}
          src="/assets/audience/audience-feature.png"
          alt="A cleaning team standing together in a bright workplace"
        />
        <a className={`${styles.primaryAction} ${styles.audienceAction}`} href="#become-a-partner">
          <img src="/assets/hero/arrow-forward-circle.svg" alt="" aria-hidden="true" />
          <span>Become a Founding Partner</span>
        </a>

        <div className={styles.audienceBand}>
          <div className={styles.designedForCard}>
            <h3>Designed for</h3>
            <div className={styles.designedForColumns}>
              <div className={styles.audiencePillColumn}>
                <div className={styles.audiencePill}><img src="/assets/audience/icon-buildings.svg" alt="" /><span>Commercial cleaning SMEs</span></div>
                <div className={styles.audiencePill}><img src="/assets/audience/icon-hospital.svg" alt="" /><span>Healthcare cleaning providers</span></div>
                <div className={styles.audiencePill}><img src="/assets/audience/icon-briefcase.svg" alt="" /><span>House &amp; Public-sector contractors</span></div>
              </div>
              <div className={styles.audiencePillColumn}>
                <div className={styles.audiencePill}><img src="/assets/audience/icon-garage.svg" alt="" /><span>Facilities management SMEs</span></div>
                <div className={styles.audiencePill}><img src="/assets/audience/icon-school.svg" alt="" /><span>Education cleaning providers</span></div>
                <div className={styles.audiencePill}><img src="/assets/audience/icon-certificate.svg" alt="" /><span>Compliance-driven organisations</span></div>
              </div>
            </div>
          </div>

          <div className={styles.notBuiltCard}>
            <h3>Not Built for</h3>
            <ul>
              <li><img src="/assets/audience/icon-alert.svg" alt="" /><span>Sole traders with residential clients</span></li>
              <li><img src="/assets/audience/icon-alert.svg" alt="" /><span>Enterprise FM firms with in-house<br />dev teams</span></li>
              <li><img src="/assets/audience/icon-alert.svg" alt="" /><span>Companies that don&apos;t prioritise<br />compliance</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.partnersSection} id="become-a-partner" aria-labelledby="partners-title">
        <img className={`${styles.partnersSpec} ${styles.partnersSpecLeft}`} src="/assets/partners/partners-spec.png" alt="" aria-hidden="true" />
        <img className={`${styles.partnersSpec} ${styles.partnersSpecRight}`} src="/assets/partners/partners-spec.png" alt="" aria-hidden="true" />

        <h2 className={styles.partnersTitle} id="partners-title">
          <span>Help shape it, <em>before</em></span>
          <span>everyone else uses it</span>
        </h2>
        <p className={styles.partnersSubtitle}>
          We&apos;re piloting Purehiveesg with a small group of founding partners<br />
          direct input, priority onboarding, no pressure to buy.
        </p>
        <a className={`${styles.primaryAction} ${styles.partnersAction}`} href="#become-a-partner">
          <img src="/assets/hero/arrow-forward-circle.svg" alt="" aria-hidden="true" />
          <span>Become a Founding Partner</span>
        </a>

        <div className={styles.pricingTable}>
          <div className={styles.pricingRow}>
            <span>Pilot pricing</span>
            <strong className={styles.pricingTbc}>TBC</strong>
          </div>
          <div className={styles.pricingRow}>
            <span>Payment to register</span>
            <strong className={styles.pricingNone}>None</strong>
          </div>
          <div className={styles.pricingRow}>
            <span>Access</span>
            <strong className={styles.pricingEarly}>Early / priority</strong>
          </div>
          <div className={styles.pricingRow}>
            <span>Input on features</span>
            <strong className={styles.pricingDirect}>Direct</strong>
          </div>
        </div>

        <div className={styles.partnersPhotoFrame}>
          <img src="/assets/partners/partners-team.png" alt="Three cleaning professionals in blue workwear" />
        </div>
      </section>

      <section className={styles.waitlistSection} id="create-account" aria-labelledby="waitlist-title">
        <div className={styles.waitlistTorus} aria-hidden="true">
          <img className={styles.waitlistTorusBase} src="/assets/waitlist/waitlist-base.png" alt="" />
          <div className={styles.waitlistTorusColor} />
          <img className={styles.waitlistTorusSpec} src="/assets/waitlist/waitlist-spec.png" alt="" />
        </div>

        <div className={styles.waitlistCopy}>
          <h2 id="waitlist-title">Join the waitlist</h2>
          <p>
            Two minutes. No payment, no commitment,<br />
            just tell us where you are today.
          </p>
          <ul className={styles.waitlistBenefits}>
            <li><span className={styles.waitlistCheck}><img src="/assets/waitlist/waitlist-check.svg" alt="" /></span><span>Early access when we launch</span></li>
            <li><span className={styles.waitlistCheck}><img src="/assets/waitlist/waitlist-check.svg" alt="" /></span><span>Direct input into what gets built</span></li>
            <li><span className={styles.waitlistCheck}><img src="/assets/waitlist/waitlist-check.svg" alt="" /></span><span>Priority onboarding into the pilot</span></li>
          </ul>
        </div>

        <form
          className={styles.waitlistFormCard}
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className={styles.waitlistFields}>
            <div className={styles.waitlistFieldRow}>
              <label className={styles.waitlistField}>
                <span>Name</span>
                <div className={styles.waitlistInputWrap}>
                  <img src="/assets/waitlist/icon-personalcard.svg" alt="" />
                  <input type="text" name="name" placeholder="Your name" required />
                </div>
              </label>

              <label className={styles.waitlistField}>
                <span>Company</span>
                <div className={styles.waitlistInputWrap}>
                  <img src="/assets/waitlist/icon-building.svg" alt="" />
                  <input type="text" name="company" placeholder="Company name" required />
                </div>
              </label>
            </div>

            <div className={styles.waitlistFieldRow}>
              <label className={styles.waitlistField}>
                <span>Work email</span>
                <div className={styles.waitlistInputWrap}>
                  <img src="/assets/waitlist/icon-sms.svg" alt="" />
                  <input type="email" name="email" placeholder="name@company.com" required />
                </div>
              </label>

              <label className={styles.waitlistField}>
                <span>
                  Phone <em className={styles.waitlistOptional}>optional</em>
                </span>
                <div className={styles.waitlistInputWrap}>
                  <img src="/assets/waitlist/icon-mobile.svg" alt="" />
                  <input type="tel" name="phone" placeholder="Phone number" />
                </div>
              </label>
            </div>

            <label className={styles.waitlistField}>
              <span>Job title</span>
              <div className={styles.waitlistInputWrap}>
                <img src="/assets/waitlist/icon-briefcase.svg" alt="" />
                <input type="text" name="jobTitle" placeholder="e.g. Managing Director" required />
              </div>
            </label>

            <div className={styles.waitlistFieldRow}>
              {renderSelect(
                "companySize",
                "companySize",
                "Company size",
                "/assets/waitlist/icon-building.svg",
                companySize,
                "Select company size",
                companySizeOptions,
                setCompanySize,
              )}
              {renderSelect(
                "region",
                "region",
                "Region",
                "/assets/waitlist/icon-location.svg",
                region,
                "Select region",
                regionOptions,
                setRegion,
              )}
            </div>

            {renderSelect(
              "publicSector",
              "publicSector",
              "Do you bid for NHS, council or public-sector contracts?",
              "/assets/waitlist/icon-briefcase.svg",
              publicSector,
              "Select an option",
              publicSectorOptions,
              setPublicSector,
            )}

            <label className={styles.waitlistField}>
              <span>Biggest compliance, ESG or tender challenge</span>
              <textarea
                className={styles.waitlistTextarea}
                name="challenge"
                placeholder="What is the hardest part of gathering or presenting evidence today?"
                rows={4}
                required
              />
            </label>

            <fieldset className={`${styles.waitlistField} ${styles.waitlistChoiceField}`}>
              <legend>How do you currently manage evidence?</legend>
              <div className={styles.waitlistChoiceGroup}>
                {evidenceOptions.map((option) => (
                  <label
                    className={`${styles.waitlistChoice} ${
                      evidenceMethods.includes(option) ? styles.waitlistChoiceSelected : ""
                    }`}
                    key={option}
                  >
                    <input
                      type="checkbox"
                      name="evidence"
                      value={option}
                      checked={evidenceMethods.includes(option)}
                      onChange={() => toggleChoice(option, evidenceMethods, setEvidenceMethods)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {renderSelect(
              "timeSpent",
              "timeSpent",
              "Time spent preparing evidence",
              "/assets/waitlist/icon-briefcase.svg",
              timeSpent,
              "Select time spent",
              timeSpentOptions,
              setTimeSpent,
            )}

            <fieldset className={`${styles.waitlistField} ${styles.waitlistChoiceField}`}>
              <legend>I’m interested in</legend>
              <div className={styles.waitlistChoiceGroup}>
                {interestOptions.map((option) => (
                  <label
                    className={`${styles.waitlistChoice} ${
                      interests.includes(option) ? styles.waitlistChoiceSelected : ""
                    }`}
                    key={option}
                  >
                    <input
                      type="checkbox"
                      name="interest"
                      value={option}
                      checked={interests.includes(option)}
                      onChange={() => toggleChoice(option, interests, setInterests)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <button className={styles.waitlistSubmit} type="submit">
            <img src="/assets/waitlist/waitlist-arrow.svg" alt="" aria-hidden="true" />
            <span>Join the waitlist</span>
          </button>
        </form>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.footerLogo} href="/" aria-label="PureHive ESG home">
          <img src="/assets/footer-logo.svg" alt="PureHive ESG" width="171" height="32" />
        </Link>
        <nav className={styles.footerNavigation} aria-label="Footer navigation">
          <a href="#problem">Problem</a>
          <a href="#how-it-works">How it works</a>
          <a href="#programme">Programme</a>
          <a href="#privacy-policy">Privacy Policy</a>
        </nav>
        <p className={styles.footerCopyright}>© 2026 PUREHIVE · EARLY-STAGE / PRE-PILOT</p>
      </footer>
    </main>
  );
}
