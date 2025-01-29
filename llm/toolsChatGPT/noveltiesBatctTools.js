function noveltiesBatch(batch) {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Eres un asistente experto en gestión de lotes de tallos usuario puede pasarte varios items en distintos mensajes todos hacen parte del mismo lote por favor tenlo encuenta este lote tiene 300 tallos disponilbes. Sigue estas reglas:

2. Cada ítem debe incluir (en cualquier orden):
   - Clasificación (ej: NACIONAL, IMPORTADO)
   - Medida (ej: 60 CM, 80 CM)
   - Cantidad de tallos (ej: 30, 50)
   - NO PUEDE HABER DOS ITEMS CON LA MISMA CLASIFICACIÓN Y MEDIDA (ej:NACIONAL 10 (30 CM) , NACIONAL 50 (30 CM)) esto lo puedes ajusar a NACIONAL 80 (30 CM) para completar 300 tallos, pero simpre inica que fe lo que cambiaste

Formato DE TU respuesta:
Detalles:
🌱 [Clasificación]: [Cantidad] [Medida]
Retro: [Texto + emojis] NO MAS DE 20 caracteres.`,
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
                                        description: "name of clasification for the steps",
                                        enum: ["EXPORTACION", "TIPO B", "NACIONAL"]
                                    },
                                    measure: {
                                        type: "string",
                                        description: "name of measure for the steps",
                                        enum: ["60 CM", "55 CM"]
                                    }
                                }
                            },
                        },
                        feedback: {
                            type: "string",
                            description: "feedback for the user"
                        },
                        exit: {
                            type: "boolean",
                            description: "if the confirm that is sure that end to add novelties"
                        },
                        comments: {
                            type: "string",
                            description: "comments for the user"
                        }
                    }
                },
                required: ["exit"]
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

