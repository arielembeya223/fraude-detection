import React, { useRef, useEffect } from 'react';
import { renderAsync } from 'docx-preview';
import './App.css';

const ReportPreview = () => {
  const previewRef = useRef(null);

  useEffect(() => {
    const loadDocx = async () => {
      try {
        const response = await fetch('/Rapport/maul.docx');
        const arrayBuffer = await response.arrayBuffer();
        
        await renderAsync(
          arrayBuffer,
          previewRef.current,
          null,
          {
            className: "compact-pages",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true, // Force la séparation en pages
            debug: false
          }
        );
      } catch (error) {
        console.error("Erreur lors du chargement du document:", error);
      }
    };

    loadDocx();
  }, []);

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <img src="logo.png" alt="Logo Fraud Detection" />
          <span><strong>Fraud Detection</strong></span>
        </div>
        <nav>
          <a href="#">Accueil</a>
          <a href="#">se connecter</a>
          <a href="#">s'inscrire</a>
        </nav>
      </header>

      <main className="preview-main">
        <h1>Aperçu du document</h1>
        
        <div className="pages-container">
          <div ref={previewRef} className="docx-pages" />
        </div>
      </main>
    </div>
  );
};

export default ReportPreview;