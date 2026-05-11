
const { createGroqProvider, createNvidiaProvider } = require('./packages/ai/dist');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'apps/server/.env') });

async function testLLM() {
  const groqKey = process.env.GROQ_API_KEY;
  const nvidiaKey = process.env.NVIDIA_API_KEY;

  if (nvidiaKey) {
    console.log('Testing NVIDIA...');
    try {
      const provider = createNvidiaProvider(nvidiaKey);
      const model = provider.getModel();
      const res = await model.invoke('Hello');
      console.log('NVIDIA Response:', res.content);
    } catch (e) {
      console.error('NVIDIA Failed:', e.message);
    }
  }

  if (groqKey) {
    console.log('Testing Groq...');
    try {
      const provider = createGroqProvider(groqKey);
      const model = provider.getModel();
      const res = await model.invoke('Hello');
      console.log('Groq Response:', res.content);
    } catch (e) {
      console.error('Groq Failed:', e.message);
    }
  }
}

testLLM();
