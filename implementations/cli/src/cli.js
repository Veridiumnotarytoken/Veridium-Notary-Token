#!/usr/bin/env node
const { program } = require('commander');
const verifyCmd = require('./commands/verify');
const signCmd = require('./commands/sign');
const issueCmd = require('./commands/issue');

program
  .name('vnt')
  .description('Veridium Notary Token (VNT) CLI')
  .version('1.0.0');

program
  .command('verify <file>')
  .description('Verify a VNT JSON file')
  .action(verifyCmd);

program
  .command('sign <claimFile> --key <privateKeyFile>')
  .description('Sign a claim JSON file and output a VNT')
  .action(signCmd);

program
  .command('issue')
  .description('Interactive wizard to issue a new VNT')
  .action(issueCmd);

program.parse();
