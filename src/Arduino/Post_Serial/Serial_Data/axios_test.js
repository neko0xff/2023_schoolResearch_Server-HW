const axios = require('axios');

axios.get('http://103.3.193.140:3095/')
.then(response => console.log(`/: ${response.data}`));

axios.get('http://103.3.193.140:3095/testDB')
    .then(response => console.log(response.data));

