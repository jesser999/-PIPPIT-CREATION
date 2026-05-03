# CloudFront Setup Guide — PIPPIT CREATION

## Step-by-step (AWS Console)

### 1. Create Distribution
- Go to **CloudFront → Distributions → Create Distribution**
- **Origin domain**: select your S3 bucket (`pippit-creation-assets`)
- **Origin access**: select **Origin access control (OAC)** → Create new OAC
- **Viewer protocol policy**: `Redirect HTTP to HTTPS`

### 2. Bucket Policy (after OAC creation)
CloudFront will display a bucket policy to copy. Paste it into:
**S3 → pippit-creation-assets → Permissions → Bucket policy**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::pippit-creation-assets/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DIST_ID"
        }
      }
    }
  ]
}
```

### 3. Cache Behaviors
| Path Pattern | Cache Policy | TTL |
|---|---|---|
| `thumbnails/*` | CachingOptimized | 1 year (immutable) |
| `characters/*` | CachingOptimized | 1 year (immutable) |
| `frames/*` | CachingOptimized | 1 year (immutable) |

### 4. Set Environment Variables
After distribution is created, copy the domain name (e.g., `d1234abcde.cloudfront.net`) and set:

```bash
# In AWS ECS/EC2 task definition for the API:
CLOUDFRONT_DOMAIN=https://d1234abcde.cloudfront.net

# In Next.js environment (Vercel / EC2):
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=https://d1234abcde.cloudfront.net
```

### 5. Invalidation (after bulk upload)
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

## Redis in Production (choose one)

| Option | Notes |
|---|---|
| **AWS ElastiCache (Redis)** | Best for ECS/EC2 deployments. Create a Redis 7 cluster in the same VPC as your API. Set `REDIS_URL=redis://your-cluster-endpoint:6379` |
| **Upstash** | Serverless, HTTP-based. Works anywhere. Free tier available. Use `rediss://` TLS URL. |
| **Redis Cloud** | Managed Redis with free 30 MB tier. Good for staging. |
