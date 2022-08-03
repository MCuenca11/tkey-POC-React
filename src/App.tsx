import { useEffect, useState } from "react";

 

import "./App.css";

import ThresholdKey from "@tkey/default";

import WebStorageModule, { WEB_STORAGE_MODULE_NAME } from "@tkey/web-storage";

import TorusServiceProvider from "@tkey/service-provider-torus";

import TorusStorageLayer from "@tkey/storage-layer-torus";

import SecurityQuestionsModule from "@tkey/security-questions";

import ShareTransferModule from "@tkey/share-transfer";

import Row from "react-bootstrap/Row";

import Col from "react-bootstrap/Col";

import Table from "react-bootstrap/Table";

import popup from "sweetalert";

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic, mnemonicToEntropy } from "bip39";

import HDKey from "hdkey";

import utils, { keccak256, toChecksumAddress, privateToAddress } from 'ethereumjs-util';

import { generateAddressFromPublicKey, ShareStore } from "@tkey/common-types";

import * as http from "http";

import * as https from 'https';

// import fetch from 'node-fetch';

// import axios from 'axios';

import jwt_decode , { JwtPayload } from "jwt-decode";

// var unirest = require("unirest");

// import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

// import { Web3Auth } from "@web3auth/web3auth";

// import TorusSdk from "@toruslabs/torus-direct-web-sdk";

 

declare global {

  interface Window {

    secrets: any;

  }

}

 

const clientId = "BC9mE4fQQ2Wmpjq0qioiZy3KQiqdhjisaBXLQ1XqxJsqKXqb1IJGhrGT50cE-6Ow1L9fHe6_m8c9tKjfnulh8jI";


 

// These are the Torus supported verifiers:

const GOOGLE = "google";

const FACEBOOK = "facebook";

const REDDIT = "reddit";

const DISCORD = "discord";

const TWITCH = "twitch";

const GITHUB = "github";

const APPLE = "apple";

const LINKEDIN = "linkedin";

const TWITTER = "twitter";

const WEIBO = "weibo";

const LINE = "line";

const EMAIL_PASSWORD = "email_password";

const PASSWORDLESS = "passwordless";

const HOSTED_EMAIL_PASSWORDLESS = "hosted_email_passwordless";

const HOSTED_SMS_PASSWORDLESS = "hosted_sms_passwordless";

// Torus Domain

const AUTH_DOMAIN = "https://torus-test.auth0.com";

// My Domain

// const AUTH_DOMAIN = "dev-f-j0-dka.us.auth0.com";

 

const LOGIN_HINT = "";

 

const loginConnectionMap: Record<string, any> = {

  [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },

  [PASSWORDLESS]: { domain: AUTH_DOMAIN, login_hint: LOGIN_HINT },

  [HOSTED_EMAIL_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "", isVerifierIdCaseSensitive: false },

  [HOSTED_SMS_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "" },

  [APPLE]: { domain: AUTH_DOMAIN },

  [GITHUB]: { domain: AUTH_DOMAIN },

  [LINKEDIN]: { domain: AUTH_DOMAIN },

  [TWITTER]: { domain: AUTH_DOMAIN },

  [WEIBO]: { domain: AUTH_DOMAIN },

  [LINE]: { domain: AUTH_DOMAIN },

 

  // I added this

  [GOOGLE]: { domain: AUTH_DOMAIN },

};

 

// This maps the verifiers to their repsective details needed.

 

const verifierMap: Record<string, any> = {

  [GOOGLE]: {

    name: "Google",

    typeOfLogin: "google",

    // Tkey Client ID

    // clientId: "134678854652-vnm7amoq0p23kkpkfviveul9rb26rmgn.apps.googleusercontent.com",

    // My client ID

    clientId: "648279118468-3p8fi5cha7sj4kv3amqiah3kff591srm.apps.googleusercontent.com",

    // My auth0 client id

    // clientId: "wdpwTWRO0s0agTAsvKwuqq4zuYnhKMDO",

    // verifier: "web3auth-testnet-verifier",

    verifier: "POC-Google-Verifier",

  },

  [FACEBOOK]: { name: "Facebook", typeOfLogin: "facebook", clientId: "617201755556395", verifier: "facebook-lrc" },

  [REDDIT]: { name: "Reddit", typeOfLogin: "reddit", clientId: "YNsv1YtA_o66fA", verifier: "torus-reddit-test" },

  [TWITCH]: { name: "Twitch", typeOfLogin: "twitch", clientId: "f5and8beke76mzutmics0zu4gw10dj", verifier: "twitch-lrc" },

 [DISCORD]: { name: "Discord", typeOfLogin: "discord", clientId: "682533837464666198", verifier: "discord-lrc" },

  [EMAIL_PASSWORD]: {

    name: "Email Password",

    typeOfLogin: "email_password",

    clientId: "sqKRBVSdwa4WLkaq419U7Bamlh5vK1H7",

    verifier: "torus-auth0-email-password",

  },

  [PASSWORDLESS]: {

    name: "Passwordless",

    typeOfLogin: "passwordless",

    clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",

    verifier: "torus-auth0-passwordless",

  },

  [APPLE]: { name: "Apple", typeOfLogin: "apple", clientId: "m1Q0gvDfOyZsJCZ3cucSQEe9XMvl9d9L", verifier: "torus-auth0-apple-lrc" },

  // Torus

  [GITHUB]: { name: "Github", typeOfLogin: "github", clientId: "PC2a4tfNRvXbT48t89J5am0oFM21Nxff", verifier: "torus-auth0-github-lrc" },

  // Mine

  // [GITHUB]: { name: "Github", typeOfLogin: "github", clientId: "wdpwTWRO0s0agTAsvKwuqq4zuYnhKMDO", verifier: "torus-auth0-github-lrc" },

  [LINKEDIN]: { name: "Linkedin", typeOfLogin: "linkedin", clientId: "59YxSgx79Vl3Wi7tQUBqQTRTxWroTuoc", verifier: "torus-auth0-linkedin-lrc" },

  [TWITTER]: { name: "Twitter", typeOfLogin: "twitter", clientId: "A7H8kkcmyFRlusJQ9dZiqBLraG2yWIsO", verifier: "torus-auth0-twitter-lrc" },

  [WEIBO]: { name: "Weibo", typeOfLogin: "weibo", clientId: "dhFGlWQMoACOI5oS5A1jFglp772OAWr1", verifier: "torus-auth0-weibo-lrc" },

  [LINE]: { name: "Line", typeOfLogin: "line", clientId: "WN8bOmXKNRH1Gs8k475glfBP5gDZr9H1", verifier: "torus-auth0-line-lrc" },

  [HOSTED_EMAIL_PASSWORDLESS]: {

    name: "Hosted Email Passwordless",

    typeOfLogin: "jwt",

    clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",

    verifier: "torus-auth0-passwordless",

  },

  [HOSTED_SMS_PASSWORDLESS]: {

    name: "Hosted SMS Passwordless",

    typeOfLogin: "jwt",

    clientId: "nSYBFalV2b1MSg5b2raWqHl63tfH3KQa",

    verifier: "torus-auth0-sms-passwordless",

  },

};

 

// This is to be used with the aggregate login (Hasn't worked yet)

// const AGGREGATE_LOGIN = {

//   aggregateVerifierType: "single_id_verifier",

//   verifierIdentifier: "tkey-google",

//   subVerifierDetailsArray: [

//     {

//       typeOfLogin: "google",

//       verifier: "web3auth-testnet-verifier",

//       clientId: "134678854652-vnm7amoq0p23kkpkfviveul9rb26rmgn.apps.googleusercontent.com",

//     },

//   ],

// };

 

// 1. Setup Service Provider

const directParams = {

  baseUrl: `${window.location.origin}/serviceworker`,

  enableLogging: true,

  network: "testnet" as any,

};

const serviceProvider = new TorusServiceProvider({ directParams });

 

// const serviceProvider = new TorusSdk({

//   baseUrl: `${window.location.origin}/serviceworker`,

//   enableLogging: true,

//   network: "testnet", // details for test net

// });

 

// 2. Initializing tKey

const webStorageModule = new WebStorageModule();

const securityQuestionsModule = new SecurityQuestionsModule();

const shareTransferModule = new ShareTransferModule();

const storageLayer = new TorusStorageLayer({ hostUrl: "https://metadata.tor.us" });

 

// Creating the ThresholdKey instance

const tKey = new ThresholdKey({

  serviceProvider: serviceProvider,

  storageLayer,

  modules: { webStorage: webStorageModule, securityQuestions: securityQuestionsModule, shareTransfer: shareTransferModule },

});

 

const App = function App() {

  // The following sets up some of the UI to begin.

  const [authVerifier, setAuthVerifier] = useState<string>("google");

  const [consoleText, setConsoleText] = useState<any>("Output Will Appear Here. You Can Inspect The Page To Get More Details.");

  const [derivedAccount, setDerivedAccount] = useState<any>("Output will appear here");

  const [mnemonics, setMnemonics] = useState<any>("");

  const [bip39Seed, setBIP39Seed] = useState<any>("");

  const [entropy, setEntropy] = useState<any>("");

  const [hdKey, setHDKey] = useState<any>(null);

  const [derivationPath, setDerivationPath] = useState<any>("m/44'/60'/0'/0");

  const [privateKey, setPrivateKey] = useState<any>("");

  const [publicKey, setPublicKey] = useState<any>("");

  const [privateExtendedKey, setPrivateExtendedKey] = useState<any>("");

  const [publicExtendedKey, setPublicExtendedKey] = useState<any>("");

  const [shareDetails, setShareDetails] = useState<string>("0x0");

  const [shareToggle, setShareToggle] = useState<string>("split");

  const [total, setTotal] = useState<number>(3);

  const [threshold, setThreshold] = useState<number>(2);

 

  // Init Service Provider

  useEffect(() => {

    const init = async () => {

      await (tKey.serviceProvider as TorusServiceProvider).init({ skipSw: false });

      try {

      } catch (error) {

        console.error(error);

      }

    };

    init();

  }, []);

 

  // ************THE FOLLOWING ARE THE MAIN FUNCTIONS:***************

 

  // ******************COLUMN 1 MAIN FUNCTIONS:*********************

 

  // Initializes key using social provider and device and then adds on security question share.

  const initializeTkeyUsing3Shares = async () => {

    try {

      setConsoleText("Initializing a New Key Using Device, Provider, and Password Shares...");

      await triggerSocialProviderLogin();

      await tKey.initialize();

      appendConsoleText("Successfully Generated New Shares With Device And Provider");

      const res = await tKey._initializeNewKey({ initializeModules: true });

      console.log("response from _initializeNewKey", res);

      setShareDetails(res.privKey.toString("hex"));

      await generateNewShareWithPassword();

    } catch (error) {

      appendConsoleText("Failed To Inititialize New TKey");

      console.error(error, "caught");

    }

  };

 

  const loginUsingDeviceAndProvider = async () => {

    try {

      setConsoleText("Getting The Social Provider Share...");

      await triggerSocialProviderLogin();

      await tKey.initialize();

      appendConsoleText("Successfully Acquired Social Provider Share!");

 

      appendConsoleText("Getting The Local Device Share...");

      const webStorageModule = tKey.modules["webStorage"] as WebStorageModule;

      await webStorageModule.inputShareFromWebStorage();

      appendConsoleText("Successfully Acquired Device Share!");

 

      // Get the number of acquired shares to show the user

      const indexes = tKey.getCurrentShareIndexes();

      // appendConsoleText(indexes);

      appendConsoleText("Number Of Acquired Shares: " + indexes.length);

 

      // We have 2 of 3 shares so we can reconstruct the key

      const reconstructedKey = await tKey.reconstructKey();

      appendConsoleText("Here's Your Private Key: " + reconstructedKey.privKey.toString("hex"));

    } catch (error) {

      setConsoleText("Failed To Login");

      console.error(error, "caught");

    }

  };

 

  const loginUsingDeviceAndPassword = async () => {

    try {

      // await triggerSocialProviderLogin();

      console.log("pass 0");

      await tKey.initialize();

      console.log("pass 1");

 

      setConsoleText("Getting The Local Device Share...");

      const webStorageModule = tKey.modules["webStorage"] as WebStorageModule;

      await webStorageModule.inputShareFromWebStorage();

      appendConsoleText("Successfully Acquired Device Share!");

      await getPasswordShare();

      appendConsoleText("Successfully Acquired Password Share!");

 

      // Get the number of acquired shares to show the user

      const indexes = tKey.getCurrentShareIndexes();

      // appendConsoleText(indexes);

      appendConsoleText("Number Of Acquired Shares: " + indexes.length);

 

      // We have 2 of 3 shares so we can reconstruct the key

      const reconstructedKey = await tKey.reconstructKey();

      appendConsoleText("Here's Your Private Key: " + reconstructedKey.privKey.toString("hex"));

    } catch (error) {

      setConsoleText("Failed To Login");

      console.error(error, "caught");

    }

  };

 

  const loginUsingProviderAndPassword = async () => {

    try {

      setConsoleText("Getting The Social Provider Share...");

      await triggerSocialProviderLogin();

      await tKey.initialize();

      appendConsoleText("Successfully Acquired Social Provider Share!");

      await getPasswordShare();

      appendConsoleText("Successfully Acquired Password Share!");

 

      // Get the number of acquired shares to show the user

      const indexes = tKey.getCurrentShareIndexes();

      // appendConsoleText(indexes);

      appendConsoleText("Number Of Acquired Shares: " + indexes.length);

 

      // We have 2 of 3 shares so we can reconstruct the key

      const reconstructedKey = await tKey.reconstructKey();

      appendConsoleText("Here's Your Private Key: " + reconstructedKey.privKey.toString("hex"));

   } catch (error) {

      setConsoleText("Failed To Login");

      console.error(error, "caught");

    }

  };

 

  // Function that uses the device and password shares to reconstruct the key (Doesn't Work Right Now)

  const initializeAndReconstruct = async () => {

    try {

      let consoleTextCopy: Record<string, any> = {};

      if (tKey === null) {

        return;

      }

      const details = await tKey.initialize();

      let shareDescriptions: any = Object.assign({}, details.shareDescriptions);

      Object.keys(shareDescriptions).map((key) => {

        shareDescriptions[key] = shareDescriptions[key].map((it: any) => JSON.parse(it));

      });

 

      // The order of these strings determines which one will be executed first.

      let priority = ["webStorage", "securityQuestions"];

      shareDescriptions = Object.values(shareDescriptions)

          .flatMap((x) => x)

          .sort((a, b) => priority.indexOf((a as any).module) - priority.indexOf((b as any).module));

 

      let requiredShares = details.requiredShares;

      if (shareDescriptions.length === 0 && requiredShares > 0) {

        throw new Error("No share descriptions available. New key assign might be required or contact support.");

      }

 

      while (requiredShares > 0 && shareDescriptions.length > 0) {

        let curr = shareDescriptions.shift();

        if (curr.module === "webStorage") {

          try {

            // Do wee need to make a new key?

            // tKey._initializeNewKey();

            await (tKey.modules.webStorage as WebStorageModule).inputShareFromWebStorage();

            requiredShares--;

            appendConsoleText("Successfully Acquired Device Share!");

          } catch (err) {

            console.log("Couldn't Get The Device Share.", err);

          }

        } else if (curr.module === "securityQuestions") {

          await getPasswordShare();

         appendConsoleText("Successfully Acquired Password Share!");

        }

 

        if (shareDescriptions.length === 0 && requiredShares > 0) {

          throw new Error("URGENT: Need To Refresh Lost Share");

        }

      }

 

      const key = await tKey.reconstructKey();

      consoleTextCopy.privKey = key.privKey.toString("hex");

      setConsoleText(consoleTextCopy);

    } catch (error) {

      setConsoleText("Failed To Login");

      console.error(error, "caught");

    }

  };

 

  // *****************COLUMN 2 MAIN FUNCTIONS:************************

 

const RefreshResetDeviceShare = async () => {

  try {

    setConsoleText("Deleting Device Share...");

    await deleteDeviceShare();

    appendConsoleText("Device Share Successfully Deleted and Shares Have Been Refreshed");

    await tKey.syncLocalMetadataTransitions();

    appendConsoleText("Generating New Device Share...");

    await generateNewDeviceShare();

    appendConsoleText("You're All Set!");

  } catch (error) {

    setConsoleText("Failed To Refresh Device Share");

  }

}

 

const RefreshResetPasswordShare = async () => {

  try {

    setConsoleText("Deleting Password Share...");

    deletePasswordShare();

    appendConsoleText("Password Share Successfully Deleted and Shares Have Been Refreshed");

    appendConsoleText("Generating New Password Share...");

    await tKey.syncLocalMetadataTransitions();

    generateNewShareWithPassword();

    appendConsoleText("Successfully Generated New Password Share!");

    appendConsoleText("You're All Set!");

  } catch (error) {

    setConsoleText("Failed To Refresh Password Share");

  }

}

 

/**

* Deletes the device share info and then refreshes all the shares

* Will have to create a new device share but the social provider

* and password logins are the same although with new shares. The

* private key remains the same when shares are refreshed.

*/

  const deleteDeviceShare = async () => {

    try {

      setConsoleText("Deleting Device Share...");

      const indexes = tKey.getCurrentShareIndexes();

      // appendConsoleText(tKey.shares);

      // appendConsoleText(indexes);

      await tKey.deleteShare(indexes[1]);

      // appendConsoleText(indexes);

      appendConsoleText("Device Share Deleted! Please Refresh Page For Complete Share Deletion to Take Effect.");

    } catch (error) {

      setConsoleText("Failed To Delete Device Share");

    }

  };

 

  /**

   * Deletes the passwrod share info and then refreshes all the shares

   * Will have to create a new password share but the social provider

   * and device logins are the same although with new shares. The

   * private key remains the same when shares are refreshed.

   */

  const deletePasswordShare = async () => {

    try {

      setConsoleText("Deleting Password Share...");

      const indexes = tKey.getCurrentShareIndexes();

      await tKey.deleteShare(indexes[2]);

      setConsoleText("Password Share Deleted!");

    } catch (error) {

      appendConsoleText("Failed To Delete Password Share");

    }

  };

 

  // Doesn't seem to be possible because provider is tied to the key

  // initialization. (Not sure)

  const deleteProviderShare = async () => {

    try {

      setConsoleText("Deleting Social Provider Share...");

      const indexes = tKey.getCurrentShareIndexes();

      await tKey.deleteShare(indexes[0]);

      setConsoleText("Social Provider Share Deleted!");

    } catch (error) {

      setConsoleText("Failed To Delete Social Provider Share");

    }

  };

 

  // Generates a new share. Adds to the total number of shares but

  // the private key stays the same.

  const generateNewShare = async () => {

    try {

      setConsoleText("Generating New Share...");

      const result = await tKey.generateNewShare();

      appendConsoleText(result.newShareStores);

      appendConsoleText("Successfully Generated New Share!");

      appendConsoleText(result);

    } catch (error) {

      setConsoleText("Failed To Generate New Share");

    }

  }

 

  // Used after the device share is deleted to make a new device share.

  // The private key remians the same.

  const generateNewDeviceShare = async () => {

    try {

      setConsoleText("Generating New Share...");

      const metadata = tKey.getMetadata();

      const newSharesDetails = await tKey.generateNewShare();

      const newShareStore = newSharesDetails.newShareStores[newSharesDetails.newShareIndex.toString("hex")];

      tKey.storeDeviceShare(newShareStore);

      // First get your device share using

      appendConsoleText("Successfully Generated New Device Share!");

    } catch (error) {

      appendConsoleText("Failed To Generate New Device Share");

    }

  }

 

    // Used after the device share is deleted to make a new device share.

    // The private key remians the same.

    const generateNewShareWithPassword = async () => {
 

      appendConsoleText("Generating New Share With Password...");

      popup("Create A Password (At Least 5 Characters)", {

        content: "input" as any,

      }).then(async (password) => {

        if (password.length >= 5) {

          await (tKey.modules.securityQuestions as SecurityQuestionsModule).generateNewShareWithSecurityQuestions(password, "What's Your Password?");

          appendConsoleText("Successfully Generated Share With Password!");

        } else {

          popup("Error", "Password Must Be At Least 5 Characters", "error");

          setConsoleText("Failed to Generate Share With Password");

        }

      });

      // await getTKeyDetails();

    };

 

 

    const windowChange = async () => {

      window.location.href = 'https://vls-api-qa/vls/lght/loginhint';

    };

 

    const windowChange2 = async () => {

      window.location.href = 'localhost3000';

    };

 

  // Not needed. Keeping for now.

  const refreshShares = async () => {

    try {

      setConsoleText("Refreshing Shares...");

      const pubPoly = tKey.metadata.getLatestPublicPolynomial();

      appendConsoleText("Public Polynomial:");

      appendConsoleText(pubPoly);

      const previousPolyID = pubPoly.getPolynomialID();

      appendConsoleText("Previous Polynomial ID:");

      appendConsoleText(previousPolyID);

      const existingShareIndexes = tKey.metadata.getShareIndexesForPolynomial(previousPolyID);

      appendConsoleText("Existing Share Indexes:");

      appendConsoleText(existingShareIndexes);

      await tKey._refreshShares(2, existingShareIndexes, previousPolyID);

      appendConsoleText("Successfully Refreshed The Shares! Here's Some Info:");

      appendConsoleText("Public Polynomial:");

      appendConsoleText(pubPoly);

 

      appendConsoleText("Previous Polynomial ID:");

      appendConsoleText(previousPolyID);

 

      appendConsoleText("Existing Share Indexes:");

      appendConsoleText(existingShareIndexes);

    } catch (error) {

      setConsoleText("Failed Get The Key Details. May Have To Login/Reconstruct It First");

    }

  };

 

  // *****************COLUMN 3 MAIN FUNCTIONS:************************

  // I don't think I need these anymore but I'm keeping it for now.

 

  const checkShareRequests = async () => {

    setConsoleText("Checking Share Requests");

    try {

      const result = await (tKey.modules.shareTransfer as ShareTransferModule).getShareTransferStore();

      const requests = await (tKey.modules.shareTransfer as ShareTransferModule).lookForRequests();

      appendConsoleText("Share Requests" + JSON.stringify(requests));

      console.log("Share requests", requests);

      console.log("Share Transfer Store", result);

    } catch (err) {

      setConsoleText("Failed to Check Share Requests");

      console.log(err);

    }

  };

 

  const resetShareRequests = async () => {

    setConsoleText("Resetting Share Transfer Requests");

    try {

      const res = await (tKey.modules.shareTransfer as ShareTransferModule).resetShareTransferStore();

      console.log(res);

      appendConsoleText("Reset share transfer successful");

    } catch (err) {

      setConsoleText("Failed to Reset Share Requests");

      console.log(err);

    }

  };

 

  const requestShare = async () => {

    setConsoleText("Requesting New Share");

    try {

      const result = await (tKey.modules.shareTransfer as ShareTransferModule).requestNewShare(navigator.userAgent, tKey.getCurrentShareIndexes());

      appendConsoleText(result);

    } catch (err) {

      setConsoleText("Failed to Request Share");

      console.error(err);

    }

  };

 

  const approveShareRequest = async () => {

    setConsoleText("Approving Share Request");

    try {

      const result = await (tKey.modules.shareTransfer as ShareTransferModule).getShareTransferStore();

      const requests = await (tKey.modules.shareTransfer as ShareTransferModule).lookForRequests();

      let shareToShare;

      try {

        shareToShare = await (tKey.modules.webStorage as WebStorageModule).getDeviceShare();

      } catch (err) {

        console.error("No Device Share Found. Generating a New Share");

        const newShare = await tKey.generateNewShare();

        shareToShare = newShare.newShareStores[newShare.newShareIndex.toString("hex")];

      }

      console.log(result, requests, tKey);

 

      await (tKey.modules.shareTransfer as ShareTransferModule).approveRequest(requests[0], shareToShare);

      // await this.tbsdk.modules.shareTransfer.deleteShareTransferStore(requests[0]) // delete old share requests

      appendConsoleText("Approved Share Transfer Request");

    } catch (err) {

      setConsoleText("Failed to Approve Share Request");

      console.error(err);

    }

  };





  // ************THE FOLLOWING ARE HELPER FUNCTIONS:***************

 

  // Uses the details in the social provider mapping to have the user login with a pop up.

  const triggerSocialProviderLogin = async () => {

    try {

     console.log("Triggering Login");

 

      // 2. Set jwtParameters depending on the verifier (google / facebook / linkedin etc)

      const jwtParams = loginConnectionMap[authVerifier] || {};

 

      const { typeOfLogin, clientId, verifier } = verifierMap[authVerifier];

 

      // 3. Trigger Login ==> opens the popup

      const loginResponse = await (tKey.serviceProvider as TorusServiceProvider).triggerLogin({

        typeOfLogin,

        verifier,

        clientId,

        jwtParams,

      });

 

      // This was an attempt at using aggregate social logins but it hasn't worked

 

      // const loginResponse = await (tKey.serviceProvider as TorusServiceProvider).triggerAggregateLogin({

      //   AggregateLoginParams: {

      //     aggregateVerifierType: "single_id_verifier",

      //     verifierIdentifier: "tkey-google",

      //     subVerifierDetailsArray: [

      //       {

      //         typeOfLogin,

      //         verifier,

      //         clientId,

      //       },

      //     ],

      //   },

      // });

 

      // setConsoleText(loginResponse);

    } catch (error) {

      setConsoleText("Could Not Get The Social Provider Share")

      console.log(error);

    }

  };

 

  // Helper function to return the password share if the inputted password is correct.

  const getPasswordShare = async () => {

    appendConsoleText("Importing Share from Password...");

    await popup("What is your password?", {

      content: "input" as any,

    }).then(async (password) => {

      if (password.length >= 5) {

        await (tKey.modules.securityQuestions as SecurityQuestionsModule).inputShareFromSecurityQuestions(password);

        appendConsoleText("Successfully Imported Share Using Password!");

      } else {

        popup("Error", "Password Must Be At Least 5 Characters", "error");

      }

    });

  };

 

  // If we have enough shares, this function provides the private key and other details.

  const getTKeyDetails = async () => {

    try {

      setConsoleText("Tkey Details:");

      // Get the private key

      appendConsoleText("Private Key:");

      appendConsoleText("0x" + tKey.privKey.toString('hex'));

      const privateKey = tKey.privKey.toString('hex');

 

      // Get the public key

      // const privateKeyToPublicKey = require('ethereum-private-key-to-public-key');

      // const publicKey = privateKeyToPublicKey(privateKey).toString('hex');

      appendConsoleText("Here's Your Public Key:")

      // appendConsoleText(publicKey);

 

      // Get the wallet address

      // const publicKeyToAddress = require('ethereum-public-key-to-address');

      // const walletAddr = publicKeyToAddress(publicKey);

      appendConsoleText("Here's Your Wallet Address:")

      // appendConsoleText(walletAddr);

 

      // Get the share info

      appendConsoleText("Required Shares:");

      appendConsoleText(tKey.getKeyDetails().requiredShares);

      appendConsoleText("Threshold:");

      appendConsoleText(tKey.getKeyDetails().threshold);

      appendConsoleText("Total Shares:");

      appendConsoleText(tKey.getKeyDetails().totalShares);

      appendConsoleText("Share Descriptions:");

      appendConsoleText(tKey.getKeyDetails().shareDescriptions);

    } catch (error) {

      setConsoleText("Failed Get The Key Details. May Have To Login/Reconstruct It First");

      console.error(error);

    }

  };

 

  // Not needed. Keeping for now.

  const reconstructKey = async () => {

    try {

      console.log("Reconstructing Key");

      setConsoleText("Reconstructing key");

      let reconstructedKey = await tKey.reconstructKey();

      appendConsoleText(reconstructedKey.privKey);

    } catch (error) {

      setConsoleText("Failed Reconstruct The Key");

      console.error(error, "caught");

    }

  };

 

  // Helper function for having multiple lines of text in the console

  const appendConsoleText = (el: any) => {

    const data = typeof el === "string" ? el : JSON.stringify(el);

    setConsoleText((x: any) => x + "\n" + data);

  };




  // ************THE FOLLOWING ARE EXTRA FUNCTIONS TO TEST OUT:***************

 

 

  const generateShares = () => {

    var re = /[0-9A-Fa-f]*/g;

    var keyToBeSplit = shareDetails.replaceAll('"', "");

    if (keyToBeSplit.substring(0, 2) === "0x") {

      keyToBeSplit = keyToBeSplit.substring(2);

    }

    if (re.test(keyToBeSplit)) {

      setShareToggle("combine");

      var shares = window.secrets.share(keyToBeSplit, total, threshold);

      setShareDetails(shares.join("\n"));

    } else {

      popup("Please enter a valid hexadecimal number");

    }

  };

 

  const combineShares = () => {

    if (shareToggle === "combine") {

      setShareToggle("split");

    }

    var comb = window.secrets.combine(shareDetails.split("\n"));

    setShareDetails(comb);

  };

 

  const generateMnemonics = () => {

    if (!validateMnemonic(mnemonics)) {

      popup("Incorrect Mnemonic", "", "error");

      setBIP39Seed("Incorrect Mnemonic");

      setEntropy("Incorrect Mnemonic");

      setPublicKey("Incorrect Mnemonic");

      setPublicExtendedKey("Incorrect Mnemonic");

      setPrivateKey("Incorrect Mnemonic");

      setPrivateExtendedKey("Incorrect Mnemonic");

    } else {

      const bip39Seed = mnemonicToSeedSync(mnemonics).toString("hex");

      const bip39entropy = mnemonicToEntropy(mnemonics);

 

      setBIP39Seed(bip39Seed);

      setEntropy(bip39entropy);

      const hd = HDKey.fromMasterSeed(Buffer.from(bip39Seed, "hex"));

      setPublicKey(hd.publicKey.toString("hex"));

      setPublicExtendedKey(hd.publicExtendedKey);

      setPrivateKey(hd.privateKey.toString("hex"));

      setPrivateExtendedKey(hd.privateExtendedKey);

      setHDKey(hd);

    }

  };

 

  const deriveAccount = () => {

    const childHd = hdKey.derive(derivationPath);

    setDerivedAccount("Private Key " + childHd.privateKey.toString("hex") + "\nPublic Key " + childHd.publicKey.toString("hex"));

  };

 

  const generateMnemonicsRandom = () => {

    const bipMnemonic = generateMnemonic();

    const bip39Seed = mnemonicToSeedSync(bipMnemonic).toString("hex");

    const bip39entropy = mnemonicToEntropy(bipMnemonic);

    setMnemonics(bipMnemonic);

    setBIP39Seed(bip39Seed);

    setEntropy(bip39entropy);

    const hd = HDKey.fromMasterSeed(Buffer.from(bip39Seed, "hex"));

    setPublicKey(hd.publicKey.toString("hex"));

    setPublicExtendedKey(hd.publicExtendedKey);

    setPrivateKey(hd.privateKey.toString("hex"));

    setPrivateExtendedKey(hd.privateExtendedKey);

    setHDKey(hd);

  };

 

  // ************THE FOLLOWING IS THE UI SET UP:***************

 

  return (

      <div className="showcase">
          <Row>

              <Col>

                <br></br>

            </Col>

          </Row>

        <div className="showcase-content">

          <Row className="center">

              <Col>

                <h1>This is a POC for Integrating With TKey</h1>

              </Col>

          </Row>

        </div>

          <Row>

              <Col>

                <br></br>

            </Col>

          </Row>

        <div className="showcase-content">

          <Row className="center">

            <Col>

              <h1>To Begin, Select a Social Verifier And Then Create New Key or Login:</h1>

            </Col>

            <Col>

              <ul>

                <li>

                <span onClick={() => setAuthVerifier("google")}>

                  <i className={"fa fa-google " + (authVerifier === "google" ? "selected" : "")}></i>

                </span>

                </li>

                <li>

                <span onClick={() => setAuthVerifier("facebook")}>

                  <i className={"fa fa-facebook " + (authVerifier === "facebook" ? "selected" : "")}></i>

                </span>

                </li>

                <li>

                <span onClick={() => setAuthVerifier("twitter")}>

                  <i className={"fa fa-twitter " + (authVerifier === "twitter" ? "selected" : "")}></i>

                </span>

                </li>

                <li>

                <span onClick={() => setAuthVerifier("apple")}>

                  <i className={"fa fa-apple " + (authVerifier === "apple" ? "selected" : "")}></i>

                </span>

                </li>

                <li>

                <span onClick={() => setAuthVerifier("github")}>

                  <i className={"fa fa-github " + (authVerifier === "github" ? "selected" : "")}></i>

                </span>

                </li>

                <li>

                <span onClick={() => setAuthVerifier("linkedin")}>

                  <i className={"fa fa-linkedin " + (authVerifier === "linkedin" ? "selected" : "")}></i>

                </span>

                </li>

                <li>

                <span onClick={() => setAuthVerifier("reddit")}>

                  <i className={"fa fa-reddit " + (authVerifier === "reddit" ? "selected" : "")}></i>

                </span>

                </li>

                <li>

                <span onClick={() => setAuthVerifier("twitch")}>

                  <i className={"fa fa-twitch " + (authVerifier === "twitch" ? "selected" : "")}></i>

                </span>

                </li>

              </ul>

            </Col>

          </Row>

          <Row className="frame">

            <Col>

              <Row>

                <Col>

                  <h1>Create/Get Private Key Or Login</h1>

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={initializeTkeyUsing3Shares}>

                  Create New TKey (3 Shares)

                </Col>

              </Row>

              {/* <Row>

                <Col className="custom-btn" onClick={initializeNewKey}>

                  Create New TKey (2 Shares)

                </Col>

              </Row> */}

              {/* <Row>

                <Col className="custom-btn" onClick={reconstructKey}>

                  Reconstruct TKey

                </Col>

              </Row> */}

              <Row>

                <Col className="custom-btn" onClick={getTKeyDetails}>

                  Get Private Key/Details

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={loginUsingDeviceAndPassword}>

                {/* <Col className="custom-btn" onClick={initializeAndReconstruct}> */}

                  Login With Device + Password 1

                </Col>

              </Row>

              <Row>

                {/* <Col className="custom-btn" onClick={loginUsingDeviceAndPassword}> */}

                <Col className="custom-btn" onClick={initializeAndReconstruct}>

                  Login With Device + Password 2

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={loginUsingDeviceAndProvider}>

                  Recover With Device + Provider

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={loginUsingProviderAndPassword}>

                  Recover With Password + Provider

                </Col>

              </Row>

            </Col>

            <Col>

              <Row>

                <Col>

                  <h1>Refresh Lost Shares</h1>

                </Col>

              </Row>

              <Row>

                <Col>

                  <br></br>

                </Col>

              </Row>

              <Row>

                <Col>

                  <br></br>

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={RefreshResetDeviceShare}>

                  Refresh/Reset Device Share

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={RefreshResetPasswordShare}>

                  Refresh/Reset Password Share

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={deleteDeviceShare}>

                  Delete Lost Device Share

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={deletePasswordShare}>

                  Delete Lost Password Share

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={deleteProviderShare}>

                  Delete Lost Provider Share (Not Possible?)

                </Col>

              </Row>

              {/* <Row>

                <Col className="custom-btn" onClick={generateNewShare}>

                  Generate New Share

                </Col>

              </Row> */}

              <Row>

                <Col className="custom-btn" onClick={generateNewDeviceShare}>

                  Generate New Device Share

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={generateNewShareWithPassword}>

                  Generate New Password Share

                </Col>

              </Row>

            </Col>

            <Col>

              <Row>

                <Col>

                  <h1>Share Transfers (Not Needed?) </h1>

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={checkShareRequests}>

                  Check Share Requests

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={requestShare}>

                  Request Share

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={approveShareRequest}>

                  Approve Request

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={resetShareRequests}>

                  Reset Share Request

                </Col>

              </Row>

            </Col>

          </Row>

          <h1>Output</h1>

          <textarea style={{ width: "100%", height: "30vh" }} value={consoleText} readOnly></textarea>

          <hr></hr>

          <Row>

              <Col>

                <br></br>

            </Col>

          </Row>

          <h1>The Following Is For Playing Around/Testing And Is Not Directly Related To The POC</h1>

          <Row>

              <Col>

                <br></br>

            </Col>

          </Row>

        <h1>Secret Sharing</h1>

        <div>

          <input

            type="number"

            value={threshold}

            onChange={(e) => {

              setThreshold(parseInt(e.target.value));

              setShareDetails("0x0");

              setShareToggle("split");

            }}

          />{" "}

          out of{" "}

          <input

            type="number"

            value={total}

            onChange={(e) => {

              setTotal(parseInt(e.target.value));

              setShareDetails("0x0");

              setShareToggle("split");

            }}

         />

        </div>

        <br></br>

        {shareToggle === "split" ? <h4> Private Key (hex format) Below</h4> : <h4>Private Key Split Into {total} Shares</h4>}

        {shareToggle === "split" ? (

          <textarea style={{ width: "100%", height: "4vh" }} value={shareDetails} onChange={(e) => setShareDetails(e.currentTarget.value)}></textarea>

        ) : (

          <textarea

            style={{ width: "100%", height: 4 * total + "vh" }}

            value={shareDetails}

            onChange={(e) => setShareDetails(e.currentTarget.value)}></textarea>

        )}

        <br></br>

        {shareToggle === "split" ? (

          <button className="custom-btn" style={{ width: "auto" }} onClick={generateShares}>

            Generate Shares

          </button>

        ) : (

          <button className="custom-btn" style={{ width: "auto" }} onClick={combineShares}>

            Combine Shares

          </button>

        )}

                <br></br>

        <h1>Mnemonics</h1>

        {mnemonics.length === 0 ? (

          <button className="custom-btn" style={{ width: "auto" }} onClick={generateMnemonicsRandom}>

            Generate Random Mnemonics

          </button>

        ) : (

          <button className="custom-btn" style={{ width: "auto" }} onClick={generateMnemonics}>

            Generate Using Mnemonic

          </button>

        )}

 

        <Table>

          <Row>

            <span style={{ width: "20%" }}>BIP39 Mnemonic</span>

            <Col>

              <input

                style={{ width: "100%" }}

                value={mnemonics}

                onChange={(e) => setMnemonics(e.currentTarget.value)}

                placeholder="Insert Mnemonic or Generate Random Mnemonic"></input>

            </Col>

          </Row>

          <Row>

            <span style={{ width: "20%" }}>BIP39 Seed</span>

            <Col>

              <input style={{ width: "100%" }} value={bip39Seed} readOnly></input>

            </Col>

          </Row>

          <Row>

            <span style={{ width: "20%" }}>Entropy</span>

            <Col>

              <input style={{ width: "100%" }} value={entropy} readOnly></input>

            </Col>

          </Row>

          <Row>

            <span style={{ width: "20%" }}>Public Key</span>

            <Col>

              <input style={{ width: "100%" }} value={publicKey} readOnly></input>

            </Col>

          </Row>

          <Row>

            <span style={{ width: "20%" }}>Extended Public Key </span>

            <Col>

              <input style={{ width: "100%" }} value={publicExtendedKey} readOnly></input>

            </Col>

          </Row>

          <Row>

            <span style={{ width: "20%" }}>Private Key</span>

            <Col>

              <input style={{ width: "100%" }} value={privateKey} readOnly></input>

            </Col>

          </Row>

          <Row>

            <span style={{ width: "20%" }}>Extended Private Key </span>

            <Col>

              <input style={{ width: "100%" }} value={privateExtendedKey} readOnly></input>

            </Col>

          </Row>

          <br></br>

          <h4>BIP32 Derivation Path</h4>

          <Col>

            <input

              style={{ width: "20%", textAlign: "center" }}

              value={derivationPath}

              onChange={(e) => setDerivationPath(e.currentTarget.value)}></input>

          </Col>

          <button className="custom-btn" onClick={deriveAccount}>

            Derive

          </button>

          <textarea style={{ width: "100%", height: "8vh" }} value={derivedAccount} readOnly></textarea>

        </Table>

      </div>

    </div>

  );

};

 

export default App;
