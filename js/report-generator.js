// Report generation and export functionality
class ReportGenerator {
    static generateJSON(analysisData) {
        return JSON.stringify(analysisData, null, 2);
    }

    static generateHTML(analysisData) {
        const { fileInfo, hashes, clientAnalysis, backendAnalysis } = analysisData;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Malware Analysis Report - ${fileInfo.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 2rem;
            background: #f5f5f5;
            color: #333;
        }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #6366f1; margin-bottom: 1rem; border-bottom: 3px solid #6366f1; padding-bottom: 0.5rem; }
        h2 { color: #4f46e5; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        h3 { color: #6b7280; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .info-grid { display: grid; grid-template-columns: 200px 1fr; gap: 0.5rem; margin-bottom: 1rem; }
        .info-label { font-weight: 600; color: #6b7280; }
        .info-value { font-family: 'Courier New', monospace; color: #111827; word-break: break-all; }
        .threat-badge { 
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-weight: 600;
            margin: 1rem 0;
        }
        .threat-low { background: #d1fae5; color: #065f46; }
        .threat-medium { background: #fed7aa; color: #92400e; }
        .threat-high { background: #fee2e2; color: #991b1b; }
        ul { margin-left: 1.5rem; margin-bottom: 1rem; }
        li { margin-bottom: 0.5rem; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; color: #6b7280; }
        .footer { margin-top: 3rem; padding-top: 1rem; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 0.875rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Malware Analysis Report</h1>
        <p style="color: #6b7280; margin-bottom: 2rem;">Generated on ${new Date().toLocaleString()}</p>

        <h2>📄 File Information</h2>
        <div class="info-grid">
            <div class="info-label">File Name:</div>
            <div class="info-value">${fileInfo.name}</div>
            <div class="info-label">File Size:</div>
            <div class="info-value">${this.formatBytes(fileInfo.size)}</div>
            <div class="info-label">File Type:</div>
            <div class="info-value">${fileInfo.type || 'Unknown'}</div>
        </div>

        <h2>🔐 Hashes</h2>
        <div class="info-grid">
            <div class="info-label">SHA256:</div>
            <div class="info-value">${hashes.sha256}</div>
            <div class="info-label">SHA1:</div>
            <div class="info-value">${hashes.sha1}</div>
            <div class="info-label">MD5:</div>
            <div class="info-value">${hashes.md5}</div>
        </div>

        ${backendAnalysis?.ai ? `
        <h2>🤖 AI Assessment</h2>
        <div class="threat-badge threat-${backendAnalysis.ai.threatLevel}">
            Threat Level: ${backendAnalysis.ai.threatLevel.toUpperCase()}
        </div>
        <p><strong>Confidence:</strong> ${backendAnalysis.ai.confidence}%</p>
        <p style="margin: 1rem 0;">${backendAnalysis.ai.summary}</p>
        
        <h3>Detected Behaviors:</h3>
        <ul>
            ${backendAnalysis.ai.behaviors.map(b => `<li>${b}</li>`).join('')}
        </ul>

        <h3>Recommendations:</h3>
        <ul>
            ${backendAnalysis.ai.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
        ` : ''}

        ${clientAnalysis?.entropy ? `
        <h2>📊 Entropy Analysis</h2>
        <div class="info-grid">
            <div class="info-label">Overall Entropy:</div>
            <div class="info-value">${clientAnalysis.entropy.overall.toFixed(2)}</div>
            <div class="info-label">Packing Detected:</div>
            <div class="info-value">${clientAnalysis.entropy.isPacked ? 'Yes' : 'No'}</div>
            <div class="info-label">Confidence:</div>
            <div class="info-value">${clientAnalysis.entropy.packingConfidence}%</div>
        </div>
        ` : ''}

        ${clientAnalysis?.strings ? `
        <h2>📝 String Analysis</h2>
        <div class="info-grid">
            <div class="info-label">Total ASCII Strings:</div>
            <div class="info-value">${clientAnalysis.strings.totalAscii}</div>
            <div class="info-label">Total Unicode Strings:</div>
            <div class="info-value">${clientAnalysis.strings.totalUnicode}</div>
            <div class="info-label">Suspicious Strings:</div>
            <div class="info-value">${clientAnalysis.strings.totalSuspicious}</div>
        </div>
        ` : ''}

        ${backendAnalysis?.yara?.matches?.length > 0 ? `
        <h2>🎯 YARA Matches</h2>
        ${backendAnalysis.yara.matches.map(match => `
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; margin: 1rem 0; border-radius: 4px;">
                <h3 style="color: #dc2626; margin-top: 0;">${match.rule}</h3>
                <p>${match.description}</p>
                <p style="margin-top: 0.5rem;"><strong>Tags:</strong> ${match.tags.join(', ')}</p>
            </div>
        `).join('')}
        ` : ''}

        <div class="footer">
            <p>⚠️ This report is for informational purposes only. Always exercise caution with unknown files.</p>
            <p style="margin-top: 0.5rem;">Generated by Malware Analysis Tool - Privacy-First, AI-Powered</p>
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    static async generatePDF(analysisData) {
        // For PDF generation, we'll use jsPDF
        // This is a placeholder - you'll need to include jsPDF library

        // For now, we'll create a simple text-based PDF alternative
        const text = this.generateTextReport(analysisData);
        return text;
    }

    static generateTextReport(analysisData) {
        const { fileInfo, hashes, clientAnalysis, backendAnalysis } = analysisData;

        let report = '';
        report += '═══════════════════════════════════════════════════════\n';
        report += '           MALWARE ANALYSIS REPORT\n';
        report += '═══════════════════════════════════════════════════════\n\n';
        report += `Generated: ${new Date().toLocaleString()}\n\n`;

        report += '─────────────────────────────────────────────────────────\n';
        report += 'FILE INFORMATION\n';
        report += '─────────────────────────────────────────────────────────\n';
        report += `File Name:  ${fileInfo.name}\n`;
        report += `File Size:  ${this.formatBytes(fileInfo.size)}\n`;
        report += `File Type:  ${fileInfo.type || 'Unknown'}\n\n`;

        report += '─────────────────────────────────────────────────────────\n';
        report += 'HASHES\n';
        report += '─────────────────────────────────────────────────────────\n';
        report += `SHA256: ${hashes.sha256}\n`;
        report += `SHA1:   ${hashes.sha1}\n`;
        report += `MD5:    ${hashes.md5}\n\n`;

        if (backendAnalysis?.ai) {
            report += '─────────────────────────────────────────────────────────\n';
            report += 'AI ASSESSMENT\n';
            report += '─────────────────────────────────────────────────────────\n';
            report += `Threat Level: ${backendAnalysis.ai.threatLevel.toUpperCase()}\n`;
            report += `Confidence:   ${backendAnalysis.ai.confidence}%\n\n`;
            report += `Summary:\n${backendAnalysis.ai.summary}\n\n`;

            if (backendAnalysis.ai.behaviors.length > 0) {
                report += 'Detected Behaviors:\n';
                backendAnalysis.ai.behaviors.forEach(b => {
                    report += `  • ${b}\n`;
                });
                report += '\n';
            }
        }

        return report;
    }

    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

window.ReportGenerator = ReportGenerator;
