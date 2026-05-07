'use client';

import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { type PlotConfig } from './powerbi-engine';

interface PDFReportGeneratorProps {
  analytics: any;
  plots: PlotConfig[];
  filters: any;
}

export function PDFReportGenerator({ analytics, plots, filters }: PDFReportGeneratorProps) {
  
  const generatePDF = async () => {
    const id = toast.loading('Generating High-Fidelity PDF Report...');
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = 20;

      // 1. Cover Page / Header
      doc.setFillColor(139, 92, 246); // Violet 500
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Productivity & AI Analytics Report', margin, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, 34);

      currentY = 55;

      // 2. Executive Summary
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', margin, currentY);
      currentY += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const scopeText = Object.entries(filters)
        .filter(([_, v]) => v && v !== 'all')
        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
        .join(' | ') || 'Scope: Global (All Organizations)';
      
      doc.text(scopeText, margin, currentY);
      currentY += 15;

      // KPI Grid
      const kpis = [
        { label: 'Avg Done to Said', value: `${Number((analytics?.kpi?.avgDoneToSaid || 0) > 1 ? analytics?.kpi?.avgDoneToSaid : (analytics?.kpi?.avgDoneToSaid || 0) * 100).toFixed(1)}%` },
        { label: 'Tech Debt Index', value: Number(analytics?.kpi?.avgTechDebt || 0).toFixed(2) },
        { label: 'Total Projects', value: analytics?.kpi?.totalProjectCount || analytics?.kpi?.projectCount || 0 },
        { label: 'Avg Throughput', value: `${Number(analytics?.kpi?.avgThroughput || 0).toFixed(1)} Pts` }
      ];

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      
      let kpiX = margin;
      kpis.forEach((kpi) => {
        // Reset colors for each card to prevent state carry-over issues
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(kpiX, currentY, (pageWidth - 2 * margin - 15) / 4, 25, 3, 3, 'FD');
        
        doc.setTextColor(139, 92, 246); // Violet for the value
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(String(kpi.value), kpiX + 5, currentY + 12);
        
        doc.setTextColor(71, 85, 105); // Slate for the label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(kpi.label, kpiX + 5, currentY + 20);
        
        kpiX += (pageWidth - 2 * margin - 15) / 4 + 5;
      });

      currentY += 40;

      // 3. Automated Insights
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Metric Insights', margin, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const insights = [
        `• The technical debt index is at ${analytics?.kpi?.avgTechDebt || 0}, showing ${Number(analytics?.kpi?.avgTechDebt) < 15 ? 'excellent' : 'manageable'} code health.`,
        `• Delivery reliability is at ${Number((analytics?.kpi?.avgDoneToSaid || 0) > 1 ? analytics?.kpi?.avgDoneToSaid : (analytics?.kpi?.avgDoneToSaid || 0) * 100).toFixed(1)}%, indicating ${Number(analytics?.kpi?.avgDoneToSaid) > 0.8 ? 'high' : 'stable'} predictability.`,
        `• This scope covers ${analytics?.kpi?.projectCount || 0} active projects and ${analytics?.kpi?.aiProjectCount || 0} AI-enabled initiatives.`,
        `• Resource productivity averages ${Number(analytics?.kpi?.avgVelocity || 0).toFixed(1)} velocity points per sprint.`
      ];

      insights.forEach(insight => {
        const lines = doc.splitTextToSize(insight, pageWidth - 2 * margin);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 5 + 2;
      });

      currentY += 10;

      // 4. Visual Charts
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Visual Analytics', margin, currentY);
      currentY += 10;

      for (let i = 0; i < plots.length; i++) {
        const plot = plots[i];
        const element = document.getElementById(`plot-card-${plot.id}`);
        
        if (element) {
          try {
            // High-fidelity capture with increased pixel ratio and style cleanup
            const imgData = await toPng(element, { 
              quality: 1,
              pixelRatio: 3, // 3x sharpest quality
              backgroundColor: '#ffffff',
              style: {
                transform: 'scale(1)',
                transformOrigin: 'top left',
                backdropFilter: 'none', // Fixes "blank/dark square" issues
                filter: 'none',
                backgroundColor: 'white'
              },
              filter: (node) => {
                // Skip capturing the edit buttons/overlays
                const el = node as HTMLElement;
                if (el.classList?.contains('z-20')) return false;
                return true;
              }
            });
            
            const imgProps = doc.getImageProperties(imgData);
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            if (currentY + imgHeight > pageHeight - margin) {
              doc.addPage();
              currentY = margin;
            }

            doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight, undefined, 'FAST');
            currentY += imgHeight + 15;
          } catch (err) {
            console.error(`Error capturing plot ${plot.title}:`, err);
          }
        }
      }

      // 5. Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`CTO Platform AI Analytics - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save(`Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF Report downloaded!', { id });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to generate PDF report.', { id });
    }
  };

  useEffect(() => {
    (window as any).generatePDFReport = generatePDF;
    return () => { delete (window as any).generatePDFReport; };
  }, [analytics, plots, filters]);

  return null;
}
