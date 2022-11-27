import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    if (!ethereum) {
      console.error("Make sure you have metamask!");
      return null;
    };

    console.log("We have ethereum object: ", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if(accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  const contractAddress = "0x2854b42f7857918D77426A2CC97De0862Da4F352";

  const contractABI = abi.abi

  const connectWallet = async () => {
    try{
      const ethereum = getEthereumObject();
      if(!ethereum){
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({
        method:"eth_requestAccounts",
      });

      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error){
      console.error(error)
    }
  }

  const wave = async () => {
    try{
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined-- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect( () => {
    const account = "";
    async function findMeta(){
      account = await findMetaMaskAccount();
    }

    findMeta();
    
    if(account !== null){
      setCurrentAccount(account);
    }
  }, [])

  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {
          !currentAccount && (
            <button className = "waveButton" onClick = {connectWallet}>
              Connect Wallet
            </button>
          )
        }
      </div>
    </div>
  );
}
