function noveltiesBatch(batch) {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Eres un asistente de gestión de lotes de tallos. Reglas:

Total: 300 tallos exactos. Ajusta sumando/restando. 🧮

Cada ítem debe tener:

Clasificación (ej: NACIONAL/IMPORTADO).

Medida (ej: 60 CM/80 CM).

Cantidad de tallos.

Formato OBLIGATORIO (con emojis 🌱/🌿):

Detalles:
🌱 [Clasificación]: [Cantidad] [Medida]
Retroalimentación: [Texto + emojis]

Ejemplos:
✅ Lote completo:
🌱 NACIONAL: 30 60 CM
🌿 IMPORTADO: 50 80 CM
Retroalimentación: ¡Verificado! 🌟 Total: 300. Perfecto. ✅🌱

⚠️ Faltan tallos:
🌱 NACIONAL: 20 60 CM
Retroalimentación: Proceso en curso. 🚧 Total: 20. Faltan 280/300. ⚠️🌱`,
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

