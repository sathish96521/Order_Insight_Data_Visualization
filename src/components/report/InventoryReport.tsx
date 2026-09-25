import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  PopoverOrigin,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Add, ArrowDropDown, BarChart as BarChartIcon, Check, Close, DeleteSweep, DensityLarge, DensityMedium, DensitySmall, Download, FilterAlt, Refresh, Save, Search, TableChart, ViewHeadline } from '@mui/icons-material';
import { DataGridPremium, GridDensity, GridToolbarContainer, GridToolbarColumnsButton, useGridApiRef, useGridApiContext, GridColDef, GridFilterModel, GridFilterOperator, GridFilterItem, GridLogicOperator } from '@mui/x-data-grid-premium';
import { fetchReportFilters, fetchReport, exportReportCsv, saveReport } from '../../services/api';
import { inventoryColumns as staticColumns, inventoryRows as staticRows } from '../../data/inventoryData';
import { colorTokens } from '../../theme/tokens';
import ReportVisualization from './ReportVisualization';
import { ReportColumn, ReportFilterOptions, ReportResponse, ReportRowUpdate } from '../../types';

declare module '@mui/x-data-grid-premium' {
  interface ToolbarPropsOverrides {
    onDownload?: () => void;
    downloading?: boolean;
    density?: GridDensity;
    onDensityChange?: (density: GridDensity) => void;
    searchValue?: string;
    onSearchChange?: (v: string) => void;
  }
}

const toolbarButtonSx = {
  color: '#000',
  fontSize: 13,
  '& .MuiButton-startIcon, & .MuiSvgIcon-root': { color: '#000' },
  '&:hover': { bgcolor: alpha(colorTokens.primaryMain, 0.08) },
};

const serverSideApplyFn: GridFilterOperator['getApplyFilterFn'] = () => null;

const stringColumnFilterOperators: GridFilterOperator[] = [
  { value: 'contains', label: 'Contains', headerLabel: 'Contains', getApplyFilterFn: serverSideApplyFn },
  { value: 'equals', label: 'Equals', headerLabel: 'Equals', getApplyFilterFn: serverSideApplyFn },
  { value: 'startsWith', label: 'Starts With', headerLabel: 'Starts With', getApplyFilterFn: serverSideApplyFn },
  { value: 'endsWith', label: 'Ends With', headerLabel: 'Ends With', getApplyFilterFn: serverSideApplyFn },
  { value: 'doesNotEqual', label: 'Not Equals', headerLabel: 'Not Equals', getApplyFilterFn: serverSideApplyFn },
  { value: 'isEmpty', label: 'Empty', headerLabel: 'Empty', getApplyFilterFn: serverSideApplyFn, requiresFilterValue: false },
  { value: 'isNotEmpty', label: 'Not Empty', headerLabel: 'Not Empty', getApplyFilterFn: serverSideApplyFn, requiresFilterValue: false },
];

const numericColumnFilterOperators: GridFilterOperator[] = [
  { value: '=', label: 'Equals', headerLabel: 'Equals', getApplyFilterFn: serverSideApplyFn },
  { value: '!=', label: 'Not Equals', headerLabel: 'Not Equals', getApplyFilterFn: serverSideApplyFn },
  { value: '>', label: 'Greater Than', headerLabel: 'Greater Than', getApplyFilterFn: serverSideApplyFn },
  { value: '>=', label: 'Greater Than or Equal To', headerLabel: '≥', getApplyFilterFn: serverSideApplyFn },
  { value: '<', label: 'Less Than', headerLabel: 'Less Than', getApplyFilterFn: serverSideApplyFn },
  { value: '<=', label: 'Less Than or Equal To', headerLabel: '≤', getApplyFilterFn: serverSideApplyFn },
  { value: 'isEmpty', label: 'Empty', headerLabel: 'Empty', getApplyFilterFn: serverSideApplyFn, requiresFilterValue: false },
  { value: 'isNotEmpty', label: 'Not Empty', headerLabel: 'Not Empty', getApplyFilterFn: serverSideApplyFn, requiresFilterValue: false },
];

const dateColumnFilterOperators: GridFilterOperator[] = [
  { value: 'is', label: 'Equals', headerLabel: 'Equals', getApplyFilterFn: serverSideApplyFn },
  { value: 'not', label: 'Not Equals', headerLabel: 'Not Equals', getApplyFilterFn: serverSideApplyFn },
  { value: 'after', label: 'After', headerLabel: 'After', getApplyFilterFn: serverSideApplyFn },
  { value: 'onOrAfter', label: 'On or After', headerLabel: 'On or After', getApplyFilterFn: serverSideApplyFn },
  { value: 'before', label: 'Before', headerLabel: 'Before', getApplyFilterFn: serverSideApplyFn },
  { value: 'onOrBefore', label: 'On or Before', headerLabel: 'On or Before', getApplyFilterFn: serverSideApplyFn },
  { value: 'isEmpty', label: 'Empty', headerLabel: 'Empty', getApplyFilterFn: serverSideApplyFn, requiresFilterValue: false },
  { value: 'isNotEmpty', label: 'Not Empty', headerLabel: 'Not Empty', getApplyFilterFn: serverSideApplyFn, requiresFilterValue: false },
];

function getColumnFilterOperators(col: ReportColumn): GridFilterOperator[] {
  const type = (col.dataType || col.columnType || '').toLowerCase();
  if (type === 'date' || type === 'datetime' || type === 'timestamp' || col.field.toUpperCase().includes('DATE')) {
    return dateColumnFilterOperators;
  }
  if (type === 'number' || type === 'numeric' || type === 'integer' || type === 'decimal' || type === 'float' || type === 'double') {
    return numericColumnFilterOperators;
  }
  return stringColumnFilterOperators;
}

let filterItemIdCounter = 0;
function nextFilterItemId() { return `filter-${++filterItemIdCounter}`; }

function GlobalFilterPanel() {
  const apiRef = useGridApiContext();
  const filterModel: GridFilterModel = apiRef.current.state.filter.filterModel;
  const allColumns = apiRef.current.getAllColumns();
  const filterableColumns = allColumns.filter((c) => c.filterable !== false);

  const items = filterModel.items;
  const logicOperator = filterModel.logicOperator ?? GridLogicOperator.And;

  const updateModel = (newItems: GridFilterItem[], newLogic?: GridLogicOperator) => {
    apiRef.current.setFilterModel({
      ...filterModel,
      items: newItems,
      logicOperator: newLogic ?? logicOperator,
    });
  };

  const getOperatorsForField = (field: string): GridFilterOperator[] => {
    const col = filterableColumns.find((c) => c.field === field);
    return (col?.filterOperators as GridFilterOperator[]) || stringColumnFilterOperators;
  };

  const addRow = () => {
    const field = filterableColumns[0]?.field || '';
    const ops = getOperatorsForField(field);
    updateModel([...items, { id: nextFilterItemId(), field, operator: ops[0]?.value || 'contains', value: '' }]);
  };

  const removeRow = (id: number | string) => {
    updateModel(items.filter((item) => item.id !== id));
  };

  const removeAll = () => updateModel([]);

  const updateItem = (id: number | string, patch: Partial<GridFilterItem>) => {
    updateModel(items.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, ...patch };
      if (patch.field && patch.field !== item.field) {
        const ops = getOperatorsForField(patch.field);
        updated.operator = ops[0]?.value || 'contains';
        updated.value = '';
      }
      return updated;
    }));
  };

  const noValueOperators = new Set(['isEmpty', 'isNotEmpty']);

  return (
    <Paper
      sx={{
        p: 2,
        minWidth: 520,
        maxWidth: 760,
        maxHeight: 420,
        overflow: 'auto',
        borderRadius: 2,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
            <FilterAlt sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
            Filters
          </Typography>
          {items.length > 0 && (
            <Button size="small" color="error" startIcon={<DeleteSweep fontSize="small" />} onClick={removeAll} sx={{ textTransform: 'none', fontSize: 12 }}>
              Remove All
            </Button>
          )}
        </Stack>

        {items.length === 0 && (
          <Typography sx={{ fontSize: 13, color: colorTokens.textMuted, py: 1 }}>
            No filters applied. Click "Add Filter" to create one.
          </Typography>
        )}

        {items.map((item, idx) => (
          <Stack key={item.id ?? idx} direction="row" spacing={0.75} alignItems="center">
            {/* Logic operator connector */}
            <Box sx={{ minWidth: 64, flexShrink: 0 }}>
              {idx === 0 ? (
                <Typography sx={{ fontSize: 12, color: colorTokens.textMuted, pl: 1 }}>Where</Typography>
              ) : (
                <Select
                  size="small"
                  value={logicOperator}
                  onChange={(e) => updateModel(items, e.target.value as GridLogicOperator)}
                  sx={{ fontSize: 12, height: 32, '& .MuiSelect-select': { py: 0.5, px: 1 } }}
                >
                  <MenuItem value={GridLogicOperator.And}>AND</MenuItem>
                  <MenuItem value={GridLogicOperator.Or}>OR</MenuItem>
                </Select>
              )}
            </Box>

            {/* Column selector */}
            <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
              <Select
                value={item.field}
                onChange={(e) => updateItem(item.id!, { field: e.target.value })}
                sx={{ fontSize: 12, height: 32 }}
              >
                {filterableColumns.map((col) => (
                  <MenuItem key={col.field} value={col.field} sx={{ fontSize: 12 }}>
                    {col.headerName || col.field}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Operator selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={item.operator}
                onChange={(e) => updateItem(item.id!, { operator: e.target.value })}
                sx={{ fontSize: 12, height: 32 }}
              >
                {getOperatorsForField(item.field).map((op) => (
                  <MenuItem key={op.value} value={op.value} sx={{ fontSize: 12 }}>
                    {op.label || op.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Value input */}
            {!noValueOperators.has(item.operator) && (
              <TextField
                size="small"
                placeholder="Value"
                value={item.value ?? ''}
                onChange={(e) => updateItem(item.id!, { value: e.target.value })}
                sx={{ flex: 1, minWidth: 100, '& .MuiInputBase-root': { fontSize: 12, height: 32 } }}
              />
            )}

            {/* Remove row button */}
            <IconButton size="small" onClick={() => removeRow(item.id!)} sx={{ color: colorTokens.textMuted }}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        ))}

        <Divider />

        <Button size="small" startIcon={<Add fontSize="small" />} onClick={addRow} sx={{ alignSelf: 'flex-start', textTransform: 'none', fontSize: 12 }}>
          Add Filter
        </Button>
      </Stack>
    </Paper>
  );
}

function CustomHeaderFilterCell({ colDef, item }: { colDef: GridColDef; item: GridFilterItem }) {
  const apiRef = useGridApiContext();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const operators = (colDef.filterOperators as GridFilterOperator[]) || stringColumnFilterOperators;
  const currentOp = operators.find((op) => op.value === item.operator) || operators[0];
  const noValue = item.operator === 'isEmpty' || item.operator === 'isNotEmpty';

  const updateFilter = (patch: Partial<GridFilterItem>) => {
    const filterModel = apiRef.current.state.filter.filterModel;
    const existingIdx = filterModel.items.findIndex((i) => i.field === colDef.field);
    let newItems: GridFilterItem[];
    if (existingIdx >= 0) {
      newItems = filterModel.items.map((i) => i.field === colDef.field ? { ...i, ...patch } : i);
    } else {
      newItems = [...filterModel.items, { id: nextFilterItemId(), field: colDef.field, operator: item.operator, value: '', ...patch }];
    }
    apiRef.current.setFilterModel({ ...filterModel, items: newItems });
  };

  return (
    <Box sx={{ width: '100%', px: 0.5, display: 'flex', alignItems: 'center' }}>
      <TextField
        size="small"
        fullWidth
        placeholder={`Filter by ${colDef.headerName || colDef.field}`}
        value={noValue ? (currentOp?.label || '') : (item.value ?? '')}
        onChange={(e) => updateFilter({ value: e.target.value })}
        disabled={noValue}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0 }}>
                <IconButton
                  size="small"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  sx={{ p: 0.25, color: colorTokens.textSecondary }}
                >
                  <FilterAlt sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: item.value ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => updateFilter({ value: '' })} sx={{ p: 0.25 }}>
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: 12,
            height: 30,
            borderRadius: 1,
            bgcolor: '#fff',
          },
          '& .MuiOutlinedInput-input': {
            padding: '4px 4px',
          },
        }}
      />
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 160, maxHeight: 300 } } }}
      >
        {operators.map((op) => (
          <MenuItem
            key={op.value}
            selected={op.value === item.operator}
            onClick={() => { updateFilter({ operator: op.value }); setMenuAnchor(null); }}
            sx={{ fontSize: 12, minHeight: 32 }}
          >
            {op.label || op.value}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

function DensitySelector({ density, onDensityChange }: { density: GridDensity; onDensityChange: (d: GridDensity) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const options: { value: GridDensity; label: string; icon: React.ReactNode }[] = [
    { value: 'compact', label: 'Compact', icon: <DensitySmall fontSize="small" /> },
    { value: 'standard', label: 'Standard', icon: <DensityMedium fontSize="small" /> },
    { value: 'comfortable', label: 'Comfortable', icon: <DensityLarge fontSize="small" /> },
  ];

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#000' }}>
        <ViewHeadline fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        <Typography sx={{ px: 2, py: 0.5, fontSize: 12, fontWeight: 600, color: colorTokens.textMuted }}>Density</Typography>
        {options.map((opt) => (
          <ListItem
            key={opt.value}
            component="li"
            onClick={() => { onDensityChange(opt.value); setAnchorEl(null); }}
            sx={{ cursor: 'pointer', px: 2, py: 0.5, '&:hover': { bgcolor: alpha(colorTokens.primaryMain, 0.08) } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>{opt.icon}</ListItemIcon>
            <ListItemText primary={opt.label} primaryTypographyProps={{ fontSize: 13 }} />
            {density === opt.value && <Check fontSize="small" sx={{ color: colorTokens.primaryMain }} />}
          </ListItem>
        ))}
      </Menu>
    </>
  );
}

function CustomToolbar({ onDownload, downloading, density, onDensityChange, searchValue, onSearchChange }: { onDownload?: () => void; downloading?: boolean; density?: GridDensity; onDensityChange?: (d: GridDensity) => void; searchValue?: string; onSearchChange?: (v: string) => void }) {
  const apiRef = useGridApiContext();
  const filterModel = apiRef.current.state.filter.filterModel;
  const activeFilterCount = filterModel.items.filter((i) => i.value !== undefined && i.value !== '').length;

  return (
    <GridToolbarContainer
      sx={{
        justifyContent: 'flex-end',
        gap: 0.5,
        px: 1,
        py: 0.5,
      }}
    >
      <TextField
        size="small"
        placeholder="Search…"
        value={searchValue || ''}
        onChange={(e) => onSearchChange?.(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: '#000' }} />
              </InputAdornment>
            ),
            endAdornment: searchValue ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange?.('')}>
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{
          width: 220,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: 13,
            bgcolor: colorTokens.whiteSoft,
          },
        }}
      />
      {/* @ts-expect-error MUI X DataGrid toolbar buttons typing does not expose sx */}
      <GridToolbarColumnsButton sx={toolbarButtonSx} />
      <Button
        size="small"
        startIcon={<FilterAlt />}
        onClick={() => apiRef.current.showFilterPanel()}
        sx={toolbarButtonSx}
      >
        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
      </Button>
      <Button
        size="small"
        startIcon={downloading ? <CircularProgress size={14} /> : <Download />}
        onClick={onDownload}
        disabled={downloading}
        sx={toolbarButtonSx}
      >
        {downloading ? 'Downloading…' : 'Download'}
      </Button>
      {density && onDensityChange && (
        <DensitySelector density={density} onDensityChange={onDensityChange} />
      )}
    </GridToolbarContainer>
  );
}

interface SearchableCheckboxDropdownProps {
  label: string;
  options: string[];
  value: string | string[];
  onChange: (nextValue: string | string[]) => void;
  multiple?: boolean;
  allOptionValue?: string;
  allOptionLabel?: string;
  minWidth?: number;
}

function SearchableCheckboxDropdown({
  label,
  options,
  value,
  onChange,
  multiple = false,
  allOptionValue,
  allOptionLabel = 'All',
  minWidth = 250,
}: SearchableCheckboxDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchText, setSearchText] = useState('');

  const open = Boolean(anchorEl);
  const normalizedSearch = searchText.trim().toLowerCase();
  const hasAllOption = Boolean(allOptionValue);

  const nonAllOptions = options.filter((opt) => opt !== allOptionValue);

  const filteredNonAllOptions = nonAllOptions.filter((opt) => opt.toLowerCase().includes(normalizedSearch));

  // Don't show "All" in the list — the header checkbox handles select-all
  const visibleOptions = filteredNonAllOptions;

  const multiValue = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : [];

  const singleValue = !multiple
    ? (Array.isArray(value) ? (value[0] || '') : value)
    : '';

  // In single-select: "ALL" means all selected; track as the singleValue
  const isAllSelected = multiple
    ? multiValue.includes(allOptionValue || '__NONE__')
    : singleValue === allOptionValue;

  const selectedSet = multiple
    ? new Set(isAllSelected ? nonAllOptions : multiValue.filter((opt) => opt !== allOptionValue))
    : new Set<string>();

  const getOptionLabel = (option: string) => {
    if (hasAllOption && allOptionValue && option === allOptionValue) return allOptionLabel;
    return option;
  };

  const displayValue = (() => {
    if (multiple) {
      if (isAllSelected) return allOptionLabel;
      const realSelected = multiValue.filter((opt) => opt !== allOptionValue);
      if (realSelected.length === 0) return '';
      if (realSelected.length === 1) return getOptionLabel(realSelected[0]);
      return `${realSelected.length} selected`;
    }
    if (isAllSelected) return allOptionLabel;
    return singleValue ? getOptionLabel(singleValue) : '';
  })();

  const isOptionChecked = (option: string): boolean => {
    if (hasAllOption && allOptionValue && option === allOptionValue) {
      return isAllSelected;
    }
    if (isAllSelected) return true;
    if (multiple) return selectedSet.has(option);
    return singleValue === option;
  };

  const handleOptionToggle = (option: string) => {
    if (!multiple) {
      // Single-select: selecting "All" or a single customer
      if (option === allOptionValue) {
        onChange(isAllSelected ? '' : allOptionValue!);
      } else {
        onChange(option);
      }
      return;
    }

    // Multi-select: toggling "All" selects/deselects everything
    if (hasAllOption && allOptionValue && option === allOptionValue) {
      onChange(isAllSelected ? [] : [allOptionValue]);
      return;
    }

    if (isAllSelected) {
      // Deselect one item from "all" = select all EXCEPT this one
      const next = nonAllOptions.filter((o) => o !== option);
      onChange(next);
      return;
    }

    const next = new Set(selectedSet);
    if (next.has(option)) {
      next.delete(option);
    } else {
      next.add(option);
    }

    const arr = Array.from(next);
    // If all items individually selected, collapse to "ALL"
    if (hasAllOption && allOptionValue && arr.length === nonAllOptions.length) {
      onChange([allOptionValue]);
    } else {
      onChange(arr);
    }
  };

  const allFilteredSelected = filteredNonAllOptions.length > 0
    && (isAllSelected || filteredNonAllOptions.every((opt) => selectedSet.has(opt)));

  const someFilteredSelected = isAllSelected || filteredNonAllOptions.some((opt) => selectedSet.has(opt));

  const handleHeaderCheckboxToggle = (checked: boolean) => {
    if (!multiple) {
      if (hasAllOption && allOptionValue) {
        onChange(checked ? allOptionValue : '');
      }
      return;
    }

    if (checked) {
      // Select all filtered items; if that means everything, use ALL
      const next = new Set(selectedSet);
      filteredNonAllOptions.forEach((opt) => next.add(opt));
      if (hasAllOption && allOptionValue && next.size === nonAllOptions.length) {
        onChange([allOptionValue]);
      } else {
        onChange(Array.from(next));
      }
    } else {
      // Deselect all filtered items
      if (isAllSelected) {
        const next = nonAllOptions.filter((o) => !filteredNonAllOptions.includes(o));
        onChange(next);
      } else {
        const next = new Set(selectedSet);
        filteredNonAllOptions.forEach((opt) => next.delete(opt));
        onChange(Array.from(next));
      }
    }
  };

  const anchorOrigin: PopoverOrigin = { vertical: 'bottom', horizontal: 'left' };
  const transformOrigin: PopoverOrigin = { vertical: 'top', horizontal: 'left' };

  return (
    <FormControl
      size="small"
      sx={{
        minWidth,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: colorTokens.whiteSoft,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTokens.primaryMain,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colorTokens.primaryDark,
            borderWidth: 2,
          },
        },
      }}
    >
      <TextField
        size="small"
        aria-label={label}
        label={label}
        value={displayValue}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setAnchorEl(event.currentTarget as HTMLElement);
          }
        }}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <ArrowDropDown sx={{ color: colorTokens.textMuted }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              width: anchorEl ? Math.max(anchorEl.clientWidth, minWidth) : minWidth,
              borderRadius: 2,
              boxShadow: '0 6px 18px rgba(15,23,42,0.2)',
              border: `1px solid ${colorTokens.borderSoft}`,
              overflow: 'hidden',
            },
          },
          list: {
            sx: { p: 0 },
          },
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            bgcolor: '#5ea3db',
            px: 1,
            py: 0.75,
            borderBottom: `1px solid ${colorTokens.borderSoft}`,
          }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Checkbox
              size="small"
              checked={multiple ? allFilteredSelected : Boolean(hasAllOption && allOptionValue && singleValue === allOptionValue)}
              indeterminate={multiple ? (someFilteredSelected && !allFilteredSelected) : false}
              onChange={(e) => handleHeaderCheckboxToggle(e.target.checked)}
              inputProps={{ 'aria-label': multiple ? 'Select all filtered options' : 'Select all option' }}
              sx={{ color: colorTokens.white, '&.Mui-checked': { color: colorTokens.white }, '&.MuiCheckbox-indeterminate': { color: colorTokens.white } }}
            />
            <TextField
              size="small"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: searchText ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="Clear search"
                        onClick={() => setSearchText('')}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 30,
                  bgcolor: colorTokens.white,
                },
              }}
            />
            <IconButton
              size="small"
              aria-label="Close dropdown"
              onClick={() => setAnchorEl(null)}
              sx={{ color: colorTokens.white, flexShrink: 0 }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
          {visibleOptions.length === 0 ? (
            <Typography sx={{ px: 2, py: 1.5, color: colorTokens.textMuted, fontSize: 13 }}>
              No results found
            </Typography>
          ) : (
            visibleOptions.map((option) => (
              <MenuItem
                key={option}
                onClick={() => handleOptionToggle(option)}
                sx={{
                  minHeight: 34,
                  py: 0.25,
                }}
              >
                <Checkbox
                  size="small"
                  checked={isOptionChecked(option)}
                  sx={{ mr: 0.5 }}
                />
                <ListItemText
                  primary={getOptionLabel(option)}
                  primaryTypographyProps={{
                    fontSize: 13,
                    noWrap: true,
                    title: getOptionLabel(option),
                  }}
                />
              </MenuItem>
            ))
          )}
        </Box>
      </Menu>
    </FormControl>
  );
}

interface InventoryReportProps {
  reportType?: string;
  serviceName?: string;
}

function InventoryReport({ reportType = 'MIS_Inventory_Report', serviceName = 'ADI' }: InventoryReportProps) {
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [rowCount, setRowCount] = useState(0);
  const [isFallback, setIsFallback] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Filter options from the API
  const [filterOptions, setFilterOptions] = useState<ReportFilterOptions>({ services: [], months: [], customers: [], siteDeletedIndicators: [] });
  // Selected filter values (sentinel values like 'ALL' / 'BOTH' mean no filter)
  const [selectedService, setSelectedService] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const customerMultiSelect = true;
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedSiteDeleted, setSelectedSiteDeleted] = useState('');

  // Track submitted filters (only apply on Submit click)
  const submittedFilters = useRef({ service: '', month: '', customer: '', siteDeleted: '' });
  const [dataRequested, setDataRequested] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [drill, setDrill] = useState<{ label: string; rows: Record<string, unknown>[] } | null>(null);
  const apiRef = useGridApiRef();
  const [gridFilterModel, setGridFilterModel] = useState<GridFilterModel>({ items: [] });
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const committedColumnFiltersRef = useRef<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [density, setDensity] = useState<GridDensity>('standard');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Editable cell state: track modified rows by _rowId
  const [editedRows, setEditedRows] = useState<Map<number, Record<string, string>>>(new Map());
  const [saving, setSaving] = useState(false);

  // Load filter options when report changes
  useEffect(() => {
    setFilterOptions({ services: [], months: [], customers: [], siteDeletedIndicators: [] });
    setSelectedService('');
    setSelectedMonth('');
    setSelectedCustomers([]);
    setSelectedSiteDeleted('');
    setReportData(null);
    setDataRequested(false);
    setFiltersLoading(true);
    submittedFilters.current = { service: '', month: '', customer: '', siteDeleted: '' };
    fetchReportFilters(reportType, serviceName)
      .then((opts) => setFilterOptions(opts || { services: [], months: [], customers: [], siteDeletedIndicators: [] }))
      .catch(() => setFilterOptions({ services: [], months: [], customers: [], siteDeletedIndicators: [] }))
      .finally(() => setFiltersLoading(false));
  }, [reportType, serviceName]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // Debounce search input → triggers server-side search
  const handleSearchChange = useCallback((v: string) => {
    setSearchValue(v);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (dataRequested) setLoading(true);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(v);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 300);
  }, [dataRequested]);

  // Serialize DataGrid filter model items for the API (reads from committed ref)
  const serializeColumnFilters = useCallback((): string | null => {
    return committedColumnFiltersRef.current;
  }, []);

  // Handle filter model changes: immediate UI update + debounced API trigger
  const handleFilterModelChange = useCallback((model: GridFilterModel) => {
    setGridFilterModel(model);
    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
    filterDebounceRef.current = setTimeout(() => {
      const validItems = model.items.filter((item) => item.value !== undefined && item.value !== '');
      committedColumnFiltersRef.current = validItems.length === 0 ? null :
        JSON.stringify(validItems.map((item) => ({
          field: item.field,
          operator: item.operator,
          value: item.value,
          ...(model.logicOperator ? { logicOperator: model.logicOperator } : {}),
        })));
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setFetchTrigger((t) => t + 1);
    }, 500);
  }, []);

  const loadPage = useCallback(() => {
    if (!dataRequested) return;
    setLoading(true);
    setError(null);

    const { service, month, customer, siteDeleted } = submittedFilters.current;
    const columnFilters = serializeColumnFilters();
    const search = debouncedSearch.trim() || null;

    fetchReport(
      reportType,
      serviceName,
      paginationModel.page,
      paginationModel.pageSize,
      customer || null,
      service || null,
      month || null,
      siteDeleted || null,
      columnFilters,
      search,
    )
      .then((report) => {
        setReportData(report);
        setRowCount(Number(report.totalRows) || 0);
        setIsFallback(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Report API unavailable';
        console.warn('Report API unavailable, using static data:', message);
        setReportData({
          reportName: 'Inventory Report',
          reportType,
          serviceName,
          isSearchable: 'NO',
          columns: staticColumns.map((c) => ({
            field: c.field,
            headerName: c.headerName ?? c.field,
            sortable: c.sortable !== false,
            filterable: false,
          })),
          rows: staticRows,
          totalRows: staticRows.length,
        });
        setRowCount(staticRows.length);
        setIsFallback(true);
        setError('Live report API unavailable. Showing static fallback data.');
      })
      .finally(() => setLoading(false));
  }, [dataRequested, reportType, serviceName, paginationModel.page, paginationModel.pageSize, fetchTrigger, serializeColumnFilters, debouncedSearch]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleDownload = useCallback(() => {
    if (!dataRequested) return;
    if (rowCount === 0) {
      setSnackbar({ open: true, message: 'No records found to download' });
      return;
    }
    const { service, month, customer, siteDeleted } = submittedFilters.current;
    const columnFilters = serializeColumnFilters();
    const search = debouncedSearch.trim() || null;
    exportReportCsv(
      reportType,
      serviceName,
      customer || null,
      service || null,
      month || null,
      siteDeleted || null,
      columnFilters,
      search,
    );
  }, [dataRequested, reportType, serviceName, serializeColumnFilters, debouncedSearch, rowCount]);

  const handleSubmit = () => {
    const isAll = selectedCustomers.includes('ALL') || selectedCustomers.length === 0;
    const normalizedCustomerSelection = isAll ? [] : selectedCustomers;

    submittedFilters.current = {
      service: selectedService === 'ALL' || selectedService === '' ? '' : selectedService,
      month: selectedMonth === 'ALL' || selectedMonth === '' ? '' : selectedMonth,
      customer: customerMultiSelect
        ? (normalizedCustomerSelection.length > 0 ? normalizedCustomerSelection.join('|||') : '')
        : (isAll ? '' : (selectedCustomers[0] || '')),
      siteDeleted: selectedSiteDeleted === 'BOTH' || selectedSiteDeleted === '' ? '' : selectedSiteDeleted,
    };
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setDataRequested(true);
    setEditedRows(new Map());
    setFetchTrigger((t) => t + 1);
  };

  // Detect if this report has any editable columns
  const isReportEditable = reportData?.isEditable === 'YES';
  const editableColumnFields = new Set(
    (reportData?.columns || [])
      .filter((col) => {
        const dt = (col.displayType || '').toUpperCase();
        return dt === 'SELECTION' || dt === 'TEXTBOX' || dt === 'TEXTAREA';
      })
      .map((col) => col.field),
  );

  // Determine the primary key column(s) for identifying rows during save
  const keyColumnField = (reportData?.columns || []).length > 0
    ? (reportData?.columns.find((c) => c.field.toUpperCase() === 'CUST_ID')?.field || reportData?.columns[0].field || '')
    : '';

  const handleSave = useCallback(async () => {
    if (editedRows.size === 0 || !reportData) return;
    setSaving(true);

    const currentRows = reportData.rows || [];
    const updates: ReportRowUpdate[] = [];

    for (const [rowId, changes] of editedRows.entries()) {
      const row = currentRows.find((_, idx) => (paginationModel.page * paginationModel.pageSize) + idx === rowId);
      if (!row) continue;
      updates.push({
        keyColumns: { [keyColumnField]: row[keyColumnField] },
        updatedColumns: changes,
      });
    }

    try {
      const result = await saveReport({
        reportType,
        serviceName,
        rows: updates,
      });
      setSnackbar({ open: true, message: `${result.updatedRows} record(s) saved successfully` });
      setEditedRows(new Map());
      setFetchTrigger((t) => t + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setSnackbar({ open: true, message: msg });
    } finally {
      setSaving(false);
    }
  }, [editedRows, reportData, paginationModel, keyColumnField, reportType, serviceName]);

  // Format month values for display (e.g. "202603" → "Mar-2026")
  const formatMonth = (val: string): string => {
    if (!val) return val;
    if (/^[A-Za-z]{3}-\d{4}$/.test(val)) return val;
    if (/^\d{6}$/.test(val)) {
      const year = val.substring(0, 4);
      const monthIdx = parseInt(val.substring(4, 6), 10) - 1;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[monthIdx] || val.substring(4, 6)}-${year}`;
    }
    return val;
  };

  if (filtersLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Inventory reports always have customer + site deleted indicator filters (hardcoded in legacy app)
  const isInventoryReport = reportType === 'MIS_Inventory_Report' || reportType === 'GMIS_Inventory_Report';
  // Billing reports always have customer + month filters
  const isBillingReport = reportType === 'MIS_View_All_Billing_Reports'
    || reportType === 'MIS_View_All_Billing_Reports_ATT_Guarantee'
    || reportType === 'GMIS_View_All_Billing_Reports';

  const hasFilters = filterOptions.services.length > 0
    || filterOptions.months.length > 0
    || filterOptions.customers.length > 0
    || (filterOptions.siteDeletedIndicators && filterOptions.siteDeletedIndicators.length > 0)
    || isInventoryReport
    || isBillingReport;

  const filterControls = hasFilters ? (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.25}
      sx={{
        alignItems: { xs: 'stretch', sm: 'center' },
        flexWrap: 'wrap',
        justifyContent: { xs: 'stretch', xl: 'center' },
        flex: { xs: '1 1 100%', xl: '1 1 auto' },
        minWidth: { xl: 560 },
      }}
    >
      {filterOptions.services.length > 0 && (
        <SearchableCheckboxDropdown
          label="Select Service"
          options={['ALL', ...filterOptions.services]}
          value={selectedService}
          onChange={(nextValue) => {
            if (Array.isArray(nextValue)) {
              setSelectedService(nextValue[0] || 'ALL');
            } else {
              setSelectedService(nextValue || 'ALL');
            }
          }}
          allOptionValue="ALL"
          allOptionLabel="All Services"
          minWidth={300}
        />
      )}

      {(filterOptions.months.length > 0 || isBillingReport) && (
        <FormControl
          size="small"
          sx={{
            minWidth: 220,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: colorTokens.whiteSoft,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colorTokens.primaryMain,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colorTokens.primaryDark,
                borderWidth: 2,
              },
            },
          }}
        >
          <InputLabel>Select Reporting Month</InputLabel>
          <Select
            value={selectedMonth}
            label="Select Reporting Month"
            onChange={(e: SelectChangeEvent) => setSelectedMonth(e.target.value)}
          >
            <MenuItem value="ALL">All Months</MenuItem>
            {filterOptions.months.map((m) => (
              <MenuItem key={m} value={m}>{formatMonth(m)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {(filterOptions.customers.length > 0 || isInventoryReport || isBillingReport) && (
        <SearchableCheckboxDropdown
          label="Select a customer"
          options={['ALL', ...filterOptions.customers]}
          value={customerMultiSelect ? selectedCustomers : (selectedCustomers[0] || '')}
          onChange={(nextValue) => {
            if (Array.isArray(nextValue)) {
              setSelectedCustomers(nextValue);
            } else {
              setSelectedCustomers(nextValue ? [nextValue] : []);
            }
          }}
          multiple={customerMultiSelect}
          allOptionValue="ALL"
          allOptionLabel="All Customers"
          minWidth={500}
        />
      )}

      {((filterOptions.siteDeletedIndicators && filterOptions.siteDeletedIndicators.length > 0) || isInventoryReport) && (
        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: colorTokens.whiteSoft,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colorTokens.primaryMain,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colorTokens.primaryDark,
                borderWidth: 2,
              },
            },
          }}
        >
          <InputLabel>Site Deleted Indicator</InputLabel>
          <Select
            value={selectedSiteDeleted}
            label="Site Deleted Indicator"
            onChange={(e: SelectChangeEvent) => setSelectedSiteDeleted(e.target.value)}
          >
            <MenuItem value="BOTH">Both</MenuItem>
            <MenuItem value="Y">Yes</MenuItem>
            <MenuItem value="N">No</MenuItem>
          </Select>
        </FormControl>
      )}

      <Button
        variant="contained"
        size="small"
        startIcon={<Refresh />}
        onClick={handleSubmit}
        disableElevation
        sx={{
          minWidth: 120,
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          px: 2.5,
          py: 0.9,
          bgcolor: colorTokens.primaryDark,
          '&:hover': { bgcolor: '#4f46e5' },
        }}
      >
        Refresh
      </Button>

      {isReportEditable && editableColumnFields.size > 0 && (
        <Button
          variant="contained"
          size="small"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={editedRows.size === 0 || saving}
          disableElevation
          sx={{
            minWidth: 120,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            py: 0.9,
            bgcolor: '#10b981',
            '&:hover': { bgcolor: '#059669' },
          }}
        >
          {saving ? 'Saving...' : `Save Changes (${editedRows.size})`}
        </Button>
      )}
    </Stack>
  ) : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = reportData
    ? (reportData.columns || []).map((col) => {
      const dt = (col.displayType || '').toUpperCase();
      const isSelectionCol = isReportEditable && dt === 'SELECTION';
      const isTextboxCol = isReportEditable && dt === 'TEXTBOX';
      const isTextareaCol = isReportEditable && dt === 'TEXTAREA';
      const base: Record<string, unknown> = {
        field: col.field,
        headerName: col.headerName,
        flex: 1,
        minWidth: 150,
        sortable: col.sortable !== false,
        filterable: true,
        filterOperators: getColumnFilterOperators(col),
        editable: false,
        renderHeaderFilter: (params: { colDef: GridColDef; item: GridFilterItem }) => (
          <CustomHeaderFilterCell colDef={params.colDef} item={params.item} />
        ),
      };
      if (isSelectionCol) {
        const options = col.displayValue
          ? col.displayValue.split(',').map((v) => v.trim())
          : ['Y', 'N'];
        const field = col.field;
        base.renderCell = (params: { row: Record<string, unknown>; value: unknown }) => {
          const rowId = params.row._rowId as number;
          const override = editedRows.get(rowId)?.[field];
          const currentVal = override ?? String(params.value ?? '');
          return (
            <select
              value={currentVal}
              onChange={(e) => {
                const newVal = e.target.value;
                setEditedRows((prev) => {
                  const next = new Map(prev);
                  const existing = next.get(rowId) || {};
                  next.set(rowId, { ...existing, [field]: newVal });
                  return next;
                });
              }}
              style={{
                width: '100%',
                height: 28,
                border: '1px solid #d0d7e2',
                borderRadius: 4,
                backgroundColor: '#f8fafc',
                fontSize: 13,
                cursor: 'pointer',
                outline: 'none',
                padding: '2px 6px',
              }}
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );
        };
      }
      if (isTextboxCol) {
        const field = col.field;
        const maxLen = col.dataLength || 256;
        base.renderCell = (params: { row: Record<string, unknown>; value: unknown }) => {
          const rowId = params.row._rowId as number;
          const override = editedRows.get(rowId)?.[field];
          const currentVal = override ?? String(params.value ?? '');
          return (
            <input
              type="text"
              value={currentVal}
              maxLength={maxLen}
              onChange={(e) => {
                const newVal = e.target.value;
                setEditedRows((prev) => {
                  const next = new Map(prev);
                  const existing = next.get(rowId) || {};
                  next.set(rowId, { ...existing, [field]: newVal });
                  return next;
                });
              }}
              style={{
                width: '100%',
                height: 28,
                border: '1px solid #d0d7e2',
                borderRadius: 4,
                backgroundColor: '#f8fafc',
                fontSize: 13,
                outline: 'none',
                padding: '2px 6px',
              }}
            />
          );
        };
      }
      if (isTextareaCol) {
        const field = col.field;
        const maxLen = col.dataLength || 1000;
        base.renderCell = (params: { row: Record<string, unknown>; value: unknown }) => {
          const rowId = params.row._rowId as number;
          const override = editedRows.get(rowId)?.[field];
          const currentVal = override ?? String(params.value ?? '');
          return (
            <textarea
              value={currentVal}
              maxLength={maxLen}
              rows={2}
              onChange={(e) => {
                const newVal = e.target.value;
                setEditedRows((prev) => {
                  const next = new Map(prev);
                  const existing = next.get(rowId) || {};
                  next.set(rowId, { ...existing, [field]: newVal });
                  return next;
                });
              }}
              style={{
                width: '100%',
                minHeight: 36,
                border: '1px solid #d0d7e2',
                borderRadius: 4,
                backgroundColor: '#f8fafc',
                fontSize: 13,
                outline: 'none',
                padding: '4px 6px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          );
        };
      }
      return base;
    })
    : [];

  const pageOffset = paginationModel.page * paginationModel.pageSize;
  const rows = reportData
    ? (reportData.rows || []).map((row, idx) => ({
      _rowId: pageOffset + idx,
      ...row,
    }))
    : [];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${colorTokens.borderPanel}`,
        bgcolor: colorTokens.white,
        height: 'calc(100vh - 126px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
      }}
    >
      {/* ── Header: Title + Chip + Filters ── */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pt: { xs: 2, md: 2.5 },
          pb: 0,
          borderBottom: `1px solid ${colorTokens.borderSoft}`,
        }}
      >
        {/* Title row */}
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          spacing={1.5}
          sx={{
            mb: 1.5,
            alignItems: { xs: 'stretch', xl: 'center' },
            justifyContent: 'space-between',
            gap: 1.25,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: { xs: '1 1 auto', xl: '0 1 auto' } }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: alpha(colorTokens.primaryMain, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TableChart sx={{ fontSize: 20, color: colorTokens.primaryDark }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  color: colorTokens.textMuted,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                }}
              >
                {serviceName} Reporting
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: colorTokens.textStrong,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontSize: { xs: 16, md: 18 },
                }}
              >
                {reportData ? reportData.reportName : reportType.replace(/_/g, ' ')}
              </Typography>
            </Box>
          </Box>

          {filterControls}

          {reportData && (
            <Button
              variant={showCharts ? 'contained' : 'outlined'}
              size="small"
              startIcon={showCharts ? <TableChart /> : <BarChartIcon />}
              onClick={() => setShowCharts((v) => !v)}
              sx={{ alignSelf: { xs: 'flex-start', xl: 'center' }, ml: { xl: 'auto' }, whiteSpace: 'nowrap' }}
            >
              {showCharts ? 'Table View' : 'Visualize'}
            </Button>
          )}

          {reportData && (
            <Chip
              size="small"
              label={`${rowCount.toLocaleString()} total`}
              sx={{
                bgcolor: alpha(colorTokens.primaryMain, 0.1),
                color: colorTokens.primaryDark,
                fontWeight: 600,
                fontSize: 12,
                height: 26,
                alignSelf: { xs: 'flex-start', xl: 'center' },
                ml: { xl: 'auto' },
              }}
            />
          )}
        </Stack>
      </Box>

      {/* ── Data area ── */}
      {!dataRequested && !reportData ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            gap: 1,
          }}
        >
          <TableChart sx={{ fontSize: 48, color: colorTokens.borderSoft }} />
          <Typography sx={{ color: colorTokens.textMuted, fontSize: 14 }}>
            Select filters and click <strong>Refresh</strong> to load report data.
          </Typography>
        </Box>
      ) : loading && !reportData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress size={36} />
        </Box>
      ) : reportData ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minHeight: 0,
            px: { xs: 1.5, md: 2 },
            pt: 1,
            pb: 0.5,
          }}
        >
          {/* Status chips */}
          {(isFallback || (error && !isFallback)) && (
            <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
              {isFallback && <Chip size="small" color="warning" label="Static Data" />}
              {error && !isFallback && <Chip size="small" color="error" label={error} />}
            </Stack>
          )}

          {/* Row info */}
          {/* <Typography variant="body2" sx={{ color: colorTokens.textMuted, mb: 0.5, fontSize: 12 }}>
            {rows.length} rows on this page &bull; Page {paginationModel.page + 1}
          </Typography> */}

          {showCharts && (
            <Box sx={{ flexGrow: 1, minHeight: 0, width: '100%', overflow: 'auto', pb: 2 }}>
              <ReportVisualization
                rows={rows as Record<string, unknown>[]}
                columns={columns as { field: string; headerName?: string }[]}
                title={`${reportData ? reportData.reportName : reportType.replace(/_/g, ' ')} — Data Visualization (current page)`}
                onOpenInTable={(sel, label) => { setDrill({ label, rows: sel }); setShowCharts(false); }}
              />
            </Box>
          )}

          {/* Data Grid */}
          {!showCharts && drill && (
            <Chip size="small" color="primary" label={`Filtered: ${drill.label} (${drill.rows.length})`} onDelete={() => setDrill(null)} sx={{ alignSelf: 'flex-start', mb: 1 }} />
          )}
          <Box sx={{ flexGrow: 1, minHeight: 0, width: '100%', overflow: 'hidden', display: showCharts ? 'none' : 'block' }}>
            <DataGridPremium
              apiRef={apiRef}
              rows={(drill ? drill.rows : rows) as any}
              columns={columns}
              pagination
              getRowId={(row) => row._rowId as number}
              disableRowSelectionOnClick
              density={density}
              getRowHeight={() => 'auto'}
              paginationMode="server"
              filterMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[25, 50, 100]}
              loading={loading}
              showToolbar
              headerFilters
              headerFilterHeight={42}
              filterModel={gridFilterModel}
              onFilterModelChange={handleFilterModelChange}
              slots={{ toolbar: CustomToolbar, filterPanel: GlobalFilterPanel }}
              slotProps={{
                toolbar: {
                  showQuickFilter: false,
                  onDownload: handleDownload,
                  downloading,
                  density,
                  onDensityChange: setDensity,
                  searchValue,
                  onSearchChange: handleSearchChange,
                },
              }}
              sx={{
                height: '100%',
                border: 'none',
                borderRadius: 2,
                fontSize: 13,
                '& .MuiDataGrid-toolbarContainer': {
                  padding: '4px 8px',
                  borderBottom: `1px solid ${colorTokens.borderSoft}`,
                  minHeight: 40,
                  '& .MuiButton-root': {
                    color: '#000',
                    '& .MuiSvgIcon-root': { color: '#000' },
                  },
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#f8fafc',
                  // Remove the line between column titles and filter inputs
                  '& .MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader': {
                    borderBottom: 'none',
                  },
                  '& .MuiDataGrid-row--borderBottom .MuiDataGrid-filler': {
                    borderBottom: 'none',
                  },
                  '& .MuiDataGrid-row--borderBottom .MuiDataGrid-scrollbarFiller': {
                    borderBottom: 'none',
                  },
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  fontSize: 12,
                  color: colorTokens.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                },
                '& .MuiDataGrid-headerFilterRow': {
                  bgcolor: '#f8fafc',
                  '& .MuiDataGrid-columnHeader, & .MuiDataGrid-scrollbarFiller': {
                    borderBottom: `2px solid ${colorTokens.borderSoft}`,
                  },
                  '& .MuiDataGrid-columnHeader': {
                    padding: '0 4px',
                    display: 'flex',
                    alignItems: 'center',
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${colorTokens.appBackground}`,
                  color: colorTokens.textBody,
                  fontSize: 13,
                  whiteSpace: 'pre-line',
                  py: 1,
                },
                '& .MuiDataGrid-cell--editable': {
                  bgcolor: alpha('#10b981', 0.06),
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha('#10b981', 0.12) },
                },
                '& .MuiDataGrid-row': {
                  '&:nth-of-type(even)': { bgcolor: '#fafbfe' },
                  '&:hover': {
                    bgcolor: alpha(colorTokens.primaryMain, 0.04),
                  },
                  transition: 'background-color 0.15s ease',
                },
                '& .MuiDataGrid-main': { overflow: 'auto' },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${colorTokens.borderSoft}`,
                  bgcolor: '#fafbfe',
                },
                '& .MuiTablePagination-root': { fontSize: 13 },
                '& .MuiDataGrid-overlay': { bgcolor: 'transparent' },
              }}
            />
          </Box>
        </Box>
      ) : null}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          variant="filled"
          severity={snackbar.message.includes('success') ? 'success' : 'error'}
          onClose={() => setSnackbar({ open: false, message: '' })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default InventoryReport;
