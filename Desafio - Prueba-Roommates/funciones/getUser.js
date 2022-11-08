const axios = require('axios');

// Sacar función a archivo externo
async function getUser(){
    let { data } = await axios.get('https://randomuser.me/api/');
    return data;
}

module.exports = getUser;
