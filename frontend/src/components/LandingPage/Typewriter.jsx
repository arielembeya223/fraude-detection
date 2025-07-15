// Typewriter.jsx (idem, juste un peu plus gros ici)
import React, { useEffect, useState } from "react";

export default function Typewriter({ lines, speed = 50, pauseBetweenLines = 700, style }) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (currentLine >= lines.length) return;

    let charIndex = 0;
    const line = lines[currentLine];

    const interval = setInterval(() => {
      setCurrentText((prev) => prev + line.charAt(charIndex));
      charIndex++;
      if (charIndex >= line.length) {
        clearInterval(interval);
        setDisplayedLines((prev) => [...prev, line]);
        setCurrentText("");
        setCurrentLine((prev) => prev + 1);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [currentLine, lines, speed]);

  return (
    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.3, fontWeight: 700, ...style }}>
      {displayedLines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
      <div>{currentText}</div>
    </div>
  );
}
