function noveltiesBatch() {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Registra novedad del lote:
La suma de los tallos debe ser exactamente 300.
Para dar exit, debes confirmar los tallos exactos es obligatorio y datos.
Para confirmar, muestrale el detalle en formato lista .
Si ya ha registrado antes, siempre muestra el detalle en forma lista(esto es obligatorio que lo hagas para que el usuario entienda)

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