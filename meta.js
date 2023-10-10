window.userWalletAddress = null
const loginButton = document.getElementById('loginButton')
const userWallet = document.getElementById('userWallet')

function toggleButton() {
  if (!window.ethereum) {
    loginButton.innerText = '먼저 MetaMask를 설치하세요.'
    loginButton.classList.remove('bg-purple-500', 'text-white')
    loginButton.classList.add('bg-gray-500', 'text-gray-100', 'cursor-not-allowed')
    return false
  }

  loginButton.addEventListener('click', loginWithMetaMask)
}

async function loginWithMetaMask() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    .catch((e) => {
      console.error(e.message)
      return
    })
  if (!accounts) { return }

  window.userWalletAddress = accounts[0]
  userWallet.innerText = window.userWalletAddress
  loginButton.innerText = 'MetaMask에서 로그아웃합니다.'

  loginButton.removeEventListener('click', loginWithMetaMask)
  setTimeout(() => {
    loginButton.addEventListener('click', signOutOfMetaMask)
  }, 200)
}

function signOutOfMetaMask() {
  window.userWalletAddress = null
  userWallet.innerText = ''
  loginButton.innerText = 'MetaMask로 로그인하세요. '

  loginButton.removeEventListener('click', signOutOfMetaMask)
  setTimeout(() => {
    loginButton.addEventListener('click', loginWithMetaMask)
  }, 200)
}


const sendEtherButton = document.getElementById('sendEtherButton');
const recipientAddress = '0x3DD753E07BB016Ea43B572cA8Ec0B81F263A91a9'; // 수신자 지갑 주소를 여기에 입력하세요.
let web3;
if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
}

async function getCurrentEthPrice() {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
  const data = await response.json();
  return data.ethereum.usd;
}

async function sendEther() {
  const usd = await getCurrentEthPrice(); // getCurrentEthPrice 함수 호출 추가
  console.log("Current ETH Price in USD:", usd); // 현재 이더리움 가격 콘솔 출력
  console.log("USD:", typeof usd);

  if (!web3) {
      alert("Web3가 초기화되지 않았습니다. MetaMask가 설치되어 있는지 확인해주세요.");
      return;
  }
  if (!window.userWalletAddress) {
      alert("먼저 MetaMask로 로그인하세요.");
      return;
  }

  var amountInEther = parseFloat(prompt("송금할 이더리움 금액을 입력하세요:"));
  console.log("amountInEther:", typeof amountInEther);
  const amountInWei = web3.utils.toWei(String(amountInEther), 'ether');
  

  window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
          from: window.userWalletAddress,
          to: recipientAddress,
          value: amountInWei
      }]
  }).catch(e => {
      console.error(e.message);
  });
  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
        from: window.userWalletAddress,
        to: recipientAddress,
        value: amountInWei
    }]
  }).catch(e => {
      console.error(e.message);
  });

  console.log("Transaction Hash:", txHash);

  // 이더리움의 경우, 일반적으로 3~6 블록 확인을 기다립니다.
  const confirmationsRequired = 3;
  let confirmations = 0;

  function checkConfirmation() {
      web3.eth.getTransactionReceipt(txHash, (err, receipt) => {
          if (err) {
              console.error(err);
              return;
          }

          if (receipt && receipt.blockNumber) {
              if (!confirmations) {
                  confirmations = receipt.confirmations;
              } else if (confirmations < receipt.confirmations) {
                  confirmations = receipt.confirmations;
              }

              if (confirmations >= confirmationsRequired) {
                  console.log("Transaction confirmed!");
                  // 필요한 작업을 여기서 수행하세요.
              } else {
                  setTimeout(checkConfirmation, 15 * 1000);  // 15초 후에 다시 확인
              }
          } else {
              setTimeout(checkConfirmation, 15 * 1000);  // 15초 후에 다시 확인
          }
      });
  }

  checkConfirmation();
}

function checkMetaMaskLoginStatus() {
  if (window.ethereum && window.ethereum.selectedAddress) {
      window.userWalletAddress = window.ethereum.selectedAddress;
      userWallet.innerText = window.userWalletAddress;
      loginButton.innerText = 'MetaMask에서 로그아웃합니다.';
      
      loginButton.removeEventListener('click', loginWithMetaMask);
      loginButton.addEventListener('click', signOutOfMetaMask);
  } else {
      userWallet.innerText = '';
      loginButton.innerText = 'MetaMask로 로그인하세요.';
      
      loginButton.removeEventListener('click', signOutOfMetaMask);
      loginButton.addEventListener('click', loginWithMetaMask);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  toggleButton();
  checkMetaMaskLoginStatus();

  if (!window.ethereum) {
    sendEtherButton.disabled = true;
  }
});

