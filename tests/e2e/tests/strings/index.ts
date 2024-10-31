import { readFileSync } from 'fs';
import { join } from 'path';

import { setup } from '../../config/setup';

function loadJson() {
  try {
    const path = join(
      process.cwd(),
      '../../assets/translations',
      `${setup.language}.json`,
    );
    const jsonData = readFileSync(path, 'utf-8');
    const data = JSON.parse(jsonData);
    return data;
  } catch (error) {
    console.error('Error loading language JSON file :', error);
    return null;
  }
}

const data = loadJson();

export default data;
