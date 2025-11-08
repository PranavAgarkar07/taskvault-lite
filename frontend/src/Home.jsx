import React from "react";
import { motion } from "framer-motion";
import "./Home.css";
import logoUrl from "./download.svg";
import { Link } from "react-router-dom";

import {
  FaBolt,
  FaShieldAlt,
  FaSyncAlt,
  FaRocket,
  FaCloud,
  FaCode,
} from "react-icons/fa";

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <div className="home-dark">
      {/* ===== Hero Section ===== */}
      <section
        className="hero-dark"
        style={{
          // display: "flex",
          justifyContent: "center", // Centers horizontally
          alignItems: "center", // Centers vertically
          height: "100vh", // Example: Occupy full viewport height
          width: "100vw", // Example: Occupy full viewport width
          // border: "1px solid lightgray", // For visualization
        }}
      >
        <img
          src={logoUrl}
          className="logo-svg"
          style={{
            justifyContent: "center", // Centers horizontally
            alignItems: "center", // Centers vertically
          }}
          alt="TaskVault logo"
        />
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="hero-title"
        >
          🗂️ TaskVault Lite
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="hero-subtitle"
        >
          Manage. Sync. Secure.
          <br />A lightning-fast open-source task manager built for you.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="hero-buttons"
        >
          <Link to="/dashboard" className="btn-primary">
            🚀 Launch App
          </Link>
          <a
            href="https://github.com/pranavagarkar07/taskvault-lite"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            View on GitHub
          </a>
        </motion.div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="features-dark" id="features">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="section-title"
        >
          ✨ Why TaskVault Lite?
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
          className="section-subtitle"
        >
          Designed to make productivity effortless — fast, private, and
          reliable.
        </motion.p>

        <div className="feature-grid">
          {[
            {
              icon: <FaBolt />,
              title: "Lightning Fast",
              text: "Optimized with local caching and smart sync — every action feels instant.",
            },
            {
              icon: <FaShieldAlt />,
              title: "Secure Authentication",
              text: "JWT-based login with Google & GitHub ensures your data stays safe.",
            },
            {
              icon: <FaSyncAlt />,
              title: "Offline Sync",
              text: "TaskVault remembers your data even when offline — syncs automatically later.",
            },
            {
              icon: <FaRocket />,
              title: "Smart Task Flow",
              text: "Filter, mark, and organize effortlessly with an intuitive UI.",
            },
            {
              icon: <FaCloud />,
              title: "Cross Platform",
              text: "Works on desktop, tablet, and mobile — seamlessly.",
            },
            {
              icon: <FaCode />,
              title: "Open Source",
              text: "Built with React + Django REST — lightweight and transparent.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="feature-card-dark"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i / 4}
            >
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Call to Action ===== */}
      <motion.section
        className="cta-dark"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2>Start Organizing Today</h2>
        <p>Experience productivity redefined — simple, smart, and secure.</p>
        <Link to="/dashboard" className="btn-primary">
          Get Started →
        </Link>
      </motion.section>

      {/* ===== Footer ===== */}
      <footer className="footer-dark">
        <p>
          © 2025 TaskVault Lite — Built by{" "}
          <a
            href="https://github.com/pranavagarkar07"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pranav Agarkar
          </a>
        </p>
      </footer>
    </div>
  );
}
