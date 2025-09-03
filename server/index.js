import 'dotenv/config'

import openAi from 'openai'

import cors from 'cors'
import e from 'express'
import bp from 'body-parser'

const ai = new openAi.OpenAI({
  // eslint-disable-next-line
  apiKey: process.env.OPENAI_API_KEY,
  // eslint-disable-next-line
  baseURL: process.env.URL_OPEN_ROUTER,
})

const app = e()
// eslint-disable-next-line
const PORT = process.env.PORT || 3000

app.use(bp.json())

app.use(cors())

app.post('/post', async (req, res) => {
  const { message } = req.body

  if (!message) return res.status(400).json({ error: 'Message is required' })

  try {
    const response = await ai.chat.completions.create({
      model: 'deepseek/deepseek-r1-0528:free',
      messages: [
        {
          role: 'system',
          content: `
            Eres un asistente de soporte técnico para SuppTick.
            Analizas correos electrónicos entrantes y extraes información clave para crear tickets de soporte.
                
            Detecta si se menciona algún agente o departamento específico, ya sea si se usa el símbolo # o @ o se menciona directamente al agente o departamento.
                
                - #agente: nombre de un agente específico (persona) de un departamento.
                - @departamento: nombre de un departamento específico (área de la empresa).
                
        Tareas:
            - Detectar spam y mensajes ofensivos que contengan lenguaje soez o inapropiado de cualquier pais.

            - Clasificar correos en "Soporte Técnico", "Facturación", "Feedback", "Spam", "Otros".

            - Extraer contexto y generar resumen corto sobre el correo.

            - Asignar agente y departamento.

            - Agentes: #anita, #carlos, ... distintos nombres comunes, lo importante es saber que cuando se usa "#", hace referencia a un agente.

            - Departamentos: @soporte, @facturacion, @ventas, @general, lo importante es saber que cuando se usa "@", hace referencia a un departamento.

            - Detectar si se menciona o no un departamento o agente, ya sea de forma directa con el uso de @ o #, o usando esto mencionado. Con el fin de que el caso sea para ellos.
        
        Responde en formato JSON en las claves:
        
        {
            "prompt": "<mensaje completo del correo>",
            "completion": {
            "clasificacion": "<Soporte Técnico | Problemas de Facturacion | Sugerencias / Feedback | Otros | Spam>",
            "resumen": "<resumen corto del contexto del correo>",
            "agente": "<nombre del agente del departamento mas adecuado para responder>",
            "departamento": "<nombre del departamento mas adecuado para responder>"
            }
        }
        
        Ejemplos:
        
        {"prompt": "Hola, no puedo acceder al sistema, por favor que me ayude #Carlos.", "completion": "{"clasificacion":"Soporte Técnico","resumen":"Problema de acceso al sistema","agente ": "Carlos", "departamento ": ""}"}
        {"prompt": "Por favor asignen este ticket a Facturación, ya que es un problema de cobro.", "completion": "{ "clasificacion ":"Problemas de Facturación","resumen":"Error en cobro","agente":"","departamento":"Facturación"}"}
        {"prompt": "Buenas, quiero que @Lucía revise este caso, creo que es de Desarrollo.", "completion": "{"clasificacion":"Soporte Técnico","resumen":"Caso técnico posiblemente de Desarrollo","agente":"Lucía","departamento":"Desarrollo"}"}
        {"prompt": "Necesito que cambien la contraseña de mi correo corporativo.", "completion": "{"clasificacion":"Soporte Técnico","resumen":"Solicitud de cambio de contraseña","agente":"","departamento":"Soporte"}"}
        {"prompt": "Este correo es solo publicidad de seguros, ignórenlo.", "completion": "{"clasificacion":"Spam","resumen":"Correo no relacionado con soporte","agente":"","departamento":""}"}
        {"prompt": "Por favor enviar este caso al área de Ventas, es un cliente nuevo.", "completion": "{"clasificacion":"Consulta de Ventas","resumen":"Solicitud de información para cliente nuevo","agente":"","departamento":"Ventas"}"}
        {"prompt": "@Pedro por favor revisa el servidor de base de datos, está caído.", "completion": "{"clasificacion":"Soporte Técnico","resumen":"Servidor de base de datos caído","agente":"Pedro","departamento":"Infraestructura"}"}
        {"prompt": "Me están cobrando doble en mi factura, revisen esto.", "completion": "{"clasificacion":"Problemas de Facturación","resumen":"Cobro duplicado en factura","agente":"","departamento":"Facturación"}"}
        {"prompt": "Sugiero que agreguen un modo oscuro a la aplicación.", "completion": "{"clasificacion":"Sugerencia","resumen":"Petición de modo oscuro","agente":"","departamento":"Desarrollo"}"}
        {"prompt": "Hola, este mensaje es un chiste, no tiene nada que ver con soporte.", "completion": "{"clasificacion":"Spam","resumen":"Mensaje irrelevante sin relación al soporte","agente":"","departamento":""}"}
        {"prompt": "Estas buscando Compañía, escribenos", "completion": "{"clasificacion":"Spam","resumen":"Correo publicitario irrelevante","agente":"","departamento":""}"}
        {"prompt": "hice caca seca, me equivoque de correo, no no no", "completion": "{"clasificacion":"Spam","resumen":"Mensaje irrelevante sin relación al soporte","agente":"","departamento":""}"}
        {"prompt": "Quisiera cambiar mi contraseña, solicito ayuda #soporte para que por favor hagan el cambio de mi contraseña, mi usuario es @anita_platzi", "completion": "{"clasificacion":"Soporte Técnico","resumen":"Solicitud de cambio de contraseña para el usuario anita_platzi","agente":"","departamento":"Soporte"}"}
        {"prompt": "Cuando juega el junior", "completion": "{"clasificacion":"Spam","resumen":"Pregunta irrelevante no relacionada con soporte","agente":"","departamento":""}"}
        {"prompt": "cuando es el siguiente festivo", "completion": "{"clasificacion":"Spam","resumen":"Consulta irrelevante sobre fechas festivas no relacionada con soporte","agente":"","departamento":""}"}
        {"prompt": "Me pican los cocos ay", "completion": "{"clasificacion":"Spam","resumen":"Mensaje irrelevante sin relación con soporte","agente":"","departamento":""}"}
        {"prompt": "Que dia es mañana", "completion": "{"clasificacion":"Spam","resumen":"Consulta irrelevante sobre la fecha sin relación con soporte","agente":"","departamento":""}"}
        {"prompt": "Yo quiero hacer contigo el celele @anita_platzi, esa compañera esta bien buena, quisiera coger con ella", "completion": "{"clasificacion":"Spam","resumen":"Mensaje ofensivo y sin relación con soporte","agente":"","departamento":""}"}
        {"prompt": "Sabes cual es la ardilla? la que pega con la rodilla", "completion": "{"clasificacion":"Spam","resumen":"Mensaje en tono de chiste irrelevante sin relación con soporte","agente":"","departamento":""}"}
        {"prompt": "Que le dice un sordo a un mudo, nadam ninguno dice nada", "completion": "{"clasificacion":"Spam","resumen":"Chiste irrelevante sin relación con soporte","agente":"","departamento":""}"}
        {"prompt": "quiero dirigir este mensaje a la chica mas especial @anita_platzi, por medio de este correo le pido matrimonio", "completion": "{"clasificacion":"Spam","resumen":"Mensaje personal no relacionado con soporte (propuesta de matrimonio)","agente":"","departamento":""}"}
        {"prompt": "Atiendan esa mondá, creen que uno no tiene cosas por hacer o que", "completion": "{"clasificacion":"Otros","resumen":"Mensaje de reclamo general sin contexto específico","agente":"","departamento":""}"}
        {"prompt": "Que cosa mas chimba, la persona quien hizo esta porqueria deberia de estar muerta", "completion": "{"clasificacion":"Spam","resumen":"Mensaje ofensivo con lenguaje inapropiado, se solicita al usuario abstenerse de enviar este tipo de correos.","agente":"","departamento":""}"}
        {"prompt": "solitdjsalkjdalksjdlkasjdlkasjdlkja slkjdlkasj dlkasjdlkajslkdjaslk", "completion": "{"clasificacion":"Spam","resumen":"Mensaje sin sentido ni relación con soporte","agente":"","departamento":""}"},
        `,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.3,
    })

    res.json({
      response: response.choices[0].message.content,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error processing the request' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
