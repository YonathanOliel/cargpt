'use client';

import type { VisionSummary } from '../lib/api';

export function VisionBanner({ vision }: { vision: VisionSummary }) {
  return (
    <div className="vision" role="status">
      <span aria-hidden="true">🔍</span> זוהה מהתמונה: <b>{vision.detectedLabel}</b> —{' '}
      {vision.description} (ביטחון {Math.round(vision.confidence * 100)}%)
    </div>
  );
}
