# How to Generate a GitHub Personal Access Token

## Overview

GitHub no longer supports password authentication for Git operations. You need to use a **Personal Access Token (PAT)** instead of your password when performing Git operations via HTTPS.

## Error You Might See

```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/username/repository.git/'
```

## Step-by-Step Guide to Generate a New Token

### 1. Sign in to GitHub

Go to [github.com](https://github.com) and sign in to your account.

### 2. Access Token Settings

**Option A: Direct Link**
- Go directly to: https://github.com/settings/tokens

**Option B: Via Settings Menu**
1. Click your profile picture in the top-right corner
2. Click **Settings**
3. Scroll down in the left sidebar and click **Developer settings**
4. Click **Personal access tokens**
5. Click **Tokens (classic)** or **Fine-grained tokens** (recommended)

### 3. Generate New Token

#### For Classic Tokens:
1. Click **Generate new token** → **Generate new token (classic)**
2. You may be prompted to confirm your password
3. Fill in the token details:
   - **Note**: Give it a descriptive name (e.g., "Git CLI Access - Ubuntu Server")
   - **Expiration**: Choose an expiration period (30 days, 60 days, 90 days, or custom)
   - **Select scopes**: Choose the permissions needed

#### For Fine-grained Tokens (Recommended):
1. Click **Generate new token**
2. Fill in the token details:
   - **Token name**: Give it a descriptive name (e.g., "Git CLI Access - Ubuntu Server")
   - **Expiration**: Choose an expiration period
   - **Repository access**: Choose which repositories this token can access
   - **Permissions**: Select the specific permissions needed

### 4. Required Scopes/Permissions

For typical Git operations, you'll need:

**Classic Token Scopes:**
- ✅ `repo` - Full control of private repositories
  - `repo:status` - Access commit status
  - `repo_deployment` - Access deployment status
  - `public_repo` - Access public repositories
  - `repo:invite` - Access repository invitations
  - `security_events` - Read and write security events

**Fine-grained Token Permissions:**
- **Repository permissions**:
  - Contents: Read and write
  - Metadata: Read-only (automatically selected)
  - Pull requests: Read and write (if needed)
  - Issues: Read and write (if needed)

### 5. Generate and Copy Token

1. Click **Generate token** at the bottom of the page
2. **IMPORTANT**: Copy the token immediately and save it securely
3. ⚠️ **You won't be able to see this token again!** If you lose it, you'll need to generate a new one

## How to Use Your Token

### Method 1: Use Token as Password (Quick)

When Git prompts for credentials:
```bash
Username: your-github-username
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Paste your token here
```

### Method 2: Update Git Remote URL (Recommended)

Replace your HTTPS remote URL to include the token:

```bash
# Current format (will fail)
https://github.com/username/repository.git

# Updated format with token
https://TOKEN@github.com/username/repository.git

# Example command to update remote
git remote set-url origin https://ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/USERNAME/REPOSITORY.git
```

### Method 3: Use Git Credential Manager

Store your token securely so you don't have to enter it every time:

**Linux:**
```bash
# Store credentials in cache for 1 hour
git config --global credential.helper cache

# Store credentials permanently (encrypted)
git config --global credential.helper store

# Then do a git operation and enter your token once
git pull
# Username: your-github-username
# Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**macOS:**
```bash
git config --global credential.helper osxkeychain
```

**Windows:**
```bash
git config --global credential.helper wincred
```

## Example: Fixing Your Current Error

Based on your error message, here's how to fix it:

```bash
# Navigate to your repository
cd /path/to/your/repository

# Option 1: Update the remote URL with your token
git remote set-url origin https://YOUR_TOKEN_HERE@github.com/USERNAME/REPOSITORY.git

# Option 2: Or use credential helper and enter token when prompted
git config credential.helper store
git pull  # Enter username and token when prompted
```

## Security Best Practices

### ✅ DO:
- Treat tokens like passwords - keep them secret
- Use descriptive names for tokens to track their usage
- Set expiration dates on tokens
- Use fine-grained tokens with minimal necessary permissions
- Revoke tokens you're no longer using
- Store tokens in secure password managers
- Use different tokens for different machines/purposes

### ❌ DON'T:
- Never commit tokens to your repository
- Don't share tokens in chat messages or emails
- Don't use the same token everywhere
- Don't give tokens more permissions than needed
- Never hardcode tokens in your code

## Revoking a Token

If a token is compromised or no longer needed:

1. Go to https://github.com/settings/tokens
2. Find the token in the list
3. Click **Delete** or **Revoke**
4. Confirm the action

## Troubleshooting

### "Authentication failed" even with token
- Verify the token hasn't expired
- Check that the token has the required scopes/permissions
- Make sure you're using the token (not your password)
- Verify you copied the entire token correctly

### Token not working for specific repository
- Check repository access settings for fine-grained tokens
- Ensure the token has `repo` scope for classic tokens
- Verify you have the necessary permissions on the repository

### Need to update token in multiple places
1. Update your Git credential store:
   ```bash
   git config --global --unset credential.helper
   git config --global credential.helper store
   ```
2. Remove old credentials (Linux):
   ```bash
   rm ~/.git-credentials
   ```
3. Next git operation will prompt for new token

## Additional Resources

- [GitHub Documentation - Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Documentation - About authentication with HTTPS](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories#cloning-with-https-urls)
- [GitHub Blog - Token authentication requirements for Git operations](https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/)

---

## Quick Reference Commands

```bash
# Set up credential helper (one-time setup)
git config --global credential.helper store

# Update remote URL with token
git remote set-url origin https://TOKEN@github.com/USERNAME/REPO.git

# Check current remote URL
git remote -v

# Remove stored credentials (to update token)
rm ~/.git-credentials  # Linux/macOS
```

---

**Last Updated**: December 2025
