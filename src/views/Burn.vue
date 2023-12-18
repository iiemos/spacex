
<script setup>
  import { ref, computed, onMounted } from "vue";
  import { ElMessage } from "element-plus";
  import { useGlobalState } from '@/store'
  import SpaceXABI from '@/abis/defiABI.json'
  // import Web3 from 'Web3'
  const state = useGlobalState()
  // import '@/joinWeb3'

  console.log('state',state);
  let web3 = ref() 
  let myAddress=ref('')//我的地址
  let SpaceXContract=ref(null)// 合约实例
  let myBalance=ref(null)// 钱包余额
  let infoData =ref(null)// 合约信息

  let fromWeiFun = (val)=>{ 
    if(val == 0) return val
    return (val / 1000000000000000000)
  }

  let refLinks = computed(()=>{ 
    if(myAddress.value){
      return window.location.origin + `/?invs=${myAddress.value}`
    }
    return 'Connect Wallet'
  })
  let showAdd = computed(()=>{ 
    if(!myAddress.value) return 'Connect Wallet'
    return myAddress.value.substring(0,4) + '....' + myAddress.value.substr(-4,4);
  })

  const navToggle = () => {
  };
  const connections = () => { //链接小狐狸钱包
    window.ethereum.request({ method: 'eth_requestAccounts' }).then((res) => {
      console.log(res, '当前钱包地址')
      myAddress.value=res[0]
      joinWeb3()
    }).catch((err) => {
      console.log(err)
      if (err.code == 4001) {
        console.log('用户拒绝连接')
      }
    })
  };

  onMounted(() => {
    // Web3浏览器检测
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
      // console.log('当前连接网络的id:', window.ethereum.chainId)
    }

    web3.value = new Web3(window.ethereum)
    // 连接钱包账户切换后触发的事件
    ethereum.on("accountsChanged", function(accounts) {
      console.log('连接钱包账户切换后触发的事件', accounts[0]);//一旦切换账号这里就会执行
      myAddress.value = accounts[0];
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
      // ElMessage.error('Please check if the network environment is a production environment');
    }
  })


  const joinWeb3 = async() =>{

    let eth_chainId = web3.value.eth.getChainId();
    console.log("查询eth_chainId", eth_chainId)
    // if (eth_chainId !== configs.chainId) {  // 与当前
    //    message.warning('Please switch to the Binance Smart Chain Mainnet')
    //   // 此处可调用切换网络方法，切换到正确网络
    //    return;
    // }
    SpaceXContract.value = new web3.value.eth.Contract(SpaceXABI, state.contractAddress.value);
    // 请求用户授权 解决web3js无法直接唤起Meta Mask获取用户身份
    // 请求用户授权 解决web3js无法直接唤起Meta Mask获取用户身份
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    // // 授权获取账户
    // 返回指定地址账户的余额
    let balance = await web3.value.eth.getBalance(accounts[0]);
    myAddress.value = accounts[0];
    console.log('balance',balance);
    // 账户余额
    try{
      // const signature = await web3.value.eth.personal.sign('msg', myAddress.value);
      // onsole.log("signature",signature)

      myBalance.value = web3.value.utils.fromWei(balance, 'ether');
      console.log('myBalance',SpaceXContract.value.methods,myBalance);
      infoData.value = await SpaceXContract.value.methods.getInfo(myAddress.value).call();
      state.updateInfoData(infoData.value)
      console.log('infoData.value',infoData.value);
    }catch(e){
      console.log(e);
    }
  }
  const copyLink = () => {
    let _input = document.createElement('input')
      _input.value = refLinks.value;
      document.body.appendChild(_input)
      _input.select()
      document.execCommand('Copy')
      ElMessage.success('Copied to clipboard')
      _input.remove()
  };
</script>
<template>
    <div class="home">
      <Header />
        <section class="section-animate bg-burn"></section>
        <div class="section-inner-center">
          <h3>{{ $t("TokenBurning") }}</h3>
          <p>{{ $t("SpaceXTokenBurnStatus") }}</p>
        </div>
        <div class="burn_num">
          <div class="burn_item">
            <count-to class="conut_to" :startVal='0' :endVal='fromWeiFun(state.infoData.value.deadNum)' :duration='3000' :decimals="5"/>
            <span class="label">{{ $t("TotalBlackHole") }}</span>
          </div>
          <!-- <div class="burn_item">
            <count-to class="conut_to" :startVal='0' :endVal='60000000' :duration='3000' :decimals="0"/>
            <span class="label">{{ $t("TotalDeflation") }}</span>
          </div>
          <div class="burn_item">
            <count-to class="conut_to" :startVal='0' :endVal='6000000000' :duration='3000' :decimals="0"/>
            <span class="label">{{ $t("Circulation") }}</span>
          </div> -->
        </div>
      <Footer />
    </div>
  </template>
  
  <style lang="less">
  .burn_num{
    padding: 50px 0;
    .burn_item{
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font: 48px/55px D-DIN-Light,Arial,Verdana,sans-serif;
      margin: 0;
      .label{
        font: 12px/24px D-DIN-Medium,Arial,Verdana,sans-serif;
      }
    }
  }
  </style>
  