import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";

const ADDRESS_COPY = "143 S Central Expy, McKinney, TX 75070";
const ADDRESS_LINE_1 = "143 S Central Expy";
const ADDRESS_LINE_2 = "Inside J’s Barber/Stylist College · next to thrift store";

const TEXT_NUMBER_DISPLAY = "469-759-3881";
const TEXT_NUMBER_RAW = "4697593881";

const EMAIL_TO = "support@pinkswann.com";

// TikTok embeds (keep all)
const TIKTOK_URLS: string[] = [
  "https://www.tiktok.com/@beautyoggg/video/7384826569535114526?is_from_webapp=1&sender_device=pc&web_id=7350495373890324014",
  "https://www.tiktok.com/@beautyoggg/video/7315933443517320478?is_from_webapp=1&sender_device=pc&web_id=7350495373890324014",
  "https://www.tiktok.com/@beautyoggg/video/7379281367881993518?is_from_webapp=1&sender_device=pc&web_id=7350495373890324014",
  "https://www.tiktok.com/@beautyoggg/video/7289627306522332459?is_from_webapp=1&sender_device=pc&web_id=7350495373890324014",
  "https://www.tiktok.com/@patty.ldy/video/7547703106826456351?is_from_webapp=1&sender_device=pc&web_id=7350495373890324014",
  "https://www.tiktok.com/@patty.ldy/video/7395684303566392618?is_from_webapp=1&sender_device=pc&web_id=7350495373890324014",
];

type SectionId =
  | "hero"
  | "context"
  | "availability"
  | "crownReset"
  | "flow"
  | "form"
  | "experience"
  | "faqFinal";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "context", label: "Quick Context" },
  { id: "availability", label: "Availability" },
  { id: "crownReset", label: "Crown Reset" },
  { id: "flow", label: "The Booking Flow" },
  { id: "form", label: "Request" },
  { id: "experience", label: "Experience" },
  { id: "faqFinal", label: "FAQ" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.21, 0.8, 0.2, 1] },
  },
};

function buildMailto(subject: string, body: string) {
  const s = encodeURIComponent(subject);
  const b = encodeURIComponent(body);
  return `mailto:${EMAIL_TO}?subject=${s}&body=${b}`;
}

function buildSmsHref(body: string) {
  const encoded = encodeURIComponent(body);
  return `sms:${TEXT_NUMBER_RAW}?body=${encoded}`;
}

// IMPORTANT: single-line SMS body (no “lines”/dividers)
function buildSingleLineText(opts: {
  name: string;
  phone: string;
  email: string;
  service: string;
  serviceType: string;
  preferredDate: string;
  timing: string;
  notes: string;
}) {
  const safe = (v: string) => (v || "").trim();
  const parts = [
    "Hey Pink Swann, Crown Request.",
    `Name: ${safe(opts.name) || "-"}`,
    `Phone: ${safe(opts.phone) || "-"}`,
    `Email: ${safe(opts.email) || "-"}`,
    `Service: ${safe(opts.service) || "-"}`,
    `Type: ${safe(opts.serviceType) || "-"}`,
    `Preferred Date: ${safe(opts.preferredDate) || "-"}`,
    `Time Window: ${safe(opts.timing) || "-"}`,
    `Notes: ${safe(opts.notes) || "-"}`,
  ];
  return parts.join(" | ");
}

// NEW: Blank prefilled SMS (multi-line; each input on a new line)
function buildBlankMultilineText() {
  return [
    "Hey Pink Swann, Crown Request.",
    "",
    "Name:",
    "Phone:",
    "Email:",
    "Service:",
    "Type: In-Shop or Mobile",
    "Preferred Date:",
    "Time Window:",
    "",
    "Notes:",
  ].join("\n");
}

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/?/, "")}`;

export default function App() {
  const [active, setActive] = useState<SectionId>("hero");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form state (no Google Sheets submission right now; this only powers the text CTA)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("Help Me Choose");
  const [serviceType, setServiceType] = useState("In-Shop");
  const [timing, setTiming] = useState("");
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  const validation = useMemo(() => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Name is required.");
    if (!phone.trim()) errs.push("Phone is required.");
    if (!service.trim()) errs.push("Service selection is required.");
    return { ok: errs.length === 0, errs };
  }, [name, phone, service]);

  // Filled text (used in FORM Text To Book button)
  const smsHref = useMemo(() => {
    const body = buildSingleLineText({
      name,
      phone,
      email,
      service,
      serviceType,
      preferredDate,
      timing,
      notes,
    });
    return buildSmsHref(body);
  }, [name, phone, email, service, serviceType, preferredDate, timing, notes]);

  // Blank template text (used in TOP Request Appointment + BOTTOM sticky Text To Book)
  const smsBlankHref = useMemo(() => {
    return buildSmsHref(buildBlankMultilineText());
  }, []);

  const mailtoHref = useMemo(() => {
    const subject = "Appointment Request";
    const body = [
      "Appointment Request",
      "",
      `Name: ${name || ""}`,
      `Phone: ${phone || ""}`,
      `Email: ${email || ""}`,
      `Preferred Date: ${preferredDate || ""}`,
      `Service: ${service || ""}`,
      `Service Type: ${serviceType || ""}`,
      `Timing Preferences: ${timing || ""}`,
      "",
      "Notes:",
      notes || "",
      "",
      `Text: ${TEXT_NUMBER_DISPLAY}`,
      `Address: ${ADDRESS_COPY}`,
    ].join("\n");
    return buildMailto(subject, body);
  }, [name, phone, email, preferredDate, service, serviceType, timing, notes]);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (visible?.target?.id) setActive(visible.target.id as SectionId);
      },
      { threshold: [0.25, 0.45, 0.6] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (TIKTOK_URLS.length === 0) return;
    const src = "https://www.tiktok.com/embed.js";
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return;
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(ADDRESS_COPY);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  function scrollTo(id: SectionId) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Kept for hero/final CTA (scrolls to form)
  function goToRequest() {
    setShowValidation(false);
    scrollTo("form");
  }

  function onTextClick(e: MouseEvent) {
    setShowValidation(true);
    if (!validation.ok) {
      e.preventDefault();
    }
  }

  return (
    <div className="page">
      <div className="bg" />

      {/* Sticky Top Bar: Request Appointment -> BLANK prefilled SMS (NO Text To Book up top) */}
      <div className="topbar">
        <div className="topbarInner">
          <div className="brand">
            <div className="brandTitle">Crown Booking</div>
            <div className="brandMeta">
              <b>{ADDRESS_LINE_1}</b> · {ADDRESS_LINE_2}
            </div>
          </div>

          <div className="actionsRow">
            <a className="pill primary" href={smsBlankHref} style={{ fontSize: 16, padding: "12px 14px" }}>
              Request Appointment
            </a>

            <button
              className="pill"
              onClick={copyAddress}
              type="button"
              aria-label="Copy address"
              style={{ fontSize: 15, padding: "12px 14px" }}
            >
              📍 <b>{copied ? "Copied" : "Copy Address"}</b>
            </button>
          </div>
        </div>
      </div>

      {/* Dot Navigation */}
      <div className="dotnav" aria-label="Section navigation">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`dotbtn ${active === s.id ? "active" : ""}`}
            onClick={() => scrollTo(s.id)}
            title={s.label}
            aria-label={s.label}
            type="button"
          />
        ))}
      </div>

      <main className="wrap">
        {/* HERO */}
        <motion.section
          id="hero"
          className="section"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="sectionInner">
            <h1 className="h1">Come home to your crown.</h1>
            <p className="sub">
              Intentional hair care, grounding scalp massage, and protective styling—
              <br />
              designed to support calm, clarity, and long-term consistency.
            </p>

            <div className="btnRow">
              <button className="btn btnPrimary" type="button" onClick={goToRequest}>
                Request Appointment
              </button>
            </div>

            <div className="smallNote">Every request is reviewed personally.</div>
          </div>
        </motion.section>

        {/* QUICK CONTEXT */}
        <motion.section
          id="context"
          className="section"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="sectionInner">
            <div className="cards3">
              <div className="card">
                <div className="cardTitle">The Work</div>
                <div className="cardBody">Crown care that’s handled right. No extra, no guessing.</div>
              </div>
              <div className="card">
                <div className="cardTitle">How It Feels</div>
                <div className="cardBody">Calm all the way through. Nothing rushed.</div>
              </div>
              <div className="card">
                <div className="cardTitle">What It Delivers</div>
                <div className="cardBody">Care that’s intentional and results you can stand on.</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* AVAILABILITY */}
        <motion.section
          id="availability"
          className="section"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="sectionInner">
            <h2 className="h2">Availability</h2>

            <div className="cards2" style={{ marginTop: 12 }}>
              <div className="card">
                <div className="cardTitle">In-Shop</div>
                <div className="cardBody">
                  Fri 11:30–3:30
                  <br />
                  Sat 2:00–6:00
                  <br />
                  <br />
                  Walk-ins welcome if space allows.
                </div>
              </div>
              <div className="card">
                <div className="cardTitle">Mobile</div>
                <div className="cardBody">Limited weekday availability.</div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <div className="cardBody">
                Appointments roll out monthly.
                <br />
                If what you’re looking for isn’t available yet, you can still request and get notified when spots open up.
              </div>

              {/* Media order: Crown Reset → Protective → Signature */}
              <div className="mediaStrip" aria-label="Visuals">
                <a
                  className="mediaCard"
                  href="https://pinkswann.com/shop/crown-reset-sensory-haircare/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={asset("media/crown-reset.png")} alt="Crown Reset" loading="lazy" />
                </a>
                <a
                  className="mediaCard"
                  href="https://pinkswann.com/shop/protective-crown-sensory-haircare/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={asset("media/protective-crown.png")} alt="Protective Crown" loading="lazy" />
                </a>
                <a
                  className="mediaCard"
                  href="https://pinkswann.com/shop/signature-crown-sensory-haircare/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={asset("media/signature-crown.png")} alt="Signature Crown" loading="lazy" />
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FEATURED STARTING POINT */}
        <motion.section
          id="crownReset"
          className="section"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="sectionInner">
            <h2 className="h2">Start With A Crown Reset</h2>
            <div className="body center">
              A calming scalp cleanse and treatment to clear buildup, ease tension,
              <br />
              and get your crown ready for whatever’s next.
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <div className="cardBody">This is a good place to start if:</div>
              <ul className="list">
                <li>Your scalp feels tight, itchy, or overwhelmed</li>
                <li>You’re coming out of braids, wigs, or a heavy season</li>
                <li>You’re not sure what service you need yet</li>
              </ul>
              <div className="cardBody" style={{ marginTop: 10 }}>
                A lot of people start here, then we decide on styling together once you’re settled.
              </div>

              <div className="btnRow" style={{ justifyContent: "center", marginTop: 12 }}>
                <a
                  className="btn btnPrimary"
                  href="https://pinkswann.com/shop/crown-reset-sensory-haircare/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Start With A Crown Reset
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* HOW BOOKING WORKS */}
        <motion.section
          id="flow"
          className="section"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="sectionInner">
            <h2 className="h2">The Booking Flow</h2>

            <div className="cards3" style={{ marginTop: 12 }}>
              <div className="card">
                <div className="cardTitle">1. Request Care</div>
                <div className="cardBody">
                  Share the service you’re seeking, timing preferences, and service type.
                </div>
              </div>
              <div className="card">
                <div className="cardTitle">2. Review &amp; Approval</div>
                <div className="cardBody">
                  Requests are reviewed personally. Approved bookings receive confirmation and next steps.
                </div>
              </div>
              <div className="card">
                <div className="cardTitle">3. Confirmation &amp; Retainer</div>
                <div className="cardBody">Appointments are secured with a retainer.</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FORM INTRO + FORM */}
        <motion.section
          id="form"
          className="section"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="sectionInner">
            <h2 className="h2">Request Your Appointment</h2>

            <div className="body center">
              If you’re stuck on what to choose, that’s okay.
              <br />
              Go with <b>Help Me Choose</b> and we’ll handle it together before anything’s set.
            </div>

            <div className="formGrid">
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                autoComplete="name"
              />
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                autoComplete="tel"
                inputMode="tel"
              />
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                autoComplete="email"
                inputMode="email"
              />

              <select className="select" value={service} onChange={(e) => setService(e.target.value)}>
                {[
                  "Scalp & Shampoo",
                  "Treatments",
                  "Natural Styles",
                  "Protective Styles",
                  "Wig Services",
                  "Kids’ Care",
                  "Events & Special Occasions",
                  "Help Me Choose",
                ].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>

              <select
                className="select"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                {["In-Shop", "Mobile"].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>

              <input
                className="input"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
              <input
                className="input"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                placeholder="Preferred time window (optional)"
              />
              <textarea
                className="textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (sensory needs, hair history, goals…)"
              />
            </div>

            {showValidation && !validation.ok && (
              <div className="formAlert" role="alert" aria-live="polite">
                {validation.errs.map((e) => (
                  <div key={e}>• {e}</div>
                ))}
              </div>
            )}

            <div className="btnRow" style={{ marginTop: 14 }}>
              <a className="btn btnPrimary" href={smsHref} onClick={onTextClick}>
                Text To Book
              </a>
            </div>

            <div className="smallNote">Every request is reviewed personally.</div>
          </div>
        </motion.section>

        {/* EXPERIENCE & SAFETY */}
        <motion.section
          id="experience"
          className="section"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="sectionInner">
            <h2 className="h2">More Than A Service</h2>

            <div className="body center">This is calm, considered care.</div>
            <ul className="list">
              <li>Intentional touch</li>
              <li>Clear expectations</li>
              <li>Trauma-informed, kid-friendly</li>
              <li>Respect for time and boundaries</li>
            </ul>

            <div className="body center" style={{ marginTop: 10 }}>
              If you have sensory needs or appointment anxiety, you can share that when you book.
            </div>

            {TIKTOK_URLS.length > 0 && (
              <div className="tiktokGrid" aria-label="TikTok embeds">
                {TIKTOK_URLS.map((url) => {
                  const id = url.split("/video/")[1]?.split("?")[0] ?? "";
                  return (
                    <blockquote
                      key={url}
                      className="tiktok-embed"
                      cite={url}
                      data-video-id={id}
                      style={{ maxWidth: 605, minWidth: 325 }}
                    >
                      <section />
                    </blockquote>
                  );
                })}
              </div>
            )}
          </div>
        </motion.section>

        {/* FAQ (includes: What You Can Request + About Appointment Holds) */}
        <motion.section
          id="faqFinal"
          className="section"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="sectionInner">
            <h2 className="h2">Before You Request</h2>

            <div className="accordion">
              {[
                {
                  q: "Not sure which service to pick?",
                  a: "That’s fine. Choose Help Me Choose and you’ll be guided before anything is locked in.",
                },
                {
                  q: "Don’t see the dates you want yet?",
                  a: "You can still request availability and get notified if a spot opens or when that month goes live.",
                },
                {
                  q: "What you can request",
                  a: [
                    "Scalp & Shampoo",
                    "Treatments",
                    "Natural Styles",
                    "Protective Styles",
                    "Wig Services",
                    "Kids’ Care",
                    "Events & Special Occasions",
                    "Help Me Choose",
                    "",
                    "Mobile availability varies by service, timing, and location.",
                  ].join("\n"),
                },
                {
                  q: "About appointment holds",
                  a: [
                    "After confirmation, a retainer is used to secure your appointment.",
                    "",
                    "• Retainer amounts vary based on service type",
                    "• A portion is non-refundable",
                    "• Retainers are due ahead of your appointment week",
                    "• Late changes may impact refund or credit options",
                    "",
                    "You’ll always get the full breakdown before payment.",
                  ].join("\n"),
                },
                {
                  q: "Do you work with kids?",
                  a: "Yes. Kid-friendly crown care and protective styling are available.",
                },
                {
                  q: "Where are in-shop appointments located?",
                  a: "143 S Central Expy — inside J’s Barber/Stylist College, next to the thrift store.",
                },
              ].map((item, idx) => {
                const open = openFaq === idx;
                return (
                  <div className="faqItem" key={idx}>
                    <button
                      className="faqBtn"
                      onClick={() => setOpenFaq(open ? null : idx)}
                      type="button"
                      aria-expanded={open}
                    >
                      <span>{item.q}</span>
                      <span className="faqIcon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" className={open ? "chev open" : "chev"}>
                          <path
                            d="M6.5 9.5L12 15l5.5-5.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    {open && (
                      <div className="faqAns" style={{ whiteSpace: "pre-line" }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <div className="cardBody" style={{ textAlign: "center", fontSize: 16 }}>
                If your crown’s been asking for attention, this is your moment to answer—on purpose.
              </div>

              <div className="btnRow" style={{ marginTop: 12 }}>
                <button className="btn btnPrimary" type="button" onClick={goToRequest}>
                  Begin Your Crown Care
                </button>
              </div>
            </div>

            <div className="footerMini">
              <div>
                📍 {ADDRESS_LINE_1} · Inside J’s Barber/Stylist College
                <br />
                📲 Text: {TEXT_NUMBER_DISPLAY} ·{" "}
                <a className="footerLink" href={mailtoHref}>
                  Email
                </a>
              </div>
              <div style={{ marginTop: 8 }}>
                <a
                  className="footerLink"
                  href="https://hustleignite.pinkswann.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Site Developed by HCH
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Bottom sticky bar: Text + color icons */}
        <div className="mobileCta" aria-label="Quick actions">
          {/* Bottom sticky Text To Book -> BLANK prefilled SMS */}
          <a className="btn btnPrimary" href={smsBlankHref}>
            Text To Book
          </a>

          <a
            className="iconBtn ig"
            href="https://instagram.com/beautyoggg"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7.5 2.8h9A4.7 4.7 0 0 1 21.2 7.5v9A4.7 4.7 0 0 1 16.5 21.2h-9A4.7 4.7 0 0 1 2.8 16.5v-9A4.7 4.7 0 0 1 7.5 2.8Zm9 1.9h-9A2.8 2.8 0 0 0 4.7 7.5v9a2.8 2.8 0 0 0 2.8 2.8h9a2.8 2.8 0 0 0 2.8-2.8v-9a2.8 2.8 0 0 0-2.8-2.8ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 1.9A2.9 2.9 0 1 0 14.9 12 2.9 2.9 0 0 0 12 9.1Zm5.4-2.4a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z"
                fill="currentColor"
              />
            </svg>
          </a>

          <a
            className="iconBtn yt"
            href="https://youtube.com/pinkswannbeauty"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.1 31.1 0 0 0 2 12a31.1 31.1 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.1 31.1 0 0 0 22 12a31.1 31.1 0 0 0-.4-4.8ZM10 15.2V8.8L15.6 12 10 15.2Z"
                fill="currentColor"
              />
            </svg>
          </a>

          <a
            className="iconBtn shop"
            href="https://mypsstore.pinkswann.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Shop"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 7V6a5 5 0 0 1 10 0v1h3l-1 14H5L4 7h3Zm2 0h6V6a3 3 0 0 0-6 0v1Zm0 4a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0v-1Zm6 0a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0v-1Z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}
