// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: false,
  apiUrl: 'http://localhost:8081/api/',

  businessApiUrl: 'http://localhost:3333/api/',

  firebase: {
    apiKey: "AIzaSyCDdtpmutpi0uWMSzmNR3QHDp4y5ErDAUw",
    authDomain: "project-travelagency.firebaseapp.com",
    projectId: "project-travelagency",
    storageBucket: "project-travelagency.firebasestorage.app",
    messagingSenderId: "70975154469",
    appId: "1:70975154469:web:2b95f9253135cebe2512cc"
  }


};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
