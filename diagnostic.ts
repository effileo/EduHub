import prisma from './src/lib/prisma';

async function main() {
  console.log('Available models on prisma:');
  console.log(Object.keys(prisma).filter(k => !k.startsWith('_')));
}

main();
