import { useEffect, useState } from "react";

 

import logo from "./logo.svg";

import "./App.css";

import ThresholdKey from "@tkey/default";

import WebStorageModule, { WEB_STORAGE_MODULE_NAME } from "@tkey/web-storage";

import TorusServiceProvider from "@tkey/service-provider-torus";

import TorusStorageLayer from "@tkey/storage-layer-torus";

import SecurityQuestionsModule from "@tkey/security-questions";

import ShareTransferModule from "@tkey/share-transfer";

import Row from "react-bootstrap/Row";

import Col from "react-bootstrap/Col";

import popup from "sweetalert";

import { debug } from "console";

 

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

 

  const [threshold, setThreshold] = useState<any>(2);

  const [total, setTotal] = useState<any>(3);

  const [shareDetails, setShareDetails] = useState<string>("");

  const [shareToggle, setShareToggle] = useState<string>("split");

 

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

 

  // Function that uses the device and guide shares to reconstruct the key (Doesn't Work Right Now)

  const initializeAndReconstruct = async () => {

    try {

      let consoleTextCopy: Record<string, any> = {};

      if (tKey === null) {

        return;

      }

      console.log('hi');

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

            tKey._initializeNewKey();

            await (tKey.modules.webStorage as WebStorageModule).inputShareFromWebStorage();

            requiredShares--;

          } catch (err) {

            console.log("Couldn't Get The Device Share.", err);

          }

        } else if (curr.module === "securityQuestions") {

          throw new Error("Password required");

        }

 

        if (shareDescriptions.length === 0 && requiredShares > 0) {

          throw new Error("New key assign is required.");

        }

      }

 

      const key = await tKey.reconstructKey();

      consoleTextCopy.privKey = key.privKey.toString("hex");

      setConsoleText(consoleTextCopy);

    } catch (error) {

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

 

      // setConsoleText(loginResponse);

    } catch (error) {

      appendConsoleText("Could Not Get The Social Provider Share")

      console.log(error);

    }

  };

 

  // // This was the base function for creating a tkey with the device share and provider share. It's no longer used

  // const initializeNewKey = async () => {

  //   try {

  //     setConsoleText("Initializing a New Key Using Device and Provider...");

  //     await triggerSocialProviderLogin();

  //     await tKey.initialize();

  //     const res = await tKey._initializeNewKey({ initializeModules: true });

  //     console.log("response from _initializeNewKey", res);

  //     appendConsoleText("Here's Your Private Key:");

  //     appendConsoleText(res.privKey);

  //     appendConsoleText("Here's Some Extra Info:");

  //     appendConsoleText(res);

  //   } catch (error) {

  //     setConsoleText("Failed To Initialize The Key (Most Likely An Error With The Social Login");

  //     console.error(error, "caught");

  //   }

  // };

 

  const initializeTkeyUsing3Shares = async () => {

    try {

      setConsoleText("Initializing a New Key Using Device, Provider, and Visa Shares...");

      await triggerSocialProviderLogin();

      await tKey.initialize();

      appendConsoleText("Successfully Generated New Shares With Device And Provider");

      const res = await tKey._initializeNewKey({ initializeModules: true });

      console.log("response from _initializeNewKey", res);

      appendConsoleText("Generating New Share With Visa Guide ID...");

      await generateNewShareWithVisaGuide();

      appendConsoleText("Successfully Generated New Share With Visa Guide ID!");

      appendConsoleText("Here's Your Private Key:");

      appendConsoleText(res.privKey);

      appendConsoleText("Here's Some Extra Info:");

      appendConsoleText(res);

    } catch (error) {

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

      appendConsoleText(indexes);

      appendConsoleText("Number Of Acquired Shares: " + indexes.length);

 

      // We have 2 of 3 shares so we can reconstruct the key

      const reconstructedKey = await tKey.reconstructKey();

      appendConsoleText("Here's Your Private Key: " + reconstructedKey.privKey.toString("hex"));

    } catch (error) {

      appendConsoleText("Failed To Login");

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

      await inputShareFromSecurityQuestions();

      appendConsoleText("Successfully Acquired Visa Guide Share!");

 

      // Get the number of acquired shares to show the user

      const indexes = tKey.getCurrentShareIndexes();

      appendConsoleText(indexes);

      appendConsoleText("Number Of Acquired Shares: " + indexes.length);

 

      // We have 2 of 3 shares so we can reconstruct the key

      const reconstructedKey = await tKey.reconstructKey();

      appendConsoleText("Here's Your Private Key: " + reconstructedKey.privKey.toString("hex"));

    } catch (error) {

      appendConsoleText("Failed To Login");

      console.error(error, "caught");

    }

  };

 

  const loginUsingProviderAndGuide = async () => {

    try {

      setConsoleText("Getting The Social Provider Share...");

      await triggerSocialProviderLogin();

      await tKey.initialize();

      appendConsoleText("Successfully Acquired Social Provider Share!");

      await inputShareFromSecurityQuestions();

      appendConsoleText("Successfully Acquired Visa Guide Share!");

 

      // Get the number of acquired shares to show the user

      const indexes = tKey.getCurrentShareIndexes();

      appendConsoleText(indexes);

      appendConsoleText("Number Of Acquired Shares: " + indexes.length);

 

      // We have 2 of 3 shares so we can reconstruct the key

      const reconstructedKey = await tKey.reconstructKey();

      appendConsoleText("Here's Your Private Key: " + reconstructedKey.privKey.toString("hex"));

    } catch (error) {

      appendConsoleText("Failed To Login");

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

      appendConsoleText(tKey.getKeyDetails());

    } catch (error) {

      setConsoleText("Failed Get The Key Details. May Have To Login/Reconstruct It First");

    }

  };

 

  const generateShares = () => {

    if (shareToggle === "split") {

      setShareToggle("combine");

    }

    var shares = window.secrets.share(shareDetails.replaceAll('"', ""), parseInt(total), parseInt(threshold));

    setShareDetails(shares.join("\n"));

  };

 

  const combineShares = () => {

    if (shareToggle === "combine") {

      setShareToggle("split");

    }

    var comb = window.secrets.combine(shareDetails.split("\n"));

    setShareDetails(comb);

  };

 

  const deleteShare = async () => {

    try {

      // setConsoleText("Tkey Details:");

      // appendConsoleText(tKey.getKeyDetails());

      setConsoleText("Deleting a Share...");

      await tKey.deleteShare;

      setConsoleText("Share Deleted!");

    } catch (error) {

      setConsoleText("Failed Get The Key Details. May Have To Login/Reconstruct It First");

    }

  };

 

  const refreshShares = async () => {

    try {

      setConsoleText("Tkey Details:");

      appendConsoleText(tKey.getKeyDetails());

    } catch (error) {

      setConsoleText("Failed Get The Key Details. May Have To Login/Reconstruct It First");

    }

  };

 

  // Helper function used to give guide a share of the key.

  const generateNewShareWithVisaGuide = async () => {

    appendConsoleText("Generating New Share With Visa Guide ID...");

    popup("What's Your Visa Guide ID? (At Least 5 Characters)", {

      content: "input" as any,

    }).then(async (value) => {

      if (value.length >= 5) {

        await (tKey.modules.securityQuestions as SecurityQuestionsModule).generateNewShareWithSecurityQuestions(value, "What's Your Visa Guide ID?");

      } else {

        popup("Error", "Visa Guide ID Must Be At Least 5 Characters", "error");

      }

    });

    await getTKeyDetails();

  };

 

  // Helper function to return the guide share if the inputted guide ID is correct.

  const inputShareFromSecurityQuestions = async () => {

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

    consoleText("Checking Share Requests");

    try {

      const result = await (tKey.modules.shareTransfer as ShareTransferModule).getShareTransferStore();

      const requests = await (tKey.modules.shareTransfer as ShareTransferModule).lookForRequests();

      appendConsoleText("Share Requests" + JSON.stringify(requests));

      console.log("Share requests", requests);

      console.log("Share Transfer Store", result);

    } catch (err) {

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

      console.log(err);

    }

  };

 

  const requestShare = async () => {

    setConsoleText("Requesting New Share");

    try {

      const result = await (tKey.modules.shareTransfer as ShareTransferModule).requestNewShare(navigator.userAgent, tKey.getCurrentShareIndexes());

      appendConsoleText(result);

    } catch (err) {

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

        console.error("No on device share found. Generating a new share");

        const newShare = await tKey.generateNewShare();

        shareToShare = newShare.newShareStores[newShare.newShareIndex.toString("hex")];

      }

      console.log(result, requests, tKey);

 

      await (tKey.modules.shareTransfer as ShareTransferModule).approveRequest(requests[0], shareToShare);

      // await this.tbsdk.modules.shareTransfer.deleteShareTransferStore(requests[0]) // delete old share requests

      appendConsoleText("Approved Share Transfer request");

    } catch (err) {

      console.error(err);

    }

  };

 

  return (

      <div className="showcase">

        <div className="showcase-top">

          <img src="https://imgs.search.brave.com/hROsXsGVks4so9hB1OkgaXBlme0UsyvHmF_69c4m720/rs:fit:1024:416:1/g:ce/aHR0cHM6Ly90aGVz/dHJhd2dyb3VwLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAx/OS8wNi9WaXNhLWxv/Z28tMTAyNHg0MTYu/cG5n" alt="Visa Logo" />

        </div>

        <div className="showcase-content">

          <Row className="center">

            <Col>

              <h4>This is a POC for Integrating Visa Guide With TKey. To Begin, Select a Social Verifier:</h4>

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

                  <h1>Create/Get Private Key</h1>

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

              <Row>

                <Col className="custom-btn" onClick={reconstructKey}>

                  Reconstruct TKey

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={getTKeyDetails}>

                  Get TKey Details

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={deleteShare}>

                  Delete Share (Doesn't Work)

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={refreshShares}>

                  Refresh Share (Doesn't Work)

                </Col>

              </Row>

            </Col>

            <Col>

              <Row>

                <Col>

                  <h1>Login</h1>

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

                <Col className="custom-btn" onClick={loginUsingDeviceAndProvider}>

                  Login With Device + Provider

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={loginUsingDeviceAndGuide}>

                {/* <Col className="custom-btn" onClick={initializeAndReconstruct}> */}

                  Login With Device + Guide

                </Col>

              </Row>

              <Row>

                <Col className="custom-btn" onClick={loginUsingProviderAndGuide}>

                  Login With Guide + Provider

                </Col>

              </Row>

            </Col>

            <Col>

              <Row>

                <Col>

                  <h1>Share Transfer</h1>

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

          <textarea style={{ width: "100%", height: "20vh" }} value={consoleText} readOnly></textarea>

          <hr></hr>

        <h1>Secret Sharing</h1>

        <Col>

          <input

            type="number"

            value={threshold}

            onChange={(e) => {

              setThreshold(e.currentTarget.value);

            }}

          />{" "}

          out of{" "}

          <input

            type="number"

            value={total}

            onChange={(e) => {

              setTotal(e.currentTarget.value);

            }}

          />

        </Col>

          <Row className="frame">

          <Col className="custom-btn" onClick={generateShares}>

            Generate Shares

          </Col>

          <Col className="custom-btn" onClick={combineShares}>

            Combine Shares

          </Col>

        </Row>

          {shareToggle === "split" ? <h1>Share Split</h1> : <h1>Combine Shares</h1>}

        <textarea style={{ width: "100%", height: "20vh" }} value={shareDetails} onChange={(e) => setShareDetails(e.currentTarget.value)}></textarea>

        </div>

      </div>

  );

};

 

export default App;