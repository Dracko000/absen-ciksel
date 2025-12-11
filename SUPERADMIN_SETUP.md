# Super Admin Registration Token Setup

To create the first super admin account, you need to:

1. Generate a secure registration token:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Replace the placeholder token in `.env`:
   ```env
   SUPERADMIN_REGISTRATION_TOKEN="your-generated-token-here"
   ```

3. Access the registration form using the special link:
   ```
   http://localhost:3000/register-superadmin?token=your-generated-token-here
   ```

**Important Security Notes:**
- Keep the registration token secret and do not expose it in client-side code
- After creating the first super admin account, consider disabling the registration endpoint
- The registration link should only be shared with authorized personnel