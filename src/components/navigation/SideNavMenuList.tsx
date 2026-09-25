import { List } from '@mui/material';
import MenuNode from './MenuNode';
import { MenuItem } from '../../types';

interface SideNavMenuListProps {
  menuTree: MenuItem[];
  selectedId: string;
  openState: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  collapsed: boolean;
}

function SideNavMenuList({ menuTree, selectedId, openState, onToggle, onSelect, collapsed }: SideNavMenuListProps) {
  return (
    <List
      disablePadding
      sx={{
        pb: 2,
        flexGrow: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {menuTree.map((menuItem) => (
        <MenuNode
          key={menuItem.id}
          item={menuItem}
          selectedId={selectedId}
          openState={openState}
          onToggle={onToggle}
          onSelect={onSelect}
          collapsed={collapsed}
        />
      ))}
    </List>
  );
}

export default SideNavMenuList;
