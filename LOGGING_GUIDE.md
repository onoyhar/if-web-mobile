# Logging System Documentation

## Overview
Sistem logging lengkap dengan level DEBUG, INFO, WARN, ERROR untuk development dan debugging.

## Features

✅ **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR  
✅ **Colored Output**: Different colors for each level  
✅ **Timestamps**: Automatic timestamps on each log  
✅ **Grouped Logs**: Group related logs together  
✅ **Environment Aware**: Auto-enabled in development  
✅ **Configurable**: Can enable/disable at runtime  

## Usage

### Import Logger

```typescript
import { logger } from "@/lib/logger";
```

### Log Levels

#### 1. DEBUG - Detailed debugging information
```typescript
logger.debug("Component mounted");
logger.debug("State updated", { oldValue, newValue });
```

#### 2. INFO - General informational messages
```typescript
logger.info("User logged in", { userId: user.id });
logger.info("Profile saved successfully");
```

#### 3. WARN - Warning messages
```typescript
logger.warn("File size exceeds limit", { size, limit });
logger.warn("No authenticated user found");
```

#### 4. ERROR - Error messages
```typescript
logger.error("Failed to save profile", error);
logger.error("Upload failed", { message: error.message });
```

### Grouped Logs

Group related operations:

```typescript
logger.group("User Signup");
logger.info("Starting signup process");
logger.debug("Validating email");
logger.info("Signup successful");
logger.groupEnd();
```

## Configuration

### Environment Variables

Add to your `.env` or `.env.local`:

```env
# Enable/disable logging (default: enabled in development)
NODE_ENV=development

# Set log level: DEBUG | INFO | WARN | ERROR
NEXT_PUBLIC_LOG_LEVEL=DEBUG
```

### Log Levels Hierarchy

```
DEBUG (0) - Shows everything
  ↓
INFO (1)  - Shows INFO, WARN, ERROR
  ↓
WARN (2)  - Shows WARN, ERROR
  ↓
ERROR (3) - Shows only ERROR
```

### Runtime Configuration

```typescript
// Enable/disable logging
logger.setEnabled(true);

// Set log level
logger.setLevel("INFO");

// Enable/disable colors
logger.setColorize(false);

// Enable/disable timestamps
logger.setTimestamp(false);
```

## Examples

### Login Flow

```typescript
logger.group("User Login");
logger.info("Starting login process", { email });

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

if (error) {
  logger.error("Login failed", error);
  logger.groupEnd();
  return;
}

logger.info("Login successful", { userId: data.user?.id });
logger.debug("Redirecting to home");
logger.groupEnd();
```

### File Upload

```typescript
logger.group("Upload Profile Photo");
logger.info("Starting photo upload", { 
  fileName: file.name, 
  fileSize: `${(file.size / 1024).toFixed(2)} KB`,
  fileType: file.type 
});

try {
  logger.debug("Uploading to storage", { filePath, bucket: "profiles" });
  
  const { error } = await supabase.storage
    .from("profiles")
    .upload(filePath, file);

  if (error) throw error;

  logger.info("File uploaded successfully");
  logger.groupEnd();
} catch (error) {
  logger.error("Photo upload failed", error);
  logger.groupEnd();
}
```

### Profile Save

```typescript
logger.group("Save Profile");
logger.info("Starting profile save");

const profileData = {
  id: user.id,
  name: profile.name,
  age: profile.age,
};

logger.debug("Saving profile data", profileData);

const { error } = await supabase
  .from("users_profile")
  .upsert(profileData);

if (error) {
  logger.error("Failed to save profile", error);
  logger.groupEnd();
  return;
}

logger.info("Profile saved successfully");
logger.groupEnd();
```

## Log Output Examples

### Console Output (Development)

```bash
[2025-11-19T12:00:00.000Z] [DEBUG] LoginPage mounted

🔍 User Login
[2025-11-19T12:00:01.000Z] [INFO] Starting login process
Data: {
  "email": "test@example.com"
}

[2025-11-19T12:00:02.000Z] [INFO] Login successful
Data: {
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "test@example.com"
}

[2025-11-19T12:00:02.000Z] [DEBUG] Redirecting to home
```

### Error Example

```bash
[2025-11-19T12:00:05.000Z] [ERROR] Failed to upload photo
Data: {
  "message": "Storage bucket not found",
  "name": "StorageError",
  "stack": "Error: Storage bucket not found\n    at ..."
}
```

## Where Logs Are Added

### 1. Login/Signup (`/app/login/page.tsx`)
- User authentication flow
- Signup process
- Quick login
- Logout

### 2. Profile Page (`/app/account/personal-info/page.tsx`)
- Profile data loading
- Photo upload
- File validation
- Profile save

### 3. Home Page (`/app/page.tsx`)
- Page mount
- Onboarding check
- New user detection
- Profile completeness check

### 4. Register Page (`/app/register/page.tsx`)
- Redirect to signup

## Best Practices

### ✅ DO:
- Use DEBUG for detailed state/props
- Use INFO for user actions (login, save, etc)
- Use WARN for potential issues
- Use ERROR for actual errors
- Group related operations
- Include relevant context data

### ❌ DON'T:
- Log sensitive data (passwords, tokens)
- Log in production (auto-disabled)
- Over-log (too much noise)
- Forget to close groups

## Debugging Tips

### 1. Enable Debug Level
```typescript
logger.setLevel("DEBUG");
```

### 2. Check Console
Open browser DevTools → Console tab

### 3. Filter Logs
Use browser console filters:
- `[DEBUG]` - Show only debug logs
- `[ERROR]` - Show only errors
- `User` - Show logs containing "User"

### 4. Network Issues
Check Supabase logs:
- Dashboard → Logs
- API logs
- Database logs

## Production

In production, logging is **automatically disabled** to:
- Improve performance
- Reduce bundle size
- Protect sensitive information

To enable in production (not recommended):
```typescript
logger.setEnabled(true);
```

## Troubleshooting

### Issue: No logs showing

**Check:**
1. `NODE_ENV` is set to `development`
2. Browser console is open
3. Log level is not too high (use DEBUG)
4. Logger is enabled: `logger.setEnabled(true)`

### Issue: Too many logs

**Solution:**
1. Increase log level to INFO or WARN
2. Remove unnecessary debug statements
3. Use groups to collapse logs

### Issue: Colors not showing

**Solution:**
```typescript
logger.setColorize(true);
```

## Testing

### Test All Levels

```typescript
logger.debug("This is debug");
logger.info("This is info");
logger.warn("This is warning");
logger.error("This is error");
```

### Test Grouping

```typescript
logger.group("Test Group");
logger.info("Inside group");
logger.debug("More details");
logger.groupEnd();
```

## Performance

Logging overhead is **minimal** in development and **zero** in production (auto-disabled).

---

## Quick Reference

```typescript
// Basic logging
logger.debug(message, data?);
logger.info(message, data?);
logger.warn(message, data?);
logger.error(message, error?);

// Grouped logs
logger.group(label);
logger.groupEnd();

// Configuration
logger.setEnabled(boolean);
logger.setLevel("DEBUG" | "INFO" | "WARN" | "ERROR");
logger.setColorize(boolean);
logger.setTimestamp(boolean);
```

---

✅ **Logging system ready!** Check browser console untuk melihat logs.
