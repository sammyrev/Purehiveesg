/* eslint-disable @next/next/no-img-element -- Logo matches the marketing site's SVG asset. */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AdminUnauthorizedError,
  adminTokenStorageKey,
  fetchWaitlistSubmissions,
  loginAdmin,
  type WaitlistSubmission,
} from "@/lib/api";
import styles from "./page.module.css";

type DashboardStatus = "loading" | "ready" | "error" | "unauthorized";
type AdminSection = "overview" | "waitlist" | "reports";

const weekMs = 7 * 24 * 60 * 60 * 1000;
const pageSize = 8;

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;

const toCsv = (rows: WaitlistSubmission[]) => {
  const header = [
    "Submitted",
    "Name",
    "Company",
    "Email",
    "Phone",
    "Job title",
    "Company size",
    "Region",
    "Public sector",
    "Time spent",
    "Evidence",
    "Interests",
    "Challenge",
  ];

  const lines = rows.map((row) =>
    [
      formatDate(row.createdAt),
      row.name,
      row.company,
      row.email,
      row.phone,
      row.jobTitle,
      row.companySize,
      row.region,
      row.publicSector,
      row.timeSpent,
      row.evidenceMethods.join("; "),
      row.interests.join("; "),
      row.challenge,
    ]
      .map(csvEscape)
      .join(","),
  );

  return [header.join(","), ...lines].join("\n");
};

const matchesQuery = (row: WaitlistSubmission, query: string) => {
  if (!query) {
    return true;
  }

  const haystack = [
    row.name,
    row.company,
    row.email,
    row.phone,
    row.jobTitle,
    row.companySize,
    row.region,
    row.publicSector,
    row.timeSpent,
    row.challenge,
    ...row.evidenceMethods,
    ...row.interests,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<WaitlistSubmission[]>([]);
  const [status, setStatus] = useState<DashboardStatus>("unauthorized");
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [weekAgo] = useState(() => Date.now() - weekMs);
  const tokenRef = useRef("");

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(adminTokenStorageKey);
    tokenRef.current = "";
    setSubmissions([]);
    setStatus("unauthorized");
  }, []);

  const loadSubmissions = useCallback(
    async (sessionToken: string) => {
      setStatus("loading");
      setErrorMessage("");

      try {
        const data = await fetchWaitlistSubmissions(sessionToken);
        setSubmissions(data);
        setStatus("ready");
      } catch (error) {
        if (error instanceof AdminUnauthorizedError) {
          clearSession();
          return;
        }

        setStatus("error");
        setErrorMessage(
          error instanceof TypeError
            ? "Could not reach the waitlist service. Please try again."
            : error instanceof Error
              ? error.message
              : "Could not load waitlist submissions.",
        );
      }
    },
    [clearSession],
  );

  useEffect(() => {
    const storedToken = sessionStorage.getItem(adminTokenStorageKey) ?? "";

    if (!storedToken) {
      return;
    }

    tokenRef.current = storedToken;
    const loadTimer = window.setTimeout(() => void loadSubmissions(storedToken), 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadSubmissions]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return submissions.filter((row) => matchesQuery(row, needle));
  }, [query, submissions]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  const stats = useMemo(() => {
    return {
      total: submissions.length,
      thisWeek: submissions.filter((row) => new Date(row.createdAt).getTime() >= weekAgo).length,
      publicSector: submissions.filter((row) => row.publicSector === "Yes").length,
      pilots: submissions.filter((row) => row.interests.includes("Pilot")).length,
    };
  }, [submissions, weekAgo]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    setSigningIn(true);

    try {
      const session = await loginAdmin(username.trim(), password);
      sessionStorage.setItem(adminTokenStorageKey, session.token);
      tokenRef.current = session.token;
      setPassword("");
      await loadSubmissions(session.token);
    } catch (error) {
      setLoginError(
        error instanceof TypeError
          ? "Could not reach the admin service. Please try again."
          : error instanceof Error
            ? error.message
            : "Could not sign in.",
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "purehive-waitlist.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
    setExpandedId(null);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    setExpandedId(null);
  };

  const renderTags = (values: string[]) => {
    if (!values.length) {
      return <span className={styles.emptyValue}>—</span>;
    }

    return (
      <div className={styles.tags}>
        {values.map((value) => (
          <span className={styles.tag} key={value}>
            {value}
          </span>
        ))}
      </div>
    );
  };

  const renderRows = () => {
    if (paged.length === 0) {
      return (
        <tr>
          <td className={styles.emptyCell} colSpan={6}>
            {submissions.length === 0 ? "No waitlist submissions yet." : "No submissions match this search."}
          </td>
        </tr>
      );
    }

    return paged.flatMap((row) => {
      const expanded = expandedId === row.id;

      return [
        <tr
          className={expanded ? styles.rowExpanded : undefined}
          key={row.id}
          onClick={() => setExpandedId(expanded ? null : row.id)}
        >
          <td className={styles.contactCell}>
            <strong className={styles.contactName}>{row.name}</strong>
            <div className={styles.contactSub}>
              <span>{row.company}</span>
              <a href={`mailto:${row.email}`} onClick={(event) => event.stopPropagation()}>
                {row.email}
              </a>
            </div>
          </td>
          <td className={styles.dateCell}>{formatDate(row.createdAt)}</td>
          <td>{row.jobTitle}</td>
          <td className={styles.wideCol}>{row.region}</td>
          <td className={styles.wideCol}>{row.publicSector}</td>
          <td className={styles.wideCol}>{renderTags(row.interests)}</td>
        </tr>,
        expanded ? (
          <tr className={styles.detailRow} key={`${row.id}-detail`}>
            <td colSpan={6}>
              <dl className={styles.detailGrid}>
                <div>
                  <dt>Phone</dt>
                  <dd>{row.phone || "—"}</dd>
                </div>
                <div>
                  <dt>Company size</dt>
                  <dd>{row.companySize}</dd>
                </div>
                <div>
                  <dt>Region</dt>
                  <dd>{row.region}</dd>
                </div>
                <div>
                  <dt>Public sector</dt>
                  <dd>{row.publicSector}</dd>
                </div>
                <div>
                  <dt>Time spent</dt>
                  <dd>{row.timeSpent}</dd>
                </div>
                <div>
                  <dt>Evidence</dt>
                  <dd>{renderTags(row.evidenceMethods)}</dd>
                </div>
                <div>
                  <dt>Interests</dt>
                  <dd>{renderTags(row.interests)}</dd>
                </div>
                <div className={styles.detailChallenge}>
                  <dt>Challenge</dt>
                  <dd>{row.challenge}</dd>
                </div>
              </dl>
            </td>
          </tr>
        ) : null,
      ];
    });
  };

  if (status === "unauthorized") {
    return (
      <main className={`${styles.page} ${styles.authPage}`}>
        <form className={styles.unlockCard} onSubmit={handleLogin}>
          <Link className={styles.authLogo} href="/" aria-label="PureHive ESG home">
            <img src="/assets/purehive-logo.svg" alt="PureHive ESG" />
          </Link>
          <span className={styles.secureLabel}>Secure workspace</span>
          <h1>Welcome back.</h1>
          <p>Sign in to review and manage your incoming waitlist submissions.</p>
          <label className={styles.field}>
            <span>Username</span>
            <input
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              required
              type="text"
              value={username}
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
          </label>
          {loginError ? (
            <p className={styles.formError} role="alert">
              {loginError}
            </p>
          ) : null}
          <button disabled={signingIn} type="submit">
            {signingIn ? "Signing in..." : "Log in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <Link className={styles.logo} href="/" aria-label="PureHive ESG home">
          <img src="/assets/purehive-logo.svg" alt="PureHive ESG" />
        </Link>

        <nav className={styles.navigation} aria-label="Admin navigation">
          <span className={styles.navSectionLabel}>Workspace</span>
          <a
            aria-current={activeSection === "overview" ? "page" : undefined}
            className={`${styles.navItem} ${activeSection === "overview" ? styles.navItemActive : ""}`}
            href="#overview"
            onClick={() => setActiveSection("overview")}
          >
            <span className={styles.navIcon} aria-hidden="true">⌘</span>
            Overview
          </a>
          <a
            aria-current={activeSection === "waitlist" ? "page" : undefined}
            className={`${styles.navItem} ${activeSection === "waitlist" ? styles.navItemActive : ""}`}
            href="#submissions"
            onClick={() => setActiveSection("waitlist")}
          >
            <span className={styles.navIcon} aria-hidden="true">◌</span>
            Waitlist
            <span className={styles.navCount}>{stats.total}</span>
          </a>
          <a
            aria-current={activeSection === "reports" ? "page" : undefined}
            className={`${styles.navItem} ${activeSection === "reports" ? styles.navItemActive : ""}`}
            href="#reports"
            onClick={() => setActiveSection("reports")}
          >
            <span className={styles.navIcon} aria-hidden="true">↗</span>
            Reports
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.supportCard}>
            <span className={styles.supportMark} aria-hidden="true">?</span>
            <div>
              <strong>Need a hand?</strong>
              <span>Your workspace is up to date.</span>
            </div>
          </div>
          <button className={styles.signOut} onClick={clearSession} type="button">
            <span aria-hidden="true">↪</span> Sign out
          </button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            <span>PureHive</span>
            <span aria-hidden="true">/</span>
            <strong>Admin workspace</strong>
          </div>
          <div className={styles.adminIdentity}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>System online</span>
            <span className={styles.avatar} aria-hidden="true">PH</span>
          </div>
        </header>

        <section className={styles.intro} aria-labelledby="dashboard-title" id="overview">
          <div>
            <p className={styles.eyebrow}>Audience intelligence</p>
            <h1 id="dashboard-title">Welcome to your<br />waitlist.</h1>
            <p className={styles.introCopy}>A focused view of the people and organisations interested in building better evidence with PureHive.</p>
          </div>
          <div className={styles.introAccent} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className={styles.stats} aria-label="Waitlist totals" id="reports">
          <article className={`${styles.statCard} ${styles.primaryStat}`}>
            <div className={styles.statTopline}>
              <p>Total audience</p>
              <span className={styles.statGlyph} aria-hidden="true">✦</span>
            </div>
            <strong>{stats.total}</strong>
            <span className={styles.statNote}>All submissions received</span>
          </article>
          <article className={styles.statCard}>
            <div className={styles.statTopline}>
              <p>New this week</p>
              <span className={styles.statGlyph} aria-hidden="true">↗</span>
            </div>
            <strong>{stats.thisWeek}</strong>
            <span className={styles.statNote}>Past seven days</span>
          </article>
          <article className={styles.statCard}>
            <div className={styles.statTopline}>
              <p>Public sector</p>
              <span className={styles.statGlyph} aria-hidden="true">⌂</span>
            </div>
            <strong>{stats.publicSector}</strong>
            <span className={styles.statNote}>Active public interest</span>
          </article>
          <article className={styles.statCard}>
            <div className={styles.statTopline}>
              <p>Pilot interest</p>
              <span className={styles.statGlyph} aria-hidden="true">◎</span>
            </div>
            <strong>{stats.pilots}</strong>
            <span className={styles.statNote}>Asked to join a pilot</span>
          </article>
        </section>

        <section className={styles.submissionsSection} aria-labelledby="submissions-title" id="submissions">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Live submissions</p>
              <h2 id="submissions-title">People waiting to hear from us.</h2>
            </div>
            <span className={styles.livePill}><span aria-hidden="true" /> Live data</span>
          </div>

          <section className={styles.toolbar}>
            <label className={styles.search}>
              <span className={styles.searchIcon} aria-hidden="true">⌕</span>
              <span className={styles.srOnly}>Search submissions</span>
              <input
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search name, email or company"
                type="search"
                value={query}
              />
            </label>
            <div className={styles.actions}>
              <button className={styles.secondaryAction} onClick={() => void loadSubmissions(tokenRef.current)} type="button">
                <span aria-hidden="true">↻</span> Refresh
              </button>
              <button className={styles.exportAction} disabled={filtered.length === 0} onClick={handleExport} type="button">
                <span aria-hidden="true">↓</span> Export CSV
              </button>
            </div>
          </section>

          {status === "error" ? (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          ) : null}

          {status === "loading" ? <p className={styles.emptyState}>Loading submissions...</p> : null}

          {status === "ready" ? (
            <>
              <div className={styles.tableWrap}>
                <div className={styles.tableMeta}>
                  <span>{filtered.length} {filtered.length === 1 ? "contact" : "contacts"}</span>
                  <span>Click a row to see the full profile</span>
                </div>
                <table className={styles.table}>
                  <caption className={styles.srOnly}>Waitlist submissions</caption>
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Submitted</th>
                      <th>Job title</th>
                      <th className={styles.wideCol}>Region</th>
                      <th className={styles.wideCol}>Public sector</th>
                      <th className={styles.wideCol}>Interests</th>
                    </tr>
                  </thead>
                  <tbody>{renderRows()}</tbody>
                </table>
              </div>
              <div className={styles.pagination}>
                <p>
                  {filtered.length === 0
                    ? "No submissions"
                    : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length}`}
                </p>
                <div className={styles.pageButtons}>
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    type="button"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {pageCount}
                  </span>
                  <button
                    disabled={currentPage >= pageCount}
                    onClick={() => handlePageChange(currentPage + 1)}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}
