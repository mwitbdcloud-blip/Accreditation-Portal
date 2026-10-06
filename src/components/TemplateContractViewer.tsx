import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Position } from '../types';
import { ContractData } from './ContractDocument';
import {
  generateContractDocx,
  getDefaultTemplateUrlForPosition,
  getDefaultTemplateFileName,
} from '../utils/contractGenerator';
import { renderDocxToContainer } from '../utils/templateDocumentEngine';

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
  templateSource,
  contractData,
  position,
  viewMode,
  currentPageIndex,
  zoomScale,
  onLoaded,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>('Loading uploaded template...');
  const [error, setError] = useState<string | null>(null);
  const [renderedPagesCount, setRenderedPagesCount] = useState<number>(0);

  const activeTemplateName = getDefaultTemplateFileName(position);

  useEffect(() => {
    let isCancelled = false;

    const loadAndRender = async () => {
      if (!containerRef.current) return;
      setIsLoading(true);
      setError(null);

      try {
        setLoadingStep(`Accessing official ${position} template...`);
        const source = templateSource || getDefaultTemplateUrlForPosition(position);

        setLoadingStep(`Transferring ${contractData.fullName}'s submitted data into template tags...`);
        // Generate filled docx using exact uploaded template
        const filledResult = await generateContractDocx(source, contractData, position);

        if (isCancelled) return;

        setLoadingStep('Rendering exact template pages and layout...');
        const total = await renderDocxToContainer(filledResult.blob, containerRef.current);

        if (isCancelled) return;

        setRenderedPagesCount(total);
        setIsLoading(false);

        if (onLoaded && containerRef.current) {
          onLoaded(total, containerRef.current);
        }
      } catch (err: any) {
        console.error('Failed to render template contract:', err);
        if (!isCancelled) {
          setError(err.message || 'Failed to parse and render uploaded contract template.');
          setIsLoading(false);
          if (onError) onError(err);
        }
      }
    };

    loadAndRender();

    return () => {
      isCancelled = true;
    };
  }, [templateSource, position, contractData.affiliateCode, contractData.fullName, contractData.startDate]);

  // Adjust pagination visibility whenever viewMode or currentPageIndex changes
  useEffect(() => {
    if (!containerRef.current || isLoading) return;

    const sections = containerRef.current.querySelectorAll<HTMLElement>('.docx-wrapper > section.docx, section.docx');
    if (!sections.length) return;

    sections.forEach((sec, idx) => {
      // Add custom page number indicator if not present
      let badge = sec.querySelector('.template-page-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'template-page-badge';
        badge.setAttribute(
          'style',
          'position: absolute; right: 24px; top: 18px; font-size: 10px; font-weight: bold; font-family: ui-monospace, monospace; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 9999px; border: 1px solid #cbd5e1; user-select: none; z-index: 10;'
        );
        badge.textContent = `Page ${idx + 1} of ${sections.length}`;
        sec.style.position = 'relative';
        sec.appendChild(badge);
      }

      if (viewMode === 'paginated') {
        sec.style.display = idx === currentPageIndex ? 'block' : 'none';
      } else {
        sec.style.display = 'block';
      }
    });
  }, [viewMode, currentPageIndex, isLoading, renderedPagesCount]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="w-full max-w-xl my-12 p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-center space-y-4 text-white">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white">
              Generating Official {position} SAA Contract
            </h4>
            <p className="text-xs text-slate-400 mt-1">{loadingStep}</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-left text-xs space-y-1 text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Source of Truth Integration
            </div>
            <p className="text-[11px] text-slate-400">
              Preserving 100% of formatting, clauses, layout, signatures, and page order from the uploaded{' '}
              <span className="font-mono text-amber-300">{activeTemplateName}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && !isLoading && (
        <div className="w-full max-w-lg my-8 p-6 bg-red-950/80 border border-red-800 rounded-2xl text-red-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" /> Template Contract Rendering Notice
          </div>
          <p>{error}</p>
          <p className="text-[11px] text-red-400">
            Please ensure the uploaded template for {position} is a valid Microsoft Word (.docx) file.
          </p>
        </div>
      )}

      {/* Rendered Document Container */}
      <div
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: 'top center',
          display: isLoading ? 'none' : 'block',
        }}
        className="template-contract-wrapper w-full max-w-4xl transition-transform duration-150"
      >
        <div
          ref={containerRef}
          className="docx-viewer-root space-y-6 [&_.docx-wrapper]:bg-transparent [&_.docx-wrapper]:p-0 [&_section.docx]:bg-white [&_section.docx]:shadow-xl [&_section.docx]:border [&_section.docx]:border-slate-300 [&_section.docx]:rounded-lg [&_section.docx]:mx-auto [&_section.docx]:my-4"
        />
      </div>
    </div>
  );
};
