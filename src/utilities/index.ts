import { ClassInfoMap } from 'types';
import { ItemInfo } from 'parsers/parseItems';
export { parseCollection } from './deserialization';

export type Color = {
  r: number,
  g: number,
  b: number,
}

export type ItemQuantity = {
  itemClass: string,
  quantity: number,
}

export function createSlug(name: string) {
  return name.replace(/[\s|.]+/g, '-').replace(/[™:]/g, '').toLowerCase();
}

export function cleanDescription(desc: string) {
  return desc.replace(/\r\n/g, '\n');
}

export function standardizeItemDescriptor(className: string) {
  return className.replace(/(?:BP_EquipmentDescriptor)|(?:BP_ItemDescriptor)|(?:BP_EqDesc)/, 'Desc_');
}

const classnameRegex = /\.(.+)$/;
export function getShortClassname(fullName: string) {
  const match = classnameRegex.exec(fullName);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error(`Failed to parse class name: [${fullName}]`);
}

const blueprintClassRegex = /^BlueprintGeneratedClass'"(.+)"'$/;
export function parseBlueprintClassname(classStr: string) {
  const match = blueprintClassRegex.exec(classStr);
  if (match && match[1]) {
    return getShortClassname(match[1]);
  }
  throw new Error(`Failed to parse blueprint class name: [${classStr}]`);
}

export function parseStackSize(data: string) {
  switch (data) {
    case 'SS_ONE':
      return 1;
    case 'SS_SMALL':
      return 50;
    case 'SS_MEDIUM':
      return 100;
    case 'SS_BIG':
      return 200;
    case 'SS_HUGE':
      return 500;
    case 'SS_FLUID':
      return -1;
    default:
      throw new Error(`Invalid stack size: [${data}]`);
  }
}

export function parseEquipmentSlot(data: string) {
  switch (data) {
    case 'ES_ARMS':
      return 'HAND';
    case 'ES_BACK':
      return 'BODY';
    default:
      throw new Error(`Invalid equipment slot: [${data}]`);
  }
}

export function parseColor(data: any, scaleTo255 = false): Color {
  const scaleFactor = scaleTo255 ? 255 : 1;
  return {
    r: Math.round(scaleFactor * data.R),
    g: Math.round(scaleFactor * data.G),
    b: Math.round(scaleFactor * data.B),
  };
}

export function parseItemQuantity(data: any, itemData: ClassInfoMap<ItemInfo>, errorIfMissing = false): ItemQuantity {
  const itemClass = standardizeItemDescriptor(parseBlueprintClassname(data.ItemClass));
  const itemInfo = itemData[itemClass];
  if (!itemInfo && errorIfMissing) {
    throw new Error(`Missing item info for ${itemClass}`);
  }
  const scaleFactor = itemInfo?.isFluid ? 1000 : 1;
  return {
    itemClass,
    quantity: data.Amount / scaleFactor,
  };
}
