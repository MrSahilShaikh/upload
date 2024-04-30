// import React, { useState } from 'react';
// import Web3 from 'web3';
// import './index.css'

// // Assuming you have your contract ABI and contract address
// const contractABI = [
//   // your contract ABI here
// ];
// const contractAddress = '0xYourContractAddress';

// const Upload=()=> {
//   const [whitelistAddress, setWhitelistAddress] = useState('');
//   const [status, setStatus] = useState('');
//   const [web3, setWeb3] = useState(null);
//   const [connectedAddress, setConnectedAddress] = useState('');

//   const handleInputChange = (e) => {
//     setWhitelistAddress(e.target.value);
//   };

//   const handleUpload = async () => {
//     try {
//       const contract = new web3.eth.Contract(contractABI, contractAddress);

//       // Upload whitelist address
//       await contract.methods.uploadWhitelistAddress(whitelistAddress).send({ from: connectedAddress });

//       setStatus('Address uploaded successfully!');
//     } catch (error) {
//       console.error('Error uploading address:', error);
//       setStatus('Error uploading address. See console for details.');
//     }
//   };

//   const connectMetaMask = async () => {
//     try {
//       if (window.ethereum) {
//         await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const web3Instance = new Web3(window.ethereum);
//         setWeb3(web3Instance);
//         const accounts = await web3Instance.eth.getAccounts();
//         setConnectedAddress(accounts[0]);
//       } else {
//         setStatus('MetaMask not found. Please install MetaMask to connect.');
//       }
//     } catch (error) {
//       console.error('Error connecting MetaMask:', error);
//       setStatus('Error connecting MetaMask. See console for details.');
//     }
//   };

//   return (
//     <div>
//         <h1>Upload Whitelist Address</h1>
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        
//         {connectedAddress ? (
//           <p>Connected Address: {connectedAddress}</p>
//         ) : (
//           <button onClick={connectMetaMask}>Connect MetaMask</button>
//         )}
//       </header>
//       <div style={{ padding: '20px' }}>
//         <input type="text" placeholder="Enter Whitelist Address" value={whitelistAddress} onChange={handleInputChange} />
//         <button onClick={handleUpload}>Upload</button>
//         {status && <p>{status}</p>}
//       </div>
//     </div>
//   );
// }

// export default Upload;

import React, { useState } from 'react';
import Web3 from 'web3';
import './index.css';

const contractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_admin",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_hardcap",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_superAdmin",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_maxContribution",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_minContribution",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AccessControlBadConfirmation",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "neededRole",
				"type": "bytes32"
			}
		],
		"name": "AccessControlUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_accounts",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_contributions",
				"type": "uint256[]"
			}
		],
		"name": "addMultipleToWhitelist",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "addToWhitelist",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contribute",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "disableWhitelist",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "enableWhitelist",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "endRaise",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "finaliseRaise",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "grantRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_newHardCap",
				"type": "uint256"
			}
		],
		"name": "HardCapIncreased",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newHardCap",
				"type": "uint256"
			}
		],
		"name": "increaseHardCap",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_max",
				"type": "uint256"
			}
		],
		"name": "MaxContributionSet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_min",
				"type": "uint256"
			}
		],
		"name": "MinContributionSet",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_account",
				"type": "address"
			}
		],
		"name": "removeFromWhitelist",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "callerConfirmation",
				"type": "address"
			}
		],
		"name": "renounceRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "revokeRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "previousAdminRole",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "newAdminRole",
				"type": "bytes32"
			}
		],
		"name": "RoleAdminChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleRevoked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_max",
				"type": "uint256"
			}
		],
		"name": "setMaxContribution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "startRaise",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "_account",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "_value",
				"type": "bool"
			}
		],
		"name": "WhitelistUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "raiseEndedEvent",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "raiseStartedEvent",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_feePercent",
				"type": "uint256"
			}
		],
		"name": "setFeePercent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_hardCap",
				"type": "uint256"
			}
		],
		"name": "setHardCap",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_min",
				"type": "uint256"
			}
		],
		"name": "setMinContribution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_time",
				"type": "uint256"
			}
		],
		"name": "totalContributed",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "ADMIN_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractCreator",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "contributions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "contributorsList",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DEFAULT_ADMIN_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "feePercent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			}
		],
		"name": "getRoleAdmin",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "hardCap",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "hasRole",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maxContribution",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "minContribution",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "numOfContributors",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "raiseEnded",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "raiseStarted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "superAdmin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalRaised",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "whitelist",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "WhitelistAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "whitelistEnabled",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const contractAddress = '0x85b74f31695cA4E05D7638b51144dAa40629BBF8';

const Upload = () => {
  const [whitelistAddresses, setWhitelistAddresses] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [status, setStatus] = useState('');
  const [web3, setWeb3] = useState(null);
  const [connectedAddress, setConnectedAddress] = useState('');

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name === 'address') {
      const updatedAddresses = [...whitelistAddresses];
      updatedAddresses[index] = value;
      setWhitelistAddresses(updatedAddresses);
    } else if (name === 'contribution') {
      const updatedContributions = [...contributions];
      updatedContributions[index] = value;
      setContributions(updatedContributions);
    }
  };

  const handleAddAddress = () => {
    setWhitelistAddresses([...whitelistAddresses, '']);
    setContributions([...contributions, '']);
  };

  const handleUpload = async () => {
    try {
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // Convert contribution amounts to wei format
      const contributionsWei = contributions.map(amount => web3.utils.toWei(amount, 'ether'));

      // Upload whitelist addresses and contributions
      console.log('Uploading addresses:', whitelistAddresses);
      console.log('Contributions (in wei):', contributionsWei);
      await contract.methods.addMultipleToWhitelist(whitelistAddresses, contributionsWei).send({ from: connectedAddress });

      setStatus('Addresses uploaded successfully!');
    } catch (error) {
      console.error('Error uploading addresses:', error);
      setStatus('Error uploading addresses. See console for details.');
    }
  };

  const connectMetaMask = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        setConnectedAddress(accounts[0]);
      } else {
        setStatus('MetaMask not found. Please install MetaMask to connect.');
      }
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
      setStatus('Error connecting MetaMask. See console for details.');
    }
  };

  return (
    <div>
      <h1>Add Multiple Addresses to Whitelist</h1>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        {connectedAddress ? (
          <p>Connected Address: {connectedAddress}</p>
        ) : (
          <button onClick={connectMetaMask}>Connect MetaMask</button>
        )}
      </header>
      <div style={{ padding: '20px' }}>
        {whitelistAddresses.map((address, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              name="address"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => handleInputChange(e, index)}
            />
            <input
              type="number"
              name="contribution"
              placeholder="Enter Contribution"
              value={contributions[index]}
              onChange={(e) => handleInputChange(e, index)}
            />
          </div>
        ))}
        <button onClick={handleAddAddress}>Add Address</button>
        <button onClick={handleUpload}>Upload</button>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
};

export default Upload;



