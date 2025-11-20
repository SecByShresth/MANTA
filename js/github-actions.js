// GitHub Actions integration for backend analysis
class GitHubActions {
    constructor(owner, repo, token) {
        this.owner = owner;
        this.repo = repo;
        this.token = token;
        this.apiBase = 'https://api.github.com';
    }

    async triggerAnalysis(fileData, fileName) {
        try {
            // Convert file to base64
            const base64Data = await this.fileToBase64(fileData);

            // Trigger workflow dispatch
            const workflowId = 'malware-analysis.yml';
            const response = await fetch(
                `${this.apiBase}/repos/${this.owner}/${this.repo}/actions/workflows/${workflowId}/dispatches`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ref: 'main',
                        inputs: {
                            file_data: base64Data.substring(0, 65000), // GitHub has input size limits
                            file_name: fileName,
                            timestamp: Date.now().toString()
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            // Poll for results
            return await this.pollForResults(fileName);
        } catch (error) {
            console.error('GitHub Actions error:', error);
            throw error;
        }
    }

    async pollForResults(fileName, maxAttempts = 30, interval = 2000) {
        // In a real implementation, this would poll the workflow run status
        // For now, we'll simulate with a timeout
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate backend analysis results
                resolve(this.getMockResults(fileName));
            }, 5000);
        });
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    getMockResults(fileName) {
        // Mock results for demonstration
        // In production, this would come from GitHub Actions
        return {
            yara: {
                matches: [
                    {
                        rule: 'Suspicious_API_Calls',
                        description: 'Detected suspicious Windows API calls commonly used in malware',
                        tags: ['suspicious', 'api', 'windows'],
                        severity: 'medium'
                    }
                ],
                totalRules: 150,
                matchedRules: 1
            },
            deepAnalysis: {
                fileType: 'PE32 executable',
                compiler: 'Microsoft Visual C++ 8.0',
                packer: 'None detected',
                digitalSignature: 'Not signed',
                antiDebug: false,
                antiVM: false,
                networkIndicators: {
                    urls: [],
                    ips: [],
                    domains: []
                }
            },
            ai: {
                threatLevel: 'medium',
                confidence: 75,
                malwareFamily: 'Unknown',
                behaviors: [
                    'Uses dynamic API resolution',
                    'Contains suspicious string patterns',
                    'High entropy sections detected'
                ],
                recommendations: [
                    'Execute in isolated sandbox environment',
                    'Monitor network traffic',
                    'Check for persistence mechanisms'
                ],
                summary: 'The file exhibits some suspicious characteristics including high entropy sections and dynamic API resolution patterns. While not definitively malicious, caution is advised when executing this file.'
            }
        };
    }

    static getConfigFromURL() {
        // Try to get GitHub config from URL parameters or localStorage
        const params = new URLSearchParams(window.location.search);

        return {
            owner: params.get('gh_owner') || localStorage.getItem('gh_owner') || '',
            repo: params.get('gh_repo') || localStorage.getItem('gh_repo') || '',
            token: params.get('gh_token') || localStorage.getItem('gh_token') || ''
        };
    }

    static saveConfig(owner, repo, token) {
        if (owner) localStorage.setItem('gh_owner', owner);
        if (repo) localStorage.setItem('gh_repo', repo);
        if (token) localStorage.setItem('gh_token', token);
    }
}

window.GitHubActions = GitHubActions;
