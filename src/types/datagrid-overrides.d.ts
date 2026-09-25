import '@mui/x-data-grid-premium';

declare module '@mui/x-data-grid-premium' {
  interface ToolbarPropsOverrides {
    onDownload?: () => void;
    downloading?: boolean;
  }
}
