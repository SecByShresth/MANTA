# 🚀 Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Test Locally

1. **Open the tool**:
   ```bash
   cd "c:\Users\ASUS\Desktop\Malware Analysis"
   python -m http.server 8000
   ```

2. **Open in browser**: http://localhost:8000

3. **Try it out**:
   - Create a simple test file (e.g., a text file with `.exe` extension for testing)
   - Drag and drop it into the upload area
   - Click "Analyze File"
   - View the results!

### Step 2: Deploy to GitHub Pages

1. **Initialize Git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Malware Analysis Tool"
   ```

2. **Create GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., "malware-analysis-tool")
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/malware-analysis-tool.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Click Save

5. **Access your tool**:
   - Wait 1-2 minutes for deployment
   - Visit: `https://YOUR_USERNAME.github.io/malware-analysis-tool/`

### Step 3: Enable Backend Analysis (Optional)

1. **Create Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`
   - Generate and copy the token

2. **Configure the tool**:
   - Open browser console (F12)
   - Run:
     ```javascript
     localStorage.setItem('gh_owner', 'YOUR_GITHUB_USERNAME');
     localStorage.setItem('gh_repo', 'malware-analysis-tool');
     localStorage.setItem('gh_token', 'YOUR_TOKEN_HERE');
     ```
   - Refresh the page

3. **Test backend analysis**:
   - Upload a file
   - The tool will now use GitHub Actions for deep analysis

## 📋 Features Checklist

After deployment, verify these features work:

- [ ] File upload (drag & drop and click)
- [ ] Hash calculation (SHA256, SHA1, MD5)
- [ ] String extraction
- [ ] Entropy analysis with chart
- [ ] PE parsing (for .exe/.dll files)
- [ ] Export to JSON
- [ ] Export to HTML
- [ ] Export to Text
- [ ] Tab switching (Overview, AI Summary, etc.)
- [ ] Responsive design on mobile
- [ ] Backend analysis (if configured)

## 🎯 Usage Tips

### Best Practices

1. **For Testing**:
   - Use harmless files first (text files, images)
   - Test with known malware samples from safe sources (e.g., theZoo, malware bazaar)
   - Always use in isolated environment

2. **For Analysis**:
   - Check all tabs for comprehensive results
   - Pay attention to entropy (>7.0 suggests packing)
   - Review suspicious strings carefully
   - Cross-reference hashes with VirusTotal

3. **For Privacy**:
   - Remember: everything is ephemeral
   - Refresh page to clear all data
   - Don't upload sensitive files to backend
   - Backend analysis sends data to GitHub Actions

### Sample Analysis Workflow

```
1. Upload file → See basic info and hash
2. Click Analyze → Wait for analysis
3. Overview tab → Check file metadata
4. AI Summary → See threat assessment
5. Static Analysis → Review PE structure
6. Strings → Look for suspicious patterns
7. Entropy → Check for packing
8. YARA → See pattern matches
9. Export → Save report for documentation
```

## 🔧 Customization

### Change Color Scheme

Edit `styles.css`:
```css
:root {
    --primary-color: #6366f1;  /* Change to your color */
    --secondary-color: #8b5cf6;
}
```

### Add Custom String Patterns

Edit `js/strings-extractor.js`:
```javascript
const suspiciousPatterns = [
    // Add your patterns here
    /your-custom-pattern/i,
];
```

### Modify Analysis Steps

Edit `js/main.js` in the `performClientAnalysis()` function.

## 🐛 Troubleshooting

### Issue: Hashes not calculating
- **Solution**: Ensure browser supports Web Crypto API (all modern browsers do)

### Issue: PE parsing fails
- **Solution**: Only works for valid PE files (.exe, .dll). Check file format.

### Issue: Backend analysis not working
- **Solution**: 
  1. Check GitHub token is valid
  2. Verify workflow file exists in `.github/workflows/`
  3. Check Actions tab in GitHub for errors

### Issue: Page not loading on GitHub Pages
- **Solution**:
  1. Wait 2-3 minutes after enabling Pages
  2. Check repository is public or token has access
  3. Verify Pages settings in repository

## 📚 Next Steps

1. ⭐ Star the repository
2. 🍴 Fork and customize
3. 🐛 Report issues
4. 🤝 Contribute improvements
5. 📢 Share with the security community

## 🆘 Getting Help

- **Documentation**: Read README.md and CONFIG.md
- **Issues**: Open an issue on GitHub
- **Discussions**: Check GitHub Discussions
- **Community**: Join security forums and share

---

**Happy Analyzing! 🔍**
