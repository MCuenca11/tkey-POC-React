# Torus tKey POC

## To run the project locally:
Clone the repo then run 
'npm install' followed by
'npm run start'

## To test out the project right away, try one of the following links (If one doesn't work, another may):
### https://tkey-poc-react.vercel.app
### https://tkey-poc-react-mcuenca11.vercel.app
### https://tkey-poc-react-git-main-mcuenca11.vercel.app


Most general messages will appear in the UI output console. You can open the developer console to view more detailed error messages.

### First Time User
* Select the social provider that you want to use 
* I have only configured Google. The other other social providers are there to display more options but they may or may not work.
* This provider will be the provider that you use each time a social provider is used. There are ways to tie multiple providers to you/the share so that you can log in with various providers but I have not configured that yet.
* Click on the button labeled "Create New TKey". This will prompt you to login with the social provider you selected and will set up the first share using it. It will also set up your device share without you having to do anything. At this point you have a 2/2 threshold key.
* You will then be prompted to create a password to use for the 3rd share. 
* Once you complete these steps without errors you will have a 2/3 threshold key and the details for your key and shares will be printed out in the console.
* If you would like to view the key and share details, you can also press the "Get Private Key/Details" button.

* NOTE: If you try to create a new tKey more than once using the same shares, you won't be allowed to do it because there is already a private key assigned to the shares. You'd have to login/recover or use the reset button described in the note below.

* NOTE: For testing purposes I'm providing a way to reset the private key and shares using the "Reset tKey" button. You should only be allowed to make a private key with the same shares once (Hence the error described above) but this is a work around in case you want to start over. The creation process is the same as the "Create New TKey" button described above.


### Returning User
#### Create/Reset Private Key Column:
* If you have already created a key and you want to make a new one for testing, you can use the "Reset tKey" button to do this without conflicts due to the previous private key.
* Once you have logged in, you have some time to press the "Get Private Key/Details" button to get your private key, public key, wallet address, and share information.


#### Login/Recover Column:
* Since you only need 2 of the 3 shares to get your pivate key, you have 3 options to get it:
* 1) Using the device and password shares:
* 2) Using the device and social provider shares:
* 3) Using the password and social provider shares:

#### Refresh Lost Shares Column:
* If a share was lost or compromised, you need to make the compromised share invalid, set up a new share, and refresh the 2 good shares while keeping the same private key.
* To do this, use the "Refresh/Reset ___ Share" button for the compromised share. (Can't be done for the social provider with this code).
* Or you can click the delete share button follwed by the generate new share button for the compromised share. Doing this allows you to check the tkey details while the process is happening. The "Refresh/Reset ___ Share" buttons do both of these steps in one.

