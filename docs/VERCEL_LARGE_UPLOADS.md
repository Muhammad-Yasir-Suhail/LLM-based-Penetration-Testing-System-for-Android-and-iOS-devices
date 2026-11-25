# APK uploads and storage on Vercel (Vercel Blob setup)

**Who this is for:** the team member who manages the Vercel project for VulnScope (vulnscope-fyp.vercel.app).
**Time needed:** about 10 minutes.
**Code changes needed:** none. The code is already in the repo; it switches on by itself once the steps below are done.

---

## 1. Why this is needed

1. **Size.** Vercel functions reject any request body larger than **4.5 MB** (error `413 FUNCTION_PAYLOAD_TOO_LARGE`). Real APKs are often 50 MB to 4 GB, so they cannot be sent to our API directly.
2. **Keeping the files.** VulnScope **keeps every uploaded APK, complete and unmodified,** for future processing (for example our own decompilation engine). Vercel functions have no permanent disk (`/tmp` is wiped), so the files must live in storage that persists.

**Vercel Blob** solves both: the browser uploads the APK **straight to Blob storage** (no 4.5 MB limit; Blob accepts files up to 5 TB), and Blob keeps it permanently.

## 2. What it does, step by step

```
User picks an APK (up to 4 GB) on /analysis/run
        |
        | 1. browser asks our API for a short-lived upload token   (/api/analysis/blob-upload)
        | 2. browser uploads the COMPLETE file to Vercel Blob       (in parallel parts, with a progress bar)
        v
   Vercel Blob, private store, folder apks/   <- the full APK is KEPT here permanently
        |
        | 3. browser asks our API to analyse it                     (/api/analysis/run)
        | 4. our function reads the file from Blob (authenticated, by byte range),
        |    runs the current security analysis and fingerprints the whole file (SHA-256 / SHA-1 / MD5)
        | 5. the session records where the APK is kept               (session.storedApk)
        v
   Analysis results shown to the user; the APK stays in Blob
```

- Once Blob is connected, **every** upload goes through Blob, including small ones, so no app is ever lost.
- The stored file is the **whole APK, byte for byte**: all assets, libraries, resources and dex files. It does not depend on what the current analysis reads, so a future pipeline or decompiler can use it as is.
- Tested locally: a 3.9 GB APK was kept byte-identical and analysed in 17 s. A 4.2 GB file was rejected as over the limit.

## 3. Before you start: which plan (important, because files are kept)

Because every APK is **kept**, Blob storage **grows with every upload** and never shrinks on its own.

| | Hobby (free) | Pro |
|---|---|---|
| Blob storage included | 1 GB / month | usage-based (paid from monthly credit) |
| Blob data transfer included | 10 GB | usage-based |
| If limits are exceeded | **Blob is blocked for 30 days** | billed on demand |
| Max function duration | 300 s | 800 s |

**Use the Pro plan.** On Hobby, a single large APK can use up the whole 1 GB, and exceeding it locks Blob for 30 days. (Source: Vercel docs, "Vercel Blob usage and pricing" and "Functions duration".) Keep an eye on **Usage → Blob** after launch.

## 4. Setup steps

### Step 1: Create the Blob store
1. Open the Vercel dashboard and select the **VulnScope project**.
2. Go to the **Storage** tab, click **Create**, then choose **Blob**.
3. Name it, for example `vulnscope-apks`.
4. **Access: choose `Private`.** The uploaded apps are other people's software kept permanently, so they must not be downloadable by anyone with a link. Our server reads them with the store's token. *The access mode cannot be changed after the store is created.*
5. Region: pick the region closest to the project's function region (by default `iad1`, Washington D.C.).

### Step 2: Connect the store to the project
1. In the Blob store, open the **Projects** tab and click **Connect to Project**.
2. Select the VulnScope project.
3. Environments: tick **Production** and **Preview**. Tick **Development** only if someone tests with Blob locally.
4. **Important:** tick **"Add a read-write token env var to this connection"**. This creates `BLOB_READ_WRITE_TOKEN`, which uploads and reads require.

### Step 3: Check function settings
Project **Settings > Functions**:
- **Fluid compute: enabled** (the default for new projects). The analysis route uses `maxDuration = 300` seconds, which is the Hobby maximum and allowed on Pro.
- Function memory: the default (2 GB) is enough. The function never loads the whole APK into memory.

### Step 4: Environment variables (only if you differ from the defaults)
In **Settings > Environment Variables**:

| Name | Default | When to set it |
|---|---|---|
| `BLOB_ACCESS` | `private` | Set to `public` **only** if the store was created as Public. It must match the store. |
| `MAX_APK_SIZE_BYTES` | `4294967296` (4 GB) | To change the upload limit. |

### Step 5: Redeploy
Environment variables only reach **new** deployments. Go to **Deployments**, open the latest production deployment, choose **⋯ > Redeploy**, or push any commit.

## 5. Check that it works

1. Open **https://vulnscope-fyp.vercel.app/api/analysis/upload-config**. You should see:
   ```json
   { "maxBytes": 4294967296, "directLimitBytes": 4404019, "blobEnabled": true, "blobAccess": "private", "onVercel": true }
   ```
   If `blobEnabled` is `false`, the token is missing (step 2.4) or you have not redeployed (step 5).
2. Open **/analysis/run**, choose **Upload Authorized APK**, and drop any APK. You should see "Uploading APK x%", then the results. The **Target APK** tab shows "Complete APK kept: Vercel Blob (private): apks/…".
3. In the Blob store's **Browser** tab, the `apks/` folder should now **contain the uploaded APK**, at its full size.

## 6. Where the kept APKs are, and how to get them

- **Vercel:** Blob store → **Browser** tab → `apks/`. Files can be downloaded from the dashboard, or with the SDK/CLI using the token (for example `vercel blob list`).
- **In each analysis session:** the `storedApk` field (also in "Export Audit JSON") holds the location, pathname, size and SHA-256 of the kept file.
- **Local development** (`npm run dev`, no Blob token): every upload is kept in `storage/apks/<sha256>_<file name>`. That folder is git-ignored and is not touched by the 24-hour cleanup of temporary uploads.
- **Deleting:** nothing is deleted automatically. Remove files from the Blob **Browser** tab when they are no longer needed.

## 7. Troubleshooting

| What you see | Cause | Fix |
|---|---|---|
| "This deployment accepts APKs up to 4.2 MB…" | Blob not connected, or token not added | Steps 2 and 5 |
| `Large uploads are not configured` (HTTP 501) | `BLOB_READ_WRITE_TOKEN` missing in this environment | Step 2.4 for that environment, then redeploy |
| Upload fails with an access / "private" / "public" error | `BLOB_ACCESS` does not match the store's access mode | Set `BLOB_ACCESS` to the store's mode (`private` or `public`), redeploy |
| Analysis fails with "could not be reached (403)" | Server cannot read a private file: token missing or for a different store | Re-check step 2.4, redeploy |
| Upload reaches 100%, then "timed out" (HTTP 504) | Analysis ran longer than the function limit | Make sure Fluid compute is on. On Pro, `maxDuration` in `src/app/api/analysis/run/route.ts` can go up to 800. The APK is still kept in Blob. |
| "APK exceeds the 4.00 GB limit" | File larger than `MAX_APK_SIZE_BYTES` | Expected. Raise the variable if needed. |
| Blob suddenly unavailable on Hobby | Hobby usage limits exceeded (30-day block) | Upgrade to Pro |

## 8. Security and cost notes

- **Anyone can upload, and every upload is kept.** The site has no login, so anyone can add files to our storage, and costs grow with it. Watch **Usage → Blob**. If it is abused, add a login check or rate limit in `onBeforeGenerateToken` in `src/app/api/analysis/blob-upload/route.ts` (Vercel recommends checking the user there).
- The store is **private**: kept APKs cannot be downloaded through a link, only with the store's token (dashboard, SDK, CLI, or our server).
- Only `.apk` files up to the size limit can get an upload token.
- Our server sends the store token only to Vercel Blob's own domain (`*.blob.vercel-storage.com`), and refuses to read from any other address.
- Costs: **storage** grows with every kept APK. **Data transfer** is charged when files are read (each analysis reads the full APK once to fingerprint it). Uploads themselves are not charged as transfer.

---

**Files involved** (for reference): `src/app/api/analysis/blob-upload/route.ts` (issues upload tokens), `src/app/api/analysis/upload-config/route.ts` (tells the page how to upload), `src/app/api/analysis/run/route.ts` (keeps and analyses the APK, records `storedApk`), `src/lib/security/streamingApk.ts` (reads very large APKs without loading them into memory), `src/lib/security/uploadConfig.ts` (limits, Blob access mode), `src/lib/security/storageManager.ts` (`storage/apks/` for local copies).
