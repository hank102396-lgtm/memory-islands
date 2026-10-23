# 記憶島 · Memory Islands

Vue 3 + Vite + Tailwind CSS 的情侶互動記憶收藏遊戲。

## 啟動

```bash
npm install
npm run dev
```

未設定 Firebase 時，專案會使用瀏覽器 localStorage 與 demo 照片預覽；設定 Firebase 後會自動切換為 Firestore + Storage。

## Firebase 設定

1. 在 Firebase Console 建立 Web App、啟用 Firestore Database 與 Storage。
2. 複製 `.env.example` 為 `.env.local`，填入 Firebase Web App 設定。
3. 建議在 Firestore 建立 `memories` collection，文件欄位由 `createMemoryUseCase` 寫入。

## Clean Architecture

- `src/domain/`：Memory entity 與 Island 定義，不依賴 Vue 或 Firebase。
- `src/usecases/`：取得與建立記憶的應用流程，透過 service interface 解耦資料來源。
- `src/infrastructure/`：Firebase Firestore / Storage 實作，並提供無設定時的 demo adapter。
- `src/presentation/`：Vue 元件，只透過 use case 取得或寫入資料。
