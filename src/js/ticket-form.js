import { client } from './openai'

const form = document.getElementById('ticket-form')

const subjectInput = document.getElementById('subject')
const messageInput = document.getElementById('message')

const AnalyzeEmail = async (message) => {
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `
            Eres un clasificador de correos de soporte.
            responde SIEMPRE en JSON válido con el formato exacto
            {"clasificacion":"","resumen":"","agente":"","departamento":""}.
          `,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.3,
    })

    const text = res.choices[0].message.content

    return JSON.parse(text)
  } catch (err) {
    console.error('Error al analizar el correo:', err)
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
})
