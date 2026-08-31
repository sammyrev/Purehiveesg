/* eslint-disable @next/next/no-img-element -- Exact Figma exports retain their intrinsic SVG and raster layering. */
"use client";

import Link from "next/link";
import { useEffect, useId, useState, type CSSProperties, type FormEvent } from "react";
import { apiUrl } from "@/lib/api";
import styles from "./page.module.css";

const navigationItems = [
  { label: "Problem", href: "#problem" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Programme", href: "#programme" },
];

const heroHexagons = [1, 2, 3, 4, 5];
const hexagonStepMs = 850;

const companySizeOptions = ["1–10", "11–50", "51–250", "250+"];
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
type WaitlistSubmitStatus = "idle" | "submitting" | "error";
type ApplicationStep = "initial" | "followUpPrompt" | "research" | "complete";

type ApplicationResponse = {
  message?: string;
  data?: { id?: string };
};

function reveal(delayMs = 0) {
  return {
    "data-reveal": true,
    ...(delayMs
      ? { style: { "--reveal-delay": `${delayMs}ms` } as CSSProperties }
      : {}),
  };
}

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
  const [submitStatus, setSubmitStatus] = useState<WaitlistSubmitStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [applicationStep, setApplicationStep] = useState<ApplicationStep>("initial");
  const [applicationId, setApplicationId] = useState("");
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
    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    const timeouts: number[] = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const markVisible = (node: Element) => {
      node.classList.add("is-visible");
      const finish = (event?: Event) => {
        if (event && event.target !== node) return;
        node.removeAttribute("data-reveal");
      };
      node.addEventListener("transitionend", finish);
      timeouts.push(window.setTimeout(() => finish(), 1200));
    };

    if (reduceMotion) {
      nodes.forEach(markVisible);
      return () => timeouts.forEach((timeout) => window.clearTimeout(timeout));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          markVisible(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, []);

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

  const handleInitialApplicationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!companySize) {
      setSubmitStatus("error");
      setSubmitMessage("Please select your company size.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      companySize,
    };

    try {
      setSubmitStatus("submitting");
      setSubmitMessage("");

      const response = await fetch(`${apiUrl}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ApplicationResponse;

      if (!response.ok) {
        throw new Error(data.message || "Could not submit your application.");
      }

      if (!data.data?.id) {
        throw new Error("Your application was saved, but we could not continue to the next step.");
      }

      form.reset();
      setCompanySize("");
      setApplicationId(data.data.id);
      setApplicationStep("followUpPrompt");
      setSubmitStatus("idle");
      setSubmitMessage("");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof TypeError
          ? "Could not reach the application service. Please try again."
          : error instanceof Error
            ? error.message
            : "Could not submit your application.",
      );
    }
  };

  const handleResearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!applicationId) {
      setSubmitStatus("error");
      setSubmitMessage("Your application reference is missing. Please submit the first step again.");
      return;
    }

    if (!region || !publicSector || !timeSpent) {
      setSubmitStatus("error");
      setSubmitMessage("Please complete all required fields.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      phone: String(formData.get("phone") ?? "").trim(),
      jobTitle: String(formData.get("jobTitle") ?? "").trim(),
      region,
      publicSector,
      challenge: String(formData.get("challenge") ?? "").trim(),
      evidenceMethods,
      timeSpent,
      interests,
    };

    try {
      setSubmitStatus("submitting");
      setSubmitMessage("");

      const response = await fetch(`${apiUrl}/api/waitlist/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ApplicationResponse;

      if (!response.ok) {
        throw new Error(data.message || "Could not save your additional answers.");
      }

      form.reset();
      setRegion("");
      setPublicSector("");
      setTimeSpent("");
      setEvidenceMethods([]);
      setInterests([]);
      setSubmitStatus("idle");
      setSubmitMessage("");
      setApplicationStep("complete");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof TypeError
          ? "Could not reach the application service. Please try again."
          : error instanceof Error
            ? error.message
            : "Could not save your additional answers.",
      );
    }
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

          <a className={styles.createAccount} href="#apply" onClick={closeMenu}>
            <img
              src="/assets/arrow-forward-circle.svg"
              alt=""
              aria-hidden="true"
              width={12}
              height={12}
            />
            <span>Become a Founding Partner</span>
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
          <a className={styles.mobileCreateAccount} href="#apply" onClick={closeMenu}>
            <img
              src="/assets/arrow-forward-circle.svg"
              alt=""
              aria-hidden="true"
              width={12}
              height={12}
            />
            <span>Become a Founding Partner</span>
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
          <h1 className={styles.heroTitle} id="hero-title" {...reveal(40)}>
            <span>Prove the work. </span>
            <span><em>Protect the contract.</em></span>
          </h1>
          <p className={styles.heroDescription} {...reveal(140)}>
            <span>
              PureHive is building a simpler way for commercial cleaning and facilities-service businesses to
              capture, organise and retrieve operational evidence for client reporting, compliance, audits and
              procurement.
            </span>
            <span>
              We&apos;re inviting a small group of UK businesses to help shape the platform as Founding Partners.
            </span>
          </p>
          <div className={styles.heroActions} {...reveal(220)}>
            <a className={styles.primaryAction} href="#apply">
              <img src="/assets/hero/arrow-forward-circle.svg" alt="" aria-hidden="true" />
              <span>Become a Founding Partner</span>
            </a>
            <a className={styles.secondaryAction} href="#how-it-works">
              <span>See What We&apos;re Building</span>
            </a>
          </div>
          <p className={styles.heroApplicationNote} {...reveal(260)}>
            Early-stage programme. There is no cost to apply.
          </p>

          <div className={styles.heroMobileVisual} aria-hidden="true">
            <div className={styles.heroMobileStage}>
              <div className={`${styles.heroMobileFolder} ${styles.heroMobileFolderAudit}`}>
                <span className={styles.heroMobileTab}>Audit trail</span>
              </div>
              <div className={`${styles.heroMobileFolder} ${styles.heroMobileFolderEvidence}`}>
                <span className={styles.heroMobileTab}>Evidence capture</span>
              </div>
              <div className={`${styles.heroMobileFolder} ${styles.heroMobileFolderLive}`}>
                <span className={styles.heroMobileLiveTitle}>Proposed capture</span>
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
                  We&apos;re designing structured, timestamped records
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.visualStage} aria-hidden="true" {...reveal(280)}>
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
            <span>Evidence capture</span>
          </div>
          <div className={`${styles.visualCard} ${styles.liveCard}`}>
            <img src="/assets/hero/card-live.svg" alt="" />
            <div className={styles.liveCardContent}>
              <span className={styles.liveLabel}>Proposed capture</span>
              <span className={styles.activeStatus}>
                <img src="/assets/hero/check-circle.svg" alt="" />
                In design
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
            We&apos;re designing structured, timestamped records
          </p>
        </div>
      </section>

      <section className={styles.pressureSection} id="problem" aria-labelledby="pressure-title">
        <div className={styles.pressureIntro} {...reveal()}>
          <h2 className={styles.pressureTitle} id="pressure-title">
            <span>Your team did the work.</span>
            <span>Can you prove it?</span>
          </h2>
          <p className={styles.pressureDescription}>
            <span>
              Commercial cleaning businesses generate evidence every day — cleaning records, photographs,
              inspections, attendance information, corrective actions and compliance records.
            </span>
            <span>
              But that evidence can become scattered across paper forms, WhatsApp, spreadsheets, emails and
              different systems.
            </span>
            <span>
              When a client, auditor or procurement team asks for proof, businesses can spend valuable time
              finding, organising and rebuilding evidence.
            </span>
            <strong>We believe there is a better way.</strong>
          </p>
        </div>

        <div className={styles.pressureTopGrid}>
          <article className={`${styles.pressureCard} ${styles.pressureCardBlue}`} {...reveal(40)}>
            <span className={styles.pressureNumber}>01</span>
            <div className={styles.pressureCardCopy}>
              <h3>Evidence matters</h3>
              <p>
                Procurement and contract management increasingly demand demonstrable evidence of supplier
                performance, compliance and wider outcomes.
              </p>
            </div>
          </article>

          <div className={styles.pressurePhotoWrap} {...reveal(120)}>
            <div className={styles.pressurePhotoFrame}>
              <img src="/assets/pressure/pressure-workers.png" alt="Cleaner holding a clipboard" />
            </div>
          </div>

          <article className={`${styles.pressureCard} ${styles.pressureCardPeach}`} {...reveal(200)}>
            <span className={styles.pressureNumber}>02</span>
            <div className={styles.pressureCardCopy}>
              <h3>Proof is needed</h3>
              <p>For client reporting, audits, contract reviews and compliance.</p>
            </div>
          </article>
        </div>

        <div className={styles.pressureBottomGrid}>
          <div className={styles.pressurePhotoWrap} {...reveal(40)}>
            <div className={styles.pressurePhotoFrame}>
              <img src="/assets/pressure/pressure-woman.png" alt="Cleaning team reviewing a tablet" />
            </div>
          </div>

          <article className={`${styles.pressureCard} ${styles.pressureCardBlue}`} {...reveal(120)}>
            <span className={styles.pressureNumber}>03</span>
            <div className={styles.pressureCardCopy}>
              <h3>Evidence is scattered</h3>
              <p>Paper forms, WhatsApp, spreadsheets, emails and systems all hold part of the story.</p>
            </div>
          </article>

          <article className={`${styles.pressureCard} ${styles.pressureCardBlue}`} {...reveal(200)}>
            <span className={styles.pressureNumber}>04</span>
            <div className={styles.pressureCardCopy}>
              <h3>Time gets lost</h3>
              <p>Finding, organising and rebuilding evidence takes people away from the work.</p>
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

        <h2 className={styles.phaseTitle} id="phase-title" {...reveal()}>
          <span>Phase 1: Built to be</span>
          <span>simple, not clever.</span>
        </h2>
        <p className={styles.phaseSubtitle} {...reveal(80)}>
          We&apos;re building a simple journey: Capture → Organise → Report.
        </p>
        <a className={`${styles.primaryAction} ${styles.phaseAction}`} href="#apply" {...reveal(140)}>
          <img src="/assets/hero/arrow-forward-circle.svg" alt="" aria-hidden="true" />
          <span>Become a Founding Partner</span>
        </a>

        <div className={styles.phaseTimeline} aria-label="Proposed PureHive product journey: Capture, Organise, Report" {...reveal(180)}>
          <img className={`${styles.phaseLine} ${styles.phaseLineOne}`} src="/assets/phases/phase-line-one.svg" alt="" />
          <img className={`${styles.phaseLine} ${styles.phaseLineTwo}`} src="/assets/phases/phase-line-two.svg" alt="" />

          <div className={`${styles.phasePoint} ${styles.phasePointOne}`}><img src="/assets/phases/phase-dot-one.svg" alt="" /></div>
          <div className={`${styles.phasePoint} ${styles.phasePointTwo}`}><img src="/assets/phases/phase-dot-two.svg" alt="" /></div>
          <div className={`${styles.phasePoint} ${styles.phasePointThree}`}><img src="/assets/phases/phase-dot-one.svg" alt="" /></div>

          <span className={`${styles.phaseNumber} ${styles.phaseNumberOne}`}>01</span>
          <span className={`${styles.phaseNumber} ${styles.phaseNumberTwo}`}>02</span>
          <span className={`${styles.phaseNumber} ${styles.phaseNumberThree}`}>03</span>

          <div className={`${styles.phaseStepCopy} ${styles.phaseStepOne}`}>
            <h3>CAPTURE</h3>
            <p>
              We&apos;re building a way to capture operational evidence as work happens: QR/NFC check-ins,
              photographs, checklists, inspections and corrective actions.
            </p>
          </div>
          <div className={`${styles.phaseStepCopy} ${styles.phaseStepTwo}`}>
            <h3>ORGANISE</h3>
            <p>
              The proposed platform will structure evidence around sites, tasks, contracts, client requirements
              and compliance records.
            </p>
          </div>
          <div className={`${styles.phaseStepCopy} ${styles.phaseStepThree}`}>
            <h3>REPORT</h3>
            <p>
              The proposed platform will make relevant evidence easier to retrieve for client reporting, audits,
              contract reviews, compliance, procurement and ESG/social-value reporting.
            </p>
          </div>
        </div>

        <aside className={styles.phaseFuture} aria-label="Future phases" {...reveal(260)}>
          <div className={styles.phaseFutureHeading}>Future possibilities</div>
          <ul>
            <li>Optional IoT integration,</li>
            <li>AI-assisted ESG analysis,</li>
            <li>and enhanced verification</li>
          </ul>
          <p>Subject to Founding Partner validation.</p>
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

        <h2 className={styles.audienceTitle} id="audience-title" {...reveal()}>
          <span>Built for cleaning leaders, </span>
          <span>not compliance departments</span>
        </h2>
        <img
          className={styles.audienceFeature}
          src="/assets/audience/audience-feature.png"
          alt="A cleaning team standing together in a bright workplace"
          {...reveal(80)}
        />
        <a className={`${styles.primaryAction} ${styles.audienceAction}`} href="#apply" {...reveal(140)}>
          <img src="/assets/hero/arrow-forward-circle.svg" alt="" aria-hidden="true" />
          <span>Become a Founding Partner</span>
        </a>

        <div className={styles.audienceBand} {...reveal(200)}>
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

        <h2 className={styles.partnersTitle} id="partners-title" {...reveal()}>
          <span>Help shape it, <em>before</em></span>
          <span>everyone else uses it</span>
        </h2>
        <p className={styles.partnersSubtitle} {...reveal(80)}>
          We&apos;re not building PureHive in isolation. We&apos;re inviting a small number of UK cleaning and
          facilities-service businesses to help us understand real evidence challenges, review proposed
          workflows and shape the platform before wider release.
        </p>
        <a className={`${styles.primaryAction} ${styles.partnersAction}`} href="#apply" {...reveal(140)}>
          <img src="/assets/hero/arrow-forward-circle.svg" alt="" aria-hidden="true" />
          <span>Become a Founding Partner</span>
        </a>

        <div className={styles.pricingTable} {...reveal(180)}>
          <div className={styles.pricingRow}>
            <span>Cost to apply</span>
            <strong className={styles.pricingNone}>None</strong>
          </div>
          <div className={styles.pricingRow}>
            <span>Programme pricing</span>
            <strong className={styles.pricingTbc}>TBC</strong>
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

        <div className={styles.partnersPhotoFrame} {...reveal(240)}>
          <img src="/assets/partners/partners-team.png" alt="Three cleaning professionals in blue workwear" />
        </div>
      </section>

      <section className={styles.waitlistSection} id="apply" aria-labelledby="waitlist-title">
        <div className={styles.waitlistTorus} aria-hidden="true">
          <img className={styles.waitlistTorusBase} src="/assets/waitlist/waitlist-base.png" alt="" />
          <div className={styles.waitlistTorusColor} />
          <img className={styles.waitlistTorusSpec} src="/assets/waitlist/waitlist-spec.png" alt="" />
        </div>

        <div className={styles.waitlistCopy} {...reveal()}>
          <h2 id="waitlist-title">Apply to Become a PureHive Founding Partner</h2>
          <p>
            Tell us a little about your business. We&apos;re looking for UK cleaning and facilities-service
            businesses willing to share their operational evidence challenges and help shape PureHive before
            wider release.
          </p>
          <ul className={styles.waitlistBenefits}>
            <li><span className={styles.waitlistCheck}><img src="/assets/waitlist/waitlist-check.svg" alt="" /></span><span>Help validate the proposed platform</span></li>
            <li><span className={styles.waitlistCheck}><img src="/assets/waitlist/waitlist-check.svg" alt="" /></span><span>Share practical evidence challenges</span></li>
            <li><span className={styles.waitlistCheck}><img src="/assets/waitlist/waitlist-check.svg" alt="" /></span><span>Shape workflows before wider release</span></li>
          </ul>
        </div>

        {applicationStep === "initial" ? (
          <form className={styles.waitlistFormCard} onSubmit={handleInitialApplicationSubmit} {...reveal(120)}>
            <div className={styles.waitlistFields}>
              <div className={styles.waitlistFieldRow}>
                <label className={styles.waitlistField}>
                  <span>Full Name</span>
                  <div className={styles.waitlistInputWrap}>
                    <img src="/assets/waitlist/icon-personalcard.svg" alt="" />
                    <input type="text" name="name" placeholder="Your name" required />
                  </div>
                </label>

                <label className={styles.waitlistField}>
                  <span>Company Name</span>
                  <div className={styles.waitlistInputWrap}>
                    <img src="/assets/waitlist/icon-building.svg" alt="" />
                    <input type="text" name="company" placeholder="Company name" required />
                  </div>
                </label>
              </div>

              <div className={styles.waitlistFieldRow}>
                <label className={styles.waitlistField}>
                  <span>Work Email</span>
                  <div className={styles.waitlistInputWrap}>
                    <img src="/assets/waitlist/icon-sms.svg" alt="" />
                    <input type="email" name="email" placeholder="name@company.com" required />
                  </div>
                </label>

                {renderSelect(
                  "companySize",
                  "companySize",
                  "Company Size",
                  "/assets/waitlist/icon-building.svg",
                  companySize,
                  "Select company size",
                  companySizeOptions,
                  setCompanySize,
                )}
              </div>
            </div>

            {submitMessage ? (
              <p className={`${styles.waitlistStatus} ${styles.waitlistStatusError}`} role="status" aria-live="polite">
                {submitMessage}
              </p>
            ) : null}

            <button className={styles.waitlistSubmit} type="submit" disabled={submitStatus === "submitting"}>
              <img src="/assets/waitlist/waitlist-arrow.svg" alt="" aria-hidden="true" />
              <span>{submitStatus === "submitting" ? "Submitting..." : "Submit Founding Partner Application"}</span>
            </button>
            <p className={styles.waitlistApplicationNote}>There is no cost to apply.</p>
          </form>
        ) : null}

        {applicationStep === "followUpPrompt" ? (
          <div className={`${styles.waitlistFormCard} ${styles.waitlistAcknowledgement}`} {...reveal(120)}>
            <h3>Thank you for your interest in PureHive.</h3>
            <p>We&apos;ve received your Founding Partner application.</p>
            <p>Help us understand your current evidence challenges by answering a few additional questions.</p>
            <button
              className={styles.waitlistSubmit}
              type="button"
              onClick={() => {
                setApplicationStep("research");
                setSubmitStatus("idle");
                setSubmitMessage("");
              }}
            >
              <img src="/assets/waitlist/waitlist-arrow.svg" alt="" aria-hidden="true" />
              <span>Tell Us More — About 60 Seconds</span>
            </button>
            <p className={styles.waitlistApplicationNote}>There is no cost to apply.</p>
          </div>
        ) : null}

        {applicationStep === "research" ? (
          <form className={styles.waitlistFormCard} onSubmit={handleResearchSubmit} {...reveal(120)}>
            <h3 className={styles.waitlistFormTitle}>Tell us a little more</h3>
            <p className={styles.waitlistFormIntro}>About 60 seconds — your answers will help shape PureHive.</p>
            <div className={styles.waitlistFields}>
              <div className={styles.waitlistFieldRow}>
                <label className={styles.waitlistField}>
                  <span>
                    Phone <em className={styles.waitlistOptional}>optional</em>
                  </span>
                  <div className={styles.waitlistInputWrap}>
                    <img src="/assets/waitlist/icon-mobile.svg" alt="" />
                    <input type="tel" name="phone" placeholder="Phone number" />
                  </div>
                </label>

                <label className={styles.waitlistField}>
                  <span>Job Title</span>
                  <div className={styles.waitlistInputWrap}>
                    <img src="/assets/waitlist/icon-briefcase.svg" alt="" />
                    <input type="text" name="jobTitle" placeholder="e.g. Managing Director" required />
                  </div>
                </label>
              </div>

              <div className={styles.waitlistFieldRow}>
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
              </div>

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

            {submitMessage ? (
              <p className={`${styles.waitlistStatus} ${styles.waitlistStatusError}`} role="status" aria-live="polite">
                {submitMessage}
              </p>
            ) : null}

            <button className={styles.waitlistSubmit} type="submit" disabled={submitStatus === "submitting"}>
              <img src="/assets/waitlist/waitlist-arrow.svg" alt="" aria-hidden="true" />
              <span>{submitStatus === "submitting" ? "Saving..." : "Save My Answers"}</span>
            </button>
          </form>
        ) : null}

        {applicationStep === "complete" ? (
          <div className={`${styles.waitlistFormCard} ${styles.waitlistAcknowledgement}`} {...reveal(120)}>
            <h3>Thank you for telling us more.</h3>
            <p>We&apos;ve saved your additional answers.</p>
            <p>They will help us understand real evidence challenges as we shape PureHive before wider release.</p>
            <p className={styles.waitlistApplicationNote}>There is no cost to apply.</p>
          </div>
        ) : null}
      </section>

      <footer className={styles.footer} {...reveal()}>
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
