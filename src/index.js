// caver-js를 통해 klaytn network와 소통.
import Caver from "caver-js";
import {Spinner} from 'spin.js';

const config = {
  rpcURL: 'https://api.baobab.klaytn.net:8651'
}
const cav = new Caver(config.rpcURL);
// webpack에서 생성된 DEPLOYED 두 상수를 불러옴.
const agContract = new cav.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);

const App = {
  auth: {
    accessType: 'keystore',
    keystore: '',
    password: ''
  },

  start: async function () {
    // sessionStorage에 저장된 내 정보를 저장함.
    const walletFromSession = sessionStorage.getItem('walletInstance');
    if(walletFromSession){
      try{
        cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
        this.changeUI(JSON.parse(walletFromSession));
      } catch(e){
        sessionStorage.removeItem('walletInstance');
      }
    }
  },

  handleImport: async function () {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0]);
    fileReader.onload = (event) => {
      try{
        if(!this.checkValidKeystore(event.target.result)){
          $('#message').text('유효하지 않은 keystore 파일입니다.');
          return;
        }
        this.auth.keystore = event.target.result;
        $('#message').text('keystore 통과. 비밀번호를 입력하세요.');
        document.querySelector('#input-password').focus();
       
      } catch(event){
        $('#message').text('유효하지 않은 keystore 파일입니다.');
        return;
      }
    }
  },

  handlePassword: async function () {
    this.auth.password = event.target.value;
  },

  handleLogin: async function () {
    if(this.auth.accessType === 'keystore'){
      try{
        // keystore 파일과 password를 통해 privateKey를 가져옴.
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        // privateKey로 Wallet 인스턴스를 생성.
        this.integrateWallet(privateKey)
      } catch (e){
        $('#message').text('비밀번호가 일치하지않습니다.');
      }
    }
  },

  handleLogout: async function () {
    this.removeWallet();
    location.reload();
  },

  submitAnswer: async function () {

  },

  deposit: async function () {
    var spinner = this.showSpinner();
    // contract의 인스턴스를 만들어 접근.
    const walletInstance = this.getWallet();
    if (walletInstance) {
      // Owner만 컨트랙에 송금할 수 있게 함.
      if (await this.callOwner() !== walletInstance.address) return;
      else {
        var amount = $('#amount').val();
        if (amount) {
          agContract.methods.deposit().send({
            from: walletInstance.address,
            gas: '250000',
            value: cav.utils.toPeb(amount, "KLAY")
          })
          .once('transactionHash', (txHash) => {
            console.log(`txHash: ${txHash}`);
          })
          .once('receipt', (receipt) => {
            console.log(`(#${receipt.blockNumber})`, receipt);
            spinner.stop();
            alert(amount + " KLAY를 컨트랙에 송금하였습니다.");
            location.reload();
          })
          .once('error', (error) => {
            alert(error.message);
          });
        }
        return;
      }
    }
  },

  registerEatery: async function () {
    var name = $('#rName').val();
    var area1 = $('#area1').val();
    var area2 = $('#area2').val();
    var area3 = $('#area3').val();
    var area4 = $('#area4').val();
    document.getElementById("rName").textContent="";
    document.getElementById("area1").textContent="";
    document.getElementById("area2").textContent="";
    document.getElementById("area3").textContent="";
    document.getElementById("area4").textContent="";
    agContract.methods.openEatery().call();
    if(!agContract.methods.registerEatery(name, area1, area2, area3, area4)){
      return;
    }

    $('#registry1').hide();
    $('#menuRegistry').show();
  },

  registerMenu: async function () {
    var menuName = $('#mName').val();
    var menuCharge = $('#mCharge').val();
    agContract.methods.addMenu(menuName, menuCharge);
    alert("메뉴 추가 성공!");
    $('#mName').value="";
    document.getElementById("mCharge").textContent="";
  },

  registerComplete: async function () {
    $('#registry1').show();
    $('#menuRegistry').hide();
  },

  callOwner: async function () {
    // await : 비동기
    return await agContract.methods.owner().call();
  },

  callContractBalance: async function () {
    return await agContract.methods.getBalance().call();
  },

  getWallet: function () {
    if (cav.klay.accounts.wallet.length) {
      // 지금 로그인 되어있는 계정을 return
      return cav.klay.accounts.wallet[0];
    }
  },

  checkValidKeystore: function (keystore) {
    const parsedKeystore = JSON.parse(keystore);  // keystore파일을 parse해서 오브젝트로 변환. 분해해서 사용 가능.
    const isValidKeystore = parsedKeystore.version &&
      parsedKeystore.id &&
      parsedKeystore.address &&
      parsedKeystore.crypto;
    return isValidKeystore;
  },

  integrateWallet: function (privateKey) {
    // wallet 인스턴스를 생성.
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance);
    // session이 끝나기 전까지 wallet의 정보를 저장.
    // 새로고침하거나 다른 페이지에 갔다와도 sessionStorage에 정보가 저장되어있음.
    sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
    this.changeUI(walletInstance);
  },

  reset: function () {
    this.auth ={
      keystore: '',
      password: ''
    };
  },

  changeUI: async function (walletInstance) {
    // modal을 닫음.
    $('#loginModal').modal('hide');
    // login버튼 숨김.
    $('#login').hide();
    // logout버튼을 보여줌.
    $('#logout').show();
    $('#step').show();
    
    // $('#game').show();
    // // 계정 주소를 보여줌.
    // $('#address').append('<br>' + '<p>' + '내 계정 주소: ' + walletInstance.address + '</p>');
    // $('#contractBalance')
    // .append('<p>' + '이벤트 잔액: ' + cav.utils.fromPeb(await this.callContractBalance(), "KLAY") + 'KLAY' + '</p>');

    // if (await this.callOwner() == walletInstance.address) {
    //   $('#owner').show();
    // }
  },

  eateryUI: async function () { // 식당 주인 UI
    const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    // modal을 닫음.
    $('#loginModal').modal('hide');
    // 주문하기, 식당등록 숨김.
    //$('#step').hide();
    // logout버튼을 보여줌.
    $('#logout').show();

    // 계정 주소를 보여줌.
    $('#address').append('<br>' + '<p>' + '내 계정 주소: ' + walletInstance.address + '</p>');

    // 식당 등록 UI show()
    $('#restaurantRegister').show();
  },

  customerUI: async function () {  // 주문자 UI
    const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    // modal을 닫음.
    $('#loginModal').modal('hide');
    // 주문자 로그인, 식당 로그인 숨김.

    // logout버튼을 보여줌.
    $('#logout').show();
    // 계정 주소를 보여줌.
    $('#address').append('<br>' + '<p>' + '내 계정 주소: ' + walletInstance.address + '</p>');

    // 식당 리스트를 보여주는 UI. 식당 누르면 메뉴 리스트.
    $('#restaurantList').show();
  },

  removeWallet: function () {
    cav.klay.accounts.wallet.clear();
    sessionStorage.removeItem('walletInstance');
    this.reset();
  },

  showTimer: function () {
    var seconds = 3;
    $('#timer').text(seconds);

    var interval = setInterval(() => {
      $('#timer').text(seconds);
    }, 1000);
  },

  showSpinner: function () {
    var target = document.getElementById('spin');
    return new Spinner(opts).spin(target);
  },

  receiveKlay: function () {

  }
};

window.App = App;

window.addEventListener("load", function () {
  App.start();
});

var opts = {
  lines: 10, // The number of lines to draw
  length: 30, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#5bc0de', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};
