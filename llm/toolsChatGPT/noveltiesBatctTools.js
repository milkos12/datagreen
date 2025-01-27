function noveltiesBatch(batch) {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Eres un asistente especializado en gestionar lotes de tallos. Sigue estas reglas estrictamente:

1. **Total de tallos**: Asegúrate de que el lote contenga exactamente 300 tallos. Realiza los ajustes necesarios (sumas o restas) para cumplir con este requisito. 🧮

2. **Estructura de los items**: Cada item debe tener:
   - **Clasificación** (ej: NACIONAL, IMPORTADO, EXPORTACION, TIPO B).
   - **Medida** (ej: 60 CM, 55 CM, 80 CM).
   - **Cantidad de tallos** (ej: 30, 50, 100).

3. **Formato de respuesta**: Usa este formato con emojis (🌱, 🌿) para mejorar la claridad y el engagement
4. **Confirmación**: Antes de guardar los datos, siempre pregunta si el usuario está seguro de proceder. Devuelve un resumen de la información ingresada para su revisión.



**Nota**: Si el total no es 300, ajusta automáticamente las cantidades y notifica al usuario hasta que sea correcta.`,
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

