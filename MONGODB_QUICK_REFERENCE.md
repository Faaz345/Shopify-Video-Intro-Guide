# 🎯 MongoDB Atlas Quick Reference Card

## 🚀 5-Minute Setup

### 1️⃣ Create Account
```
URL: https://www.mongodb.com/cloud/atlas/register
Method: Sign up with Google (fastest)
```

### 2️⃣ Create Free Cluster
```
Type: M0 FREE
Provider: AWS
Region: Nearest to you (check ping ms)
Name: shopify-cluster
```

### 3️⃣ Add Database User
```
Location: Security → Database Access → Add User
Username: shopifyguide
Password: [Auto-generate] → COPY THIS!
Privileges: Atlas Admin
```

### 4️⃣ Configure Network
```
Location: Security → Network Access → Add IP
Choose: Allow Access from Anywhere
IP: 0.0.0.0/0
Comment: Render deployment
```

### 5️⃣ Get Connection String
```
Location: Database → Connect → Connect your application
Driver: Node.js
Version: 4.1 or later
```

### 6️⃣ Format Your String
```
Original:
mongodb+srv://shopifyguide:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

Replace with:
mongodb+srv://shopifyguide:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/shopify-guide?retryWrites=true&w=majority
```

## ⚠️ Critical Points

### ✅ DO:
- Use 0.0.0.0/0 for Network Access (required for Render)
- Add database name after .net/ (shopify-guide)
- Copy password immediately when generated
- Test connection before deploying

### ❌ DON'T:
- Leave <password> in connection string
- Add quotes around URI in environment variables
- Forget to add database name
- Skip Network Access configuration

## 🧪 Test Command
```bash
# After updating connection string in test-mongodb-connection.js:
node test-mongodb-connection.js
```

## 🔧 Environment Variable Format
```env
MONGODB_URI=mongodb+srv://shopifyguide:actualpassword@cluster0.xxxxx.mongodb.net/shopify-guide?retryWrites=true&w=majority
```
**NO quotes around the value!**

## 🆘 Common Fixes

| Error | Solution |
|-------|----------|
| Authentication failed | Wrong password or username |
| Network timeout | Add 0.0.0.0/0 to Network Access |
| Cannot connect | Wait 2 mins after Network Access change |
| Invalid connection | Check database name after .net/ |

## 📍 MongoDB Atlas Dashboard Links

After login, bookmark these:
- **Clusters**: https://cloud.mongodb.com/v2/YOUR_PROJECT_ID#clusters
- **Database Access**: https://cloud.mongodb.com/v2/YOUR_PROJECT_ID#security/database/users
- **Network Access**: https://cloud.mongodb.com/v2/YOUR_PROJECT_ID#security/network/accessList

## 💡 Pro Tips

1. **Save credentials immediately:**
   ```
   Username: shopifyguide
   Password: [SAVE THIS NOW]
   Connection: [SAVE FULL STRING]
   ```

2. **Test locally first:**
   ```bash
   node test-mongodb-connection.js
   ```

3. **For Render deployment:**
   - Network Access MUST have 0.0.0.0/0
   - No quotes in environment variable
   - Include database name in URI

## 📊 Free Tier Limits
- **Storage**: 512 MB (enough for thousands of sessions)
- **Transfer**: 10 GB/month (more than enough)
- **Connections**: 500 concurrent (plenty)

## ✅ Success Checklist
- [ ] Account created
- [ ] M0 cluster running (green dot)
- [ ] Database user created
- [ ] Password saved
- [ ] Network Access has 0.0.0.0/0
- [ ] Connection string formatted correctly
- [ ] Local test passes
- [ ] Added to Render environment

---

**Total Setup Time: 5-10 minutes**

**Need detailed help?** See `MONGODB_ATLAS_SETUP.md`
