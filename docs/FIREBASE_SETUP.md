# Firebase and Cloudinary setup

## Firebase

1. Create a Firebase project and a Web App.
2. Create a Cloud Firestore database.
3. In Authentication, enable the Anonymous sign-in provider.
4. Publish the rules in `firestore.rules` from the Firestore Rules page.

Firebase Spark is enough for Firestore and authentication. Firebase Storage is not used by this project.

## Cloudinary image storage

1. Create a Cloudinary account and open the Cloudinary Console.
2. Open Settings, then Upload presets.
3. Create an upload preset and set its Signing mode to **Unsigned**.
4. Restrict the preset to image files and set a reasonable maximum file size.
5. Copy the Cloud name and the upload preset name.

The browser uploads images directly to Cloudinary. The returned image URL is saved in the Firestore `memories` document.

## Local environment

Copy `.env.example` to `.env.local` and fill in the Firebase and Cloudinary values:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset
```

## GitHub Pages

Add the same eight values as Repository Secrets under Settings, Secrets and variables, Actions:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

The Pages workflow injects these values during the production build.
