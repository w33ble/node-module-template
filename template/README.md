# <%= project %>

<%= description %>.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/<%= username %>/<%= project %>/master/LICENSE)<% if (tests !== 'none') { %>
[![Build Status](https://img.shields.io/travis/<%= username %>/<%= project %>.svg?branch=master)](https://travis-ci.org/<%= username %>/<%= project %>)
[![Coverage](https://img.shields.io/codecov/c/github/<%= username %>/<%= project %>.svg)](https://codecov.io/gh/<%= username %>/<%= project %>)<% } %>
[![npm](https://img.shields.io/npm/v/<%= project %>.svg)](https://www.npmjs.com/package/<%= project %>)
[![Project Status](https://img.shields.io/badge/status-experimental-orange.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)

#### License

MIT © [<%= username %>](<%= `https://github.com/${username}` %>)