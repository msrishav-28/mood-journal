/**
 * Export Service — PDF, CSV, and Text download
 */
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export entries as a styled PDF document.
 */
export const exportPDF = (entries, userName = 'User') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(43, 45, 47); // --color-text-main
  doc.text('Sentia', 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // --color-text-muted
  doc.text(`Journal export for ${userName}`, 20, 33);
  doc.text(`Generated ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })}`, 20, 39);
  doc.text(`${entries.length} entries`, 20, 45);

  // Divider
  doc.setDrawColor(229, 228, 221);
  doc.line(20, 50, 190, 50);

  let y = 60;

  entries.forEach((entry, idx) => {
    // Check page break
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    // Date header
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(date, 20, y);
    y += 5;

    // Tags
    if (entry.tags?.length) {
      doc.setFontSize(8);
      doc.setTextColor(138, 154, 134); // accent
      doc.text(entry.tags.join(' · '), 20, y);
      y += 6;
    }

    // Transcript
    doc.setFontSize(11);
    doc.setTextColor(43, 45, 47);
    const lines = doc.splitTextToSize(entry.transcript || '', 165);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 3;

    // AI Insight
    if (entry.aiInsight) {
      doc.setFontSize(9);
      doc.setTextColor(138, 154, 134);
      doc.text('Sentia reflects:', 20, y);
      y += 5;
      doc.setTextColor(75, 85, 99);
      const insightLines = doc.splitTextToSize(entry.aiInsight, 160);
      doc.text(insightLines, 22, y);
      y += insightLines.length * 4 + 4;
    }

    // Separator
    if (idx < entries.length - 1) {
      doc.setDrawColor(229, 228, 221);
      doc.line(20, y, 190, y);
      y += 10;
    }
  });

  doc.save(`sentia-journal-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export entries as CSV — great for importing into spreadsheets or LLMs.
 */
export const exportCSV = (entries) => {
  const headers = ['Date', 'Duration (sec)', 'Tags', 'Dominant Emotion', 'Transcript', 'AI Insight'];
  
  const rows = entries.map(e => [
    new Date(e.createdAt).toISOString(),
    e.durationSeconds || '',
    (e.tags || []).join('; '),
    e.dominantEmotion || '',
    `"${(e.transcript || '').replace(/"/g, '""')}"`,
    `"${(e.aiInsight || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sentia-journal-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export entries as plain text — ideal for pasting into ChatGPT, Claude, etc.
 */
export const exportText = (entries, userName = 'User') => {
  let text = `SENTIA JOURNAL EXPORT\n`;
  text += `User: ${userName}\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  text += `Entries: ${entries.length}\n`;
  text += `${'='.repeat(60)}\n\n`;

  entries.forEach((entry, idx) => {
    const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    text += `--- Entry ${idx + 1} ---\n`;
    text += `Date: ${date}\n`;
    if (entry.tags?.length) text += `Mood: ${entry.tags.join(', ')}\n`;
    text += `\n${entry.transcript || ''}\n`;
    if (entry.aiInsight) {
      text += `\n[Sentia reflects]\n${entry.aiInsight}\n`;
    }
    text += '\n';
  });

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sentia-journal-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export default { exportPDF, exportCSV, exportText };
