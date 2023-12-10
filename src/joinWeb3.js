import { ref, computed, onMounted } from "vue";
import { useGlobalState } from '@/store'
import SpaceXABI from '@/abis/defiABI.json'
const state = useGlobalState()

console.log(123123);
let web3 = ref() 
let myAddress=ref('')//我的地址
let SpaceXContract=ref(null)// 合约实例
let myBalance=ref(null)// 钱包余额
let infoData =ref(null)// 合约信息
let usdtCoin =ref(null)// usdt地址
let spaceCoin =ref(null)// space地址
let inivetAdderss =ref(null)// 我的上级地址
let allAdderss =ref(null)// 我的上级地址
let allstakeCp =ref(null)// 全网算力
let userCp =ref(null)// 全网算力
let teamCp =ref(null)// 直推团队算力
let teamCp2 =ref(null)// 15代团队算力
let userAward =ref(null)// 全网算力
let teamAward =ref(null)// 团队可领取收益
let team2Award =ref(null)// 15代团队可领取收益
let teamLength =ref(null)// teamLength
let team2Length =ref(null)// 15代人数
let overAward =ref(null)// 已经领取了多少收益
let overTeam =ref(null)// 直推已经领取了多少收益
let overTeam2 =ref(null)// 15代已经领取了多少收益
let deadNum =ref(null)// 销毁总量
let contractAddress=ref('0xd71C14fd0e8153C00DFC98688d9C61bA982aD1c8')//合约地址


onMounted(() => {
    // Web3浏览器检测
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
      console.log('当前连接网络的id:', window.ethereum.chainId)
    }
    web3.value = new Web3(window.ethereum)
    // 连接钱包账户切换后触发的事件
    ethereum.on("accountsChanged", function(accounts) {
      console.log('连接钱包账户切换后触发的事件', accounts[0]);//一旦切换账号这里就会执行
      state.myAddress.value = accounts[0];
      joinWeb3();
    });
    // 正确处理链更改之后的业务流程可能很复杂。官方建议链更改只有重新加载页面
    ethereum.on('chainChanged', (chainId) => {
      console.log("chainId",chainId)
      window.location.reload();
    });
    // 断开连接监听事件
    ethereum.on('disconnect',  async function (result, error) {
      console.log("断开连接",result)
      console.log("error",error)
    });
    connections()
    // 测试网络 97
    if(ethereum.networkVersion == 97){
      console.log('当前是测试网络');
    }
  })

  const connections = () => { //链接小狐狸钱包
    window.ethereum.request({ method: 'eth_requestAccounts' }).then((res) => {
      console.log(res, '当前钱包地址')
      state.myAddress.value=res[0]
      joinWeb3()
    }).catch((err) => {
      console.log(err)
      if (err.code == 4001) {
        console.log('用户拒绝连接')
      }
    })
  };
  const joinWeb3 = async() =>{

    let eth_chainId = web3.value.eth.getChainId();
    console.log("eth_chainId",eth_chainId)
    let accounts = await web3.value.eth.getAccounts();
    console.log("查询eth_chainId", eth_chainId)
    // if (eth_chainId !== configs.chainId) {  // 与当前
    //    message.warning('Please switch to the Binance Smart Chain Mainnet')
    //   // 此处可调用切换网络方法，切换到正确网络
    //    return;
    // }


    SpaceXContract.value = new web3.value.eth.Contract(SpaceXABI, contractAddress.value);
    // 请求用户授权 解决web3js无法直接唤起Meta Mask获取用户身份
    const enable = await ethereum.enable();
    console.log('enable',enable[0]);
    // // 授权获取账户  
    // 返回指定地址账户的余额
    let balance = await web3.value.eth.getBalance(enable[0]);
    myAddress.value = accounts[0];
    console.log('balance',balance);
    // 账户余额
    try{
      // const signature = await web3.value.eth.personal.sign('msg', myAddress.value);
      // onsole.log("signature",signature)

      let myBalance = web3.value.utils.fromWei(balance, 'ether');
      console.log('myBalance',SpaceXContract.value.methods);
      infoData.value = await SpaceXContract.value.methods.getInfo(myAddress.value).call();
      state.updateInfoData(infoData.value)
      console.log('state',state.infoData.value)

      }catch(e){
        console.log(e);
      }
  }