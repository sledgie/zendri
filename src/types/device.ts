export type DeviceCategory =
  | "iPhone"
  | "Android Phones"
  | "Foldables"
  | "iPad"
  | "Android Tablets"
  | "Generic Devices";

export type DevicePlatform =
  | "iOS"
  | "iPadOS"
  | "Android"
  | "HarmonyOS"
  | "Fire OS"
  | "Generic";

export type Orientation = "portrait" | "landscape";

export type FoldState = "none" | "folded" | "unfolded";

export type DataAccuracy = "verified" | "estimated";

export type CutoutStyle = "dynamic-island" | "notch" | "punch-hole" | "none";

export interface DevicePreset {
  id: string;
  name: string;
  manufacturer: string;
  platform: DevicePlatform;
  category: DeviceCategory;
  family: string;
  viewportWidth: number;
  viewportHeight: number;
  dpr: number;
  supportedOrientations: Orientation[];
  defaultOrientation: Orientation;
  foldState: FoldState;
  accuracy: DataAccuracy;
  cutout?: CutoutStyle;
  notes: string;
  isCustom?: boolean;
}

export interface DeviceCatalogFile {
  catalogVersion: string;
  lastUpdated: string;
  totalDevices: number;
  devices: DevicePreset[];
}

export type ZoomPreset = "fit" | "50" | "75" | "100" | "125" | "custom";

export type PreviewStatus = "idle" | "loading" | "ready" | "blocked" | "error" | "invalid";

export interface CompareDeviceSlot {
  slotId: string;
  deviceId: string;
  orientation: Orientation;
  zoomMode: ZoomPreset;
  customZoom: number;
  reloadKey: number;
}

export interface CustomViewportPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  group: "phone" | "tablet" | "desktop";
}

export interface DeveloperOverlayState {
  showRuler: boolean;
  showDimensionsBadge: boolean;
  showSafeArea: boolean;
  showGrid: boolean;
  showBreakpointMarkers: boolean;
  showDeviceFrame: boolean;
  showCutout: boolean;
}

export interface WorkspaceSettings {
  canvasBackdrop: "dark" | "slate" | "paper";
  defaultZoom: ZoomPreset;
  reducedMotion: boolean;
  autoCloseSidebarOnMobile: boolean;
  syncCompareRotation: boolean;
}
