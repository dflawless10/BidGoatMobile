# SendGrid API Key Migration Guide

## Problem
GitHub push protection is blocking pushes because SendGrid API keys are hardcoded in:
- `main.py` (lines 54, 1965, 2051, 2107, 2135)
- `test_sendgrid.py` (line 6)

## Solution

### Step 1: Extract Your API Key
1. Open your local `C:\BidGoatOfficial\main.py` file
2. Copy the hardcoded SendGrid API key value (it should look like `SG.xxxxxxxxxxxxx`)
3. Keep this value safe - you'll need it in Step 3

### Step 2: Set Up Environment Variables

#### Create .env file
1. In your project root directory (same level as this README), create a file named `.env`
2. The `.env` file is already in `.gitignore`, so it won't be committed to the repository

#### Add your API key to .env
Add the following line to your `.env` file, replacing the placeholder with your actual API key:
```
SENDGRID_API_KEY=SG.your_actual_api_key_here
```

### Step 3: Update Your Python Files

#### For main.py
At the top of the file (after your imports), ensure you have:
```python
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
```

Then replace all hardcoded API key instances with:
```python
# OLD (lines 54, 1965, 2051, 2107, 2135):
sendgrid_api_key = "SG.hardcoded_key_here"
sg = SendGridAPIClient('SG.hardcoded_key_here')

# NEW:
sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
```

#### For test_sendgrid.py
At the top of the file (after your imports), ensure you have:
```python
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
```

Then replace the hardcoded API key on line 6 with:
```python
# OLD (line 6):
api_key = "SG.hardcoded_key_here"

# NEW:
api_key = os.getenv('SENDGRID_API_KEY')
```

### Step 4: Install Required Package
If you haven't already, install the python-dotenv package:
```bash
pip install python-dotenv
```

### Step 5: Verify Everything Works
1. Run your Python scripts locally to ensure they can read from the environment variable
2. Check that emails are being sent successfully with the environment variable

### Step 6: Add Files to Repository
Once you've updated your files:
1. Copy your updated `main.py` to your repository (no hardcoded keys!)
2. Copy your updated `test_sendgrid.py` to your repository (no hardcoded keys!)
3. Commit and push - GitHub push protection will no longer block you

## Important Notes
- **Never** commit your `.env` file - it's already in `.gitignore`
- The `.env.example` file in the repository shows what variables are needed
- Each developer/environment needs their own `.env` file
- For production, use environment variables on your hosting platform

## Quick Search and Replace Commands

For bash/Linux:
```bash
# Back up your files first!
cp main.py main.py.backup
cp test_sendgrid.py test_sendgrid.py.backup

# Replace in main.py (adjust the pattern to match your actual key)
sed -i "s/\"SG\.[a-zA-Z0-9_-]*\"/os.getenv('SENDGRID_API_KEY')/g" main.py

# Replace in test_sendgrid.py
sed -i "s/\"SG\.[a-zA-Z0-9_-]*\"/os.getenv('SENDGRID_API_KEY')/g" test_sendgrid.py
```

For PowerShell (Windows):
```powershell
# Back up your files first!
Copy-Item main.py -Destination main.py.backup
Copy-Item test_sendgrid.py -Destination test_sendgrid.py.backup

# Replace in main.py
(Get-Content main.py) -replace '"SG\.[a-zA-Z0-9_-]*"', "os.getenv('SENDGRID_API_KEY')" | Set-Content main.py

# Replace in test_sendgrid.py
(Get-Content test_sendgrid.py) -replace '"SG\.[a-zA-Z0-9_-]*"', "os.getenv('SENDGRID_API_KEY')" | Set-Content test_sendgrid.py
```

## Verification Checklist
- [ ] `.env` file created with your actual SendGrid API key
- [ ] `.env` is listed in `.gitignore` (already done ✓)
- [ ] `load_dotenv()` is called at the top of both Python files
- [ ] All hardcoded API keys replaced with `os.getenv('SENDGRID_API_KEY')`
- [ ] Scripts tested locally and work correctly
- [ ] `python-dotenv` package installed
- [ ] Files can be pushed to GitHub without push protection errors
