import Link from "next/link";

/**
 * Root-level not-found. Renders inside the root <html>/<body> shell when the
 * URL falls outside the [lang] segment (or before a locale match happens),
 * so visitors always see a friendly page instead of a Next.js error overlay.
 */
export default function RootNotFound() {
  return (
    <html lang="ka">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffcf5",
          backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
          backgroundSize: "26px 26px",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          color: "#2a1d14",
          padding: "32px 16px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              fontSize: 56,
              color: "#f3b62b",
              lineHeight: 1,
            }}
          >
            ✦
          </span>
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              fontSize: "clamp(36px, 6vw, 56px)",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              margin: "18px 0 10px",
            }}
          >
            ეს გვერდი დაიკარგა.
          </h1>
          <p style={{ fontSize: 15, opacity: 0.7, margin: "0 0 28px", lineHeight: 1.55 }}>
            ბმული, რომელიც გახსენი, ან არ არსებობს, ან გადატანილია. ამასობაში — შემოგვიარე მაღაზიაში.
          </p>
          <Link
            href="/ka/shop"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.02em",
              background: "#d56826",
              color: "#fef0d6",
              borderRadius: 999,
              padding: "12px 28px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            მაღაზიაში გადასვლა <span aria-hidden="true">→</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
