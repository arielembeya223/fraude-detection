import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ParticleBackground from "./ParticleBackground";
import Typewriter from "./Typewriter";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Détection de Fraude Financière Avancée";
  }, []);

  const introLines = [
    "Bienvenue sur Fraud Detection.",
    "Notre solution révolutionne la sécurité financière grâce à l’analyse graphique et à l’IA.",
    "Découvrez comment détecter les fraudes efficacement.",
  ];

  const sections = [
    {
      title: "Analyse Graphique Puissante",
      lines: [
        "Une analyse en profondeur des réseaux de paiement pour identifier les anomalies.",
        "Visualisez les transactions sous forme de graphes dynamiques.",
      ],
      img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
      imgAlt: "Analyse graphique",
    },
    {
      title: "IA et Machine Learning",
      lines: [
        "Machine Learning avancé pour apprendre des comportements suspects.",
        "Détection en temps réel et prévention proactive des fraudes.",
      ],
      img: "/machine.jpeg",
      imgAlt: "Machine Learning",
    },
    {
      title: "Rapports Dynamiques",
      lines: [
        "Visualisations interactives et tableaux de bord personnalisés.",
        "Gardez un œil sur les tendances et agissez rapidement.",
      ],
      img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80",
      imgAlt: "Rapports dynamiques",
    },
    {
      title: "Sécurité Renforcée",
      lines: [
        "Protection avancée des données et conformité réglementaire.",
        "Gardez vos informations confidentielles en toute confiance.",
      ],
      img: "/securite.jpeg",
      imgAlt: "Sécurité renforcée",
    },
  ];

  return (
    <div style={styles.page}>
      <ParticleBackground />

      <div style={styles.bgOverlay}></div>

      <header style={styles.header}>
        <div style={styles.logo}>FRAUD DETECTION</div>
        <nav style={styles.nav}>
          <a href="/login" style={styles.navLink}>
            Connexion
          </a>
          <a href="/register" style={styles.navLink}>
            Inscription
          </a>
        </nav>
      </header>

      {/* Intro plein écran */}
      <section style={styles.heroFullScreen}>
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ maxWidth: 850, margin: "auto", textAlign: "center" }}
        >
          <Typewriter
            lines={introLines}
            speed={45}
            pauseBetweenLines={700}
            style={{ fontSize: 28, color: "#2c2c2c", fontWeight: "700" }}
          />

          <motion.button
            whileHover={{
              scale: 1.07,
              boxShadow: "0 10px 30px rgba(108, 99, 255, 0.4)",
              backgroundColor: "#5a54d1",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/register")}
            style={styles.ctaButtonLarge}
          >
            Commencer Maintenant
          </motion.button>
        </motion.div>
      </section>

      {/* Sections scrollables */}
      {sections.map((sec, idx) => {
        const isEven = idx % 2 === 0;
        return (
          <section
            key={idx}
            style={{
              ...styles.section,
              flexDirection: isEven ? "row" : "row-reverse",
            }}
          >
            <motion.img
              src={sec.img}
              alt={sec.imgAlt}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              style={styles.image}
              whileHover={{ scale: 1.05, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9 }}
              style={styles.textBlock}
            >
              <h2 style={styles.sectionTitle}>{sec.title}</h2>
              <Typewriter
                lines={sec.lines}
                speed={40}
                pauseBetweenLines={600}
                style={{ fontSize: 20, color: "#555555", fontWeight: "600" }}
              />
            </motion.div>
          </section>
        );
      })}

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Fraud Detection — Tous droits réservés.
      </footer>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f8f8f8",
    minHeight: "100vh",
    overflowX: "hidden",
  },
bgOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: `
    radial-gradient(circle at 25% 25%, #c2fff3 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, #cce6ff 0%, transparent 50%)
  `,
  filter: "blur(120px)",
  zIndex: 0,
},

  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 36px",
    backgroundColor: "rgba(255,255,255,0.85)",
    backdropFilter: "saturate(180%) blur(14px)",
    fontWeight: "700",
    fontSize: 20,
  },
  logo: {
    color: "#2c2c2c",
  },
  nav: {
    display: "flex",
    gap: 28,
  },
  navLink: {
    color: "#00d48c",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: 17,
    cursor: "pointer",
    transition: "color 0.3s ease",
  },
  heroFullScreen: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 20px",
    zIndex: 10,
    position: "relative",
    flexDirection: "column",
  },
  ctaButtonLarge: {
    marginTop: 44,
    backgroundColor: "#6c63ff",
    border: "none",
    padding: "16px 50px",
    borderRadius: 50,
    color: "#fff",
    fontWeight: "700",
    fontSize: 22,
    cursor: "pointer",
    boxShadow: "0 12px 40px rgba(108, 99, 255, 0.4)",
    transition: "background-color 0.3s ease",
  },
  section: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
    maxWidth: 1100,
    margin: "0 auto 70px",
    padding: "0 20px",
    flexWrap: "wrap",
    zIndex: 10,
    position: "relative",
  },
  textBlock: {
    flex: "1 1 400px",
    maxWidth: 500,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2c2c2c",
    marginBottom: 28,
    letterSpacing: 0.8,
  },
  image: {
    flex: "1 1 400px",
    maxWidth: 500,
    borderRadius: 24,
    boxShadow: "0 10px 35px rgba(0,0,0,0.12)",
    objectFit: "cover",
    height: 340,
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  footer: {
    textAlign: "center",
    padding: 32,
    fontSize: 15,
    color: "#4a4a4a",
    backgroundColor: "#ececec",
    fontWeight: "600",
    position: "relative",
    zIndex: 10,
  },
};
