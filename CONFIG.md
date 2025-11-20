# Malware Analysis Tool - Configuration

## GitHub Actions Configuration

To enable backend analysis via GitHub Actions, you need to configure the following:

### 1. GitHub Personal Access Token

Create a token with the following scopes:
- `repo` (Full control of private repositories)
- `workflow` (Update GitHub Action workflows)

### 2. Configuration Methods

#### Method A: URL Parameters (Temporary)
Add to the URL when accessing the tool:
```
https://yourusername.github.io/malware-analysis-tool/?gh_owner=USERNAME&gh_repo=REPO&gh_token=TOKEN
```

#### Method B: LocalStorage (Persistent)
Open browser console and run:
```javascript
localStorage.setItem('gh_owner', 'YOUR_GITHUB_USERNAME');
localStorage.setItem('gh_repo', 'YOUR_REPO_NAME');
localStorage.setItem('gh_token', 'YOUR_PERSONAL_ACCESS_TOKEN');
```

### 3. Security Considerations

⚠️ **Important**: 
- Never commit your personal access token to the repository
- Use tokens with minimal required permissions
- Rotate tokens regularly
- Consider using GitHub Apps for production deployments

### 4. Backend Analysis Features

When configured, the backend will perform:
- Deep static analysis with Python tools
- YARA rule scanning
- AI-powered threat assessment
- Advanced pattern detection

### 5. Disabling Backend Analysis

To use only client-side analysis:
- Simply don't configure GitHub credentials
- The tool will work fully in the browser
- All analysis will be client-side only

## Advanced Configuration

### Custom YARA Rules

Edit `.github/workflows/malware-analysis.yml` to add custom YARA rules:

```yaml
- name: Download custom YARA rules
  run: |
    git clone YOUR_YARA_RULES_REPO /tmp/yara-rules
```

### AI Model Integration

To integrate a custom AI model:

1. Add model dependencies to the workflow
2. Implement model inference in the AI analysis step
3. Format results to match the expected JSON structure

Example for HuggingFace:
```yaml
- name: AI Analysis
  run: |
    pip install transformers torch
    python3 ai_analysis.py
```

### Rate Limiting

GitHub Actions has the following limits:
- Free tier: 2,000 minutes/month
- Pro tier: 3,000 minutes/month

Monitor usage in your GitHub account settings.

## Troubleshooting

### Backend Analysis Not Working

1. Check GitHub token permissions
2. Verify workflow file is in `.github/workflows/`
3. Check Actions tab in GitHub repository for errors
4. Ensure repository has Actions enabled

### CORS Issues

If experiencing CORS errors:
1. Ensure GitHub Pages is properly configured
2. Check that the repository is public (or token has correct permissions)
3. Verify API endpoints are correct

### Performance Issues

For large files:
- Client-side analysis may be slow for files >10MB
- Consider increasing chunk size in entropy calculation
- Backend analysis has GitHub Actions timeout (6 hours max)

## Environment Variables

The tool uses the following localStorage keys:
- `gh_owner`: GitHub username
- `gh_repo`: Repository name  
- `gh_token`: Personal access token

Clear with:
```javascript
localStorage.clear();
```
