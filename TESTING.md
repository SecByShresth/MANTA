# 🧪 Testing Guide & File Size Limits

## ⚠️ File Size Limits

The tool has the following limits to ensure smooth performance and prevent browser crashes:

### Client-Side Analysis Limits

| Component | Limit | Reason |
|-----------|-------|--------|
| **Maximum File Size** | 50 MB | Browser memory constraints |
| **String Extraction** | First 10 MB | Performance optimization |
| **Entropy Sections** | Max 500 sections | Prevent stack overflow |
| **Strings Displayed** | 1,000 per type | UI performance |
| **Total Strings Extracted** | 5,000 max | Memory management |

### Why These Limits?

- **Browser Memory**: JavaScript runs in browser memory, which is limited
- **Stack Overflow Prevention**: Large files can cause "Maximum call stack size exceeded" errors
- **Performance**: Analyzing very large files client-side would freeze the browser
- **User Experience**: Fast, responsive analysis is better than slow, complete analysis

## 📊 Recommended File Sizes

| File Size | Analysis Type | Expected Time |
|-----------|---------------|---------------|
| < 1 MB | Client-side only | 1-2 seconds |
| 1-10 MB | Client-side only | 2-5 seconds |
| 10-50 MB | Client-side only | 5-15 seconds |
| > 50 MB | Backend only (GitHub Actions) | 30-60 seconds |

## 🧪 Testing Locally

### Step 1: Create Test Files

Create small test files for local testing:

#### Text File Test (Safe)
```bash
# Create a simple text file
echo "This is a test file for malware analysis" > test.txt

# Rename to .exe for testing (it's just text, safe)
mv test.txt test.exe
```

#### PowerShell Test File
```powershell
# Create a test PowerShell script
@"
Write-Host "Test Script"
`$url = "http://example.com"
Invoke-WebRequest -Uri `$url
"@ | Out-File test.ps1
```

### Step 2: Test the Tool

1. **Open the tool**: http://localhost:8000
2. **Upload test file**: Drag and drop or click to browse
3. **Check file preview**: Verify hash calculation works
4. **Click Analyze**: Watch the progress bar
5. **Review results**: Check all tabs

### Step 3: Verify Features

✅ **Upload Section**
- [ ] Drag and drop works
- [ ] Click to browse works
- [ ] File info displays correctly
- [ ] SHA256 hash calculates

✅ **Analysis Progress**
- [ ] Progress bar animates
- [ ] Step indicators update
- [ ] Status messages display

✅ **Results Tabs**
- [ ] Overview shows file info and hashes
- [ ] AI Summary displays (or shows "not configured")
- [ ] Static Analysis shows PE data (for .exe/.dll)
- [ ] Strings tab shows extracted strings
- [ ] Entropy tab shows chart and stats
- [ ] YARA tab shows matches (or "no matches")

✅ **Export Functions**
- [ ] JSON export downloads
- [ ] HTML export downloads
- [ ] Text export downloads

✅ **Reset Function**
- [ ] "Analyze Another File" button works
- [ ] Returns to upload screen
- [ ] Clears previous data

## 🐛 Common Issues & Solutions

### Issue: "Maximum call stack size exceeded"

**Cause**: File too large for client-side analysis

**Solutions**:
1. ✅ **FIXED**: Now shows error message for files > 50MB
2. Use smaller test files (< 10MB recommended)
3. Enable backend analysis for large files

### Issue: "Analysis failed: [error]"

**Causes & Solutions**:

| Error Message | Cause | Solution |
|---------------|-------|----------|
| File too large | > 50MB | Use smaller file or backend |
| Hash calculation error | Browser issue | Refresh page, try again |
| PE parsing error | Not a valid PE file | Normal for non-PE files |
| Out of memory | File too large | Reduce file size |

### Issue: Slow Performance

**Causes**:
- File size too large (10-50MB range)
- Too many strings extracted
- Complex PE structure

**Solutions**:
- Use files < 10MB for best performance
- Close other browser tabs
- Use a modern browser (Chrome, Firefox, Edge)

### Issue: Strings Not Showing

**Causes**:
- Binary file with no readable strings
- File is encrypted/packed
- Minimum string length too high

**Solutions**:
- Check "Entropy" tab - high entropy means encrypted
- Try different file types
- This is normal for packed malware

## 📝 Test Cases

### Test Case 1: Small Text File
- **File**: test.txt (< 1KB)
- **Expected**: Fast analysis, many strings, low entropy
- **Time**: < 1 second

### Test Case 2: PowerShell Script
- **File**: test.ps1 (< 10KB)
- **Expected**: Suspicious strings detected, script content visible
- **Time**: 1-2 seconds

### Test Case 3: Small Executable
- **File**: small.exe (< 1MB)
- **Expected**: PE parsing works, sections shown, imports listed
- **Time**: 2-3 seconds

### Test Case 4: Medium File
- **File**: medium.exe (5-10MB)
- **Expected**: All analysis works, may take longer
- **Time**: 5-10 seconds

### Test Case 5: Large File (Limit Test)
- **File**: large.exe (40-50MB)
- **Expected**: Analysis works but slower, all features functional
- **Time**: 10-15 seconds

### Test Case 6: Too Large File
- **File**: toolarge.exe (> 50MB)
- **Expected**: Error message shown, analysis prevented
- **Time**: Immediate error

## 🎯 Performance Benchmarks

Based on testing with various file sizes:

| File Size | Hash Calc | String Extract | Entropy | PE Parse | Total Time |
|-----------|-----------|----------------|---------|----------|------------|
| 100 KB | 0.1s | 0.2s | 0.1s | 0.1s | ~0.5s |
| 1 MB | 0.2s | 0.5s | 0.3s | 0.2s | ~1.2s |
| 5 MB | 0.5s | 1.5s | 1.0s | 0.5s | ~3.5s |
| 10 MB | 1.0s | 2.5s | 2.0s | 1.0s | ~6.5s |
| 25 MB | 2.0s | 4.0s | 4.0s | 2.0s | ~12s |
| 50 MB | 4.0s | 6.0s | 8.0s | 4.0s | ~22s |

*Times are approximate and vary by browser/system*

## 🔍 What to Look For

### Good Signs (File is Likely Safe)
- ✅ Low entropy (< 6.0)
- ✅ Readable strings
- ✅ Valid PE structure
- ✅ No suspicious API calls
- ✅ No YARA matches

### Warning Signs (File is Suspicious)
- ⚠️ Medium entropy (6.0-7.0)
- ⚠️ Some obfuscated strings
- ⚠️ Unusual PE sections
- ⚠️ Some suspicious strings
- ⚠️ Minor YARA matches

### Red Flags (File is Likely Malicious)
- 🔴 High entropy (> 7.0) - packed/encrypted
- 🔴 No readable strings
- 🔴 Suspicious API calls (VirtualAlloc, CreateRemoteThread)
- 🔴 Network indicators (IPs, URLs)
- 🔴 Multiple YARA matches
- 🔴 Obfuscation detected

## 🚀 Next Steps After Testing

Once local testing is complete:

1. **Deploy to GitHub Pages** (see DEPLOYMENT.md)
2. **Configure Backend** (optional, see CONFIG.md)
3. **Test with Real Samples** (use caution!)
4. **Share with Community**

## ⚠️ Safety Reminders

- ✋ **Never execute suspicious files**
- ✋ **Always use isolated environments**
- ✋ **Don't upload sensitive data**
- ✋ **This is static analysis only**
- ✋ **False positives/negatives can occur**

## 📞 Getting Help

If you encounter issues:

1. Check browser console (F12) for errors
2. Try with a smaller file
3. Refresh the page and try again
4. Check this testing guide
5. Review QUICKSTART.md
6. Open an issue on GitHub

---

**Happy Testing! 🧪**

*Remember: This tool is for educational and research purposes only.*
