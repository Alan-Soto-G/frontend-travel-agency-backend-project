import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'http://localhost:8081/api/',
  businessApiUrl: 'http://localhost:3333/api/',
  chatbotWebhookUrl: 'https://precongested-cherise-shieldlessly.ngrok-free.dev/webhook/chat-bot',
  msSecurity: 'http://localhost:8081',
  firebase: {
    apiKey: "AIzaSyCDdtpmutpi0uWMSzmNR3QHDp4y5ErDAUw",
    authDomain: "project-travelagency.firebaseapp.com",
    projectId: "project-travelagency",
    storageBucket: "project-travelagency.firebasestorage.app",
    messagingSenderId: "70975154469",
    appId: "1:70975154469:web:2b95f9253135cebe2512cc"
  }
};
