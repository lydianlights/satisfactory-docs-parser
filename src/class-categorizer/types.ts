import { DocsDataClass } from 'types';

export type CategoryKey =
  'itemDescriptors'
  | 'resources'
  | 'consumables'
  | 'equipment'

  | 'buildableDescriptors'
  | 'buildables'
  | 'vehicles'

  | 'recipes'

  | 'schematics';

export type CategorizedClassnames = {
  [key in CategoryKey]: string[];
}

export type CategorizedDataClasses = {
  [key in CategoryKey]: DocsDataClass[];
}