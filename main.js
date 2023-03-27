import { ChatGPTAPI } from 'chatgpt'
import { createOpenAPI, createWebsocket } from 'qq-guild-bot';

let parentMessageId = ''

const api = new ChatGPTAPI({
    apiKey: "apiKey",
    apiBaseUrl:"apiBaseUrl",
    debug: true
})


const testConfig = {
  appID: 'appID', // 申请机器人时获取到的机器人 BotAppID
  token: 'token', // 申请机器人时获取到的机器人 BotToken
  intents: ['PUBLIC_GUILD_MESSAGES', 'GUILD_MESSAGES'], // 事件订阅,用于开启可接收的消息类型
  sandbox: false, // 沙箱支持，可选，默认false. v2.7.0+
};

// 创建 client
const client = createOpenAPI(testConfig);
// 创建 websocket 连接
const ws = createWebsocket(testConfig);

// 消息监听
ws.on('READY', (wsdata) => {
  console.log('[READY TO GO!!]');
});

ws.on('PUBLIC_GUILD_MESSAGES', (wsdata) => {
  console.log('[PUBLIC_GUILD_MESSAGES] 事件接收 :', wsdata.msg.content);
  wsdata.msg.content = String(wsdata.msg.content).replaceAll("<@!12671406020854745006> ", '')
  let tryNum = 0
  let handleRes = true
  if(!handleMsg(wsdata)){
    while(!handleRes && tryNum < 3){
      tryNum++
      handleRes = handleMsg(wsdata)
    }
  }
  
});
ws.on('GUILD_MESSAGES', (data) => {
  // console.log('[GUILD_MESSAGES]', data);    
  if(data.msg.content.indexOf('//') > -1){
    data.msg.content = String(data.msg.content).replaceAll("<@!12671406020854745006> ", '')
    let tryNum = 0
    let handleRes = false
    if(!handleMsg(data)){
      while(!handleRes && tryNum < 3){
        tryNum++
        handleRes = handleMsg(data)
      }
    }
  }
});

function handleMsg(data){
  console.log('ChatGPT question:', data.msg.content)
  api.sendMessage(data.msg.content,{
    // parentMessageId: parentMessageId || '',
    timeoutMs: 30 * 1000 // 30秒
  }).then(res => {
      console.log('ChatGPT answer: ',res.text)
      parentMessageId = res.parentMessageId
      client.messageApi.postMessage(data.msg.channel_id, {content: res.text,})
      .then(res => {
        console.log('postMessage end');
      })
      .catch(err => {
        console.log('postMessage err');
      });
      return true
  }).catch(err =>{
    console.log("ERROR!", err)
    return false
  })
}

