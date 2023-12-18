
<script setup>
  import { ref, computed, onMounted, watch } from "vue";
  import { RouterLink, RouterView } from "vue-router";
  import math from '@/assets/js/math.js'
  import { useStorage } from '@vueuse/core'
  // import Web3 from 'web3'
  import { useI18n } from 'vue-i18n'
  import { useRouteQuery } from '@vueuse/router'
	import IconUSDT from '@/components/icons/IconUSDT.vue'
	import IconSpacex from '@/components/icons/IconSpacex.vue'
  import { useGlobalState } from "@/store";
  import { useDebounceFn,computedAsync } from '@vueuse/core'
  import { ElMessage } from "element-plus";
  import { Pointer } from '@element-plus/icons-vue'
  import defiABI from "@/abis/defiABI.json";
  import usdtABI from "@/abis/usdtABI.json";
  import spaceXABI from "@/abis/spaceABI.json";
  import lpABI from "@/abis/lpABI.json";
  import cakeLpABI from "@/abis/cakeLpABI.json";
  const { t } = useI18n()
  console.log('i18n', t('ApprovalUSDTSuccess'))
  const addSpaceX = ref(0) // 
  const tabsActive = ref(1)
  const myUSDTNumber = ref(0) // 添加的usdt数量
  const myUSDTNumber2 = ref(0) // 组合添加的usdt数量



  let addNum = math.add(3,2); // 5
let mulNum = math.multiply(3,2); // 6
let subNum = math.subtract(3,2); // 1 
let divNum = math.divide(3,2); // 1.5


  const state = useGlobalState();
  let web3 = ref();
  let myAddress = ref(""); //我的地址
  let infoData = ref(""); //我的地址
  let myETHBalance = ref(""); // EHT余额
  let myUSDTBalance = ref(""); // USDT余额
  let pushAddress = ref(""); // 目标算力地址
  let DeFiContract = ref(""); // 合约实例
  let usdtContract = ref(""); // usdt合约实例
  let SpaceXContract = ref(""); // SpaceX合约实例
  let lpPairContract = ref(""); // lp流动性合约实例
  let mySpaceXBalance = ref(""); // SpaceX余额
  let LPContract = ref(""); // LP合约实例
  const invites = useRouteQuery('invs')
  const refLinks = ref('')
  const activeName = ref('first') // tabs 选中的名称
  const myLpBalance = ref(0) // 流动性总余额
  const myLpTotleBalance = ref(0) // 我的流动性余额
  const myAddCpuPower = ref(0) // 加入添加的算力
  const myAddCpuPower2 = ref(0) // 组合加入添加的算力
  

  // 监听LP添加usdt的变化，更新SpaceX的值
  watch(myUSDTNumber, (newValue) => {
    if(!newValue || newValue == 0) myAddCpuPower.value = 0
    myAddCpuPower.value = newValue * 2.5
  });

  watch(myAddCpuPower, (newValue) => {
    if(!newValue || newValue == 0) myUSDTNumber.value = 0
    myUSDTNumber.value = newValue / 2.5
  });

// 监听tabs2添加usdt的变化，更新SpaceX的值
  watch(myUSDTNumber2, (newValue) => {
    if(!newValue || newValue == 0) myAddCpuPower2.value = 0
    if(newValue == 0) return addSpaceX.value = 0
    myAddCpuPower2.value = (newValue * 8.3)
    
    getPriceFun((Number(newValue)/ 0.3 * 0.5833))
  });

  watch(myAddCpuPower2, (newValue) => {
    if(!newValue || newValue == 0) myUSDTNumber2.value = 0
    myUSDTNumber2.value = (newValue / 8.3)
  });

  
   const AddLpUsdtNumber = ref(0) // 添加流动性usdt数量
  let spaceCoinPrice = ref(0); // SpaceX实时价格（1USDT）
  let LPSpaceX = ref(0); // SpaceX实时价格（1USDT）


  // 监听LP添加usdt的变化，更新SpaceX的值
  watch(AddLpUsdtNumber, (newValue) => {
    LPSpaceX.value = Number(newValue) * spaceCoinPrice.value
  });

  // // 监听LP添加SpaceX的变化，更新usdt的值
  watch(LPSpaceX, (newValue) => {
    AddLpUsdtNumber.value = Number(newValue) / spaceCoinPrice.value
  });



  if(typeof(invites.value) == "undefined"){
    refLinks.value = '0xDA02d522d8cd60de0a2F9773f80b16Fc9ED99bdd'
  }else{
    refLinks.value =  invites.value
  }
  console.log('当前邀请链接为：',refLinks.value);
  const changeTabs = (idx)=>{
    tabsActive.value = idx
  }

  let toFixed8 = (val)=>{ 
    if(val == 0) return val
    return Number((Math.floor(val * 100000) / 100000)).toFixed(5)
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
    setInterval(() => {
      joinWeb3()
    }, 15000);
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
    let accounts = await web3.value.eth.getAccounts();
    // 请求用户授权 解决web3js无法直接唤起Meta Mask获取用户身份
    const enable = await ethereum.enable();
    // // 授权获取账户
    // 返回指定地址账户的余额
    let balance = await web3.value.eth.getBalance(enable[0]);
    myAddress.value = accounts[0];
    try {
      // 创建合约实例
      DeFiContract.value = new web3.value.eth.Contract(defiABI,state.contractAddress.value);
      // 获取合约中返回的信息
      infoData.value = await DeFiContract.value.methods.getInfo(myAddress.value).call();
      // 设置info值
      state.updateInfoData(infoData.value);
      // 创建usdt合约实例
      usdtContract.value = new web3.value.eth.Contract(usdtABI, state.infoData.value.usdtCoin);
      // 获取钱包eth余额
      myETHBalance.value = web3.value.utils.fromWei(balance, "ether");
      console.log('myETHBalance',myETHBalance.value);
      // 获取usdt余额
      let usdtBalance = await usdtContract.value.methods.balanceOf(myAddress.value).call();
      myUSDTBalance.value = web3.value.utils.fromWei(usdtBalance, "ether");
      console.log('usdtBalance',myUSDTBalance.value);
      // 创建spacex合约实例
      SpaceXContract.value = new web3.value.eth.Contract(spaceXABI, state.infoData.value.spaceCoin);
      // 获取spacex余额
      let SpaceXBalance = await SpaceXContract.value.methods.balanceOf(myAddress.value).call();
      mySpaceXBalance.value = web3.value.utils.fromWei(SpaceXBalance, "ether");
      console.log('mySpaceXBalance',mySpaceXBalance.value);
      // 获取当前质押等级
      state.userLevel.value = await DeFiContract.value.methods.getUserLevel(myAddress.value).call();
      if(state.infoData.value.inivet != '0x0000000000000000000000000000000000000000'){
        refLinks.value = state.infoData.value.inivet
      }
      
      // 获取LP实时价格 getPrice
      const SpaceXPrice = await DeFiContract.value.methods.getPrice(state.infoData.value.spaceCoin).call();
      spaceCoinPrice.value = web3.value.utils.fromWei(SpaceXPrice, "ether");
      console.log('实时价格为：' ,spaceCoinPrice.value);
      // 获取_pair() LP的地址然后使用BALANCEOF函数拿到LP数量即可
      const lp_pair = await SpaceXContract.value.methods._pair().call();
      // 创建查询流动性组合合约实例
      lpPairContract.value = new web3.value.eth.Contract(cakeLpABI, lp_pair);
      const my_lp_balanceOf  = await lpPairContract.value.methods.balanceOf(myAddress.value).call();
      const lp_balanceOf = await SpaceXContract.value.methods.balanceOf(lp_pair).call();
      myLpBalance.value = web3.value.utils.fromWei(my_lp_balanceOf, "ether");
      myLpTotleBalance.value = web3.value.utils.fromWei(lp_balanceOf, "ether");
      // console.log('LP 流动性地址为：',lp_pair);
      // console.log('LP 流动性总数量：',myLpTotleBalance.value);
      // console.log('我的LP 流动性数量：',myLpBalance.value);
      // 创建 增删流动性 实例
      LPContract.value = new web3.value.eth.Contract(lpABI, state.LPAddress.value);
    } catch (e) {
      console.log(e);
    }
  };
  const addLiquidityFn = useDebounceFn( async(clickVal) => {
    if(!myAddress.value || myAddress.value === '0x00000000000000000000000000000000deadbeef'){
      return joinWeb3()
    }
    if(myETHBalance.value * 1 < 0.001) return ElMessage.warning(t('gasError'));
    if(myUSDTBalance.value < 0.01 || myUSDTNumber.value < 0.01) return ElMessage.error(t('USDTbalanceError'));
    if(refLinks.value == 'undefined' || !refLinks.value) return ElMessage.warning(t('refLinksError')) 
    // if(myUSDTNumber.value > myUSDTBalance.value) return ElMessage.error('Solde de portefeuille insuffisant');
    const callValue = web3.value.utils.toWei(myUSDTNumber.value.toString());
    // 判断是否授权
    let allowanceOfCurrentAccount = await usdtContract.value.methods.allowance(myAddress.value, state.contractAddress.value).call();
    console.log('被授权的数量：',allowanceOfCurrentAccount);
    console.log('购买的数量',callValue);
    if(allowanceOfCurrentAccount == 0 || allowanceOfCurrentAccount < callValue){
      console.log('执行授权语句');
      let defaultVal = web3.value.utils.toWei("10000000000", "ether"); // 默认授权额度
      usdtContract.value.methods.approve(state.contractAddress.value , defaultVal).send({from: myAddress.value}).then((receipt) => {
        console.log('Approval successful:1111', receipt);
        ElMessage.success(t('approveSuccess'))
        console.log('授权之后执行转账语句....12312312.');
        if(DeFiContract.value){
          try{
            const mode = 1; // 模式
            console.log('邀请链接:',refLinks.value);
            console.log('收益地址:',myAddress.value);
            console.log('mode:',mode);
            console.log('购买金额:',callValue);
              DeFiContract.value.methods.stake(
                refLinks.value,
                myAddress.value,
                mode,
                callValue
              )
              .send({
                from: myAddress.value,
              })
              .on('transactionHash', (hash)=>{
                console.log(hash);
                ElMessage.success(t('AddTransactionSent'))
                console.log("Transaction sent");
              })
              .once('receipt', res => {
                ElMessage.success(t('TransactionSuccess'))
                console.log("Transaction confirmed");
                myUSDTNumber.value = 0
                joinWeb3();
              }).catch((error) => {
                console.error('Approval failed:', error.code);
                if(error.code == '-32603'){
                  ElMessage.error(t('gasLow'));
                }
              });
            }catch(e){
              console.log(e);
            }
        }
      }).catch((error) => {
        console.error('Approval failed:', error.code);
        if(error.code == '-32603'){
          ElMessage.error(t('gasLow'));
        }
      });
    }else{
      //执行转账语句
      console.log('执行转账语句');
      if(DeFiContract.value){
        try{
          const mode = 1; // 模式
          console.log('邀请链接:',refLinks.value);
          console.log('收益地址:',myAddress.value);
          console.log('mode:',mode);
          console.log('购买金额:',callValue);
            DeFiContract.value.methods.stake(
              refLinks.value,
              myAddress.value,
              mode,
              callValue
            )
            .send({
              from: myAddress.value,
            })
            .on('transactionHash', (hash)=>{
              console.log(hash);
              ElMessage.success(t('AddTransactionSent'))
              console.log("Transaction sent");
            })
            .once('receipt', res => {
              ElMessage.success(t('TransactionSuccess'))
              console.log("Transaction confirmed");
              myUSDTNumber.value = 0
              joinWeb3();
            })
            .catch((error) => {
              console.error('Approval failed:', error.code);
              if(error.code == '-32603'){
                ElMessage.error(t('gasLow'));
              }
            });
          }catch(e){
            console.log(e);
          }
      }
    }
  }, 500)

  const addZuHeFunc= useDebounceFn( async(val) => {
    if(!myAddress.value || myAddress.value === '0x00000000000000000000000000000000deadbeef'){
      return joinWeb3()
    }
    if(myETHBalance.value * 1 < 0.001) return ElMessage.warning(t('gasError'));
    if(myUSDTBalance.value < 0.01) return ElMessage.error(t('USDTbalanceError'));
    if(myUSDTNumber2.value < 0.01) return ElMessage.error(t('amountSmal'));
    if(pushAddress.value == '')  return ElMessage.error(t('addressEmpty'));
    if(myUSDTNumber2.value > myUSDTBalance.value) return ElMessage.error(t('USDTbalanceError'));
    if(addSpaceX.value > mySpaceXBalance.value) return ElMessage.error(t('SpaceXbalanceError'));
    const callValue = web3.value.utils.toWei(myUSDTNumber2.value.toString());
    const callSpaceXValue = web3.value.utils.toWei(addSpaceX.value.toString());
    // return
    // 判断是否授权
    let allowanceOfCurrentAccount = await usdtContract.value.methods.allowance(myAddress.value, state.contractAddress.value).call();
    console.log('被授权的数量：',allowanceOfCurrentAccount);
    console.log('购买的数量',callValue);
    478899676444231700
    1063780310010340688
    // 验证USDT是否授权
    let USDTofCurrentAccount = await usdtContract.value.methods.allowance(myAddress.value, state.contractAddress.value).call();
    console.log('USDT授权额度为：',USDTofCurrentAccount);
    // 验证SpaceX是否授权
    let SpaceXDeFiAccount = await SpaceXContract.value.methods.allowance(myAddress.value, state.contractAddress.value).call();
    console.log('SpaceX授权额度为：',SpaceXDeFiAccount);

    console.log('组合添加USDT数量:',callValue, '购买数量是否大于授权数量',allowanceOfCurrentAccount > Number(callValue));
    console.log('组合添加SpaceX数量:',callSpaceXValue, '购买数量是否大于授权数量' ,SpaceXDeFiAccount > Number(callSpaceXValue));
    if(allowanceOfCurrentAccount == 0 || SpaceXDeFiAccount == 0 || allowanceOfCurrentAccount < Number(callValue) || SpaceXDeFiAccount < Number(callSpaceXValue)){
      console.log('执行授权语句');
      let defaultVal = web3.value.utils.toWei("10000000000", "ether"); // 默认授权额度
      if(allowanceOfCurrentAccount == 0 || allowanceOfCurrentAccount < Number(callValue)){
        usdtContract.value.methods.approve(state.contractAddress.value , defaultVal).send({from: myAddress.value}).then((receipt) => {
          console.log('Approval successful:1111', receipt);
          ElMessage.success(t('approveSuccess'))
          console.log('授权之后执行转账语句....12312312.');
        }).catch((error) => {
          console.error('Approval failed:', error.code);
          if(error.code == '-32603'){
            ElMessage.error(t('gasLow'));
          }
        });
      }
      if( SpaceXDeFiAccount == 0 || SpaceXDeFiAccount < Number(callSpaceXValue)){
        SpaceXContract.value.methods.approve(state.contractAddress.value , defaultVal).send({from: myAddress.value}).then((receipt) => {
          console.log('Approval successful:1111', receipt);
          ElMessage.success(t('approveSuccess'))
          console.log('授权多币SpaceX 之后执行转账语句....12312312.');
        }).catch((error) => {
          console.error('Approval failed:', error.code);
          if(error.code == '-32603'){
            ElMessage.error(t('gasLow'));
          }
        });
      }
    }else{
      //执行转账语句
      console.log('执行转账语句');
      if(DeFiContract.value){
        try{
          const mode = 2; // 模式
          console.log('邀请链接:',refLinks.value);
          console.log('收益地址:',pushAddress.value);
          console.log('mode:',mode);
          console.log('购买金额:',callValue);
            DeFiContract.value.methods.stake(
              refLinks.value,
              pushAddress.value,
              mode,
              callValue
            )
            .send({
              from: myAddress.value,
            })
            .on('transactionHash', (hash)=>{
              console.log(hash);
              ElMessage.success(t('AddTransactionSent'))
              console.log("Transaction sent");
            })
            .once('receipt', res => {
              ElMessage.success(t('TransactionSuccess'))
              console.log("Transaction confirmed");
              myUSDTNumber2.value = 0
              joinWeb3();
            })
            .catch((error) => {
              console.error('Approval failed:', error.code);
              if(error.code == '-32603'){
                ElMessage.error(t('gasLow'));
              }
            });
          }catch(e){
            console.log(e);
          }
      }
    }
  },500)




  const addLiquidityFn2 = useDebounceFn( async(val) => {
    console.log('LPSpaceX',LPSpaceX.value);
    if(!myAddress.value || myAddress.value === '0x00000000000000000000000000000000deadbeef'){
      return joinWeb3()
    }
    if(myETHBalance.value * 1 < 0.001) return ElMessage.warning(t('gasError'));
    if(myUSDTBalance.value < 0.01 || AddLpUsdtNumber.value < 0.01) return ElMessage.error(t('USDTbalanceError'));
    // 判断账户 USDT 余额是否充足
    if(AddLpUsdtNumber.value > myUSDTBalance.value) return ElMessage.error(t('USDTbalanceError'));
    if(LPSpaceX.value > mySpaceXBalance.value) return ElMessage.error(t('SpaceXbalanceError'));
    if(LPSpaceX.value < 0.01) return ElMessage.error(t('amountSmal'));
    // 验证USDT是否授权
    let USDTofCurrentAccount = await usdtContract.value.methods.allowance(myAddress.value, state.LPAddress.value).call();
    console.log('USDT授权额度为：',USDTofCurrentAccount);
    // 验证SpaceX是否授权
    let SpaceXofCurrentAccount = await SpaceXContract.value.methods.allowance(myAddress.value, state.LPAddress.value).call();
    console.log('SpaceX授权额度为：',SpaceXofCurrentAccount);
    const callUSDTValue =  web3.value.utils.toWei(AddLpUsdtNumber.value.toString());// 添加USDT金额
    const callSpaceXValue = web3.value.utils.toWei(LPSpaceX.value.toString());// 添加USDT金额
    console.log('LP添加USDTss数量:',callUSDTValue, '购买数量是否大于授权数量',USDTofCurrentAccount > Number(callUSDTValue));
    console.log('LP添加SpaceX数量:',callSpaceXValue, '购买数量是否大于授权数量' ,SpaceXofCurrentAccount > callSpaceXValue);
    if(USDTofCurrentAccount > Number(callUSDTValue) && SpaceXofCurrentAccount > Number(callSpaceXValue)){
      console.log('执行LP添加语句');
      if(LPContract.value){
        try{
          LPContract.value.methods.addL(
              callUSDTValue,
              callSpaceXValue,
            )
            .send({
              from: myAddress.value,
            })
            .on('transactionHash', (hash)=>{
              console.log(hash);
              ElMessage.success(t('AddTransactionSent'))
              console.log("Transaction sent");
            })
            .once('receipt', res => {
              ElMessage.success(t('TransactionSuccess'))
              console.log("Transaction confirmed");
              AddLpUsdtNumber.value = 0
              LPSpaceX.value = 0
              joinWeb3();
            }).catch((error) => {
              console.error('Approval failed:', error.code);
              if(error.code == '-32603'){
                ElMessage.error(t('gasLow'));
              }
            });
          }catch(e){
            console.log(e);
          }
      }
    }else{
      approveLPfunc()
    }
  }, 500)
  
  // 投入授权USDT
  const approveUSDT = () =>{
    // 判断是否授权
    // let allowanceOfCurrentAccount = await usdtContract.value.methods.allowance(myAddress.value, state.contractAddress.value).call();
    // console.log('被授权的数量：',allowanceOfCurrentAccount);
  }
  // 投入授权SpaceX
  // 授权LP合约
  const approveLPfunc = ()=>{
    let defaultVal = web3.value.utils.toWei("10000000000", "ether"); // 默认授权额度
    usdtContract.value.methods.approve(state.LPAddress.value , defaultVal).send({from: myAddress.value}).then((receipt) => {
      console.log('组合流动性授权USDT成功：', receipt);
      ElMessage.success(t('ApprovalUSDTSuccess'))
    }).catch((error) => {
      console.error('Approval failed:', error.code);
      if(error.code == '-32603'){
        ElMessage.error(t('gasLow'));
      }
    });
    SpaceXContract.value.methods.approve(state.LPAddress.value , defaultVal).send({from: myAddress.value}).then((receipt) => {
      console.log('组合流动性授权SpaceX成功：', receipt);
      ElMessage.success(t('ApprovalSpaceXSuccess'))
    }).catch((error) => {
      console.error('Approval failed:', error.code);
      if(error.code == '-32603'){
        ElMessage.error(t('gasLow'));
      }
    });
  }
  const handleClick = (tab, event) =>{
  }
  const removeLPfun = useDebounceFn( async(val) => {
    // lpPairContract
    let allowanceOfCurrentAccount = await lpPairContract.value.methods.allowance(myAddress.value, state.LPAddress.value).call();
    console.log('移除流动性被授权的数量：',allowanceOfCurrentAccount);
    const removeValue = web3.value.utils.toWei(myLpBalance.value.toString());
    let defaultVal = web3.value.utils.toWei("10000000000", "ether"); // 默认授权额度
    if(allowanceOfCurrentAccount < defaultVal){
      // lpPairContract.value = new web3.value.eth.Contract(cakeLpABI, lp_pair);
      // const my_lp_balanceOf  = await lpPairContract.value.methods.balanceOf(myAddress.value).call();

      lpPairContract.value.methods.approve(state.LPAddress.value , removeValue).send({from: myAddress.value}).then((receipt) => {
        console.log('流动性授权成功：', receipt);
        ElMessage.success(t('ApprovalUSDTSuccess'))
      }).catch((error) => {
        console.error('Approval failed:', error.code);
        if(error.code == '-32603'){
          ElMessage.error(t('gasLow'));
        }
      });
    }else{
      if(LPContract.value){
          try{
           
            console.log('removeValue1123123123122222',removeValue,allowanceOfCurrentAccount);
            LPContract.value.methods.removeL(
              removeValue,
              )
              .send({
                from: myAddress.value,
              })
              .on('transactionHash', (hash)=>{
                console.log(hash);
                ElMessage.success(t('TransactionSend'))
                console.log("Transaction sent");
              })
              .once('receipt', res => {
                ElMessage.success(t('TransactionConfirmed'))
                console.log("Transaction confirmed");
                AddLpUsdtNumber.value = 0
                LPSpaceX.value = 0
                joinWeb3();
              })
              .catch((error) => {
                console.error('Approval failed:', error.code);
                if(error.code == '-32603'){
                  ElMessage.error(t('gasLow'));
                }
              });
            }catch(e){
              console.log(e);
            }
        }
    }
  },500)
  // getPrice2
  const getPriceFun = useDebounceFn( async(val) => {
    const toWeiVal = web3.value.utils.toWei(val.toString());
    // 获取组合添加算力实时价格 getPrice
    const SpaceXPrice2 = await DeFiContract.value.methods.getPrice2(toWeiVal).call();
    const spaceCoinPric2 = web3.value.utils.fromWei(SpaceXPrice2, "ether");
    addSpaceX.value = spaceCoinPric2
  },500)

</script>
<template>
    <div class="home">
      <Header />
      <section class="section-animate bg-dragon liquidity_warp">
        <div class="section-inner-center lp_inner">
          <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane :label="t('liquidity')" name="first">
              <div class="lp_warp"> 
                <div class="content-tabs animate" role="tablist">
                </div>
                  <div class="tab_tlt_warp">
                    <div class="tab_tlt_item" :class="{active : tabsActive == 1}" @click="changeTabs(1)">
                      USDT
                    </div>
                    <span>|</span> 
                    <div class="tab_tlt_item" :class="{active : tabsActive == 2}" @click="changeTabs(2)">
                      USDT + SpaceX
                    </div>
                  </div>
                  <div class="my_balance_box">
                    <div>
                      {{ $t("WalletBalance") }}：
                    </div>
                    <div>
                      <div style="text-align: right;">
                        {{ toFixed8(myETHBalance) }} BNB 
                      </div>
                      <div style="text-align: right;">
                        {{ toFixed8(myUSDTBalance) }} USDT
                      </div>
                      <div style="text-align: right;">
                        {{ toFixed8(mySpaceXBalance) }} SpaceX
                      </div>
                    </div>
                  </div>
                  <table v-if="tabsActive == 1" class="data additional-toggle" style="display: table">
                      <tbody >
                          <tr class="js-stagger">
                              <td >
                                <div class="coin_box">
                                  <IconUSDT class="lp_icon" /> USDT
                                </div>
                              </td>
                              <td >
                                  <input type="number" v-model="myUSDTNumber">
                              </td>
                          </tr>
                          <tr class="js-stagger">
                              <td >
                                <div class="coin_box">
                                  助推力
                                </div>
                              </td>
                              <td >
                                  <input type="number" v-model="myAddCpuPower">
                              </td>
                          </tr>
                      </tbody>
                  </table>
                  <table v-if="tabsActive == 2" class="data additional-toggle" style="display: table">
                      <tbody >
                          <tr class="js-stagger">
                              <td >
                                <div class="coin_box">
                                  <IconUSDT class="lp_icon" /> USDT
                                </div>
                              </td>
                              <td >
                                  <input type="number" v-model="myUSDTNumber2">
                              </td>
                          </tr>
                          <tr class="js-stagger">
                              <td >
                                <div class="coin_box">
                                  <IconSpacex class="lp_icon" /> SpaceX
                                </div>
                              </td>
                              <td style="padding: 20px 0;">
                                {{ addSpaceX }}
                              </td>
                          </tr>
                          <tr class="js-stagger">
                              <td >
                                <div class="coin_box">
                                  助推力
                                </div>
                              </td>
                              <td >
                                  <input type="number" v-model="myAddCpuPower2">
                              </td>
                          </tr>
                          <tr class="js-stagger">
                              <td >
                                <div class="coin_box">
                                  Address
                                </div>
                              </td>
                              <td style="text-align: right; padding: 20px 0;">
                                <el-tooltip
                                  class="box-item"
                                  effect="dark"
                                  :content="pushAddress"
                                  placement="top-end"
                                >
                                <input class="address_txt" type="text" style="width: 100%" v-model="pushAddress">
                                </el-tooltip>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
              <div class="add_liquidity" @click="addLiquidityFn()"  v-if="tabsActive ==1">
                <span class="text">{{ $t("personalBoost") }}</span>
              </div>
              <div class="add_liquidity" @click="addZuHeFunc()" v-if="tabsActive ==2">
                <span class="text">{{ $t("AddLiquidity") }}</span>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="t('liudongxing')" name="second">
              <div class="lp_warp"> 
                <div class="content-tabs animate" role="tablist">
                </div>
                  <div class="my_balance_box">
                    <div>
                      {{ $t("WalletBalance") }}：
                    </div>
                    <div>
                      <div style="text-align: right;">
                        {{ toFixed8(myETHBalance) }} BNB 
                      </div>
                      <div style="text-align: right;">
                        {{ toFixed8(myUSDTBalance) }} USDT
                      </div>
                      <div style="text-align: right;">
                        {{ toFixed8(mySpaceXBalance) }} SpaceX
                      </div>
                    </div>
                  </div>
                  <div class="my_ldx_box" v-if="myLpBalance > 0">
                    <div class="my_ldx_box_tlt">
                      您钱包中的LP代币
                      <!-- <div class="remove_btn" @click="removeLPfun()">
                        移除
                      </div> -->
                    </div>
                    <div class="my_ldx_box_item">
                      <div>
                        USDT-SpaceX
                      </div>
                      <div>
                        {{ toFixed8(myLpBalance) }} 
                      </div>
                    </div>
                    <div class="my_ldx_box_item">
                      <div>
                        交易对中的份额：
                      </div>
                      <div>
                        {{ toFixed8((myLpBalance / myLpTotleBalance)*100) }}% 
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
                              <input type="number" v-model="AddLpUsdtNumber">
                            </td>
                        </tr>
                        <tr class="js-stagger">
                            <td >
                              <div class="coin_box">
                                <IconSpacex class="lp_icon" /> SpaceX
                              </div>
                            </td>
                            <td style="padding: 20px 0;">
                              <input type="number" v-model="LPSpaceX">
                            </td>
                        </tr>
                      </tbody>
                  </table>
                  <div class="add_liquidity" @click="addLiquidityFn2()">
                    <span class="text">{{ $t('addliudongxing') }}</span>
                  </div>
                  <div  v-if="myLpBalance > 0" class="add_liquidity" @click="removeLPfun()">
                    <span class="text">{{ $t('removeLiudongxing') }}</span>
                  </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </section>
      <Footer />
    </div>
  </template>
  
<style>
.el-tabs__item{
  color: rgba(255,255,255,.6);
}
.el-tabs__item.is-active{
  color: #fff;
  font-weight: bold;
}
.el-tabs__item:hover{
  color: #fff;
}
.el-tabs__active-bar{
  background-color: #fff;
}
.el-tabs__nav-wrap::after{
  background-color: rgba(255,255,255,.6);
}
</style>
  <style lang="less" scoped>
  .lp_inner{
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    width: 100%;
    max-width: 100%;
    padding: 20vh 20px 0 20px;
  }
  .my_balance_box{
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
    font-family: D-DIN-Bold;
    border-bottom: 1px solid #ffffff75;
  }
  .my_ldx_box{
    text-align: left;
    font-family: D-DIN-Bold;
    border-bottom: 1px solid #ffffff75;
    padding-bottom: 10px;
  }
  .my_ldx_box_tlt{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
  }
  .my_ldx_box_item{
    padding: 4px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .remove_btn{
    border: 1px solid #fff;
    display: inline-block;
    margin-top: 4px;
    padding: 2px 20px;
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
    // display: flex;
    // align-items: center;
    // justify-content: center;
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
  