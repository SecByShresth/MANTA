# 🔍 Malware Analysis Tool

A **privacy-focused, AI-powered malware static analysis tool** that runs entirely on GitHub Pages (frontend) and GitHub Actions (backend serverless jobs) with **zero databases** and **fully ephemeral sessions**.

[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-blue)](https://pages.github.com/)
[![GitHub Actions](https://img.shields.io/badge/Backend-GitHub%20Actions-green)](https://github.com/features/actions)
[![Privacy First](https://img.shields.io/badge/Privacy-First-red)](https://github.com)

## ✨ Features

### 🎯 Core Philosophy
- ❌ **No backend server** - Only GitHub Actions processes analysis jobs
- ❌ **No database** - No state, no persistence
- ❌ **No storage** - Reports exist only in memory during the page session
- ✅ **Fully ephemeral** - Everything vanishes on page refresh
- ✅ **Privacy-first** - Your files never leave your control (except for optional backend analysis)

### 🔬 Analysis Capabilities

#### Client-Side Analysis (Browser)
- **Hash Calculation**: SHA256, SHA1, MD5
- **File Metadata**: Type, size, MIME detection
- **String Extraction**: ASCII and Unicode strings with suspicious pattern detection
- **PE Header Parsing**: For Windows executables (.exe, .dll)
  - DOS and PE headers
  - File characteristics
  - Section analysis
  - Import/Export tables (basic)
- **Entropy Calculation**: Detect packed/encrypted sections
- **Suspicious Pattern Detection**: Identify malware indicators

#### Backend Analysis (GitHub Actions - Optional)
- **Deep Static Analysis**: Advanced file inspection
- **YARA Scanning**: Pattern matching with public rules
- **AI-Powered Assessment**: Threat level evaluation
- **Behavior Analysis**: Suspicious activity detection
- **Confidence Scoring**: Risk assessment

### 📊 Supported File Types
- Windows Executables: `.exe`, `.dll`, `.msi`
- Scripts: `.js`, `.vbs`, `.ps1`, `.bat`
- Archives: `.zip`
- Android: `.apk`

### 📈 Report Formats
- **JSON**: Machine-readable format
- **HTML**: Standalone report with embedded styles
- **Text**: Simple text-based report

## 🚀 Quick Start

### Option 1: Use GitHub Pages (Recommended)

1. **Fork this repository**
2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
3. **Access your tool**: `https://yourusername.github.io/malware-analysis-tool/`

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/malware-analysis-tool.git
cd malware-analysis-tool

# Serve with any static server
python -m http.server 8000
# or
npx serve

# Open http://localhost:8000
```

## ⚙️ Configuration

### Enable Backend Analysis (Optional)

To enable GitHub Actions backend analysis:

1. **Create a Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` and `actions` scopes

2. **Configure the tool**:
   - Add to URL: `?gh_owner=USERNAME&gh_repo=REPO&gh_token=TOKEN`
   - Or store in localStorage (persists across sessions)

3. **Update workflow file**:
   - Edit `.github/workflows/malware-analysis.yml`
   - Customize analysis steps as needed

### Privacy Note
- Backend analysis sends file data to GitHub Actions
- Files are **immediately deleted** after analysis
- **No artifacts are stored**
- Results are returned to frontend only

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                         │
│                  (Static Frontend)                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ File Upload  │  │   Analysis   │  │   Reports    │ │
│  │  & Preview   │→ │   Engine     │→ │  & Export    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                           │
│         │                  │                           │
│         ▼                  ▼                           │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Client-Side Analysis                     │ │
│  │  • Hashing  • PE Parsing  • Strings  • Entropy  │ │
│  └──────────────────────────────────────────────────┘ │
│                        │                              │
└────────────────────────┼──────────────────────────────┘
                         │ (Optional)
                         ▼
         ┌───────────────────────────────┐
         │     GitHub Actions            │
         │   (Serverless Backend)        │
         │                               │
         │  ┌─────────────────────────┐ │
         │  │  Deep Static Analysis   │ │
         │  │  YARA Scanning          │ │
         │  │  AI Assessment          │ │
         │  │  ⚠️  Ephemeral Only     │ │
         │  └─────────────────────────┘ │
         └───────────────────────────────┘
```

## 📁 Project Structure

```
malware-analysis-tool/
├── index.html                 # Main HTML file
├── styles.css                 # Styles and design system
├── js/
│   ├── main.js               # Main application logic
│   ├── crypto-utils.js       # Hash calculation utilities
│   ├── pe-parser.js          # PE file parser
│   ├── strings-extractor.js  # String extraction
│   ├── entropy-calculator.js # Entropy analysis
│   ├── github-actions.js     # Backend integration
│   └── report-generator.js   # Export functionality
├── .github/
│   └── workflows/
│       └── malware-analysis.yml  # GitHub Actions workflow
└── README.md
```

## 🔒 Security & Privacy

### What We DON'T Do
- ❌ Store any uploaded files
- ❌ Keep analysis results in databases
- ❌ Track users or their activities
- ❌ Create persistent logs
- ❌ Share data with third parties

### What We DO
- ✅ Process everything client-side when possible
- ✅ Delete backend files immediately after analysis
- ✅ Use ephemeral session storage only
- ✅ Provide full transparency (open source)

### Recommendations
- 🔐 Use for **static analysis only** - never execute suspicious files
- 🔐 Run in an **isolated environment** when analyzing real malware
- 🔐 Don't upload **sensitive or confidential** files
- 🔐 Verify the tool's source code before use

## 🎨 UI Features

- **Modern, Minimalistic Design**: Clean interface with smooth animations
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: Easy to extend with dark theme
- **Drag & Drop**: Intuitive file upload
- **Real-time Progress**: Visual feedback during analysis
- **Interactive Charts**: Entropy visualization
- **Tabbed Interface**: Organized results display

## 🛠️ Development

### Prerequisites
- Modern web browser with ES6+ support
- (Optional) Python 3.10+ for GitHub Actions backend

### Adding Custom Analysis

#### Client-Side
Edit the respective JavaScript modules in the `js/` directory:
- `pe-parser.js` - Add PE parsing features
- `strings-extractor.js` - Add pattern detection
- `entropy-calculator.js` - Customize entropy analysis

#### Backend (GitHub Actions)
Edit `.github/workflows/malware-analysis.yml`:
- Add Python dependencies
- Implement custom analysis steps
- Integrate AI models (Ollama, HuggingFace, etc.)

### Example: Adding YARA Rules

```yaml
- name: Download YARA rules
  run: |
    git clone https://github.com/Yara-Rules/rules.git /tmp/yara-rules

- name: Run YARA scan
  run: |
    yara -r /tmp/yara-rules/malware /tmp/sample_file
```

## 📊 Cost Analysis

### GitHub Free Tier
- **GitHub Pages**: Unlimited static hosting
- **GitHub Actions**: 2,000 minutes/month free
- **Storage**: No storage used (ephemeral)

### Estimated Usage
- Average analysis: ~30 seconds
- Monthly capacity: ~4,000 analyses (free tier)
- **Total cost**: $0 💰

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Ideas for Contribution
- Add support for more file types (ELF, Mach-O, APK deep analysis)
- Implement additional client-side parsers
- Integrate more AI models
- Improve UI/UX
- Add more export formats
- Enhance YARA rule sets

## 📝 License

MIT License - See LICENSE file for details

## ⚠️ Disclaimer

This tool is for **educational and research purposes only**. 

- Always handle malware samples in isolated environments
- Never execute suspicious files on production systems
- The AI analysis is probabilistic and may have false positives/negatives
- This tool does not replace professional malware analysis
- Use at your own risk

## 🙏 Acknowledgments

- **GitHub** for Pages and Actions infrastructure
- **YARA** for pattern matching capabilities
- **PE File Format** documentation
- Open source security community

## 📧 Contact

For questions, issues, or suggestions:
- Open an issue on GitHub
- Submit a pull request
- Check existing discussions

---

**Made with ❤️ for the security community**

*Privacy-First • AI-Powered • Fully Ephemeral*
