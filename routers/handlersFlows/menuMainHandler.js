/* 
1. validate if the users have a flow open (crear new column)
2. create new column for identify for what company correspond the flow: DONE

3. identify of what comapny is of user
4. find wiht the company finder before find the flows
5. writ a good message.
 
 
now focus on: show the menu of alls flows avilable for the compani
*/

const { Company, Flow, User } = require('../../models');

const getNamesOfFlows = async (user) => {
    const companyToTheBelongsUser = user.dataValues.company_id;
    const flows = await Flow.findAll({
        where: {
            ownerCompanyId: companyToTheBelongsUser
        }
    });
    console.log(companyToTheBelongsUser,"**************************************ooooooooooooooooooo", flows);
    let listTextFLows = '';

    flows.forEach((item, index) => {
        listTextFLows = `${listTextFLows}${index + 1}. ${item.dataValues.name}\n`;
    });
    console.log("**************************************one");
    return listTextFLows;
}

const messageFlowsMenu = async (fromNumber) => {
    // Search for the user with the resulting phone number
    const user = await User.findOne({
        where: {
            phone_number: fromNumber
        }
    });
    console.log(fromNumber,"**************************************two",user);
    const namesOfFlowsListText = await getNamesOfFlows(user);
    const endList = `Hola ${user.dataValues.name}!\n¿Qué necesitas hascer?\n\n*Por favor responde a este mensaje con un numero-que corresponda a lo que necesitas hacer*\n\n\n${namesOfFlowsListText}`;

    return { user, endList};
}

module.exports = {
    messageFlowsMenu
}