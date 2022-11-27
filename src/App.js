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

  const contractAddress = "0x046eafFD179100c46065A2b8e5AD895B1FEF4D98";

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
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState =>[
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message
        }
      ])
      allWaves.reverse();

    }

    if(window.ethereum){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      wavePortalContract.off("NewWave", onNewWave);
    }
  }, [])

  getAllWaves();

  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        glad you're alive
        </div>

        <div className="bio">
          <p>This is a "Depressing things that happened to everyone" wall.</p>
          <p>Write here some bad memories you haven't forgotten.</p>  
          <p>A reason why you keep staring at nothingness. </p> 
          <p>Or, a reason why you're feeling guilty. </p>
          <p>Let it all out. </p>
          <p>Tell us.</p> 
        </div>

        <textarea placeholder = "What's that thing that makes you cry at night?" className = "textMessage" onChange={captureMessage}></textarea>

        <button className="waveButton" onClick={wave}>
          let everyone know
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
            return (<div className="messages">
              {
              //"" + converts object to string
              }
              <p className = "message">
              {"" + wave.message}
              </p>
              <p className = "timestamp">
              <b>On: </b>{"" + wave.timestamp}
              </p>
              <p className = "from">
              <b>From: </b> {"" + wave.address}
              </p>
            </div>)
          })
        }
      </div>
    </div>
  );
}
