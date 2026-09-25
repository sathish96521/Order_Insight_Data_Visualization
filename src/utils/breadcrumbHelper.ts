import { BreadcrumbItem, MenuItem } from '../types';

export function findBreadcrumbPath(menuTree: MenuItem[], selectedId: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  function traverse(items: MenuItem[], path: BreadcrumbItem[] = []): boolean {
    for (const item of items) {
      if (item.type === 'label') continue;
      if (item.id === selectedId) {
        breadcrumbs.push(...path, { id: item.id, title: item.title });
        return true;
      }
      if (item.children?.length) {
        if (traverse(item.children, [...path, { id: item.id, title: item.title }])) {
          return true;
        }
      }
    }
    return false;
  }

  traverse(menuTree);
  return breadcrumbs.length > 0
    ? [{ id: 'home', title: 'Home' }, ...breadcrumbs]
    : [{ id: 'home', title: 'Home' }];
}
