<template>
  <div class="nav">
    <el-button @click="initInsert">通过想法新增</el-button>
  </div>
  <div class="bookList">
    <div class="book" @click="turnDetail(book.id)" v-for="book in bookList" :key="book.id">
      <div class="info">
        <div>{{ book.name }}</div>
        <!-- <div v-if="book.type"><el-tag>{{typeList.find(v => v.id === book.type)?.name}}</el-tag></div> -->
        <!-- <span v-if="book.status === 0"><el-tag type="warning">无正文</el-tag></span>
        <span v-if="book.status === 2"><el-tag type="warning">待确认</el-tag></span> -->
        <!-- <div>{{ book.problem }}</div> -->
      </div>
      <div class="imgContent">
        <img class="img" v-if="book.img" :src="book.img + '?x-oss-process=image/resize,w_300,quality,q_60'" />
      </div>
      <div class="tools">
        <el-button size="small" :type="book.img ? 'default' : 'primary'" @click.stop="editImgShow(book)">
          {{ book.img ? '重新生成封皮' : '生成封皮' }}</el-button>
        <div style="flex-grow: 1"></div>
        <el-button size="small" type="warning" @click.stop="deleteBook(book)">
          删除</el-button>
      </div>
    </div>
  </div>
  <el-dialog v-model="insertVisible" @close="createClose" title="新增专题" width="80%">
    <el-form :model="form" v-if="createStep === 0">
      <el-form-item required label="写这本书的人的特点">
        <el-input v-model="form.system" placeholder="例如：精通儿童辅食制作" />
      </el-form-item>
      <el-form-item required label="这本书要解决啥问题，或达到什么目的">
        <el-input v-model="form.bookProblem" placeholder="例如：新手妈妈制作营养丰富的儿童辅食" />
      </el-form-item>
      <!-- <el-form-item required label="外部餐卡资料，推荐百度百科词条">
        <el-input v-model="form.outUrl"
          placeholder="例如：https://baike.baidu.com/item/%E6%9D%8E%E7%99%BD/1043?fr=ge_ala#1-1" />
      </el-form-item> -->
      <el-form-item required label="书本结构">
        <el-radio-group v-model="form.cateType">
          <el-radio :value="1">树状结构：常用于知识/工具书</el-radio>
          <el-radio :value="2">线性结构：故事/编年体</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item required label="分类">
        <el-select placeholder="请选择专栏所属的分类" :disabled="form.system == '' || form.bookProblem === ''"
          v-model="form.type">
          <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="begin">开始</el-button>
      </el-form-item>
    </el-form>
    <div v-if="createStep === 1" class="chatContent">
      <div class="chat" v-if="createCateJSON.length === 0">
        <div ref="createChatDom" class="chatList">
          <div class="chatItem" :class="{ user: createCateAnswer.role === 'user' }"
            v-for="createCateAnswer in createCateAnswerList" v-html="createCateAnswer.text.replace(/\n/g, '<br/>')">
          </div>
          <span class="createLoading" v-if="createCateAnswerLoading">
            <el-icon>
              <Loading />
            </el-icon>
          </span>
        </div>
        <div class="chatTools">
          <el-input v-model="createCateQuestion" />
          <el-button @click="chatBeter" :loading="createCateAnswerLoading" :disabled="createCateJSONLoading"
            style="margin-left: 8px;">沟通</el-button>
          <el-button @click="createCate" :loading="createCateJSONLoading" :disabled="createCateAnswerLoading"
            style="margin-left: 8px;">完成沟通，下一步</el-button>
        </div>
      </div>
      <div class="cateInfo" v-if="createCateJSON.length > 0">
        <div class="catList">
          <div v-for="item in createCateJSON" class="cateItem">
            <div class="info">
              <div class="head">{{ item.title }}</div>
              <div class="desc">{{ item.desc }}</div>
            </div>
            <div class="children">
              <div v-for="item2 in item.children" class="cateItem">
                <div class="info">
                  <div class="head">{{ item2.title }}</div>
                  <div class="desc">{{ item2.desc }}</div>
                </div>
                <div class="children">
                  <div v-for="item3 in item2.children" class="cateItem">
                    <div class="info">
                      <div class="head">{{ item3.title }}</div>
                      <div class="desc">{{ item3.desc }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="cateAction">
          <el-button @click="createBook" size="large" type="primary" :loading="createCateJSONLoading || creteLoading"
            :disabled="createCateAnswerLoading || createCateJSON.length === 0">创建专题</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
  <el-dialog v-model="editImgIsShow" title="封皮编辑" width="80%">
    <div class="createImgStep">
      <div class="title">选择主题和风格</div>
      <div v-html="createImgStep1Answer.replace(/\n/g, '<br/>')"></div>
      <div class="seggestStyles" v-if="createImgStep1StyleSelect">
        <div class="styleItem" @click="!createImging ? createImgStep1StyleSelect = styleKey : ''"
          :class="{ active: createImgStep1StyleSelect === styleKey }" v-for="styleKey in Object.keys(allStyle)">
          <div>{{ allStyle[styleKey] ? allStyle[styleKey] : '' }}</div>
        </div>
      </div>
      <div class="seggestColors">
        <div @click="!createImging ? createImgStep1ColorsSelect = item : ''" class="seggestColorItem"
          :class="{ active: createImgStep1ColorsSelect === item }" v-for="item in createImgStep1Colors"
          :style="{ backgroundColor: item }">
          {{ item }}
        </div>
      </div>
      <div v-if="!createImging">
        <el-button @click="chatCreateImgStep2">重新生成下一步</el-button>
      </div>
    </div>
    <div class="createImgStep">
      <div class="title">生成提示词</div>
      <el-input v-if="createImgStep2AnswerJSON" type="textarea" autosize v-model="createImgStep2AnswerJSON.prompt" />
      <div v-else v-html="createImgStep2Answer.replace(/\n/g, '<br/>')"></div>
      <div v-if="!createImging">
        <el-button @click="chatCreateImgStep3">重新生成图片</el-button>
      </div>
    </div>
    <div class="createImgStep">
      <div class="title">绘图</div>
      <div>
        <div v-if="createImging">生成图片中</div>
        <div v-else-if="saveImg">保存中</div>
        <img :src="createImgUrl" style="width: 400px;">
      </div>
      <div>
        <el-button style="width: 400px;" v-if="createImgUrl" size="large" type="primary" @click="saveCreateImg"
          :disabled="createImging || !createImgUrl" :loading="saveImg">{{ saveImg ? '保存中' : '保存' }}</el-button>
      </div>
    </div>
  </el-dialog>
  <el-dialog v-model="twoChatShow" title="产生选题" width="80%">
    <div class="twoChat">
      <div class="chat" :class="{ chat1: item.user === 'chat1', chat2: item.user === 'chat2' }"
        v-for="item in twoChatContnt">
        <div class="user">{{ item.user === 'chat1' ? '发版员' : '审核员' }}</div>
        <div class="text">{{ item.content }}</div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElRadioGroup, ElRadio, ElOption, ElIcon, ElMessageBox } from 'element-plus';
import { Delete, get, post, put } from '@/plugins/request'
import router from '@/router/index';
import Session from '@/plugins/session';
import json1 from '@/plugins/json1';
import demo1 from '@/plugins/demo1';
import cateDemo from '@/plugins/cateDemo';

type IBook = {
  id: number;
  name: string;
  desc: string;
  problem: string;
  status: number,
  createUserSystem: string;
  img: string;
  type: number;
}
type CateItem = {
  title: string,
  children?: CateItem[],
  desc: string,
  length: number,
  contentId?: number[],
}
type ICateType = 1 | 2;// 1树状结构，常用于知识。2线性结构，故事/编年体
const insertVisible = ref<boolean>(false)
const insertStrategy = ref<string>('');
const form = reactive<{
  system: string,
  bookProblem: string,
  outUrl: string,// 外部资料
  cateType: ICateType,
  type: null | number,
}>({
  system: '精通儿童辅食制作',// 你是一个精通html、css和jsPDF三方包使用的专家
  bookProblem: '制作营养丰富的儿童辅食',// jsPDF包如何使用
  outUrl: '',
  cateType: 1,// 1树状结构，常用于知识。2线性结构，故事/编年体
  type: null,
})
const createStep = ref<0 | 1 | 2>(0);
const createCateAnswerLoading = ref<boolean>(false)
const createCateQuestion = ref<string>('')
const createCateAnswerList = ref<Array<{
  text: string,
  role: 'assistant' | 'user'
}>>([])
const createCateJSONLoading = ref<boolean>(false)
const createCateJSON = ref<CateItem[]>([])
const creteLoading = ref<boolean>(false);
// const createBookIng = ref<boolean>(false)
const createChatDom = ref()

const allStyle: {
  [key: string]: string,
} = {
  'Base': '通用风格',
  "3D Model": '3D模型',
  // 'Anime': '动漫', // 动漫分割的封皮，全是日本动漫那种东西
  'Origami': '折纸',
  'Line Art': '线条艺术',
  'Neonpunk': '霓虹朋克',
  'Lowpoly': '低多边形'
}

// 创建封皮
const editImgIsShow = ref<boolean>(false)
const createImgInput = ref<string>('')
const createImgBook = ref<IBook>()
const createImgStep1Answer = ref<string>('')
const createImgUrl = ref<string>()
const createImging = ref<boolean>(false)
const saveImg = ref<boolean>(false)
const createImgStep1StyleSelect = ref<keyof typeof allStyle>();// 第一步待选择的主题
const createImgStep1Colors = ref<string[]>();// 第一步待选择的颜色列表
const createImgStep1ColorsSelect = ref<string>();// 第一步待选择的颜色列表
const createImgStep1ObjectSelect = ref<string[]>();// 第一步待选择的颜色列表
const createImgStep2Answer = ref<string>('')
const createImgStep2AnswerJSON = ref<{
  prompt: string,
}>()
const typeList = ref<Array<{
  id: number,
  name: string,
}>>([])
const bookCount = ref<number>(-1)
const bookList = ref<IBook[]>([])
const bookListLoading = ref<boolean>(false)

// 对抗网络
const twoChatShow = ref<boolean>(false)
const twoChatContnt = ref<{
  user: 'chat1' | 'chat2',
  content: string,
}[]>([])

onMounted(() => {
  const match = location.hash.match(/#token=(.*)/);
  if (match) {
    const token = match[1]
    localStorage.setItem('token', token)
    location.hash = '';
  }
  initBookList()
})
async function initBookList() {
  const typeListRes = await get('/bookType');
  console.log('typeListRes', typeListRes)
  typeList.value = typeListRes.map((v: any) => {
    return {
      id: v.id,
      name: v.name,
    }
  })

  const { data, count } = await get(`/bookList`)
  bookCount.value = count;
  bookList.value = data.map((v: any) => {
    return {
      id: v.id,
      name: v.name,
      desc: v.desc,
      problem: v.problem,
      status: v.status,
      createUserSystem: v.createUserSystem,
      img: v.img,
      type: v.type,
    }
  });
  bookListLoading.value = false;
}

function turnDetail(id: number) {
  router.push('/book/editor/' + id)
}
let session: Session;
let sessionImg: Session;
function initInsert() {
  insertVisible.value = true
  form.bookProblem = ''
  form.system = ''
}
async function begin() {
  console.log(form)
  createStep.value = 1;
  createCateAnswerList.value = []
  createCateAnswerLoading.value = true
  session = new Session(form.system)
  const cateDescMap: {
    [key in ICateType]: string
  } = {
    [1]: `你要考虑这本书都需要讲解什么内容。简短告诉我`,
    [2]: cateDemo,
  }
  createCateAnswerList.value.push({
    text: '',
    role: 'assistant'
  });
  // 你可以参考这个网址中[${form.outUrl}]中外部资料作为常识。
  createCateAnswerList.value[createCateAnswerList.value.length - 1].text = await session.chat(`我们一起合作要写一本名讲述${form.bookProblem}的书。${cateDescMap[form.cateType]}`, (res) => {
    createCateAnswerList.value[createCateAnswerList.value.length - 1].text += res;
    if (createChatDom.value) {
      createChatDom.value.scrollTop += 3000
    }
  })
  createCateAnswerLoading.value = false
}
async function chatBeter() {
  createCateAnswerList.value.push({
    text: createCateQuestion.value,
    role: 'user'
  });
  createCateAnswerLoading.value = true
  createCateAnswerList.value.push({
    text: '',
    role: 'assistant'
  });
  createCateAnswerList.value[createCateAnswerList.value.length - 1].text = await session.chat(createCateQuestion.value, (res) => {
    createCateAnswerList.value[createCateAnswerList.value.length - 1].text += res;
    if (createChatDom.value) {
      createChatDom.value.scrollTop += 3000
    }
  })
  createCateQuestion.value = '';
  createCateAnswerLoading.value = false
}
async function createCate() {
  createCateJSONLoading.value = true;
  let json = ''
  if (form.cateType === 1) {
    createCateAnswerList.value.push({
      text: '',
      role: 'assistant'
    });
    createCateAnswerList.value[createCateAnswerList.value.length - 1].text = await session.chat(`这些章节内容比例大概是什么样的？`, (res) => {
      createCateAnswerList.value[createCateAnswerList.value.length - 1].text += res;
      if (createChatDom.value) {
        createChatDom.value.scrollTop += 3000
      }
    })
    createCateAnswerList.value.push({
      text: '',
      role: 'assistant'
    });
    createCateAnswerList.value[createCateAnswerList.value.length - 1].text = await session.chat(`根据你说的比例，重新调整一下。占比较多的多划分一些子章节。占比较少的，少划分子章节。不要索引。`, (res) => {
      createCateAnswerList.value[createCateAnswerList.value.length - 1].text += res;
      if (createChatDom.value) {
        createChatDom.value.scrollTop += 3000
      }
    })
  }
  const createCatePrompt: string = (() => {
    if (form.cateType === 1) {
      return `根据你生成的目录章节，构建这个目录的json结构。
## 格式要求
格式需要是json格式，只返回json数据即可，json格式示例如下：
\`\`\`json${JSON.stringify(json1)}
\`\`\`
你生成的json，如上所示，不进行格式缩进，以去掉不必要的空格。每个children下至少有2个子节点。如果children下没有子节点，则不保留，不要出现\`\`\`"children": []\`\`\`这种空数组
`
    } else if (form.cateType === 2) {
      return `好的，根据你生成的目录，构建成json结构。
## 格式要求
格式需要是json格式，json格式示例如下：
\`\`\`json${JSON.stringify(demo1)}
\`\`\`
目录只有一层结构。数量和你刚才说的目录数量一致，title直接沿用目录名称。不要省略和合并内容，json可能很长，要完整展现出来。
`
    } else {
      return ''
    }
  })()
  if (!createCatePrompt) {
    return;
  }
  json = await session.chat(createCatePrompt, (res) => {
    json += res;
  }, {
    isGiveup: true,
    isJSON: true,
  })
  console.log(json)
  try {
    let children: CateItem[] = []
    try {
      children = JSON.parse(json);
    } catch (e) {
      children = eval(`(${json})`)
    }
    console.log('children', children);
    if (children.length === 1 && children[0].children) {
      children = children[0].children;
    }
    console.log(children);
    createCateJSON.value = children;
  } catch (e) {
    ElMessage.error('json结构不严格');
  }
  createCateJSONLoading.value = false;
}
async function createBook() {
  creteLoading.value = true;
  const bookInfoJSON = await session.chat(`给这个书起个15个字以内的吸引人的名字，然后总结一段30字以内的短描述，短描述适合印刷在封皮上
  ## json格式说明
\`\`\`json
{
  "name": "书名",
  "desc": "短描述",
}
\`\`\``, () => {
  }, {
    isJSON: true,
    isSessionEnd: true,
  })
  console.log(bookInfoJSON)
  try {
    const bookInfo: {
      name: string,
      desc: string,
    } = JSON.parse(bookInfoJSON);
    console.log(bookInfo)
    const insertInfo = {
      name: bookInfo.name, // 名字
      createUserSystem: form.system, // 创建者能力描述
      problem: form.bookProblem, // 帮助读者解决的问题
      desc: bookInfo.desc, // 副标题描述
      cateIsExamine: false, // 类目是否人工审核过完成初始化
      img: '', // 封皮
      cateJSON: JSON.stringify(createCateJSON.value), // 类目
      cateType: form.cateType,
      status: 0,
      type: form.type,
      strategy: insertStrategy.value, // 策略
    };
    console.log(insertInfo);
    const res = await post(`/createBook`, insertInfo);
    console.log('创建成功', res);
    if (res) {
      insertVisible.value = false;
      ElMessage.success('创建成功')
      await initBookList();
      console.log('创建成功2')
      const insertInfo = await get(`/bookInfo/${res}`)
      console.log('创建成功3', insertInfo)
      if (insertInfo) {
        console.log('创建成功4', insertInfo)
        editImgShow({
          id: insertInfo.id,
          name: insertInfo.name,
          desc: insertInfo.desc,
          problem: insertInfo.problem,
          createUserSystem: insertInfo.createUserSystem,
          img: insertInfo.img,
          status: insertInfo.status,
          type: insertInfo.type,
        })
      }
    }
  } catch (e: any) {
    console.error(e);
    ElMessage.error(e)
  }
  creteLoading.value = false;
}
async function editImgShow(book: IBook) {
  createImgInput.value = ''
  editImgIsShow.value = true
  createImgBook.value = book;
  sessionImg = new Session(book.createUserSystem)
  await chatCreateImg()
}

async function chatCreateImg() {
  if (!createImgBook.value) {
    return;
  }
  createImging.value = true
  const prompy: string = `我正在写一本《${createImgBook.value.name}》的书，书讲的是：${createImgBook.value.problem}。我想生成这本书的封面，需要百度千帆接口，调用大模型生成图片，
模型支持：${Object.values(allStyle).join('、')}，这${Object.values(allStyle).length}种风格，告诉我这本书最适合的一种风格和原因，如果没有特别贴切的，直接用通用风格。
给我两个备选的适合的主题背景色，除非特别合适，否则降低深蓝的使用。
再给我一到三个，能够匹配这本书，有具体形象的景观、物品或人物，不用告诉我原因。
说话简洁些
`
  createImgStep1Answer.value = '';
  createImgUrl.value = '';
  createImgStep2Answer.value = '';
  createImgStep1Colors.value = []
  createImgStep1StyleSelect.value = undefined;
  createImgStep1ColorsSelect.value = undefined;
  createImgStep2AnswerJSON.value = undefined
  createImgStep1Answer.value = await sessionImg.chat(prompy, (res) => {
    createImgStep1Answer.value += res;
  })
  console.log('createImgStep1Answer.value', createImgStep1Answer.value)
  const jsonText = await sessionImg.chat(`
根据刚才的信息，给我汇总一个json格式的数据。
## 格式要求
\`\`\`json
{
  "object": ["元素1","元素2","元素3"],
  "backgroundColor": ["十六进制颜色背景色1", "十六进制颜色背景色2"],
  "style": "风格"
}
\`\`\`
## 示例
\`\`\`json
{
  "object": ["香蕉","书本","路灯"],
  "backgroundColor": ["#6e8e82","#ff00ef"],
  "style": "折纸"
}
\`\`\`
`, (res) => {
    createImgStep1Answer.value += res
  }, {
    isJSON: true,
  })

  console.log('=====', jsonText)
  if (jsonText) {
    try {
      const json: {
        object: string[],
        backgroundColor: string[],
        style: (typeof allStyle)[keyof typeof allStyle],
      } = JSON.parse(jsonText);
      console.log('=====,3', json)
      const enumIndex = Object.values(allStyle).indexOf(json.style)
      const style: keyof typeof allStyle = Object.keys(allStyle)[enumIndex] as keyof typeof allStyle;
      if (style === undefined) {
        ElMessage.error('style不存在');
        return;
      } else {
        createImgStep1StyleSelect.value = style;
      }
      createImgStep1Colors.value = json.backgroundColor;
      createImgStep1ColorsSelect.value = createImgStep1Colors.value[0]
      createImgStep1ObjectSelect.value = json.object;
      createImging.value = false;
      chatCreateImgStep2()
    } catch (e) {
      createImging.value = false;
      ElMessage.error('json结构不对')
    }
  }
}
async function chatCreateImgStep2() {
  if (createImgStep1ColorsSelect.value === undefined || createImgStep1StyleSelect.value === undefined || createImgStep1ObjectSelect.value === undefined) {
    return;
  }
  createImgStep2AnswerJSON.value = undefined
  createImging.value = true
  const mainColor: string = createImgStep1ColorsSelect.value;
  const objects: string[] = createImgStep1ObjectSelect.value;
  createImgStep2Answer.value = '';
  const prompt = await sessionImg.chat(`帮助我写一个中文的文生图模型的Prompt。
## 要求如下
背景主色调接近十六进制颜色代码“${mainColor}”。
让图片上半部分有大面积纯色留白，比如添加蓝色的天空，白色的黑板，纯色的墙面，大片雪地。
包含元素${objects.join('、')}中的一个或多个，元素尽可能在图片下半部分。
简约一些，图片不要太乱。
给我一个符合这个表述的文生图Prompt。
## 格式如下
\`\`\`json
{
  "prompt": "文生图Prompt正文"
}
\`\`\`
`, (res) => {
    createImgStep2Answer.value += res
  }, {
    isJSON: true,
    isSessionEnd: true,
  })
  let json2
  try {
    json2 = JSON.parse(prompt)
  } catch (e) {
    json2 = eval(`(${prompt})`)
  }
  createImgStep2AnswerJSON.value = json2;
  createImging.value = false
  chatCreateImgStep3()
}
async function chatCreateImgStep3() {
  if (createImgStep1StyleSelect.value === undefined || createImgStep2AnswerJSON.value === undefined) {
    return;
  }
  createImging.value = true
  const selectStyle: keyof typeof allStyle = createImgStep1StyleSelect.value;
  post('/createBookImg', {
    prompt: createImgStep2AnswerJSON.value.prompt,
    style: selectStyle
  }).then(res => {
    console.log('createBookImg', res)
    createImgUrl.value = "data:image/png;base64," + res.data[0].b64_image;
    // charGPTStrLoading.value[sentUserId] = false;
  }).finally(() => {
    createImging.value = false;
  })
}
async function saveCreateImg() {
  if (!createImgUrl.value || !createImgBook.value) {
    return;
  }
  const base64ToBlob = (dataurl: string) => {
    const arr = dataurl.split(',')
    // @ts-ignore
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  const formData = new FormData()
  saveImg.value = true
  formData.append('file', base64ToBlob(createImgUrl.value))
  const data = await post('/oss', formData)
  const { url } = data;
  if (url) {
    console.log('ddddd-2', data)
    editImgIsShow.value = false;
    await put(`/setBookImg/${createImgBook.value.id}`, {
      img: url,
    })
    saveImg.value = false
    initBookList()
  }
}
function deleteBook(book: IBook) {
  ElMessageBox.confirm('是否删除:' + book.name, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await Delete(`/deleteBook/${book.id}`)
    initBookList()
  }).catch(() => {
    // 用户取消删除
  })
}
function createClose() {
  createStep.value = 0
  createCateQuestion.value = ''
  createCateAnswerList.value = [];
  createCateJSON.value = []
}
</script>
<style lang="less" scoped>
.page {
  width: 1050px;
  margin: 0 auto;
}

.chatContent {
  display: flex;
  margin-top: 8px;
  height: 68vh;

  .chat {
    flex-grow: 1;
    height: 100%;
    overflow-y: hidden;
    margin-right: 10px;
    display: flex;
    flex-direction: column;

    .chatList {
      margin-top: 8px;
      overflow-y: auto;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: start;
      gap: 8px;

      .chatItem {
        border: solid 1px #333;
        border-radius: 4px;
        padding: 8px;
        max-width: 86%;

        &.user {
          align-self: end;
          background: #95ec69;
          color: black;
          border: none;
        }
      }
    }

    .chatTools {
      display: flex;
      margin-top: 8px;
    }

    .createLoading {
      margin-left: 4px;
    }
  }

  .cateInfo {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .catList {
      flex-grow: 1;
      overflow-y: auto;

      .cateItem {
        border: solid 1px #bfbfbf;
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
        margin: 8px 0;

        .info {
          display: flex;
          align-items: center;
          gap: 12px;

          .head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
          }

          .desc {
            color: #999;
            font-size: 14px;
          }
        }

        .children {
          margin-left: 16px;
        }
      }
    }

    .cateAction {
      padding-top: 8px;
      border-top: solid 1px #cccccc;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
    }
  }
}

.twoChat {
  .chat {
    margin-bottom: 10px;
    display: flex;

    .user {
      width: 50px;
      height: 50px;
      text-align: center;
      line-height: 50px;
      border: solid 1px #333;
      flex-shrink: 0;
      border-radius: 8px;
    }

    .text {
      border: solid 1px #333;
      border-radius: 4px;
      padding: 8px;
      margin: 0 8px;
    }

    &.chat1 {
      max-width: 80%;
    }

    &.chat2 {
      max-width: 80%;
      margin-left: 20%;
      flex-direction: row-reverse;
    }
  }
}

.createImgStep {
  border: solid 1px #333;
  border-radius: 4px;
  margin-bottom: 4px;
  padding: 8px;

  .title {
    font-size: 16px;
  }
}

.seggestColors {
  display: flex;

  .seggestColorItem {
    margin: 8px;
    width: 100px;
    height: 80px;
    border-radius: 8px;
    box-sizing: border-box;
    border: solid 2px transparent;
    color: black;
    text-align: center;
    line-height: 76px;
    cursor: pointer;
    border: solid 1px #eee;
    box-shadow: 0px 0px 3px 0px #c1c1c1;

    &.active {
      border: solid 2px black;
    }
  }
}

.seggestStyles {
  display: flex;

  .styleItem {
    margin: 8px;
    width: 100px;
    height: 80px;
    border-radius: 8px;
    box-sizing: border-box;
    border: solid 1px black;
    color: black;
    text-align: center;
    cursor: pointer;

    &.active {
      border: solid 2px black;
    }
  }
}

.bookList {
  display: flex;
  flex-wrap: wrap;
  margin: 12px;
  height: calc(100vh - 64px);
  overflow: auto;
  gap: 12px;

  .bookTabs {
    width: 100%;
  }

  .book {
    width: 250px;
    height: 373px;
    border: solid 1px #aaa;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .imgContent {
      min-height: 266px;
      width: 250px;
      height: 333px;
      background-color: #c8c8c8;
    }

    .info {
      position: absolute;
      width: 90%;
      text-align: center;
      background: rgba(255, 255, 255, 0.7);
      padding: 8px;
      box-sizing: border-box;
      top: 30px;
      left: 5%;
    }

    .img {
      width: 100%;
    }

    .tools {
      display: flex;
      padding: 8px;
    }
  }
}
</style>