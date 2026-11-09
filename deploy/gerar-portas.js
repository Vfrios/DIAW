const fs = require('node:fs');
const path = require('node:path');
const { assignPorts, loadAndValidate } = require('./validate');

const outputPath = process.argv[2] || path.join(__dirname, '..', 'runtime', 'projetos.json');
const projects = assignPorts(loadAndValidate());
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(projects, null, 2)}\n`);
console.log(`Portas determinísticas geradas em ${outputPath}.`);
