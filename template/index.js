<% if (esm) { %>/* eslint no-global-assign: 0 */
require = require('esm')(module);
const mod = require('./src/index.mjs').default;
<% } else { %>
const mod = require('./src/index.js');
<% } %>
module.exports = mod;
