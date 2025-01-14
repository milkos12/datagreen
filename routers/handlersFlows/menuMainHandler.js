// routes/handlersFlows/menuMainHandler.js

/*
    Si no hay un flujo activo y el mensaje es un numero comprobar que el número corresponda a
    un fujo listado en el menú


    1. cuando se active el flujo nuevo se debe crear un registro nuevo en el modelo asociado
    2. seguarda el id de nuvo registrado en el modelo asosciado 

*/

const { Company, Flow, User, FlowHistory, Step, FlowHistoryData, ModelItem, Sequelize, sequelize } = require('../../models');
const axios = require('axios');

const getFlowsListOfUsers = async (user) => {
    const companyId = user.company_id;
    const flows = await Flow.findAll({
        where: {
            ownerCompanyId: companyId
        },
        include: [{
            model: Step,
            as: 'steps'
        }]
    });

    console.log("************************************** Obtener flujos");
    return flows;
}

const createNewRegister = async (user, flowSelected) => {
    const steps = flowSelected.steps;

    const model = await ModelItem.findByPk(steps[0].modelId);

    const objetToCreate = {};

    model.requiredFields.forEach(filed => {
        objetToCreate[filed] = user[filed];
    });
    //user create
    objetToCreate[model.idName] = user.user_id;

    const Model = sequelize.models[model.name];

    const newObect = await Model.create(objetToCreate);
    
    return newObect[model.idNameModel];
}

// Función para obtener la selección de una opcion del menú principal
const getSelectionMainMenu = async (message, user) => {
    const REGEX = /(\d)+/g;
    const textOfMessage = message.text.body.trim();
    let match = textOfMessage.match(REGEX);

    if (match) {
        const selection = Number.parseInt(match[0]);
        const flows = await getFlowsListOfUsers(user);
        const flowSelected = flows[selection - 1];
        const idNewObject = await createNewRegister(user, flowSelected);

        await FlowHistory.create({
            flowId: flowSelected.flow_id,
            createdById: user.user_id,
            currentStep: 1,
            isCompleted: false,
            relatedModelObjectId: idNewObject

        });

        // Obtener los pasos del flujo
        const steps = flowSelected.steps.sort((a, b) => a.order - b.order);

        await sendStepMessage(user, steps[0]);
        match = true;

    } else {
        match = false;
    }

    return { messageIsSelection: match };
}

// Función para obtener los nombres de los flujos
const getNamesOfFlows = async (user) => {
    const flows = await getFlowsListOfUsers(user);
    let listTextFlows = '';

    flows.forEach((item, index) => {
        listTextFlows += `${index + 1}. ${item.name}\n`;
    });

    console.log("************************************** Flujos obtenidos");
    return listTextFlows;
}

// Función para enviar el menú de flujos al usuario
const messageFlowsMenu = async (fromNumber) => {
    // Buscar al usuario
    const user = await User.findOne({
        where: {
            phone_number: fromNumber
        }
    });

    console.log(fromNumber, "************************************** Usuario", user);

    if (!user) {
        console.log(`No se encontró el usuario con número: ${fromNumber}`);
        return {};
    }

    const namesOfFlowsListText = await getNamesOfFlows(user);

    const messageEnd = `Hola ${user.name}!\n¿Qué necesitas hacer?\n\n*Por favor responde a este mensaje con un número que corresponda a lo que necesitas hacer*\n\n\n${namesOfFlowsListText}`;

    return messageEnd;
}

// Función para procesar la respuesta del usuario en un flujo activo
const processUserResponse = async (user, activeFlow, message) => {
    console.log('--------------------->', user);
}

// Función para enviar un mensaje indicando que la opción es inválida
const sendInvalidOptionMessage = async (user) => {
    const toNumber = `57${user.phone_number}@s.whatsapp.net`;
    const messageBody = `La opción que seleccionaste no es válida. Por favor, intenta nuevamente.`;

    const whatsappPayload = {
        to: toNumber,
        body: messageBody,
    };

    try {
        const response = await axios.post(process.env.WHATSAPP_API_URL, whatsappPayload, {
            headers: {
                'Authorization': process.env.WHATSAPP_API_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Mensaje de opción inválida enviado a ${toNumber}:`, response.data);
    } catch (apiError) {
        console.error(`Error al enviar el mensaje de opción inválida a ${toNumber}:`, apiError.response ? apiError.response.data : apiError.message);
    }
}

// Función para enviar un mensaje de finalización del flujo
const sendCompletionMessage = async (user) => {
    const toNumber = `57${user.phone_number}@s.whatsapp.net`;
    const messageBody = `Has completado el flujo exitosamente. ¡Gracias!`;

    const whatsappPayload = {
        to: toNumber,
        body: messageBody,
    };

    try {
        const response = await axios.post(process.env.WHATSAPP_API_URL, whatsappPayload, {
            headers: {
                'Authorization': process.env.WHATSAPP_API_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Mensaje de finalización enviado a ${toNumber}:`, response.data);
    } catch (apiError) {
        console.error(`Error al enviar el mensaje de finalización a ${toNumber}:`, apiError.response ? apiError.response.data : apiError.message);
    }
}

// Función para enviar un mensaje de un paso específico
const sendStepMessage = async (user, step) => {
    const toNumber = `57${user.phone_number}@s.whatsapp.net`;
    const messageBody = step.message;

    const whatsappPayload = {
        to: toNumber,
        body: messageBody,
    };

    try {
        const response = await axios.post(process.env.WHATSAPP_API_URL, whatsappPayload, {
            headers: {
                'Authorization': process.env.WHATSAPP_API_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Mensaje del paso ${step.order} enviado a ${toNumber}:`, response.data);
    } catch (apiError) {
        console.error(`Error al enviar el mensaje del paso ${step.order} a ${toNumber}:`, apiError.response ? apiError.response.data : apiError.message);
    }
}

// Función para iniciar un nuevo flujo
const startNewFlow = async (user, selectedFlowId) => {
    // Crear un nuevo FlowHistory
    const newFlowHistory = await FlowHistory.create({
        flowId: selectedFlowId,
        userId: user.user_id,
        isCompleted: false,
        currentStep: 0
    });

    // Obtener los pasos del flujo
    const steps = await Step.findAll({
        where: {
            flowId: selectedFlowId
        },
        order: [['order', 'ASC']]
    });

    if (steps.length === 0) {
        console.log(`El flujo con ID ${selectedFlowId} no tiene pasos definidos.`);
        return;
    }

    // Enviar el primer paso al usuario
    const firstStep = steps[0];
    await sendStepMessage(user, firstStep);
}

module.exports = {
    getSelectionMainMenu,
    messageFlowsMenu,
    processUserResponse,
    startNewFlow
}
