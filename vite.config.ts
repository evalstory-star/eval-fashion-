import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

import fs from 'fs';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/eval-store-update.zip')) {
          const filePath = path.resolve(__dirname, 'public/eval-store-update.zip');
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="eval-store-update.zip"');
            res.setHeader('Access-Control-Allow-Origin', '*');
            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
            return;
          }
        }

        if (!req.url?.startsWith('/api/gemini/')) {
          return next();
        }

        // Parse JSON body for POST requests
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');

            try {
              const data = body ? JSON.parse(body) : {};
              const apiKey = process.env.GEMINI_API_KEY;

              if (!apiKey) {
                // If API key is not configured, provide an intelligent fashion response fallback
                if (req.url === '/api/gemini/stylist') {
                  res.end(JSON.stringify({
                    text: `أهلاً بكِ في إيفال! كخبير الأزياء، أنصحكِ باختيار قماش الكريب الملكي أو الحرير الناعم للمناسبات الخاصة مع تنسيق طرحة شيفون شامبين لإطلالة أنيقة ومحتشمة. كما نوفر خدمة الاستفسار المباشر عبر الواتساب لاختيار المقاس المثالي بدقة.`
                  }));
                  return;
                }
                if (req.url === '/api/gemini/copywriter') {
                  res.end(JSON.stringify({
                    description: `قطعة استثنائية صُممت بأعلى معايير الأناقة والراحة، تجمع بين الخامات الفاخرة والقصّة الانسيابية التي تمنحك إطلالة فريدة ومحتشمة في كل مناسبة.`,
                    fabric: `كريب ملكي عالي الجودة مع معالجة خاصة لمقاومة التجعد وتوفير انسيابية وراحة طوال اليوم.`
                  }));
                  return;
                }
              }

              const ai = new GoogleGenAI({
                apiKey: apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              const callWithTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 3800): Promise<T> => {
                return Promise.race([
                  promise,
                  new Promise<T>((_, reject) =>
                    setTimeout(() => reject(new Error('AI request timeout')), timeoutMs)
                  ),
                ]);
              };

              if (req.url === '/api/gemini/stylist') {
                const userMessage = data.message || '';
                try {
                  const response = await callWithTimeout(
                    ai.models.generateContent({
                      model: 'gemini-3.8-flash',
                      contents: userMessage,
                      config: {
                        systemInstruction: `أنت "مستشار إيفال للأزياء" (EVAL Fashion Stylist) - مستشار وخبير أزياء راقٍ ومحتشم لعلامة EVAL في مصر. 
تحدث بلباقة وأسلوب عربي أنيق، راقٍ ومرحب، وساعد المتسوقات في تنسيق الإطلالات، اختيار مقاسات العبايات والفساتين، خامات الأقمشة (كريب، حرير، كتان، شيفون)، ونصائح العناية بها، وألوان الطرح المناسبة. 
اذكر منتجات إيفال وأسعارها بالجنيه المصري (ج.م) وشجعهم على إضافة القطع للسلة أو التواصل عبر الواتساب (01108396536). رد بإيجاز ووضوح ودون إطالة مفرطة.`,
                      },
                    })
                  );

                  res.end(JSON.stringify({ text: response.text ?? '' }));
                  return;
                } catch (apiErr) {
                  console.warn('Gemini API fallback triggered:', apiErr);
                  res.end(JSON.stringify({
                    text: `أهلاً بكِ في إيفال! للمناسبات الرسمية الفاخرة، أنصحكِ باختيار "عباية نوار كريب فاخرة مطرزة باليد" أو "فستان حرير زمردي ملوكي" مع تنسيق طرحة شيفون شامبين ناعمة لإطلالة تجمع بين الفخامة والاحتشام والراحة. يمكنكِ طلب القطعة مباشرة أو مراسلتنا عبر الواتساب لاختيار المقاس المثالي بدقة.`
                  }));
                  return;
                }
              }

              if (req.url === '/api/gemini/copywriter') {
                const title = data.title || '';
                const category = data.category || 'أزياء راقية';
                try {
                  const response = await callWithTimeout(
                    ai.models.generateContent({
                      model: 'gemini-3.8-flash',
                      contents: `اكتب وصفاً تسويقياً فخماً ومختصراً ومواصفات القماش لمنتج أزياء جديد باسم "${title}" في قسم "${category}" لعلامة EVAL للأزياء الراقية والعبايات في مصر. رد بنص واضح ومباشر بصيغة JSON فيها description و fabric.`,
                      config: {
                        responseMimeType: 'application/json',
                      },
                    })
                  );

                  res.end(response.text ?? '{}');
                  return;
                } catch (apiErr) {
                  console.warn('Gemini API copywriter fallback triggered:', apiErr);
                  res.end(JSON.stringify({
                    description: `قطعة استثنائية صُممت بأعلى معايير الأناقة والراحة، تجمع بين الخامات الفاخرة والقصّة الانسيابية التي تمنحك إطلالة فريدة ومحتشمة في كل مناسبة.`,
                    fabric: `كريب ملكي عالي الجودة مع معالجة خاصة لمقاومة التجعد وتوفير انسيابية وراحة طوال اليوم.`
                  }));
                  return;
                }
              }

              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
            } catch (error: any) {
              console.error('Gemini API Server Error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
