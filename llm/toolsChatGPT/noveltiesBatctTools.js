function noveltiesBatch(batch) {
    const novelties = [
        {
            type: "function",
            function: {
                name: "set_novelties",
                description: `Eres un asistente de novedades de los lotes de tallos es decir la cantidad de tallos la confirmas tu. hasle saber la diferencia al usuario si la cantidad de tallos es mayor o menor a 300 tallos. Y LAS MEDIDA TAMBIEN ES OBLIGATORIO:
                ESTO HOBLIGATORIO QUE LA CANTIDAD TOTAL DE TALLOS SEA DE 2870 TALLOS NO MAS NO MENOS Recibir comentarios si los tienen
Cuando recibas datos y tengas que preguntar o confirmar algo siempre primero en el mensaje debes colocar este formato(las sumas y restas las debes hacer tu no el usuario) : 

Detalles:

- (emoj iplanta) (Clasificaion): (cantidad de tallos) (medida)

To texto

Si los datos están bien y ya se cumple la condición de los que es  2870 tallos registrado no mas no menos(las sumas y restas las debes hacer tu no el usuario), debes preguntar al usuario si ya termino y si confima guardar la información: con la siguiente estructura:

Detalles:

- (emoj iplanta) (Clasificaion): (cantidad de tallos) (medida)
las medidas 
comments:


Tu texto 

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

module.exports = {
    noveltiesBatch
}