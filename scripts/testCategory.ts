import { addCategory, getAllCategories } from '../lib/categories';

async function run() {
  console.log('GITHUB_TOKEN', process.env.GITHUB_TOKEN ? 'set' : 'not set');
  try {
    const before = await getAllCategories();
    console.log('Before:', before);
    const res = await addCategory('Exploration');
    console.log('AddCategory result:', res);
    const after = await getAllCategories();
    console.log('After:', after);
  } catch (err:any) {
    console.error('Error in script', err);
  }
}

run();
