
<script setup>
  import { ref, computed, onMounted } from "vue";
  import { RouterLink, RouterView } from "vue-router";
  import { useStorage } from '@vueuse/core'
  // import Web3 from 'web3'
  import { useRouteQuery } from '@vueuse/router'
	import IconUSDT from '@/components/icons/IconUSDT.vue'
	import IconSpacex from '@/components/icons/IconSpacex.vue'
  import { useGlobalState } from "@/store";
  import { useDebounceFn } from '@vueuse/core'
  import { ElMessage } from "element-plus";
  import { Pointer } from '@element-plus/icons-vue'
  import SpaceXABI from "@/abis/defiABI.json";
  import usdtABI from "@/abis/usdtABI.json";


  const tabsActive = ref(0)
  const myUSDTNumber = ref(0) // 添加的usdt数量
  let addSpaceX = computed((d)=>{  // 动态计算添加的SpaceX数量
    return Number(myUSDTNumber.value) * 1.94433333333333
  })

  const state = useGlobalState();
  let web3 = ref();
  let myAddress = ref(""); //我的地址
  let infoData = ref(""); //我的地址
  let myETHBalance = ref(""); // EHT余额
  let myUSDTBalance = ref(""); // USDT余额
  let mySpaceXBalance = ref(""); // SpaceX余额
  let DeFiContract = ref(""); // 合约实例
  let usdtContract = ref(""); // usdt合约实例
  const invites = useRouteQuery('invites')
  const refLinks = ref('')
  if(invites.value){
    refLinks.value = invites
  }else{
    refLinks.value =  '0xDA02d522d8cd60de0a2F9773f80b16Fc9ED99bdd'
  }
  const changeTabs = (idx)=>{
    tabsActive.value = idx
  }
  onMounted(() => {

    // Web3浏览器检测
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!");
      console.log("当前连接网络的id:", window.ethereum.chainId);
    }

    web3.value = new Web3(window.ethereum);
    // 连接钱包账户切换后触发的事件
    ethereum.on("accountsChanged", function (accounts) {
      console.log("连接钱包账户切换后触发的事件", accounts[0]); //一旦切换账号这里就会执行
      myAddress.value = accounts[0];
      joinWeb3();
    });
    // 正确处理链更改之后的业务流程可能很复杂。官方建议链更改只有重新加载页面
    ethereum.on("chainChanged", (chainId) => {
      console.log("chainId", chainId);
      window.location.reload();
    });
    // 断开连接监听事件
    ethereum.on("disconnect", async function (result, error) {
      console.log("断开连接", result);
      console.log("error", error);
    });
    connections();
  });

  const connections = () => {
    //链接小狐狸钱包
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((res) => {
        console.log(res, "当前钱包地址");
        myAddress.value = res[0];
        joinWeb3();
      })
      .catch((err) => {
        console.log(err);
        if (err.code == 4001) {
          console.log("用户拒绝连接");
        }
      });
  };
  const joinWeb3 = async () => {
    let eth_chainId = web3.value.eth.getChainId();
    console.log("eth_chainId", eth_chainId);
    let accounts = await web3.value.eth.getAccounts();
    console.log("查询eth_chainId", eth_chainId);
    // 请求用户授权 解决web3js无法直接唤起Meta Mask获取用户身份
    const enable = await ethereum.enable();
    console.log("enable", enable[0]);
    // // 授权获取账户
    // 返回指定地址账户的余额
    let balance = await web3.value.eth.getBalance(enable[0]);
    myAddress.value = accounts[0];
    console.log("balance", balance);
    try {
      // 创建合约实例
      DeFiContract.value = new web3.value.eth.Contract(SpaceXABI,state.contractAddress.value);
      console.log('DeFiContract.value ',DeFiContract.value );
      // 获取合约中返回的信息
      infoData.value = await DeFiContract.value.methods.getInfo(myAddress.value).call();
      // 设置info值
      state.updateInfoData(infoData.value);
      console.log('infoData.value',infoData.value);
      // 创建usdt合约实例
      usdtContract.value = new web3.value.eth.Contract(usdtABI, state.infoData.value.usdtCoin);
      console.log('usdtContract.value',usdtContract.value);
      // 获取钱包eth余额
      myETHBalance.value = web3.value.utils.fromWei(balance, "ether");
      console.log('myETHBalance',myETHBalance.value);
      // 获取usdt余额
      let usdtBalance = await usdtContract.value.methods.balanceOf(myAddress.value).call();
      myUSDTBalance.value = web3.value.utils.fromWei(usdtBalance, "ether");
      console.log('usdtBalance',myUSDTBalance.value);
      // 获取当前质押等级
      state.userLevel.value = await DeFiContract.value.methods.getUserLevel(myAddress.value).call();
      console.log("state.userLevel.value", state.userLevel.value);
    } catch (e) {
      console.log(e);
    }
  };
  const addLiquidityFn = useDebounceFn( async(val) => {
    if(!myAddress.value || myAddress.value === '0x00000000000000000000000000000000deadbeef'){
      return joinWeb3()
    }
    if(myETHBalance.value * 1 < 0.001) return ElMessage.warning('Insufficient Gas');
    if(myUSDTBalance.value < 0.01 || myUSDTNumber.value < 0.01) return ElMessage.error('Minimum deposit amount 0.01 BNB');
    const callValue = web3.value.utils.toWei(myUSDTNumber.value);
    // 判断是否授权
    let allowanceOfCurrentAccount = await usdtContract.value.methods.allowance(myAddress.value, state.contractAddress.value).call();
    console.log('被授权的数量：',allowanceOfCurrentAccount);
    if(allowanceOfCurrentAccount == 0 || allowanceOfCurrentAccount < callValue){
      console.log('执行授权语句');
      let defaultVal = web3.value.utils.toWei("10000000000", "ether");
      usdtContract.value.methods.approve(state.contractAddress.value , defaultVal).send({from: myAddress.value,gas:20000000}).then((receipt) => {
        console.log('Approval successful:', receipt);
        ElMessage.success('授权成功！请继续操作！',3)
      }).catch((error) => {
        console.error('Approval failed:', error.code);
        if(error.code == '-32603'){
          ElMessage.error('GAS is low, please adjust the cost of GAS');
        }
      });

    }else{
      //执行转账语句
      console.log('执行转账语句');
      if(DeFiContract.value){
        try{
          const mode = 1; // 模式
            let inviter = refLinks.value;
            DeFiContract.value.methods.stake(
              inviter,
              myAddress.value,
              mode,
              callValue
            )
            .send({
              from: myAddress.value,
            })
            .on('transactionHash', (hash)=>{
              console.log(hash);
              ElMessage.success('Transaction sent')
              console.log("Transaction sent");
            })
            .once('receipt', res => {
              ElMessage.success('Transaction confirmed')
              console.log("Transaction confirmed");
              myUSDTNumber.value = 0
              joinWeb3();
            })
            .catch(err => console.log(err))
          }catch(e){
            console.log(e);
          }
      }
    }
  }, 500)

  const addLiquidityFn2 = useDebounceFn( async(val) => {
    console.log(123);
    if(!myAddress.value || myAddress.value === '0x00000000000000000000000000000000deadbeef'){
      return joinWeb3()
    }
    if(myETHBalance.value * 1 < 0.001) return ElMessage.warning('Insufficient Gas');
    if(myUSDTBalance.value < 0.01 || myUSDTNumber.value < 0.01) return ElMessage.error('Minimum deposit amount 0.01 BNB');
    const callValue = web3.value.utils.toWei(myUSDTNumber.value);
    // 计算等比例的
  })

</script>
<template>
    <div class="home">
      <Header />
      <section class="section-animate bg-dragon liquidity_warp">
        <div class="section-inner-center">
            <div class="lp_warp">
              <div class="content-tabs animate" role="tablist" style="opacity: 1; visibility: inherit; translate: none; rotate: none; scale: none; transform: translate3d(0px, 0px, 0px);">
              </div>
                <h2>{{ $t("AddLiquidity") }}</h2>
                <div class="tab_tlt_warp">
                  <div class="tab_tlt_item" :class="{active : tabsActive == 0}" @click="changeTabs(0)">
                    USDT
                  </div>
                  <span>|</span> 
                  <div class="tab_tlt_item" :class="{active : tabsActive == 1}" @click="changeTabs(1)">
                    USDT + SpaceX
                  </div>
                </div>
                <div class="my_balance_box">
                  <div>
                    {{ $t("WalletBalance") }}：
                  </div>
                  <div>
                    <div style="text-align: right;">
                      {{ myETHBalance }} BNB 
                    </div>
                    <div style="text-align: right;">
                      {{ myUSDTBalance }} USDT
                    </div>
                  </div>
                </div>
                <table class="data additional-toggle" style="display: table">
                    <tbody >
                        <tr class="js-stagger">
                            <td >
                              <div class="coin_box">
                                <IconUSDT class="lp_icon" /> USDT
                              </div>
                            </td>
                            <td >
                                <input type="text" v-model="myUSDTNumber">
                            </td>
                        </tr>
                        <tr class="js-stagger" v-if="tabsActive !=0">
                            <td >
                              <div class="coin_box">
                                <IconSpacex class="lp_icon" /> SpaceX
                              </div>
                            </td>
                            <td style="padding: 20px 0;">
                              {{ addSpaceX }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="add_liquidity" @click="addLiquidityFn()"  v-if="tabsActive ==0">
			        <span class="text">{{ $t("AddLiquidity") }}</span>
		        </div>
            <div class="add_liquidity" @click="addLiquidityFn2()" v-if="tabsActive ==1">
			        <span class="text">{{ $t("AddLiquidity") }}</span>
		        </div>
        </div>
      </section>
      <Footer />
    </div>
  </template>
  
  <style lang="less" scoped>
  .my_balance_box{
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
    font-family: D-DIN-Bold;
    border-bottom: 1px solid #fff;
  }
  .tab_tlt_warp{
    display: flex;
    align-items: center;
    font-family: D-DIN-Bold;
    margin-top: 20px;
    span{
      display: block;
      margin: 0 6px;
      opacity: .5;
    }
    .tab_tlt_item{
      opacity: .5;
      transition: opacity .3s;
      &.active{
        opacity: 1;
      }
    }
  }
  .liquidity_warp{
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lp_warp{
    h2{
      font-size: 30px;
      font-family: D-DIN-Bold;
      text-align: left;
    }
  }
  .add_liquidity{
      margin-top: 20px;
      cursor: pointer;
      text-align: center;
      padding: 10px 15px;
      border: 1px solid #fff;
    }
  .my_liquidity{
    width: 90%;
    position: relative;
    margin: 10px;
    overflow: hidden;

    .my_liquidity_tlt{
      h4{
        font: 36px/36px D-DIN-Bold,Arial,Verdana,sans-serif;
        font-weight: 400;
        font-style: normal;
      }
    }

    .my_liquidity_item{
      padding: 20px 0;
      border-bottom: 1px solid #fff;
    }
    .my_liquidity_item,.my_liquidity_top{
      display: flex;
      align-items: center;
    }
    .my_liquidity_item_num{
      width: 33.33%;
    }
    .my_liquidity_item_usdt{
      width: 33.33%;
    }
    .my_liquidity_item_sx{
      width: 33.33%;
    }
  }
  .add_lp_list{
    display: flex;
    flex-direction: column; 
  }
.my_liquidity_list{
  margin-top: 30px;
  font: 14px/18px D-DIN-Bold,Arial,Verdana,sans-serif;
  text-align: left;
  span{
    &:first-child{
      text-align: left;
    }
    text-align: right;
  }
}
  .add_lp_list_top{
    display: flex;
    align-items: center;
    margin-top: 20px;
    font-weight: bold;

  }
.coin_box{
  color: #fff;
  display: flex;
  align-items: center;
}
  .lp_icon{
      width: 24px;
      height: 24px;
      margin-right: 6px;
    }
  .add_lp_list_bottom{
    margin-top: 6px;
    width: 100%;
    color: #fff;
    flex-grow: 2;
    text-align: center;
    cursor: text;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding: 10px 15px;
    border: 1px solid #fff;
    input{
      text-align: right;
      width: 100%;
      position: relative;
      font-weight: 500;
      outline: none;
      border: none;
      flex: 1 1 auto;
      background-color: transparent;
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0;
      color: #fff;
    }
    .moey{
      text-align: right;
      width: 100%;
      font-weight: 400;
      line-height: 1.5;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
    }
  }
.address_txt{
    color: #fff !important;
    display: inline-block;
    max-width: 200px;
    text-align: right;
    cursor: text;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
table {
    width: 100%;
    margin-top: 30px;
}
table td {
    font: 600 16px/18px D-DIN-Regular,Arial,Verdana,sans-serif;
    text-align: left;
    color: #fff;
    // padding: 20px 0;
    border-bottom: 1pt solid rgba(255,255,255,.3);
}
table td input{
  height: 60px;
  background-color: #fff0;
  border: none;
  text-align: right;
  color: #fff;
  font-family: D-DIN-Bold;
  font-size: 16px;
  outline: none;
  &:focus{
    border: none;
    outline: none;
  }
}
table.data td {
    text-align: right;
}
table.data td:first-child {
    font: 14px/18px D-DIN-Bold,Arial,Verdana,sans-serif;
    text-align: left;
}
table.data td {
    text-align: right;
}
table.data td span {
    color: #868686;
}
  </style>
  