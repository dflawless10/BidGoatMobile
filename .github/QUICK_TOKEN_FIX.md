# Quick Fix: GitHub Authentication Error

## 🚨 Problem
```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/...'
```

## ⚡ Quick Solution

### Step 1: Generate Token (5 minutes)
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: `Git CLI Access`
4. Select scope: ✅ `repo` (Full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token immediately** (starts with `ghp_`)

### Step 2: Use Token in Git
Choose one method:

#### Method A: Update Remote URL (Recommended)
```bash
cd /var/www/gobidgoat
git remote set-url origin https://YOUR_TOKEN@github.com/dflawless10/gobidgoat.git
git pull  # Should work now!
```

#### Method B: Use Credential Helper
```bash
cd /var/www/gobidgoat
git config credential.helper store
git pull
# Username: dflawless10
# Password: ghp_YOUR_TOKEN_HERE
```

## 📖 Need More Details?
See the complete guide: [GITHUB_TOKEN_SETUP.md](../GITHUB_TOKEN_SETUP.md)

## 🔒 Security Reminder
- ✅ Keep your token secret
- ✅ Never commit it to your repository
- ✅ Use different tokens for different machines
- ✅ Set expiration dates

---
**Pro Tip**: Save your token in a password manager immediately after generating it!
