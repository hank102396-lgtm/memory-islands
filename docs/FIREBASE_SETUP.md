# Firebase 跨裝置資料設定

## 1. 建立 Firebase 專案

1. 在 Firebase Console 建立專案，新增 Web App。
2. 開啟 Firestore Database。
3. 開啟 Storage。
4. 到 Authentication → Sign-in method，啟用 Anonymous 匿名登入。

## 2. 本機設定

複製 `.env.example` 為 `.env.local`，填入 Firebase Web App 的設定：

```env
VITE_FIREBASE_API_KEY=你的 apiKey
VITE_FIREBASE_AUTH_DOMAIN=你的 authDomain
VITE_FIREBASE_PROJECT_ID=你的 projectId
VITE_FIREBASE_STORAGE_BUCKET=你的 storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=你的 messagingSenderId
VITE_FIREBASE_APP_ID=你的 appId
```

## 3. 套用資料庫規則

專案內的 `firestore.rules` 與 `storage.rules` 會要求匿名登入後才能讀寫。可在 Firebase CLI 執行：

```bash
firebase deploy --only firestore:rules,storage
```

也可以將兩個規則檔案的內容貼到 Firebase Console 對應的 Rules 頁面並發布。

## 4. GitHub Pages 設定

在 GitHub Repository → Settings → Secrets and variables → Actions → New repository secret，新增以下 6 個 Secrets：

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

部署工作流程會在建置時注入這些設定。完成後，不同裝置開啟網站會共用 Firestore 的照片與留言，新增或刪除也會即時同步。
