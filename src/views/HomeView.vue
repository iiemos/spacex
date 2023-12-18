<script setup>
  import { ref, computed, onMounted } from "vue";
  import { ElMessage } from "element-plus";
  import { useGlobalState } from '@/store'
  import SpaceXABI from '@/abis/defiABI.json'
  import { useRouteQuery } from '@vueuse/router'
  // import Web3 from 'web3'
  const state = useGlobalState()
  // import '@/joinWeb3'
  const invites = useRouteQuery('invs')
  console.log('首页显示的邀请地址',invites.value);
  let web3 = ref() 
  let myAddress=ref('')//我的地址
  let DeFiContract=ref(null)// 合约实例
  let myBalance=ref(null)// 钱包余额
  let infoData =ref(null)// 合约信息

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
    setTimeout(()=>{
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
    },1000)

  })


  const joinWeb3 = async() =>{

    let eth_chainId = web3.value.eth.getChainId();
    console.log("查询eth_chainId", eth_chainId)
    DeFiContract.value = new web3.value.eth.Contract(SpaceXABI, state.contractAddress.value);
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
      console.log('myBalance',DeFiContract.value.methods,myBalance);
      infoData.value = await DeFiContract.value.methods.getInfo(myAddress.value).call();

      state.updateInfoData(infoData.value)

      // // 合约账户余额
      // this.contractBalance = web3.value.utils.fromWei(await web3.value.eth.getBalance(this.contractAddress))
      // // eggsPerMiner 一天的时间秒数  864000（秒）
      // this.eggsPerMiner = await this.eggContract.methods.EGGS_TO_HATCH_1MINERS().call();
      // // myMiners 用户质押数量
      // this.myMiners = await this.eggContract.methods.hatcheryMiners(this.myAddress).call();
      // // myEggs 用户获得的奖励
      // this.myEggs =  await this.eggContract.methods.getMyEggs().call({from:this.myAddress});
      // // 
      // let myEarns = 0;
      // if(this.myEggs > 0){
      //   myEarns = web3.value.utils.fromWei(await this.eggContract.methods.calculateEggSell(this.myEggs).call());
      //   if(Number(myEarns) < 0.000001){
      //     myEarns = 0;
      //   }
      // }
      // this.myEarns = myEarns // 计算最终奖励
      // console.log('myBalance',this.myBalance);
      // console.log('contractBalance',this.contractBalance);
      // console.log('eggsPerMiner',this.eggsPerMiner);
      // console.log('myMiners',this.myMiners);
      // console.log('myEggs',this.myEggs);
      // console.log('myEarns',this.myEarns);
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
    <!-- Section A -->
    <section class="section-a">
      <span class="background gallery-background gallery-full" role="img" aria-label="Image from Starship's Second Flight Test" data-desktop="https://sxcontent9668.azureedge.us/cms-assets/assets/Flight_2_Web_Crop_fbebdf1cd4.jpg" data-mobile="https://sxcontent9668.azureedge.us/cms-assets/assets/Flight_Test_2_Launch_Checkpoint_20231118_DSC_04687_037481d4c6.jpg" style="background-image: url(&quot;https://sxcontent9668.azureedge.us/cms-assets/assets/Flight_2_Web_Crop_fbebdf1cd4.jpg&quot;);"><div class="vsc-controller"></div>
        <video aria-hidden="true" data-content-video="true" poster="https://sxcontent9668.azureedge.us/cms-assets/assets/Flight_2_Web_Crop_fbebdf1cd4.jpg" muted="" playsinline="" loop="" autoplay="">
          <source type="video/mp4" src="https://sxcontent9668.azureedge.us/cms-assets/assets/OTF_2_Launch_Checkpoint_Slo_Mo_1920_1080_4ef903451e.mp4">
        </video>
      </span>
      <div class="section-inner">
        <h4>SpaceX</h4>
        <h2>{{ $t("HighYieldMiner") }}</h2>
        <a href="javascript:;" class="btn">
          <div class="hover"></div>
          <span @click="copyLink()" v-if="myAddress">{{ $t("inviteFriends") }}</span>
          <span @click="connections()" v-if="!myAddress">{{ $t("ConnectWallet") }}</span>
        </a>
      </div>

      <div class="scroll-arrow">
        <svg width="30px" height="20px">
          <path
            stroke="#ffffff"
            fill="none"
            stroke-width="2px"
            d="M2.000,5.000 L15.000,18.000 L28.000,5.000 "
          ></path>
        </svg>
      </div>
    </section>
    <!-- Section B -->
    <section class="section-b">
      <div class="section-inner">
        <h4>SpaceX</h4>
        <h2>{{ $t("ViewHomePage") }}</h2>
        <a :href="`/?invs=${invites}`" class="btn">
          <div class="hover"></div>
          <span>{{ $t('home') }}</span>
        </a>
      </div>
    </section>
    <!-- Section C -->
    <section class="section-c">
      <div class="section-inner">
        <h4>SpaceX</h4>
        <h2>{{ $t("AddLiquidity") }}</h2>
        <a :href="`/liquidity?invs=${invites}`" class="btn">
          <div class="hover"></div>
          <span>{{ $t('liquidity') }}</span>
        </a>
      </div>
    </section>
    <!-- Section F -->
    <section class="section-f">
      <div class="section-inner">
        <h4>SpaceX</h4>
        <h2>{{ $t("ViewMyTeam") }}</h2>
        <a :href="`/team?invs=${invites}`" class="btn">
          <div class="hover"></div>
          <span>{{ $t('team') }}</span>
        </a>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style>
</style>
