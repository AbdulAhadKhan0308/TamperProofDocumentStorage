"use strict";
console.log("Here");

const provider = window.ethereum;
const web3 = new Web3(window.ethereum);
let contract = 0;
const btnAdmin = document.querySelector("#ctrl-btn-Admin");
const btnStudent = document.querySelector("#ctrl-btn-Student");
const paraMessage = document.querySelector(".container__header2");
const centerAdmin = document.querySelector("#center-admin");
const centerStudent = document.querySelector("#center-student");
const inEnrollmentNo = document.querySelector("#in-enrollmentno");
const inSemester = document.querySelector("#in-semester");
const btnStore = document.querySelector("#btnStore");
const btnCID = document.querySelector("#btn-CID");
const studentEnrollmentNo = document.querySelector("#in-student-enrollmentno");
const studentSemester = document.querySelector("#in-student-semester");
const labelResult = document.querySelector("#label-result");

///////////////////////////////////////////////////

btnAdmin.addEventListener("click", () => {
  if (btnAdmin.classList.contains("dark-bnt") == false) {
    btnAdmin.classList.add("dark-btn");
    btnStudent.classList.remove("dark-btn");
    paraMessage.innerHTML = "Welcome, Admin";

    centerStudent.classList.add("hidden");
    centerAdmin.classList.remove("hidden");
  }
});

btnStudent.addEventListener("click", () => {
  if (btnStudent.classList.contains("dark-bnt") == false) {
    btnStudent.classList.add("dark-btn");
    btnAdmin.classList.remove("dark-btn");
    paraMessage.innerHTML = "Welcome, Student";

    centerAdmin.classList.add("hidden");
    labelResult.classList.add("hidden");
    centerStudent.classList.remove("hidden");
  }
});

///////////////////////////////////////////
if (provider) {
  startApp(provider); // Initialize your app
} else {
  console.log("Please install MetaMask! and uninstall other wallets");
}

function startApp(provider) {
  // If the provider returned by detectEthereumProvider is not the same as
  // window.ethereum, something is overwriting it, perhaps another wallet.
  if (provider !== window.ethereum) {
    console.error("Do you have multiple wallets installed?");
  }
}

/**********************************************************/
/* Handle chain (network) and chainChanged (per EIP-1193) */
/**********************************************************/

/* Handle user accounts and accountsChanged (per EIP-1193) */
/***********************************************************/

const executeit = async function () {
  const chainId = await ethereum.request({ method: "eth_chainId" });

  handleChainChanged(chainId);

  function handleChainChanged(_chainId) {
    console.log(
      "Connected to chain with id (eg 0x2a is Kovan testnet) ",
      chainId,
      "ethereum.isConnected() ",
      ethereum.isConnected()
    );
  }

  let currentAccount = null;
  ethereum
    .request({ method: "eth_accounts" })
    .then(handleAccountsChanged)
    .catch((err) => {
      // Some unexpected error.
      // For backwards compatibility reasons, if no accounts are available,
      // eth_accounts will return an empty array.
      console.error(err);
    });

  // Note that this event is emitted on page load.
  // If the array of accounts is non-empty, you're already
  // connected.
  ethereum.on("accountsChanged", handleAccountsChanged);

  // For now, 'eth_accounts' will continue to always return an array
  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log("Go to wallet and please connect to MetaMask.");
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
      console.log(currentAccount);
    }
  }
  function connect() {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then(handleAccountsChanged)
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log("Please connect to MetaMask.");
        } else {
          console.error(error);
        }
      });
  }
  connect();
  const Abi = [
    {
      inputs: [
        {
          internalType: "string",
          name: "rollsem",
          type: "string",
        },
        {
          internalType: "string",
          name: "cid",
          type: "string",
        },
      ],
      name: "update",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "rollsem",
          type: "string",
        },
      ],
      name: "getHashOfMarksheet",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      name: "marksheethashes",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  contract = new web3.eth.Contract(
    Abi,
    "0xDA985542EC843a17a36F3b641d8CD08569a7c6C8"
  );
  console.log("This is contract", contract);
};

executeit();

/*contract.defaultAccount = `0xd9AaCbcdbF452bD80eb610fB5687E4DeEF4A44f1`;
contract.defaultChain = 'kovan';
contract.options.address = contractaddress;
console.log(contract.methods, typeof contract.methods);*/

//////////////////////////////////////////

btnStore.addEventListener("click", async () => {
  //take the input
  let inputted = inputtoJSON();

  console.log("This is inputted in JSON format", inputted);

  //convert to json
  const marksheetstr = JSON.stringify(inputted);

  console.log("This is marksheetstr", marksheetstr);

  //store on ipfs
  const hashObj = await addToRemoteNode(marksheetstr);
  console.log("This is hashObj", hashObj);

  //hash on Ethereum's Kovan testnet
  hashOnChain(`${inputted.enrollmentno}$${inputted.semester}`, hashObj.path);
});

btnCID.addEventListener("click", async () => {
  const rollsem = `${studentEnrollmentNo.value}$${studentSemester.value}`;

  console.log("Rollsem", rollsem);

  //get marksheet cid form mapping in deployed smartcontract
  const value = await contract.methods.getHashOfMarksheet(rollsem).call();
  let showmessage;

  if (value)
    showmessage = `Your marksheet is available at https://ipfs.infura.io/ipfs/${value}`;
  else showmessage = `Your marksheet is unavailable on IPFS`;

  console.log(showmessage);
  labelResult.classList.remove("hidden");

  labelResult.innerHTML = showmessage;
});

///////////////////////////////////////
/*btnCopyright.addEventListener("click", function () {
  var songlyrics = inputcopyright.value;
  console.log("LYRICS");
  console.log(songlyrics);

  contract.methods
    .copyrightLyrics(songlyrics)
    .send({ from: ethereum.selectedAddress }, (err, result) => {
      if (err) console.log(err);
      else {
        alert(
          "SUCCESS! YOU CAN GET TRANSACTION DETAILS BY VISITING etherscan.io PAGE OF THE CHAIN YOU ARE OPERATING ON"
        );
        console.log("Hash", result);
      }
    });
});

btnVerify.addEventListener("click", async function () {
  var songlyrics = inputVerify.value;
  const value = await contract.methods.checkLyrics(songlyrics).call();
  console.log(value);
  if (value) alert(`TRUE: This song is copyrighted.`);
  else alert(`FALSE: This song is not copyrighted.`);
});*/
//////////////////////////////////////////

async function addToRemoteNode(strmarksheet) {
  const ipfs = window.IpfsHttpClient.create("https://ipfs.infura.io:5001");

  console.log(ipfs);

  console.log("getEndpointConfig()");
  console.log(ipfs.getEndpointConfig());

  const file = await ipfs.add({ content: strmarksheet });
  console.log(file);
  return file;
}

function inputtoJSON() {
  const inputted = new Object();
  let i = 0;

  inputted.enrollmentno = inEnrollmentNo.value;
  inputted.semester = inSemester.value;
  inputted.subjects = new Array();
  inputted.grades = new Array();

  for (i = 0; i < 10; i++) {
    const elemsub = document.querySelector(`#in-sub${i + 1}`);
    const elemgrade = document.querySelector(`#in-grade${i + 1}`);
    inputted.subjects.push(elemsub.value);
    inputted.grades.push(elemgrade.value);
  }
  console.log("This is marksheet", inputted);
  return inputted;
}

function hashOnChain(rollsem, cid) {
  console.log("Rollsem", rollsem);
  console.log("cid", cid);

  contract.methods
    .update(rollsem, cid)
    .send({ from: ethereum.selectedAddress }, (err, result) => {
      if (err) console.log(err);
      else {
        alert(
          "SUCCESS! YOU CAN GET TRANSACTION DETAILS BY VISITING etherscan.io PAGE OF THE CHAIN YOU ARE OPERATING ON"
        );
      }
    });
}
/*addToRemoteNode("AAAAifkdls");
  console.log(inSemester);
  const node = await window.IpfsCore.create();
  const version = await node.version();
  console.log("Inside asyn main func");
  console.log("Version", version.version);

  const file = await node.add({
    path: "hello.txt",
    content: "Hello World 101",
  });

  console.log("Added file:", file.path, file.cid.toString());
*/

///////////////////////////////////////////
