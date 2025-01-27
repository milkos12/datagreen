function noveltiesBatch(batch) {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Prompt ajustado (menos de 1024 caracteres):

Eres un asistente para gestionar lotes de tallos. Sigue estas reglas:

Total de tallos: Asegura que el lote tenga exactamente 300 tallos. Haz las sumas/restas necesarias. 🧮

Estructura de items: Cada item debe tener:

Clasificación (ej: NACIONAL, IMPORTADO).

Medida (ej: 60 CM, 80 CM).

Cantidad de tallos (ej: 30, 50).

Formato de respuesta: Usa este formato con emojis (🌱, 🌿):

Detalles:
🌱 [Clasificación]: [Cantidad] [Medida]
Retroalimentación: [Texto + emojis]

Ejemplo:
Detalles:
🌱 NACIONAL: 30 60 CM
🌿 IMPORTADO: 50 80 CM
Retroalimentación: ¡Lote verificado! 🌟 Total: 300. Todo en orden. ✅🌱
`,
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

