import { DocsClasslist, DocsClasslistMap } from 'types';
import { parseItems, parseBuildings, parseRecipes, parseSchematics } from 'parsers';
import { getCategoryClasses } from 'class-categories';

const nativeClassRegex = /FactoryGame\.(.+)'$/;

function parseDocs(input: Buffer | string) {
  if (Buffer.isBuffer(input)) {
    const asString = input.toString('utf16le', 2);
    return parseDocsString(asString);
  } else {
    return parseDocsString(input);
  }
}

function parseDocsString(input: string) {
  const docs = (JSON.parse(input) as DocsClasslist[]);

  if (!Array.isArray(docs)) {
    throw new Error('Invalid Docs.json file -- not an array');
  }

  const classlistMap: DocsClasslistMap = {};
  for (const entry of docs) {
    if (!Object.prototype.hasOwnProperty.call(entry, 'NativeClass') || !Object.prototype.hasOwnProperty.call(entry, 'Classes')) {
      throw new Error('Invalid Docs.json file -- missing required keys');
    }
    const match = nativeClassRegex.exec(entry.NativeClass);
    if (!match || !match[1]) {
      throw new Error(`Could not parse top-level class ${entry.NativeClass}`);
    }
    const nativeClassName = match[1];
    classlistMap[nativeClassName] = entry.Classes;
  }

  const classList = Object.keys(classlistMap).sort();
  const categoryClasses = getCategoryClasses(classlistMap);

  const { items, resources, equipment } = parseItems(categoryClasses);
  const buildings = parseBuildings(categoryClasses, { resources });
  const { itemRecipes, buildRecipes } = parseRecipes(categoryClasses, { items, buildings });
  // const schematics = parseSchematics(categoryClasses);

  return {
    meta: {
      originalDocs: docs,
      topLevelClassList: classList,
      classlistMap,
      categories: categoryClasses,
    },
    data: {
      items,
      resources,
      equipment,
      buildings,
      itemRecipes,
      buildRecipes,
      // schematics,
    }
  };
}

export default parseDocs;
