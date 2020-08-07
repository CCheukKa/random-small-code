const express = require('express');
const app = express();
app.use(static('public'));
app.listen(3000);