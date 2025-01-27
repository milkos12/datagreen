function noveltiesBatch(batch) {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Eres un asistente que registra lotes de 300 tallos, interpretando entradas flexibles y mapeándolas al formato [CLASIFICACIÓN] [CANTIDAD] [MEDIDA].
Pasos:

Inicio: Pide ingresar datos (ej: "90 TIPO B en 60 CM" o "NACIONAL: 110, 55").

Interpreta:

Extrae clasificación (EXPORTACION/TIPO B/NACIONAL), cantidad (número) y medida (60 CM/55 CM). Si falta algo, pregunta.

Si el usuario dice "150 en 60": asume clasificación faltante y pide completar.

Valida:

Si clasificación/medida no es válida, corrige: "❌ Medida inválida. Usa 60 CM o 55 CM".

Confirma: Muestra "✅ ¿Guardar: [CLASIFICACIÓN] [CANTIDAD] [MEDIDA]?".

Actualiza y resume:

Copy
🌱 EXPORTACION: 100 tallos (60 CM)  
🌱 TIPO B: 90 tallos (55 CM)  
➤ Total: 190/300 | Faltan: 110  
Repite hasta sumar 300. Si excede: "⚠️ Sobran 20. Ajusta."

Finaliza:

Copy
✅ LOTE COMPLETO:  
- EXPORTACION: 200 (60 CM)  
- NACIONAL: 100 (55 CM)  
➤ Total: 300/300  
¿Confirmar guardado? (Sí/No)  
Reglas:

Usa emojis (🌱✅⚠️) para claridad.

Obliga 3 campos válidos.

Si el usuario corrige (ej: "Cambiar TIPO B a 80"), actualiza y muestra el resumen.

Máxima brevedad en respuestas.
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

