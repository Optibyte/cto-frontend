'use client';

import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { type PlotConfig, pivotData } from './powerbi-engine';

interface StarterChartEntry {
  id: string;
  title: string;
  subtitle: string;
}

interface PDFReportGeneratorProps {
  analytics: any;
  plots: PlotConfig[];
  filters: any;
  rawData?: any[];
  starterChartIds?: StarterChartEntry[];
  activeTab?: string;
}

interface TabReportConfig {
  title: string;
  subtitle: string;
  elements: Array<{
    id: string;
    title: string;
    subtitle: string;
    isKpi?: boolean;
  }>;
}

const TAB_REPORT_CONFIGS: Record<string, TabReportConfig> = {
  'ai-governance': {
    title: 'AI Governance Hub Report',
    subtitle: 'Governance status, compliance gates, and organizational AI maturity',
    elements: [
      { id: 'ai-governance-hub', title: 'Governance Status & Maturity', subtitle: 'Status details, wave rollouts, and compliance scores' }
    ]
  },
  'adoption-details': {
    title: 'Adoption & Fluency Telemetry Report',
    subtitle: 'Date-wise statistics on active developers, certifications, and tool adoption',
    elements: [
      { id: 'adoption-kpi-cards', title: 'Key Performance Indicators', subtitle: 'Summary of active developers, certifications, and tool adoption rate', isKpi: true },
      { id: 'adoption-chart-trend', title: 'Adoption & Certification Trend', subtitle: 'Date-wise adoption rate and certification rate trend' },
      { id: 'adoption-chart-growth', title: 'Active Developer Growth', subtitle: 'Active developer user growth trend' }
    ]
  },
  'assets-details': {
    title: 'Assets & Reuse Telemetry Report',
    subtitle: 'Date-wise statistics on shared library components, prompts, and template reuse',
    elements: [
      { id: 'assets-kpi-cards', title: 'Key Performance Indicators', subtitle: 'Summary of reuse rates, prompt runs, and template usage', isKpi: true },
      { id: 'assets-chart-volume', title: 'Prompt Reuse Volume', subtitle: 'Total prompt runs executed over the period' },
      { id: 'assets-chart-rate', title: 'Reuse & Template Rate', subtitle: 'Code reuse and template usage rate trend' }
    ]
  },
  'tokens-details': {
    title: 'Tokens & Cost Telemetry Report',
    subtitle: 'Date-wise statistics on LLM spend, token volumes, and cache hit efficiency',
    elements: [
      { id: 'tokens-kpi-cards', title: 'Key Performance Indicators', subtitle: 'Summary of LLM spend, token volumes, and cache hit ratio', isKpi: true },
      { id: 'tokens-chart-spend', title: 'LLM Spend & Token Volume', subtitle: 'API cost and token consumption trend' },
      { id: 'tokens-chart-cache', title: 'Cache Hit Efficiency', subtitle: 'Cache hit efficiency trend over the period' }
    ]
  },
  'agent-details': {
    title: 'Agent Performance Telemetry Report',
    subtitle: 'AI evaluation pass rates, human-in-the-loop validation, and hallucination rates',
    elements: [
      { id: 'agent-kpi-cards', title: 'Key Performance Indicators', subtitle: 'Summary of eval pass rate, HITL acceptance, and hallucination rate', isKpi: true },
      { id: 'agent-chart-trend', title: 'Validation & Performance Trend', subtitle: 'Evaluation pass rate and HITL acceptance trend' },
      { id: 'agent-chart-hallucination', title: 'Hallucination Rate', subtitle: 'Factual inconsistency rate trend' }
    ]
  },
  'delivery-view': {
    title: 'Delivery View Report',
    subtitle: 'Delivery throughput points, cycle time, quality, and commitment reliability',
    elements: [
      { id: 'delivery-kpi-cards', title: 'Key Performance Indicators', subtitle: 'Summary of velocity, defect density, done-to-said, and quality', isKpi: true },
      { id: 'delivery-chart-velocity', title: 'Flow & Predictability Trend (SPC)', subtitle: 'Statistical Process Control limits for Delivery Velocity' },
      { id: 'delivery-chart-quality', title: 'Quality & Defect Density (SPC)', subtitle: 'Defect density with UCL/LCL control limits vs Quality rating' },
      { id: 'delivery-chart-pod', title: 'AI Adoption & Maturity by Pod', subtitle: 'Maturity rating and wave rollout comparison across functional pods' }
    ]
  },
  'executive-view': {
    title: 'Executive View Report',
    subtitle: 'Financial savings, return on investment, maturity, and compliance risk index',
    elements: [
      { id: 'executive-kpi-cards', title: 'Key Performance Indicators', subtitle: 'Summary of total savings, ROI, maturity, and compliance risk', isKpi: true },
      { id: 'executive-chart-roi', title: 'FTE Savings & Transformation ROI (SPC)', subtitle: 'Accumulated savings vs ROI with statistical process limits' },
      { id: 'executive-chart-maturity', title: '4M Capability Maturity (SPC)', subtitle: 'Maturity rating across Methods, Metrics, Mindset, Mastery' },
      { id: 'executive-chart-risk', title: 'Transformation Risk & Readiness Score Card', subtitle: 'Systemic risk index and readiness gate trend' }
    ]
  },
  'ai-monitor': {
    title: 'Transformation Comparison Report',
    subtitle: 'Comparing traditional vs AI-enabled progress across team sprints',
    elements: [
      { id: 'plot-card-ai-1', title: 'Velocity Comparison', subtitle: 'Average velocity comparison across phases' },
      { id: 'plot-card-ai-2', title: 'Throughput Comparison', subtitle: 'Average throughput comparison across phases' },
      { id: 'plot-card-ai-3', title: 'Quality Comparison', subtitle: 'Quality score comparison across phases' },
      { id: 'plot-card-ai-4', title: 'Done-to-Said Comparison', subtitle: 'Done-to-said ratio comparison across phases' },
      { id: 'plot-card-ai-5', title: 'Tech Debt Comparison', subtitle: 'Tech debt index comparison across phases' }
    ]
  }
};

// ─── Capture the LIVE element — no cloning ────────────────────────────────────
// We temporarily override the element's size in-place so Recharts
// reflows to full width, capture, then instantly restore everything.
async function captureLiveChart(element: HTMLElement): Promise<string | null> {
  // 1. Save every ancestor's overflow so nothing clips the element during capture
  const ancestors: Array<{ el: HTMLElement; overflow: string; maxWidth: string }> = [];
  let node = element.parentElement;
  while (node && node !== document.body) {
    ancestors.push({ el: node, overflow: node.style.overflow, maxWidth: node.style.maxWidth });
    node.style.overflow = 'visible';
    node.style.maxWidth = 'none';
    node = node.parentElement;
  }

  // 2. Force the card itself to a wide, unconstrained size
  const saved = {
    width: element.style.width,
    minWidth: element.style.minWidth,
    maxWidth: element.style.maxWidth,
    height: element.style.height,
    overflow: element.style.overflow,
    position: element.style.position,
  };

  element.style.width = '1400px';
  element.style.minWidth = '1400px';
  element.style.maxWidth = 'none';
  element.style.overflow = 'visible';
  element.style.position = 'relative';

  // 3. Force every ResponsiveContainer inside to match
  const containers = element.querySelectorAll<HTMLElement>('.recharts-responsive-container');
  const savedContainerWidths: string[] = [];
  containers.forEach(c => {
    savedContainerWidths.push(c.style.width);
    c.style.width = '1360px';
  });

  // 4. Wait for Recharts ResizeObserver to fire and repaint
  await new Promise(r => setTimeout(r, 300));

  // 5. Capture
  let imgData: string | null = null;
  try {
    imgData = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: 1400,
      height: element.scrollHeight,
      style: {
        backdropFilter: 'none',
        filter: 'none',
        backgroundColor: '#ffffff',
      },
      filter: (node) => {
        const el = node as HTMLElement;
        if (el.dataset?.pdfSkip) return false;
        // skip floating buttons / overlays but keep chart content
        if (el.tagName === 'BUTTON' && el.closest('[data-chart-overlay]')) return false;
        return true;
      },
    });
  } catch (e) {
    console.error('toPng failed:', e);
  }

  // 6. Restore everything exactly as it was
  element.style.width = saved.width;
  element.style.minWidth = saved.minWidth;
  element.style.maxWidth = saved.maxWidth;
  element.style.height = saved.height;
  element.style.overflow = saved.overflow;
  element.style.position = saved.position;

  containers.forEach((c, i) => { c.style.width = savedContainerWidths[i]; });

  ancestors.forEach(({ el, overflow, maxWidth }) => {
    el.style.overflow = overflow;
    el.style.maxWidth = maxWidth;
  });

  return imgData;
}

export function PDFReportGenerator({ analytics, plots, filters, rawData, starterChartIds = [], activeTab = 'consolidated' }: PDFReportGeneratorProps) {

  const generatePDF = async () => {
    const toastId = toast.loading('Preparing PDF...');

    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();   // 297 mm
      const pageHeight = doc.internal.pageSize.getHeight();  // 210 mm
      const margin = 14;
      const contentW = pageWidth - margin * 2;
      let currentY = 0;

      // ── Helpers ────────────────────────────────────────────────────────
      const newPageIfNeeded = (h: number) => {
        if (currentY + h > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
      };

      const drawSectionTitle = (text: string) => {
        newPageIfNeeded(14);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(text, margin, currentY);
        doc.setDrawColor(139, 92, 246);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY + 1.5, margin + doc.getTextWidth(text), currentY + 1.5);
        currentY += 9;
      };

      // ── HEADER ─────────────────────────────────────────────────────────
      doc.setFillColor(109, 40, 217);
      doc.rect(0, 0, pageWidth, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');

      const config = activeTab !== 'consolidated' ? TAB_REPORT_CONFIGS[activeTab] : null;
      const reportTitle = config ? config.title : 'Productivity & AI Analytics Report';
      doc.text(reportTitle, margin, 10);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        margin, 19
      );

      const scopeText =
        Object.entries(filters)
          .filter(([k, v]) => v && v !== 'all' && k !== 'activeTab')
          .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
          .join('  |  ') || 'Scope: Global (All Organisations)';

      doc.setFillColor(245, 243, 255);
      doc.setDrawColor(196, 181, 253);
      doc.setLineWidth(0.25);
      doc.roundedRect(margin, 27, contentW, 7.5, 1.5, 1.5, 'FD');
      doc.setTextColor(109, 40, 217);
      doc.setFontSize(7);
      doc.text(scopeText, margin + 3, 32);

      currentY = 41;

      if (activeTab === 'consolidated') {
        // ── KPI CARDS ──────────────────────────────────────────────────────
        drawSectionTitle('Executive Summary');

        const kpis = [
          {
            label: 'Done-to-Said',
            value: `${Number(
              (analytics?.kpi?.avgDoneToSaid || 0) > 1
                ? analytics?.kpi?.avgDoneToSaid
                : (analytics?.kpi?.avgDoneToSaid || 0) * 100
            ).toFixed(1)}%`,
            sub: 'Delivery reliability',
          },
          {
            label: 'Tech Debt Index',
            value: Number(analytics?.kpi?.avgTechDebt || 0).toFixed(2),
            sub: 'Code health score',
          },
          {
            label: 'Active Projects',
            value: String(analytics?.kpi?.totalProjectCount ?? analytics?.kpi?.projectCount ?? 0),
            sub: 'Total in scope',
          },
          {
            label: 'Avg Throughput',
            value: `${Number(analytics?.kpi?.avgThroughput || 0).toFixed(1)} Pts`,
            sub: 'Per sprint',
          },
          {
            label: 'Avg Velocity',
            value: `${Number(analytics?.kpi?.avgVelocity || 0).toFixed(1)} Pts`,
            sub: 'Per sprint',
          },
        ];

        const cardW = (contentW - (kpis.length - 1) * 3) / kpis.length;
        const cardH = 19;
        let cardX = margin;

        kpis.forEach(kpi => {
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.25);
          doc.roundedRect(cardX, currentY, cardW, cardH, 2, 2, 'FD');
          doc.setFillColor(139, 92, 246);
          doc.rect(cardX, currentY, 2.5, cardH, 'F');

          doc.setTextColor(109, 40, 217);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(kpi.value, cardX + 5, currentY + 8.5);

          doc.setTextColor(30, 41, 59);
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.text(kpi.label, cardX + 5, currentY + 13.5);

          doc.setTextColor(100, 116, 139);
          doc.setFontSize(5.5);
          doc.setFont('helvetica', 'normal');
          doc.text(kpi.sub, cardX + 5, currentY + 17);

          cardX += cardW + 3;
        });

        currentY += cardH + 7;

        // ── INSIGHTS ───────────────────────────────────────────────────────
        drawSectionTitle('Metric Insights');

        const dts = Number(
          (analytics?.kpi?.avgDoneToSaid || 0) > 1
            ? analytics?.kpi?.avgDoneToSaid
            : (analytics?.kpi?.avgDoneToSaid || 0) * 100
        );

        const insights = [
          `Technical Debt Index is ${analytics?.kpi?.avgTechDebt || 0}, showing ${Number(analytics?.kpi?.avgTechDebt) < 15 ? 'excellent' : 'manageable'} code health.`,
          `Delivery reliability is ${dts.toFixed(1)}%, reflecting ${dts > 80 ? 'high' : 'moderate'} sprint predictability.`,
          `Scope covers ${analytics?.kpi?.projectCount || 0} active projects and ${analytics?.kpi?.aiProjectCount || 0} AI-enabled initiatives.`,
          `Resource productivity averages ${Number(analytics?.kpi?.avgVelocity || 0).toFixed(1)} velocity points per sprint.`,
        ];

        const insightH = insights.length * 6 + 5;
        doc.setFillColor(250, 245, 255);
        doc.setDrawColor(216, 180, 254);
        doc.setLineWidth(0.25);
        doc.roundedRect(margin, currentY, contentW, insightH, 2, 2, 'FD');

        currentY += 4.5;
        insights.forEach(insight => {
          doc.setFillColor(139, 92, 246);
          doc.circle(margin + 3.5, currentY - 0.8, 0.8, 'F');
          doc.setTextColor(30, 41, 59);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(insight, contentW - 10);
          doc.text(lines, margin + 7, currentY);
          currentY += lines.length * 4.5 + 1.5;
        });
        currentY += 5;

        // ── AI ALERTS ──────────────────────────────────────────────────────
        const aiPlots = plots.filter(p => p.legend === 'aiBaseline' && p.dataSource !== 'manual_metrics');
        const aiEvents: string[] = [];

        aiPlots.forEach(plot => {
          const data = pivotData(rawData || [], plot);
          if (!data.length) return;
          const latest = data[data.length - 1];
          const aiVal = latest['AI-Enabled'];
          const baseVal = latest['Traditional'];
          if (aiVal === undefined || baseVal === undefined) return;
          const metric = plot.metrics[0]?.key;
          const worse = metric === 'technicalDebtIndex' ? aiVal > baseVal : aiVal < baseVal;
          if (worse)
            aiEvents.push(
              `AI-Enabled ${plot.metrics[0].key} (${Number(aiVal).toFixed(2)}) is below Traditional baseline (${Number(baseVal).toFixed(2)}).`
            );
        });

        if (aiEvents.length > 0) {
          drawSectionTitle('⚠  AI Monitor Alerts');
          const alertH = aiEvents.length * 6 + 5;
          doc.setFillColor(254, 242, 242);
          doc.setDrawColor(252, 165, 165);
          doc.setLineWidth(0.25);
          doc.roundedRect(margin, currentY, contentW, alertH, 2, 2, 'FD');
          currentY += 4.5;
          aiEvents.forEach(ev => {
            doc.setFillColor(220, 38, 38);
            doc.circle(margin + 3.5, currentY - 0.8, 0.8, 'F');
            doc.setTextColor(185, 28, 28);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(ev, contentW - 10);
            doc.text(lines, margin + 7, currentY);
            currentY += lines.length * 4.5 + 1.5;
          });
          currentY += 5;
        }

        // ── STARTER CHARTS (Consolidated Dashboard) ──────────────────────
        if (starterChartIds.length > 0) {
          drawSectionTitle('Consolidated Starter Dashboard');

          for (let i = 0; i < starterChartIds.length; i++) {
            const entry = starterChartIds[i];
            const element = document.getElementById(entry.id);
            if (!element) {
              console.warn(`Starter chart element not found: ${entry.id}`);
              continue;
            }

            toast.loading(`Capturing starter chart ${i + 1} of ${starterChartIds.length}...`, { id: toastId });

            const imgData = await captureLiveChart(element);
            if (!imgData) continue;

            // New page for each starter chart
            doc.addPage();
            currentY = margin;

            // Violet title strip
            doc.setFillColor(245, 243, 255);
            doc.setDrawColor(196, 181, 253);
            doc.setLineWidth(0.25);
            doc.roundedRect(margin, currentY, contentW, 13, 2, 2, 'FD');
            doc.setFillColor(139, 92, 246);
            doc.rect(margin, currentY, 3, 13, 'F');
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(entry.title, margin + 6, currentY + 8);
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text(entry.subtitle, margin + 6, currentY + 12);
            currentY += 16;

            // Scale and embed image
            const imgProps = doc.getImageProperties(imgData);
            const availH = pageHeight - currentY - margin;
            const imgWidth = contentW;
            const imgHeight = Math.min(availH, Math.round((imgProps.height * imgWidth) / imgProps.width));

            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.25);
            doc.roundedRect(margin, currentY, contentW, imgHeight, 2, 2, 'S');
            doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight, undefined, 'FAST');
            currentY += imgHeight + 5;
          }
        }

        // ── CHARTS — one per page ──────────────────────────────────────────
        for (let i = 0; i < plots.length; i++) {
          const plot = plots[i];
          const element = document.getElementById(`plot-card-${plot.id}`);
          if (!element) {
            console.warn(`Element not found: plot-card-${plot.id}`);
            continue;
          }

          toast.loading(`Capturing chart ${i + 1} of ${plots.length}...`, { id: toastId });

          const imgData = await captureLiveChart(element);
          if (!imgData) continue;

          // New page for each chart
          doc.addPage();
          currentY = margin;

          // Chart title strip
          doc.setFillColor(245, 243, 255);
          doc.setDrawColor(196, 181, 253);
          doc.setLineWidth(0.25);
          doc.roundedRect(margin, currentY, contentW, 10, 2, 2, 'FD');
          doc.setFillColor(139, 92, 246);
          doc.rect(margin, currentY, 3, 10, 'F');
          doc.setTextColor(30, 41, 59);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(plot.title || `Chart ${i + 1}`, margin + 6, currentY + 7);
          currentY += 13;

          // Scale image to fill available page area
          const imgProps = doc.getImageProperties(imgData);
          const availH = pageHeight - currentY - margin;
          const imgWidth = contentW;
          const imgHeight = Math.min(availH, Math.round((imgProps.height * imgWidth) / imgProps.width));

          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.25);
          doc.roundedRect(margin, currentY, contentW, imgHeight, 2, 2, 'S');
          doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight, undefined, 'FAST');
          currentY += imgHeight + 5;
        }
      } else {
        // ── TAB-SPECIFIC REPORT ────────────────────────────────────────────
        if (config) {
          // Filter out elements based on checkboxes if we are in ai-monitor tab
          const activeElements = config.elements.filter(el => {
            if (activeTab === 'ai-monitor') {
              const plotId = el.id.replace('plot-card-', '');
              return plots.some(p => p.id === plotId);
            }
            return true;
          });

          for (let i = 0; i < activeElements.length; i++) {
            const entry = activeElements[i];
            const element = document.getElementById(entry.id);
            if (!element) {
              console.warn(`Element not found: ${entry.id}`);
              continue;
            }

            toast.loading(`Capturing ${entry.title}...`, { id: toastId });

            const imgData = await captureLiveChart(element);
            if (!imgData) continue;

            const imgProps = doc.getImageProperties(imgData);
            const imgWidth = contentW;
            const imgHeight = Math.round((imgProps.height * imgWidth) / imgProps.width);

            const availHPage1 = pageHeight - currentY - margin;
            const fitsOnPage1 = i === 0 && imgHeight <= availHPage1;

            if (fitsOnPage1 || entry.isKpi) {
              drawSectionTitle(entry.title);

              const availH = pageHeight - currentY - margin;
              const finalH = Math.min(availH, imgHeight);

              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.25);
              doc.roundedRect(margin, currentY, contentW, finalH, 2, 2, 'S');
              doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, finalH, undefined, 'FAST');
              currentY += finalH + 5;
            } else {
              doc.addPage();
              currentY = margin;

              // Title strip
              doc.setFillColor(245, 243, 255);
              doc.setDrawColor(196, 181, 253);
              doc.setLineWidth(0.25);
              doc.roundedRect(margin, currentY, contentW, 13, 2, 2, 'FD');
              doc.setFillColor(139, 92, 246);
              doc.rect(margin, currentY, 3, 13, 'F');
              doc.setTextColor(30, 41, 59);
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              doc.text(entry.title, margin + 6, currentY + 8);
              doc.setTextColor(100, 116, 139);
              doc.setFontSize(7);
              doc.setFont('helvetica', 'normal');
              doc.text(entry.subtitle, margin + 6, currentY + 12);
              currentY += 16;

              const availH = pageHeight - currentY - margin;
              const finalH = Math.min(availH, imgHeight);

              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.25);
              doc.roundedRect(margin, currentY, contentW, finalH, 2, 2, 'S');
              doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, finalH, undefined, 'FAST');
              currentY += finalH + 5;
            }
          }
        }
      }

      // ── FOOTER on every page ───────────────────────────────────────────
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(245, 243, 255);
        doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(109, 40, 217);
        doc.text('SkillVector AI Analytics', margin, pageHeight - 2.5);
        doc.text(`Page ${p} of ${totalPages}`, pageWidth / 2, pageHeight - 2.5, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 2.5, { align: 'right' });
        if (p > 1) {
          doc.setDrawColor(196, 181, 253);
          doc.setLineWidth(0.2);
          doc.line(margin, margin - 1, pageWidth - margin, margin - 1);
        }
      }

      const filename = activeTab === 'consolidated'
        ? `Consolidated_Report_${new Date().toISOString().split('T')[0]}.pdf`
        : `${activeTab.replace('-details', '').replace('-view', '')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;

      doc.save(filename);
      toast.success('PDF downloaded!', { id: toastId });

    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to generate PDF.', { id: toastId });
    }
  };

  useEffect(() => {
    (window as any).generatePDFReport = generatePDF;
    return () => { delete (window as any).generatePDFReport; };
  }, [analytics, plots, filters, rawData, starterChartIds, activeTab]);

  return null;
}