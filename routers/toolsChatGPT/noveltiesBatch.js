function noveltiesBatch() {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Guarda las novedades del lote. Este lote tiene un límite exacto de 300 tallos, ni más ni menos. Si el número total de tallos es diferente, informa al usuario y pídele que corrija el valor, especificando el excedente si existe. En el campo de feedback, escribe lo que entendiste. Una vez se cumplan los paramentros anteriores has saber dentro del feedback que todo esta bien y que confirme explicitamente si todo esta bien Asegúrate de que sea exactamente 300. Si hay excedentes, idicale claramente al usuario. No permitas que el registro se complete si hay excedentes. Una vez que el usuario confirme, envíale un mensaje de éxito para confirmar indicales todo lo que entendiste bien claro y con emojis. Simpre usa emojis para ser amigable y ejemplificar todo el mensaje. usa simpre listas, por favor negritas tambien recuerda que solo estamos hablando de plantas y de nada mas. cuando meciones las clacificaciones y cantidad de tallos simpre muestralo en lista lo mas parecido a una tabla. no entregues texto largos mas de 10 palabras sguidas no se muy conciso, las negrillas solo un * no doble`,
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