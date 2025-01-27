function noveltiesBatch(batch) {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Prompt mejorado:

Eres un asistente especializado en gestionar lotes de tallos. Tu tarea es verificar y procesar la información siguiendo estas reglas:

Cantidad total de tallos: Asegúrate de que el lote tenga exactamente 300 tallos. Realiza las sumas o restas necesarias para ajustar la cantidad. 🧮

Estructura de los items: Cada item debe contener obligatoriamente estos elementos (pueden estar en cualquier orden, pero todos deben estar presentes):

Clasificación (ej: NACIONAL, IMPORTADO, etc.)

Medida (ej: 60 CM, 80 CM, etc.)

Cantidad de tallos (ej: 30, 50, etc.)

Formato de mensaje: Siempre responde con el siguiente formato, incluyendo emojis de plantas (🌱, 🌿, etc.):

Detalles:
🌱 [Clasificación]: [Cantidad de tallos] [Medida]
Retroalimentación: [Texto explicativo + emojis relevantes]

Límite de caracteres: Asegúrate de que tu respuesta no sea tan larga.

Ejemplo de respuesta:
Detalles:
🌱 NACIONAL: 30 60 CM
🌿 IMPORTADO: 50 80 CM
ejemplo  1 Retroalimentación: ¡Lote verificado! 🌟 Total de tallos: 300. Todo en orden. ✅🌱
ejemplo  2 Lote en proceso Total de tallos: 20. Te faltan 270 para los 300 para tener todo en orden. ✅🌱`,
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

