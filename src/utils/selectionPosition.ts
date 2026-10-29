export interface SelectionCoords {
  x: number; // Screen X (clamped)
  y: number; // Screen Y (clamped)
  placement: 'top' | 'bottom';
  spanRect: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  };
}

let mirrorDiv: HTMLDivElement | null = null;

const PROPERTIES_TO_COPY = [
  'boxSizing',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
  'whiteSpace',
  'wordBreak',
  'overflowWrap',
] as const;

/**
 * Calculates the exact viewport coordinates of selected text inside a textarea.
 * Uses a zero-drift styled mirror DOM element to guarantee 1:1 line wrap alignment.
 */
export function getSelectionCoordinates(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number,
  bubbleWidth = 120,
  bubbleHeight = 36
): SelectionCoords | null {
  if (!textarea || start < 0 || end <= start) return null;

  if (typeof document === 'undefined') return null;

  if (!mirrorDiv) {
    mirrorDiv = document.createElement('div');
    mirrorDiv.id = '__gaigao_textarea_mirror__';
    mirrorDiv.style.position = 'fixed';
    mirrorDiv.style.top = '-99999px';
    mirrorDiv.style.left = '-99999px';
    mirrorDiv.style.visibility = 'hidden';
    mirrorDiv.style.pointerEvents = 'none';
    mirrorDiv.style.zIndex = '-9999';
    document.body.appendChild(mirrorDiv);
  }

  const computed = window.getComputedStyle(textarea);
  for (const prop of PROPERTIES_TO_COPY) {
    mirrorDiv.style[prop] = computed[prop] as string;
  }

  // Exact client width to match wrapping
  mirrorDiv.style.width = `${textarea.clientWidth}px`;
  mirrorDiv.style.height = 'auto';
  mirrorDiv.style.overflow = 'hidden';

  const fullText = textarea.value;
  const beforeText = fullText.substring(0, start);
  const selectedText = fullText.substring(start, end);

  // Build nodes in mirror
  mirrorDiv.textContent = '';

  const beforeNode = document.createTextNode(beforeText);
  mirrorDiv.appendChild(beforeNode);

  const span = document.createElement('span');
  span.textContent = selectedText;
  mirrorDiv.appendChild(span);

  const spanLeft = span.offsetLeft;
  const spanTop = span.offsetTop;
  const spanWidth = span.offsetWidth;
  const spanHeight = span.offsetHeight;

  const textareaRect = textarea.getBoundingClientRect();

  // Screen coordinates of the selected text
  const screenLeft = textareaRect.left + spanLeft - textarea.scrollLeft;
  const screenTop = textareaRect.top + spanTop - textarea.scrollTop;
  const screenBottom = screenTop + spanHeight;
  const screenRight = screenLeft + spanWidth;

  // Viewport calculations (handles mobile iOS visualViewport when keyboard is up)
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const viewportTop = window.visualViewport?.offsetTop ?? 0;
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
  const headerHeight = 56; // avoid top navbar
  const keyboardBuffer = 12; // buffer above keyboard

  // Horizontally center the bubble near the start of selection
  let targetX = screenLeft + Math.min(spanWidth / 2, 60) - bubbleWidth / 2;
  // Clamp X horizontally
  targetX = Math.max(12, Math.min(viewportWidth - bubbleWidth - 12, targetX));

  // Determine placement (top vs bottom)
  let targetY: number;
  let placement: 'top' | 'bottom' = 'top';

  const spaceAbove = screenTop - headerHeight;
  const maxAllowedY = viewportTop + viewportHeight - keyboardBuffer - bubbleHeight;

  if (spaceAbove >= bubbleHeight + 8) {
    // Place directly above the selected text
    targetY = screenTop - bubbleHeight - 6;
    placement = 'top';
  } else if (screenBottom + bubbleHeight + 8 <= maxAllowedY + bubbleHeight) {
    // If blocked on top, place directly below the selected text
    targetY = screenBottom + 6;
    placement = 'bottom';
  } else {
    // Clamped visible zone if text is partially covered
    targetY = Math.max(headerHeight + 6, Math.min(maxAllowedY, screenTop - bubbleHeight - 6));
  }

  return {
    x: targetX,
    y: targetY,
    placement,
    spanRect: {
      top: screenTop,
      left: screenLeft,
      bottom: screenBottom,
      right: screenRight,
      width: spanWidth,
      height: spanHeight,
    },
  };
}
