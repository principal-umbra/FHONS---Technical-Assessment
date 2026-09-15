import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { evaluations, questionnaireType } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let prompt = '';
      if (questionnaireType === 'perfil_profesional') {
        prompt = `Eres un redactor corporativo experto en branding personal y perfiles de colaboradores para el sitio web oficial de la compañía FHONS.
A partir de las respuestas brindadas por el colaborador en su cuestionario de Perfil Profesional, genera una biografía y ficha corporativa impecable, humana, profesional y lista para ser publicada en el website oficial.

Datos del Colaborador y Respuestas:
${JSON.stringify(evaluations, null, 2)}

Por favor, estructura tu respuesta en formato Markdown con las siguientes secciones:
1. **Titular Profesional de Portada** (One-liner de impacto: Cargo, especialidad y valor que aporta a FHONS)
2. **Biografía Corporativa Oficial** (2 párrafos fluidos y atractivos que resuman su rol, experiencia, lo que hace en FHONS y sus logros)
3. **Especialidades y Credenciales Clave** (Bullet points de sus principales habilidades, certificaciones y fortalezas)
4. **Cultura & Compromiso FHONS** (Lo que más disfruta de su trabajo, por qué le gusta estar en FHONS y cómo define su estilo en 3 palabras)
5. **Factor Humano & Pasiones** (Hobbies, talentos o faceta personal destacada en un tono cercano y elegante)
6. **Revisión de Privacidad & Recomendaciones** (Avisa si el colaborador especificó alguna restricción y da una recomendación final para la foto oficial)`;
      } else {
        prompt = `Analiza las siguientes respuestas de evaluación de un agente de soporte técnico (TI) y genera un perfil integral detallado de sus habilidades conductuales, psicológicas, laborales y comunicativas.

Evaluaciones:
${JSON.stringify(evaluations, null, 2)}

Por favor, estructura tu respuesta en formato Markdown con las siguientes secciones:
1. Resumen Ejecutivo
2. Perfil Psicológico (Manejo de crisis, empatía, resiliencia)
3. Perfil Social/Laboral (Integración con equipo, ownership, trabajo bajo presión)
4. Habilidades Comunicativas (Claridad, asertividad, manejo de malas noticias)
5. Áreas de Mejora y Recomendaciones`;
      }

      let response;
      let lastError;
      const maxRetries = 5;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          break; // Success, exit loop
        } catch (err: any) {
          lastError = err;
          const isOverloaded = err?.status === 503 || err?.status === 429 || err?.message?.includes("503") || err?.message?.includes("429") || err?.message?.includes("high demand");
          
          if (isOverloaded && attempt < maxRetries - 1) {
            console.log(`Gemini API overloaded. Retrying attempt ${attempt + 1} of ${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempt))); // 2s, 4s, 8s backoff
          } else {
            throw err; // Re-throw if not retryable or out of retries
          }
        }
      }

      if (!response) {
        throw lastError;
      }

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Error analyzing with Gemini:", error);
      res.status(500).json({ error: error.message || "Failed to analyze" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Fallback for SPA routing in production
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
