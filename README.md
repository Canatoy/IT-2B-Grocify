# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



For the expo development 
Use android stodio 


# IT-2B-Grocify

This is a grocery app using Expo and Clerk.

## Getting Started
1. Run `npm install`.
2. Ensure you have NDK 26.1.10909125 installed.
3. On Windows, move your NDK to `C:\AndroidNDK` to avoid path errors.
4. Create a `local.properties` in the `/android` folder with:
   `ndk.dir=C\:\\AndroidNDK\\27.1.12297006`

## Running the App
Run `npx expo run:android` to start the development build.


# IT-2B-Grocify

This is a grocery app using Expo and Clerk. This project uses **Native Clerk Components**, so it requires a Development Build to run.

## 🛠️ Getting Started
1. **Clone the repo:** `git clone <your-repo-url>`
2. **Install dependencies:** `npm install`
3. **Install EAS CLI:** `npm install -g eas-cli`
4. **Login:** `eas login` (Login with your Expo account)

## 🔑 Clerk Environment Setup
The login screen won't load without API keys. 
1. Create a file named `.env` in the root directory.
2. Paste the following line (Ask Rasheed for the actual key):
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
   ```

## 🚀 How to Run (Development Build)
Since we use native components, **you cannot use standard Expo Go**. 

### 1. Download & Install the App
Run this command to automatically download and install the latest build onto your running emulator:
```bash
eas build:run -p android --latest
```
*(Alternatively, download the APK from the [Expo Dashboard](https://expo.dev...) and drag it into your emulator).*

### 2. Start the Server
Once the app is installed on the emulator, run:
```bash
npx expo start
```

### 3. Connect
Open the "Grocify" app icon on your emulator home screen (do not use Expo Go). It will load your local code changes instantly.

---
## 📝 Note for Windows Users
If you decide to build the `android` folder locally instead of using EAS, ensure you have **NDK 26.1.10909125** installed and mapped in `local.properties`. Otherwise, just use the **EAS commands** above to skip the setup!












