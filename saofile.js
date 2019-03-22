const path = require('path');
const year = new Date().getFullYear();

module.exports = {
  prompts() {
    return [
      {
        name: 'project',
        message: 'What is the name of the new project?',
        required: true,
        default: this.outFolder,
      },
      {
        name: 'description',
        message: 'How would you describe the new project?',
        default: 'Another fine project',
      },
      {
        name: 'name',
        message: 'What is your name?',
        default: this.gitUser.name || this.gitUser.username,
        store: true,
      },
      {
        name: 'username',
        message: 'What is your GitHub username?',
        default: this.gitUser.username,
        store: true
      },
      {
        name: 'nodeVersion',
        message: 'What node version are you targetting?',
        default: '8',
      },
      {
        name: 'esm',
        type: 'confirm',
        message: 'Include runtime es6 module support?',
        default: false,
      },
      {
        name: 'airbnb',
        type: 'confirm',
        message: 'Include airbnb eslint rules?',
        default: true,
      },
      {
        name: 'buildTarget',
        type: 'list',
        message: 'Transpilation target node version:',
        choices: [
          'none',
          '4',
          '6',
          '8',
          '10',
        ],
        default: 'none',
      },
      {
        name: 'tests',
        type: 'list',
        message: 'Choose your test runner:',
        choices: [
          'none',
          'tapped',
          'ava',
        ],
        default: 'none',
      },
      {
        name: 'docker',
        type: 'confirm',
        message: 'Include a Dockerfile?',
        default: true,
      }
    ]
  },
  actions: [
    {
      // Copy and transform all files in `template` folder into output directory
      type: 'add',
      files: '**',
      filters: {
        'src/index.js': '!esm',
        'src/index.mjs': 'esm',
        'test/index.js': 'tests !== "none" && !esm',
        'test/index.mjs': 'tests !== "none" && esm',
        'index.mjs': 'esm',
        'Dockerfile': 'docker',
        '.dockerignore': 'docker',
      },
    },
  ],
  async completed() {
    this.gitInit();
    await this.npmInstall();
    this.showProjectTips();

    if (path.resolve(process.cwd()) !== path.resolve(this.outDir)) {
      this.logger.success(`To get started, ${this.chalk.yellow('cd', this.outFolder)}`);
    }
  },
};
