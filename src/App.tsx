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

 

declare global {

  interface Window {

    secrets: any;

  }

}

 

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

const AUTH_DOMAIN = "https://torus-test.auth0.com";

 

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

};

 

const verifierMap: Record<string, any> = {

  [GOOGLE]: {

    name: "Google",

    typeOfLogin: "google",

    clientId: "134678854652-vnm7amoq0p23kkpkfviveul9rb26rmgn.apps.googleusercontent.com",

    verifier: "web3auth-testnet-verifier",

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

  [GITHUB]: { name: "Github", typeOfLogin: "github", clientId: "PC2a4tfNRvXbT48t89J5am0oFM21Nxff", verifier: "torus-auth0-github-lrc" },

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

 

// 1. Setup Service Provider

const directParams = {

  baseUrl: `${window.location.origin}/serviceworker`,

  enableLogging: true,

  network: "testnet" as any,

};

const serviceProvider = new TorusServiceProvider({ directParams });

 

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

 

  // Helper function for having multiple lines of text in the console

  const appendConsoleText = (el: any) => {

    const data = typeof el === "string" ? el : JSON.stringify(el);

    setConsoleText((x: any) => x + "\n" + data);

  };

 

  useEffect(() => {

   const init = async () => {

      // Init Service Provider

      await (tKey.serviceProvider as TorusServiceProvider).init({ skipSw: false });

      try {

      } catch (error) {

        console.error(error);

      }

    };

 

    init();

  }, []);

 

  // Function that uses the device and Visa shares to reconstruct the key (Doesn't Work Right Now)

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

          await getVisaGuideShare();

          appendConsoleText("Successfully Acquired Visa Guide Share!");

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

 

      // const loginResponse = await (tKey.serviceProvider as TorusServiceProvider).triggerHybridAggregateLogin({

      //   singleLogin: {

      //     typeOfLogin,

      //     verifier,

      //     clientId,

      //     jwtParams,

      //   },

      //   aggregateLoginParams: {

      //     aggregateVerifierType: "single_id_verifier",

      //     verifierIdentifier: "tkey-google",

      //     subVerifierDetailsArray: [

      //       {

      //         clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",

      //         typeOfLogin: "google",

      //         verifier: "torus",

      //       },

      //     ],

      //   }

      // });

 

      // setConsoleText(loginResponse);

    } catch (error) {

      setConsoleText("Could Not Get The Social Provider Share")

      console.log(error);

    }

  };

 

  // Initializes key using social provider and device and then adds on security question share.

  const initializeTkeyUsing3Shares = async () => {

    try {

      setConsoleText("Initializing a New Key Using Device, Provider, and Visa Shares...");

      await triggerSocialProviderLogin();

      await tKey.initialize();

      appendConsoleText("Successfully Generated New Shares With Device And Provider");

      const res = await tKey._initializeNewKey({ initializeModules: true });

      console.log("response from _initializeNewKey", res);

      setShareDetails(res.privKey.toString("hex"));

      await generateNewShareWithVisaGuide();

      // appendConsoleText("Successfully Generated New Share With Visa Guide ID!");

      // appendConsoleText("Here's Your Private Key:");

      // appendConsoleText(res.privKey);

      // setShareToggle("split");

      // appendConsoleText("Here's Some Extra Info:");

      // appendConsoleText(res);

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

 

  const loginUsingDeviceAndGuide = async () => {

    try {

      // await triggerSocialProviderLogin();

      console.log("pass 0");

      // await tKey.initialize();

      console.log("pass 1");

 

      setConsoleText("Getting The Local Device Share...");

      const webStorageModule = tKey.modules["webStorage"] as WebStorageModule;

      await webStorageModule.inputShareFromWebStorage();

      appendConsoleText("Successfully Acquired Device Share!");

      await getVisaGuideShare();

      appendConsoleText("Successfully Acquired Visa Guide Share!");

 

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

 

  const loginUsingProviderAndGuide = async () => {

    try {

      setConsoleText("Getting The Social Provider Share...");

      await triggerSocialProviderLogin();

      await tKey.initialize();

      appendConsoleText("Successfully Acquired Social Provider Share!");

      await getVisaGuideShare();

      appendConsoleText("Successfully Acquired Visa Guide Share!");

 

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

 

  const getTKeyDetails = async () => {

    try {

      setConsoleText("Tkey Details:");

      appendConsoleText("Private Key:");

      appendConsoleText("0x" + tKey.privKey.toString('hex'));

      appendConsoleText("More Info:");

      appendConsoleText(tKey.getKeyDetails());

    } catch (error) {

      setConsoleText("Failed Get The Key Details. May Have To Login/Reconstruct It First");

    }

  };

 

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

 

  const deleteDeviceShare = async () => {

    try {

      // setConsoleText("Tkey Details:");

      // appendConsoleText(tKey.getKeyDetails());

      setConsoleText("Deleting Device Share...");

      const indexes = tKey.getCurrentShareIndexes();

      appendConsoleText(tKey.shares);

      appendConsoleText(indexes);

      await tKey.deleteShare(indexes[1]);

      appendConsoleText(indexes);

      appendConsoleText("Device Share Deleted!");

    } catch (error) {

      setConsoleText("Failed To Delete Device Share");

    }

  };

 

  const deleteVisaShare = async () => {

    try {

      // setConsoleText("Tkey Details:");

      // appendConsoleText(tKey.getKeyDetails());

      setConsoleText("Deleting Visa Guide Share...");

      const indexes = tKey.getCurrentShareIndexes();

      await tKey.deleteShare(indexes[2]);

      setConsoleText("Visa Share Deleted!");

    } catch (error) {

      appendConsoleText("Failed To Delete Visa Share");

    }

  };

 

  const deleteProviderShare = async () => {

    try {

      // setConsoleText("Tkey Details:");

      // appendConsoleText(tKey.getKeyDetails());

      setConsoleText("Deleting Social Provider Share...");

      const indexes = tKey.getCurrentShareIndexes();

      await tKey.deleteShare(indexes[3]);

      setConsoleText("Social Provider Share Deleted!");

    } catch (error) {

      setConsoleText("Failed To Delete Social Provider Share");

    }

  };

 

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

 

  const generateNewDeviceShare = async () => {

    try {

      setConsoleText("Generating New Share...");

      const indexes = tKey.getCurrentShareIndexes();

      await tKey.deleteShare(indexes[3]);

      const result = await tKey.generateNewShare();

      appendConsoleText("1");

      // const webStorageModule = tKey.modules["webStorage"] as WebStorageModule;

      // appendConsoleText("2");

      // const shareStore = webStorageModule.getDeviceShare();

      appendConsoleText(result.newShareStores);

      appendConsoleText(result.newShareIndex);

      // webStorageModule.storeDeviceShare(result.newShareStores[1]);

      appendConsoleText("3");

      // appendConsoleText(result);

      // const shareStore = await result.newShareStores;

      // appendConsoleText("share stores");

      // appendConsoleText(shareStore);

 

      tKey.storeDeviceShare(result.newShareStores[1]);

      // First get your device share using

      appendConsoleText("Successfully Generated New Device Share!");

    } catch (error) {

      appendConsoleText("Failed To Generate New Device Share");

    }

  }

 

    // Helper function used to give guide a share of the key.

    const generateNewShareWithVisaGuide = async () => {

      appendConsoleText("Generating New Share With Visa Guide ID...");

      popup("What's Your Visa Guide ID? (At Least 5 Characters)", {

        content: "input" as any,

      }).then(async (value) => {

        if (value.length >= 5) {

          await (tKey.modules.securityQuestions as SecurityQuestionsModule).generateNewShareWithSecurityQuestions(value, "What's Your Visa Guide ID?");

          setConsoleText("Successfully Generated Share With Visa Guide ID!");

        } else {

          popup("Error", "Visa Guide ID Must Be At Least 5 Characters", "error");

          setConsoleText("Failed to Generate Share With Visa Guide ID");

        }

      });

      // await getTKeyDetails();

    };

 

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

 

      // Need to make new key? Want the same private key though

    } catch (error) {

      setConsoleText("Failed Get The Key Details. May Have To Login/Reconstruct It First");

    }

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

 

  // Helper function to return the guide share if the inputted guide ID is correct.

  const getVisaGuideShare = async () => {

    appendConsoleText("Importing Share from Visa Guide...");

    await popup("What is your Visa Guide ID?", {

      content: "input" as any,

    }).then(async (value) => {

      if (value.length >= 5) {

        await (tKey.modules.securityQuestions as SecurityQuestionsModule).inputShareFromSecurityQuestions(value);

        appendConsoleText("Successfully Imported Share Using Visa Guide ID!");

      } else {

        popup("Error", "Visa Guide ID Must Be At Least 5 Characters", "error");

      }

    });

  };

 

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

 

  return (

      <div className="showcase">

        <div className="showcase-top">

          <img src="https://imgs.search.brave.com/hROsXsGVks4so9hB1OkgaXBlme0UsyvHmF_69c4m720/rs:fit:1024:416:1/g:ce/aHR0cHM6Ly90aGVz/dHJhd2dyb3VwLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAx/OS8wNi9WaXNhLWxv/Z28tMTAyNHg0MTYu/cG5n" alt="Visa Logo" />

        </div>

          <Row>

              <Col>

                <br></br>

            </Col>

          </Row>

        <div className="showcase-content">

          <Row className="center">

              <Col>

                <h1>This is a POC for Integrating Visa Guide With TKey</h1>

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

                {/* <Col className="custom-btn" onClick={loginUsingDeviceAndGuide}> */}

                <Col className="custom-btn" onClick={initializeAndReconstruct}>

                  Login With Device + Visa

                </Col>

              </Row>

              <Row>

               <Col className="custom-btn" onClick={loginUsingDeviceAndProvider}>

                  Recover With Device + Provider

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={loginUsingProviderAndGuide}>

                  Recover With Visa + Provider

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

                <Col className="custom-btn" onClick={deleteDeviceShare}>

                  Delete Lost Device Share & Refresh

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={deleteVisaShare}>

                  Delete Lost Visa Share & Refresh

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={deleteProviderShare}>

                  Delete Lost Provider Share (Not Possible?)

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={generateNewShare}>

                  Generate New Share

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={generateNewDeviceShare}>

                  Generate New Device Share (In Progress)

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={generateNewShareWithVisaGuide}>

                  Generate New Visa Share

                </Col>

              </Row>

            </Col>

            <Col>

              <Row>

                <Col>

                  <h1>Share Transfers (Probably Not Needed)</h1>

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