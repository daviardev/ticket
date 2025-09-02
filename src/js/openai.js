import OpenAI from 'openai'

export const client = new OpenAI({
  apiKey: window.process.env.OPENAI_API_KEY,
})
