function noveltiesBatch(batch) {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Actúa como asistente inteligente para registrar lotes de 300 tallos con capacidad de interpretar entradas flexibles y convertirlas al formato estructurado [CLASIFICACIÓN] [CANTIDAD] [MEDIDA].

Interacción:
Inicio:

Indicar: "Ingresa los datos de tallos (ej: '50 tallos NACIONAL en 55 CM' o 'EXPORTACION: 100, 60 CM'). Asegúrate de incluir: Clasificación, Cantidad y Medida."

Procesamiento de entradas:

Si el usuario ingresa datos en formato no estructurado (ej: "Quiero 80 de TIPO B en 60"):
a. Extraer:

Clasificación: Buscar coincidencias con ["EXPORTACION", "TIPO B", "NACIONAL"].

Cantidad: Identificar números.

Medida: Detectar "60 CM" o "55 CM" (si solo pone "60", asumir "60 CM").
b. Mostrar confirmación:
"✅ Entendido: TIPO B | 80 tallos | 60 CM. ¿Es correcto? (Sí/No)".

Si falta algún campo:
"⚠️ Faltan datos. Por favor, indica: [Clasificación] [Cantidad] [Medida] (ej: 'EXPORTACION 120 55 CM')".

Validación post-confirmación:

Actualizar lista y mostrar:
🌿 Resumen parcial:
🌱 EXPORTACION: 150 tallos (60 CM)
🌱 TIPO B: 80 tallos (60 CM)
📊 Total: 230/300 | Faltan: 70 tallos

Repetir hasta alcanzar 300:

Si el usuario excede: "⚠️ Sobran 20 tallos (320/300). Elimina o ajusta registros."

Confirmación final:

Mostrar lista completa con emojis y preguntar:
"¿Guardar este lote? (Sí/No)
✅ EXPORTACION: 200 tallos (60 CM)
✅ NACIONAL: 100 tallos (55 CM)".

Reglas clave:
Interpretación flexible: Reconocer números, palabras clave (ej: "de", "en", "para") y sinónimos (ej: "centímetros" → "CM").

Validar ENUMs: Rechazar clasificaciones o medidas no listadas y mostrar opciones válidas.

Tolerancia a formatos: Aceptar combinaciones como:

"Agregar 60 CM: 90 tallos TIPO B" → TIPO B | 90 | 60 CM

"NACIONAL, 110 unidades de 55" → NACIONAL | 110 | 55 CM.`,
                parameters: {
                    type: "object",
                    properties: {
                        conten: {
                            type: "array",
                            description: "conten of lote",
                            items: {
                                type: "object",
                                properties: {
                                    amout_stems: {
                                        type: "number",
                                        description: "amout of stems per clasificacion"
                                    },
                                    clasification: {
                                        type: "string",
                                        description: "name of new clasification for the steps",
                                        enum: ["EXPORTACION", "TIPO B", "NACIONAL"]
                                    },
                                    measure: {
                                        type: "string",
                                        description: "name of new measure for the steps",
                                        enum: ["60 CM", "55 CM"]
                                    }
                                }
                            },
                            required: ["measure", "amout_stems", "clasification"]
                        },
                        feedback: {
                            type: "string",
                            description: "feedback for the user"
                        },
                        exit: {
                            type: "boolean",
                            description: "if the confirm that is sure and the number of stems is correct, if don't is false. SIEMPRE PEDIR CONFIRMACIÓN ANTES DE MARCAR COMO TRUE"
                        },
                        comments: {
                            type: "string",
                            description: "comments for the user"
                        }
                    }
                },
                required: ["conten", "feedback", "exit", "measure"]
            }
        }
    ];
    return novelties;
}


function noveltiesBatchStructureSMS(batch) {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Eres un asistente que gestiona json convertidos a mensajes de texto para lotes de tallos usas siempre emojis de plantas dentro del texto como en el ejemplo. Debes OBLIGATORIAMENTE USAR LA SIGUENTE EXTRUCTURA Tal cual como es:
                Detalles:

                *🌱 (Clasificación):* (Cantidad de tallos) *(Medida)*

                *Retroalimentación:* (feedback)
                `,
                parameters: {
                    type: "object",
                    properties: {
                        sms: {
                            type: "string",
                            description: "finish sms with structure, and format for use in whatsapp use emojis"
                        }
                    }
                },
                required: ["sms"]

            }
        }
    ];
    return novelties;
}

module.exports = {
    noveltiesBatch,
    noveltiesBatchStructureSMS
}

