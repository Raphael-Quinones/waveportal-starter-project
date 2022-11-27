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
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState('');

  const contractAddress = "0x688A0E7f7368ec9CCD99FEDe931F3F7be2294B8E";

  const contractABI = abi.abi

  const getAllWaves = async () => {
    try{
      const { ethereum } = window;
      if(ethereum){

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned.reverse());



      } else {
        console.log("Ethereum object doesn't exist!")
      }

    } catch (error) {
      console.error(error)
    }
  }

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

        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
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

  function captureMessage(event){
    setMessage(event.target.value);
  }



  useEffect( () => {
    const account = "";
    async function findMeta(){
      account = await findMetaMaskAccount();
    }
    async function getAllWav(){
      await getAllWaves();
    }

    findMeta();
    
    if(account !== null){
      setCurrentAccount(account);
    }

    getAllWav();
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

        <textarea onChange={captureMessage}></textarea>

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
        {
          allWaves.map(wave =>{
            return (<div>
              {
              //"" + converts object to string
              }
              <p>
                {"" + wave.address}
              </p>
              <p>
                {"" + wave.timestamp}
              </p>
              <p>
                {"" + wave.message}
              </p>
            </div>)
          })
        }
      </div>
    </div>
  );
}
