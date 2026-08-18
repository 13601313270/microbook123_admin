import { ElMessage } from "element-plus";
import { post } from "./request";
import { costConfig, ModelEnum } from "./wenxinyiyanConfig";

class Session {
  sessionId: number;
  system: string;
  option: { httpMethod: "get" | "post"; url: string };
  constructor(system: string, option?: {
    httpMethod?: 'get' | 'post'
    url?: string,
  }) {
    this.sessionId = Math.round(Math.random() * 100000000)
    this.system = system;
    this.option = {
      httpMethod: 'get',
      url: '/wenxinyiyan/chatWithMemory',
    };
    if (option?.httpMethod) {
      this.option.httpMethod = option?.httpMethod;
    }
    if (option?.url) {
      this.option.url = option?.url;
    }
  }
  // 'ernie-4.0-turbo-8k-latest' // 输入0.02     输出：0.06
  // 'ernie-3.5-128k',             // 输入0.0008    输出：0.002
  // 'ernie-3.5-8k-0701',          // 输入0.0008    输出：0.002
  // 'ernie-speed-128k',        // 免费
  chat(
    message: string,
    step?: (val: string) => void,
    { isGiveup, model }: {
      isGiveup?: boolean,
      model?: ModelEnum,
    } = { isGiveup: false }
  ): Promise<string> {
    return new Promise<string>(resolve => {
      if (this.option.httpMethod === 'post' || message.length > 800) {// 浏览器限制，所以url不能太长
        post(this.option.url, {
          session: this.sessionId,
          message: message,
          system: this.system,
          isGiveup: !!isGiveup,
          model: model || 'ernie-speed-128k',
          stream: false,// post不支持EventSource
        }).then((res) => {
          const { result, usage } = res;
          const { completion_tokens, prompt_tokens } = usage;
          import('calc-number').then(({ default: calcNumber }) => {
            const cost = costConfig[model || 'ernie-speed-128k'];
            const runStr = `(${prompt_tokens} * ${cost.prompt} + ${completion_tokens} * ${cost.completion})/1000`;
            const costNumber = calcNumber(runStr);
            if (costNumber) {
              ElMessage.info('费用：' + costNumber)
            }
          })
          resolve(result);
        })
        return;
      }
      let returnStr = ''
      const eventSource = new EventSource(`https://api.studying1v1.com${this.option.url}?session=${this.sessionId}&message=${encodeURIComponent(message)}&system=${encodeURIComponent(this.system)}&model=${model || 'ernie-speed-128k'}&isGiveup=${!!isGiveup}`);
      eventSource.onopen = function () {
        returnStr = ''
        console.log('连接已打开');
      };
      let lastUsage: any = null;
      eventSource.onmessage = function (event) {
        const jsonStr = event.data.replace(/^data:\s/, '');
        let json;
        try {
          json = JSON.parse(jsonStr)
        } catch (e) {
          console.error(e);
          debugger
          json = eval(`(${jsonStr})`)
          debugger
        }
        lastUsage = json.usage;
        returnStr += json.result
        step && step(json.result)
      };
      eventSource.addEventListener('error', (event) => {
        if (event.eventPhase === EventSource.CLOSED) {
          console.log('Connection was closed.');
          eventSource.close()

          import('calc-number').then(({ default: calcNumber }) => {
            if (lastUsage) {
              console.log('lastUsage', lastUsage)
              const { prompt_tokens, completion_tokens } = lastUsage
              const cost = costConfig[model || 'ernie-speed-128k'];
              const runStr = `(${prompt_tokens} * ${cost.prompt} + ${completion_tokens} * ${cost.completion})/1000`;
              console.log('lastUsage', runStr);
              const costNum = calcNumber(runStr);
              console.log('lastUsage', costNum);
              if (costNum > 0) {
                ElMessage.info('费用：' + costNum)
              }
            }
          })
          resolve(returnStr)
        } else {
          console.error('An error occurred:', event);
        }
      });
    })
  }
  chatOneTime(
    message: string,
    step?: (val: string) => void,
    { isGiveup, model }: {
      isGiveup?: boolean,
      model?: ModelEnum,
    } = { isGiveup: false }
  ): Promise<string> {
    return new Promise<string>(resolve => {
      const messageObj = JSON.stringify([{
        role: "user",
        content: message
      }]);
      if (this.option.httpMethod === 'post' || messageObj.length > 800) {// 浏览器限制，所以url不能太长
        post('/wenxinyiyan/chat', {
          message: message,
          system: this.system,
          model: model || 'ernie-speed-128k',
          stream: false,// post不支持EventSource
        }).then((res) => {
          const { result, usage } = res;
          const { completion_tokens, prompt_tokens } = usage;
          import('calc-number').then(({ default: calcNumber }) => {
            const cost = costConfig[model || 'ernie-speed-128k'];
            const runStr = `(${prompt_tokens} * ${cost.prompt} + ${completion_tokens} * ${cost.completion})/1000`;
            const costNumber = calcNumber(runStr);
            if (costNumber) {
              ElMessage.info('费用：' + costNumber)
            }
          })
          resolve(result);
        })
        return;
      }
      let returnStr = ''
      const eventSource = new EventSource(`https://api.studying1v1.com/wenxinyiyan/chat?message=${encodeURIComponent(messageObj)}&system=${encodeURIComponent(this.system)}&model=${model || 'ernie-speed-128k'}&isGiveup=${!!isGiveup}`);
      eventSource.onopen = function () {
        returnStr = ''
        console.log('连接已打开');
      };
      let lastUsage: any = null;
      eventSource.onmessage = function (event) {
        const jsonStr = event.data.replace(/^data:\s/, '');
        let json;
        try {
          json = JSON.parse(jsonStr)
        } catch (e) {
          console.error(e);
          debugger
          json = eval(`(${jsonStr})`)
          debugger
        }
        lastUsage = json.usage;
        returnStr += json.result
        step && step(json.result)
      };
      eventSource.addEventListener('error', (event) => {
        if (event.eventPhase === EventSource.CLOSED) {
          console.log('Connection was closed.');
          eventSource.close()

          import('calc-number').then(({ default: calcNumber }) => {
            if (lastUsage) {
              console.log('lastUsage', lastUsage)
              const { prompt_tokens, completion_tokens } = lastUsage
              const cost = costConfig[model || 'ernie-speed-128k'];
              const runStr = `(${prompt_tokens} * ${cost.prompt} + ${completion_tokens} * ${cost.completion})/1000`;
              console.log('lastUsage', runStr);
              const costNum = calcNumber(runStr);
              console.log('lastUsage', costNum);
              if (costNum > 0) {
                ElMessage.info('费用：' + costNum)
              }
            }
          })
          resolve(returnStr)
        } else {
          console.error('An error occurred:', event);
        }
      });
    })
  }
}
export default Session