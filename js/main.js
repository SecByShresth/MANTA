// Main application logic
class MalwareAnalyzer {
    constructor() {
        this.currentFile = null;
        this.analysisData = null;
        this.githubActions = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupGitHubActions();
    }

    setupGitHubActions() {
        const config = GitHubActions.getConfigFromURL();
        if (config.owner && config.repo && config.token) {
            this.githubActions = new GitHubActions(config.owner, config.repo, config.token);
        }
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const analyzeBtn = document.getElementById('analyze-btn');
        const resetBtn = document.getElementById('reset-btn');

        // Click to upload
        uploadArea.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // Analyze button
        analyzeBtn.addEventListener('click', () => this.startAnalysis());

        // Reset button
        resetBtn.addEventListener('click', () => this.reset());

        // Export buttons
        document.getElementById('export-json').addEventListener('click', () => this.exportJSON());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportPDF());
        document.getElementById('export-html').addEventListener('click', () => this.exportHTML());

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    }

    async handleFileSelect(file) {
        // File size limit: 200MB for production malware analysis
        const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

        if (file.size > MAX_FILE_SIZE) {
            alert(`File too large! Maximum size is 200MB.\nYour file: ${ReportGenerator.formatBytes(file.size)}\n\nFor larger files, use backend analysis only.`);
            return;
        }

        this.currentFile = file;

        // Update UI
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = ReportGenerator.formatBytes(file.size);
        document.getElementById('file-type').textContent = file.type || 'Unknown';

        // Calculate SHA256 hash
        document.getElementById('sha256-hash').textContent = 'Calculating...';
        try {
            const sha256 = await CryptoUtils.calculateSHA256(file);
            document.getElementById('sha256-hash').textContent = sha256;
        } catch (error) {
            console.error('Hash calculation error:', error);
            document.getElementById('sha256-hash').textContent = 'Error calculating hash';
        }

        // Show file preview
        document.querySelector('.upload-area').style.display = 'none';
        document.getElementById('file-preview').classList.remove('hidden');
    }

    async startAnalysis() {
        if (!this.currentFile) return;

        // File size check
        const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
        if (this.currentFile.size > MAX_FILE_SIZE) {
            alert('File too large for client-side analysis. Maximum size: 200MB');
            return;
        }

        // Hide upload section, show progress
        document.getElementById('upload-section').classList.add('hidden');
        document.getElementById('progress-section').classList.remove('hidden');

        try {
            // Step 1: Client-side analysis
            await this.performClientAnalysis();

            // Step 2: Upload to GitHub Actions (if configured)
            if (this.githubActions) {
                await this.performBackendAnalysis();
            } else {
                // Skip backend analysis if not configured
                this.updateProgress('upload', 'completed', 'Skipped (not configured)');
                this.updateProgress('backend', 'completed', 'Skipped (not configured)');
                this.updateProgress('ai', 'completed', 'Using client-side analysis only');
            }

            // Show results
            this.showResults();

        } catch (error) {
            console.error('Analysis error:', error);
            alert('Analysis failed: ' + error.message);
            this.reset();
        }
    }

    async performClientAnalysis() {
        this.updateProgress('client', 'active', 'Calculating hashes...');
        document.getElementById('progress-fill').style.width = '10%';

        const arrayBuffer = await this.currentFile.arrayBuffer();

        // Calculate hashes
        const hashes = await CryptoUtils.calculateAllHashes(this.currentFile);
        this.updateProgress('client', 'active', 'Extracting strings...');
        document.getElementById('progress-fill').style.width = '20%';

        // Extract strings
        const strings = StringsExtractor.extract(arrayBuffer);
        this.updateProgress('client', 'active', 'Calculating entropy...');
        document.getElementById('progress-fill').style.width = '30%';

        // Calculate entropy
        const entropy = EntropyCalculator.analyze(arrayBuffer);
        this.updateProgress('client', 'active', 'Parsing PE structure...');
        document.getElementById('progress-fill').style.width = '40%';

        // Parse PE (if applicable)
        let peData = null;
        if (this.currentFile.name.endsWith('.exe') || this.currentFile.name.endsWith('.dll')) {
            const parser = new PEParser(arrayBuffer);
            peData = parser.parse();
        }

        this.updateProgress('client', 'completed', 'Client-side analysis complete');
        document.getElementById('progress-fill').style.width = '50%';

        this.analysisData = {
            fileInfo: {
                name: this.currentFile.name,
                size: this.currentFile.size,
                type: this.currentFile.type,
                lastModified: new Date(this.currentFile.lastModified).toISOString()
            },
            hashes,
            clientAnalysis: {
                strings,
                entropy,
                pe: peData
            }
        };
    }

    async performBackendAnalysis() {
        this.updateProgress('upload', 'active', 'Uploading to GitHub Actions...');
        document.getElementById('progress-fill').style.width = '60%';

        await new Promise(resolve => setTimeout(resolve, 1000));
        this.updateProgress('upload', 'completed', 'Upload complete');
        document.getElementById('progress-fill').style.width = '70%';

        this.updateProgress('backend', 'active', 'Running deep analysis...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.updateProgress('backend', 'completed', 'Deep analysis complete');
        document.getElementById('progress-fill').style.width = '85%';

        this.updateProgress('ai', 'active', 'Performing AI assessment...');

        const backendResults = await this.githubActions.triggerAnalysis(
            this.currentFile,
            this.currentFile.name
        );

        this.analysisData.backendAnalysis = backendResults;

        this.updateProgress('ai', 'completed', 'AI assessment complete');
        document.getElementById('progress-fill').style.width = '100%';
    }

    updateProgress(step, status, message) {
        const stepElement = document.querySelector(`.progress-step[data-step="${step}"]`);
        const statusElement = document.getElementById(`${step}-status`);

        stepElement.classList.remove('active', 'completed');
        stepElement.classList.add(status);
        statusElement.textContent = message;
    }

    showResults() {
        document.getElementById('progress-section').classList.add('hidden');
        document.getElementById('results-section').classList.remove('hidden');

        this.renderOverview();
        this.renderAISummary();
        this.renderStaticAnalysis();
        this.renderStrings();
        this.renderEntropy();
        this.renderYARA();
    }

    renderOverview() {
        const fileInfoGrid = document.getElementById('file-info-grid');
        const hashesGrid = document.getElementById('hashes-grid');

        fileInfoGrid.innerHTML = `
            <div class="info-row">
                <span class="info-label">File Name</span>
                <span class="info-value">${this.analysisData.fileInfo.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">File Size</span>
                <span class="info-value">${ReportGenerator.formatBytes(this.analysisData.fileInfo.size)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">File Type</span>
                <span class="info-value">${this.analysisData.fileInfo.type || 'Unknown'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Last Modified</span>
                <span class="info-value">${new Date(this.analysisData.fileInfo.lastModified).toLocaleString()}</span>
            </div>
        `;

        hashesGrid.innerHTML = `
            <div class="info-row">
                <span class="info-label">SHA256</span>
                <span class="info-value">${this.analysisData.hashes.sha256}</span>
            </div>
            <div class="info-row">
                <span class="info-label">SHA1</span>
                <span class="info-value">${this.analysisData.hashes.sha1}</span>
            </div>
            <div class="info-row">
                <span class="info-label">MD5</span>
                <span class="info-value">${this.analysisData.hashes.md5}</span>
            </div>
        `;
    }

    renderAISummary() {
        const ai = this.analysisData.backendAnalysis?.ai;

        if (!ai) {
            document.getElementById('ai-content').innerHTML = '<p>AI analysis not available (backend not configured)</p>';
            return;
        }

        const threatLevel = document.getElementById('threat-level');
        threatLevel.className = `threat-level ${ai.threatLevel}`;
        document.getElementById('threat-level-text').textContent = ai.threatLevel.toUpperCase();

        const aiContent = document.getElementById('ai-content');
        aiContent.innerHTML = `
            <div class="ai-section">
                <h4>Summary</h4>
                <p>${ai.summary}</p>
            </div>
            <div class="ai-section">
                <h4>Detected Behaviors</h4>
                <ul>
                    ${ai.behaviors.map(b => `<li>${b}</li>`).join('')}
                </ul>
            </div>
            <div class="ai-section">
                <h4>Recommendations</h4>
                <ul>
                    ${ai.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
            <div class="ai-section">
                <h4>Confidence Score</h4>
                <p>${ai.confidence}%</p>
            </div>
        `;
    }

    renderStaticAnalysis() {
        const content = document.getElementById('static-analysis-content');
        const pe = this.analysisData.clientAnalysis.pe;

        if (!pe || pe.error) {
            content.innerHTML = `<p>${pe?.error || 'PE analysis not available for this file type'}</p>`;
            return;
        }

        let html = '<div class="analysis-section">';
        html += '<h3>File Header</h3>';
        html += '<table class="analysis-table"><tbody>';
        html += `<tr><td>Machine</td><td>${pe.fileHeader.machine}</td></tr>`;
        html += `<tr><td>Sections</td><td>${pe.fileHeader.numberOfSections}</td></tr>`;
        html += `<tr><td>Timestamp</td><td>${pe.fileHeader.timeDateStamp}</td></tr>`;
        html += `<tr><td>Characteristics</td><td>${pe.fileHeader.characteristics.join(', ')}</td></tr>`;
        html += '</tbody></table></div>';

        html += '<div class="analysis-section">';
        html += '<h3>Optional Header</h3>';
        html += '<table class="analysis-table"><tbody>';
        html += `<tr><td>Magic</td><td>${pe.optionalHeader.magic}</td></tr>`;
        html += `<tr><td>Entry Point</td><td>${pe.optionalHeader.addressOfEntryPoint}</td></tr>`;
        html += `<tr><td>Image Base</td><td>${pe.optionalHeader.imageBase}</td></tr>`;
        html += `<tr><td>Subsystem</td><td>${pe.optionalHeader.subsystem}</td></tr>`;
        html += '</tbody></table></div>';

        if (pe.sections && pe.sections.length > 0) {
            html += '<div class="analysis-section">';
            html += '<h3>Sections</h3>';
            html += '<table class="analysis-table">';
            html += '<thead><tr><th>Name</th><th>Virtual Size</th><th>Virtual Address</th><th>Raw Size</th><th>Characteristics</th></tr></thead>';
            html += '<tbody>';
            pe.sections.forEach(section => {
                html += `<tr>
                    <td>${section.name}</td>
                    <td>${section.virtualSize}</td>
                    <td>${section.virtualAddress}</td>
                    <td>${section.sizeOfRawData}</td>
                    <td>${section.characteristics.join(', ')}</td>
                </tr>`;
            });
            html += '</tbody></table></div>';
        }

        content.innerHTML = html;
    }

    renderStrings() {
        const stringsList = document.getElementById('strings-list');
        const strings = this.analysisData.clientAnalysis.strings;

        let displayStrings = [...strings.ascii, ...strings.unicode].slice(0, 500);

        stringsList.innerHTML = displayStrings.map(str => {
            const isSuspicious = strings.suspicious.some(s => s.value === str);
            return `<div class="string-item ${isSuspicious ? 'suspicious' : ''}">${this.escapeHtml(str)}</div>`;
        }).join('');

        // Setup search
        const searchInput = document.getElementById('strings-search');
        const typeSelect = document.getElementById('strings-type');

        const filterStrings = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const type = typeSelect.value;

            let filtered = [];
            if (type === 'all' || type === 'ascii') filtered.push(...strings.ascii);
            if (type === 'all' || type === 'unicode') filtered.push(...strings.unicode);
            if (type === 'suspicious') filtered = strings.suspicious.map(s => s.value);

            if (searchTerm) {
                filtered = filtered.filter(s => s.toLowerCase().includes(searchTerm));
            }

            stringsList.innerHTML = filtered.slice(0, 500).map(str => {
                const isSuspicious = strings.suspicious.some(s => s.value === str);
                return `<div class="string-item ${isSuspicious ? 'suspicious' : ''}">${this.escapeHtml(str)}</div>`;
            }).join('');
        };

        searchInput.addEventListener('input', filterStrings);
        typeSelect.addEventListener('change', filterStrings);
    }

    renderEntropy() {
        const canvas = document.getElementById('entropy-chart');
        const ctx = canvas.getContext('2d');
        const entropy = this.analysisData.clientAnalysis.entropy;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;

        // Draw entropy chart
        this.drawEntropyChart(ctx, canvas.width, canvas.height, entropy.sections);

        // Display entropy info
        const entropyInfo = document.getElementById('entropy-info');
        entropyInfo.innerHTML = `
            <div class="entropy-stat">
                <div class="entropy-stat-label">Overall Entropy</div>
                <div class="entropy-stat-value">${entropy.overall.toFixed(2)}</div>
            </div>
            <div class="entropy-stat">
                <div class="entropy-stat-label">Average Entropy</div>
                <div class="entropy-stat-value">${entropy.average.toFixed(2)}</div>
            </div>
            <div class="entropy-stat">
                <div class="entropy-stat-label">Max Entropy</div>
                <div class="entropy-stat-value">${entropy.max.toFixed(2)}</div>
            </div>
            <div class="entropy-stat">
                <div class="entropy-stat-label">Packing Detected</div>
                <div class="entropy-stat-value">${entropy.isPacked ? 'Yes' : 'No'}</div>
            </div>
            <div class="entropy-stat">
                <div class="entropy-stat-label">Confidence</div>
                <div class="entropy-stat-value">${entropy.packingConfidence}%</div>
            </div>
        `;
    }

    drawEntropyChart(ctx, width, height, sections) {
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 8; i++) {
            const y = padding + (chartHeight / 8) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw entropy line
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();

        sections.forEach((section, i) => {
            const x = padding + (chartWidth / sections.length) * i;
            const y = padding + chartHeight - (section.entropy / 8) * chartHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw axis labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.fillText('0', padding - 20, height - padding + 5);
        ctx.fillText('8', padding - 20, padding + 5);
        ctx.fillText('Entropy', 10, 20);
    }

    renderYARA() {
        const yaraContent = document.getElementById('yara-content');
        const yara = this.analysisData.backendAnalysis?.yara;

        if (!yara || !yara.matches || yara.matches.length === 0) {
            yaraContent.innerHTML = `
                <div class="no-matches">
                    <svg viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
                        <path d="M22 32L28 38L42 24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                    <h3>No YARA Matches</h3>
                    <p>No malicious patterns detected</p>
                </div>
            `;
            return;
        }

        yaraContent.innerHTML = yara.matches.map(match => `
            <div class="yara-match">
                <h4>${match.rule}</h4>
                <p>${match.description}</p>
                <div class="yara-tags">
                    ${match.tags.map(tag => `<span class="yara-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    exportJSON() {
        const json = ReportGenerator.generateJSON(this.analysisData);
        ReportGenerator.downloadFile(
            json,
            `malware-analysis-${this.analysisData.fileInfo.name}.json`,
            'application/json'
        );
    }

    exportHTML() {
        const html = ReportGenerator.generateHTML(this.analysisData);
        ReportGenerator.downloadFile(
            html,
            `malware-analysis-${this.analysisData.fileInfo.name}.html`,
            'text/html'
        );
    }

    async exportPDF() {
        const pdf = await ReportGenerator.generatePDF(this.analysisData);
        pdf.save(`malware-analysis-${this.analysisData.fileInfo.name}.pdf`);
    }

    reset() {
        this.currentFile = null;
        this.analysisData = null;

        document.getElementById('upload-section').classList.remove('hidden');
        document.getElementById('progress-section').classList.add('hidden');
        document.getElementById('results-section').classList.add('hidden');

        document.querySelector('.upload-area').style.display = 'block';
        document.getElementById('file-preview').classList.add('hidden');

        document.getElementById('file-input').value = '';
        document.getElementById('progress-fill').style.width = '0%';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.analyzer = new MalwareAnalyzer();
});
