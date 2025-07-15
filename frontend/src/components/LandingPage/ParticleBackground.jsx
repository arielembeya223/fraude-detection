import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useCallback } from "react";

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: {
          color: {
            value: "transparent",
          },
        },
        particles: {
          number: {
            value: 60,
            density: {
              enable: true,
              area: 2000,
            },
          },
          color: {
            value: ["#00d48c", "#4670f4"], // 💚 Vert et 💙 Bleu
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 0.3,
          },
          size: {
            value: { min: 6, max: 10 },
          },
          move: {
            enable: true,
            speed: 1.5,
            direction: "none",
            outModes: {
              default: "out",
            },
          },
          links: {
            enable: true,
            distance: 120,
            color: "#a1cfff",
            opacity: 0.2,
            width: 1,
          },
        },
        detectRetina: true,
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}