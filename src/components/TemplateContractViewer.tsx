import React, { useEffect, useRef } from 'react';
import { Position } from '../types';
import { ContractData } from './ContractDocument';
import { OfficialSaaDocument } from './OfficialSaaDocument';

interface TemplateContractViewerProps {
  templateSource?: ArrayBuffer | Uint8Array | string;
  contractData: ContractData;
  position: Position;
  viewMode: 'continuous' | 'paginated';
  currentPageIndex: number;
  zoomScale: number;
  onLoaded?: (totalPages: number, container: HTMLElement) => void;
  onError?: (err: Error) => void;
}

export const TemplateContractViewer: React.FC<TemplateContractViewerProps> = ({
  contractData,
  position,
  viewMode,
  currentPageIndex,
  zoomScale,
  onLoaded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && onLoaded) {
      onLoaded(9, containerRef.current);
    }
  }, [position, JSON.stringify(contractData), onLoaded]);

  return (
    <div ref={containerRef} className="w-full flex justify-center py-2">
      <OfficialSaaDocument
        contractData={contractData}
        position={position}
        viewMode={viewMode}
        currentPageIndex={currentPageIndex}
        zoomScale={zoomScale}
        onTotalPagesCalculated={(total) => {
          if (containerRef.current && onLoaded) {
            onLoaded(total, containerRef.current);
          }
        }}
      />
    </div>
  );
};
