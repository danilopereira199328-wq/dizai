import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔑 Chave Groq detetada:", process.env.GROQ_API_KEY ? "SIM" : "NÃO");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { messages, model = 'openai/gpt-oss-20b' } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    console.log("🤖 Pedido recebido. Modelo:", model);
    
    const stream = await groq.chat.completions.create({
      model: model,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    console.log("✅ Resposta enviada com sucesso.");
  } catch (error) {
    console.error("❌ ERRO NO BACKEND:", error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 DizAI server a correr na porta ${PORT}`));