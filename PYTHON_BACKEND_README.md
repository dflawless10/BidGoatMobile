# BidGoat Python Backend

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your SendGrid API key:
```
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
```

**Important:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### 3. Get Your SendGrid API Key

1. Go to [SendGrid](https://app.sendgrid.com/)
2. Log in to your account
3. Navigate to Settings > API Keys
4. Create a new API key with "Mail Send" permissions
5. Copy the key and add it to your `.env` file

### 4. Verify Setup

Run the test script to verify your configuration:
```bash
python test_sendgrid.py
```

You should see:
```
✓ SendGrid API Key loaded from environment variable
✓ SendGrid client initialized successfully
✓ Test email message created
✓ Configuration is correct!
```

## File Structure

- `main.py` - Main email sending functionality
- `test_sendgrid.py` - Test script to verify SendGrid configuration
- `.env` - Your local environment variables (DO NOT COMMIT)
- `.env.example` - Template for required environment variables
- `requirements.txt` - Python dependencies

## Security Best Practices

1. **Never hardcode API keys** - Always use environment variables
2. **Never commit `.env` files** - These contain sensitive credentials
3. **Use `.env.example`** - Commit this to show what variables are needed (without actual values)
4. **Rotate keys regularly** - If a key is compromised, revoke it immediately in SendGrid dashboard

## Migration from Hardcoded Keys

If you have existing files with hardcoded SendGrid API keys, see [SENDGRID_MIGRATION_GUIDE.md](./SENDGRID_MIGRATION_GUIDE.md) for detailed migration instructions.

## Production Deployment

For production environments:
1. Do NOT use `.env` files
2. Set environment variables directly on your hosting platform:
   - **Heroku:** `heroku config:set SENDGRID_API_KEY=your_key`
   - **AWS:** Use AWS Secrets Manager or Parameter Store
   - **Azure:** Use Azure Key Vault
   - **Google Cloud:** Use Secret Manager

## Common Issues

### "SENDGRID_API_KEY not found in environment variables"
- Make sure you've created a `.env` file in the project root
- Verify the variable name is exactly `SENDGRID_API_KEY`
- Check that `python-dotenv` is installed

### Emails not sending
- Verify your API key is valid and not revoked
- Check SendGrid dashboard for error messages
- Ensure your SendGrid account is active and verified

## Support

For SendGrid-specific issues, refer to the [SendGrid Documentation](https://docs.sendgrid.com/).
