export const X_FIELD_OF_VIEW_DEGREES = 110.0; // 87.0
export const Y_FIELD_OF_VIEW_DEGREES = 64.0; // 58.0
export const X_FIELD_OF_VIEW_RADIANS = (Math.PI / 180.0) * X_FIELD_OF_VIEW_DEGREES;
export const Y_FIELD_OF_VIEW_RADIANS = (Math.PI / 180.0) * Y_FIELD_OF_VIEW_DEGREES;

export const CANVAS_DIMENSIONS = { X: 848, Y: 480 };

export const DEPTH_UNITS = 0.001; // 0.1mm per depth unit, configured in App.

export const X_RADIANS_PER_PIXEL = X_FIELD_OF_VIEW_RADIANS / CANVAS_DIMENSIONS.X;
export const Y_RADIANS_PER_PIXEL = Y_FIELD_OF_VIEW_RADIANS / CANVAS_DIMENSIONS.Y;

export const TANGENT_X_RADIANS_PER_PIXEL = Math.tan(X_RADIANS_PER_PIXEL);
export const TANGENT_Y_RADIANS_PER_PIXEL = Math.tan(Y_RADIANS_PER_PIXEL);

export const AREA_BG_COLOR = '#238DBF';
export const AREA_BG_COLOR_RGB = [35, 141, 191];
