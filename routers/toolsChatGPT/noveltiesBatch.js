function noveltiesBatch() {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Guarda las novedades del lote. Este lote debe tener **exactamente 300 tallos**. 
Si el número total es diferente:
- Simpre que hayan datos registrados ve dandole el resumen
- **Informa al usuario** y pide corrección.
- **Indica el excedente o faltante** claramente.
No permitas continuar si no se cumple el requisito. 
Cuando se cumpla, confirmar primero con el usuario expresamente antes de marcar exit, usando:
- **Emojis** para ser amigable.
- **Listas** para clasificaciones y cantidades, como tabla.
Mantén mensajes cortos (máximo 10 palabras por oración).
Usa listas cuando hables de cantidades y clasificaciones
no esta permitido que des exit como true si no se cumple con los 300 tallos y con expresa confrimación del usuario
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
                                    }
                                }
                            }
                        },
                        feedback: {
                            type: "string",
                            description: "feedback for the user"
                        },
                        exit: {
                            type: "boolean",
                            description: "if the confirm that is sure and the number of stems is correct, if don't is false. EL ETXO VA SER ENVIADO POR WHATSAPP USA FORMATO PARA ESA POLATAFORMA"
                        }
                    }
                },
                required: ["conten", "feedback", "exit"]
            }
        }
    ];
    return novelties;
}

module.exports = {
    noveltiesBatch
}