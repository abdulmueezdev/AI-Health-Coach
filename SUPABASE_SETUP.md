# Supabase Dashboard Setup

## Enable Email Confirmation

To ensure that users must confirm their email address before accessing the application, you need to enable Email Confirmations in your Supabase project settings.

1. Go to the Supabase Dashboard for your project: 
   [https://supabase.com/dashboard/project/gvhszzielsrmjshwvftc](https://supabase.com/dashboard/project/gvhszzielsrmjshwvftc)
2. In the left sidebar, navigate to **Authentication** > **Providers**.
3. Under the **Email** provider settings, find the **Confirm email** toggle.
4. Turn **Confirm email** ON.
5. Save your changes.

### Site URL & Redirect URLs
Ensure your Site URL and Redirect URLs are configured correctly for local development and production.
- Go to **Authentication** > **URL Configuration**.
- Set the **Site URL** to `http://localhost:3000` (for local development) or your production domain.
- When users click the confirmation link in their email, they will be redirected to the Site URL (e.g. `http://localhost:3000/?code=...`). The Next.js middleware is configured to intercept the `code` parameter, exchange it for a valid session, and redirect them appropriately.

### Customizing the Email Template
You can optionally customize the confirmation email sent to users:
- Go to **Authentication** > **Email Templates**.
- Select the **Confirm signup** template.
- Make sure the link variable `{{ .ConfirmationURL }}` is present in the email body so users can click it to confirm their account.
