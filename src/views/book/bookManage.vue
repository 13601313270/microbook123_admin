<template>
  <div class="nav">
    <el-button @click="initInsert">通过想法新增</el-button>
    <el-button @click="initInsertByName">通过书名新增</el-button>
  </div>
  <div class="bookList" v-loading="bookListLoading">
    <el-tabs type="border-card" class="bookTabs" v-model:model-value="activeTab">
      <el-tab-pane label="公司发展史系列">
        <CompanyHistory v-if="activeTab === '0'" @insertInit="insertInit" @toEditDetail="turnDetail" />
      </el-tab-pane>
      <el-tab-pane label="名人传记">
        <PeopleHistory v-if="activeTab === '1'" @insertInit="insertInit" @toEditDetail="turnDetail" />
      </el-tab-pane>
      <el-tab-pane label="著名战争">著名战争</el-tab-pane>
    </el-tabs>

    <!-- <div class="book" @click="turnDetail(book.id)" v-for="book in bookList" :key="book.id">
      <div class="info">
        <div>{{ book.name }}</div>
        <div v-if="book.type"><el-tag>{{typeList.find(v => v.id === book.type)?.name}}</el-tag></div>
        <span v-if="book.status === 0"><el-tag type="warning">无正文</el-tag></span>
        <span v-if="book.status === 2"><el-tag type="warning">待确认</el-tag></span>
        <div>{{ book.problem }}</div>
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
    </div> -->
  </div>
  <!-- <el-pagination v-if="page > 0" class="page" @current-change="changePage" :current-page="page" :page-size="pageSize"
    layout="total, prev, pager, next, jumper" :total="bookCount" /> -->
  <el-dialog v-model="insertVisible" @close="createClose" title="新增图书" width="80%">
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
        <el-button :disabled="form.system == '' || form.bookProblem === ''" @click="getRecType"
          :loading="typeAIRecloading">AI判断</el-button>
        <el-select :disabled="form.system == '' || form.bookProblem === ''" v-model="form.type">
          <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="begin">开始</el-button>
      </el-form-item>
    </el-form>
    <div v-if="createStep === 1" class="chatContent">
      <div class="chat">
        <div style="display: flex;">
          <el-input v-model="createCateQuestion" />
          <el-button @click="chatBeter" :loading="createCateAnswerLoading"
            :disabled="createCateJSONLoading">沟通</el-button>
        </div>
        <div ref="createChatDom" class="chatList">
          <div class="chatItem" v-for="createCateAnswer in createCateAnswerList"
            v-html="createCateAnswer.replace(/\n/g, '<br/>')"></div>
          <span class="createLoading" v-if="createCateAnswerLoading">
            <el-icon>
              <Loading />
            </el-icon>
          </span>
        </div>
      </div>
      <div class="catList">
        <el-button @click="createCate" :loading="createCateJSONLoading"
          :disabled="createCateAnswerLoading">生成</el-button>
        <div>
          <div v-for="item in createCateJSON" class="cateItem">
            <div class="head">
              <el-input class="titleInput" v-model="item.title" />
            </div>
            <div class="desc">{{ item.desc }}</div>
            <div class="children">
              <div v-for="item2 in item.children" class="cateItem">
                <div>
                  <div class="head">
                    <el-input class="titleInput" v-model="item2.title" />
                  </div>
                  <div class="desc">{{ item2.desc }}</div>
                </div>
                <div class="children">
                  <div v-for="item3 in item2.children" class="cateItem">
                    <div class="head">
                      <el-input class="titleInput" v-model="item3.title" />
                    </div>
                    <div class="desc">{{ item3.desc }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-button @click="createBook" :loading="createCateJSONLoading || creteLoading"
          :disabled="createCateAnswerLoading || createCateJSON.length === 0">创建图书</el-button>
      </div>
    </div>
  </el-dialog>
  <el-dialog v-model="editImgIsShow" title="图片编辑" width="80%">
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
        <img :src="createImgUrl" style="width: 400px;">
        <el-button v-if="createImgUrl" type="primary" @click="saveCreateImg"
          :disabled="createImging || !createImgUrl">保存</el-button>
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
import { onMounted, ref, reactive, onActivated } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { get, post, put, Delete } from '@/plugins/request'
import router from '@/router/index';
import Session from '@/plugins/session';
import CompanyHistory from './companyHistory.vue';
import PeopleHistory from './peopleHistory.vue';

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
const activeTab = ref<string>('0');
const page = ref<number>(1);
const pageSize = ref<number>(10);
const bookCount = ref<number>(-1)
const bookListLoading = ref<boolean>(false)
const bookList = ref<IBook[]>([])
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
const createCateAnswerList = ref<string[]>([])
const createCateJSONLoading = ref<boolean>(false)
const createCateJSON = ref<CateItem[]>([])
const creteLoading = ref<boolean>(false);
const createBookIng = ref<boolean>(false)
const createChatDom = ref()

// 根据书名创建
const insertByNameVisible = ref<boolean>(false)
const formByName = reactive<{
  system: string,
  bookProblem: string,
  cateType: ICateType,
}>({
  system: '精通儿童辅食制作',// 你是一个精通html、css和jsPDF三方包使用的专家
  bookProblem: '制作营养丰富的儿童辅食',// jsPDF包如何使用
  cateType: 1,// 1树状结构，常用于知识。2线性结构，故事/编年体
})

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
const typeAIRecloading = ref<boolean>(false)

// 对抗网络
const twoChatShow = ref<boolean>(false)
const twoChatContnt = ref<{
  user: 'chat1' | 'chat2',
  content: string,
}[]>([])

onActivated(() => {
  // initBookList()
})
async function initBookList() {
  bookListLoading.value = true;
  const { data: typeListRes } = await get(`/admin/dbBase/tableCommon/book/type`, {
    query: {},
    sort: {
    },
    page: {
      page: 0,
      pageSize: 100,
    },
  });
  typeList.value = typeListRes.map((v: any) => {
    return {
      id: v.id.val,
      name: v.name.val,
    }
  })
  const { data, count } = await get(`/admin/dbBase/tableCommon/book/book`, {
    query: {},
    sort: {
      id: 'desc',
    },
    page: {
      page: page.value - 1,
      pageSize: pageSize.value,
    },
  })
  bookCount.value = count;
  bookList.value = data.map((v: any) => {
    return {
      id: v.id.val,
      name: v.name.val,
      desc: v.desc.val,
      problem: v.problem.val,
      status: v.status.val,
      createUserSystem: v.createUserSystem.val,
      img: v.img.val,
      type: v.type.val,
    }
  });
  bookListLoading.value = false;
}
function changePage(val: number) {
  console.log(val)
  page.value = val;
  initBookList();
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
    [2]: `你要考虑这本书都需要讲解什么内容，并生成本书的目录，目录类似小说，编年体，或人物传记，具体哪年干了什么事情，然后给我你规划的本书的目录。目录就一层结构。
## 生成目录格式要求
一行一个时间发生的时间，年份在前，发生的事情在后。中间用“：”隔开。注意：即时年份非常多，也不要划分成一个个时期。就罗列出来就好。

## 目录示例：
718年：隐居大匡山，往来旁郡。
726年：自金陵至广陵。
728年：春至江夏，改葬吴指南。送孟浩然之广陵。
731年：下终南山。有《下终南山过斛斯山人宿置酒》诗。
736年：春由太原经洛阳口安陆。
738年：游襄阳，有《赠孟浩然》诗。
740年：发生XXXX事情。
741年：发生XXXX事情。
742年：发生XXXX事情。
743年：发生XXXX事情。

## 反面示例
第一章：某某时期
718年：隐居大匡山，往来旁郡。从赵蕤学纵横术
726年：自金陵至广陵，又东南游苏州、杭州、越州、台州，东涉溟海。
728年：春至江夏，改葬吴指南。送孟浩然之广陵。回安陆，寓居白兆山。
731年：下终南山。有《下终南山过斛斯山人宿置酒》诗。
736年：春由太原经洛阳口安陆。
第二章：某某时期
738年：游襄阳，有《赠孟浩然》诗。
740年：发生XXXX事情。
741年：发生XXXX事情。
742年：发生XXXX事情。
743年：发生XXXX事情。
`,
  }
  createCateAnswerList.value.push('');
  // 你可以参考这个网址中[${form.outUrl}]中外部资料作为常识。
  createCateAnswerList.value[createCateAnswerList.value.length - 1] = await session.chat(`我们一起合作要写一本名讲述${form.bookProblem}的书。${cateDescMap[form.cateType]}`, (res) => {
    createCateAnswerList.value[createCateAnswerList.value.length - 1] += res;
    if (createChatDom.value) {
      createChatDom.value.scrollTop += 3000
    }
  }, {
    model: 'ernie-3.5-128k'
  })
  createCateAnswerLoading.value = false
}
async function chatBeter() {
  createCateAnswerLoading.value = true
  createCateAnswerList.value.push('');
  createCateAnswerList.value[createCateAnswerList.value.length - 1] = await session.chat('我希望对你生成的目录进行一些改进，' + createCateQuestion.value, (res) => {
    createCateAnswerList.value[createCateAnswerList.value.length - 1] += res;
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
    createCateAnswerList.value.push('');
    createCateAnswerList.value[createCateAnswerList.value.length - 1] = await session.chat(`这些章节内容比例大概是什么样的？`, (res) => {
      createCateAnswerList.value[createCateAnswerList.value.length - 1] += res;
      if (createChatDom.value) {
        createChatDom.value.scrollTop += 3000
      }
    }, {
      model: 'ernie-3.5-128k'
    })
    createCateAnswerList.value.push('');
    createCateAnswerList.value[createCateAnswerList.value.length - 1] = await session.chat(`根据你说的比例，重新调整一下。占比较多的多划分一些子章节。占比较少的，少划分子章节。不要索引。`, (res) => {
      createCateAnswerList.value[createCateAnswerList.value.length - 1] += res;
      if (createChatDom.value) {
        createChatDom.value.scrollTop += 3000
      }
    }, {
      model: 'ernie-3.5-128k'
    })
  }
  const createCatePrompt: string = (() => {
    if (form.cateType === 1) {
      return `根据你生成的目录章节，构建这个目录的json结构。
## 格式要求
格式需要是json格式，只返回json数据即可，json格式示例如下：
\`\`\`json${JSON.stringify([
        {
          "title": "第一部分名称",
          "desc": "短描述",
          "children": [
            {
              "title": "第一章名称",
              "desc": "短描述",
              "children": [
                {
                  "title": "三级类目1",
                  "desc": "短描述",
                },
                {
                  "title": "三级类目2",
                  "desc": "短描述",
                }
              ]
            },
            {
              "title": "第二章名称",
              "desc": "短描述",
            }
          ]
        },
        {
          "title": "第二部分名称",
          "desc": "短描述",
          "children": [
            {
              "title": "第三章名称",
              "desc": "短描述",
              "children": [
                {
                  "title": "三级类目1",
                  "desc": "短描述",
                },
                {
                  "title": "三级类目2",
                  "desc": "短描述",
                }
              ]
            },
            {
              "title": "第四章名称",
              "desc": "短描述",
            }
          ]
        }
      ])}
\`\`\`
你生成的json，如上所示，不进行格式缩进，以去掉不必要的空格。每个children下至少有2个子节点。如果children下没有子节点，则不保留，不要出现\`\`\`"children": []\`\`\`这种空数组
`
    } else if (form.cateType === 2) {
      return `好的，根据你生成的目录，构建成json结构。
## 格式要求
格式需要是json格式，json格式示例如下：
\`\`\`json${JSON.stringify([
        {
          "title": "718年：隐居大匡山，往来旁郡。",
          "desc": "短描述",
        },
        {
          "title": "726年：自金陵至广陵。",
          "desc": "短描述",
        },
        {
          "title": "728年：春至江夏，改葬吴指南。送孟浩然之广陵。",
          "desc": "短描述",
        },
        {
          "title": "731年：下终南山。有《下终南山过斛斯山人宿置酒》诗。",
          "desc": "短描述",
        },
        {
          "title": "736年：春由太原经洛阳口安陆。",
          "desc": "短描述",
        },
        {
          "title": "738年：游襄阳，有《赠孟浩然》诗。",
          "desc": "短描述",
        },
        {
          "title": "740年：发生XXXX事情。",
          "desc": "短描述",
        },
        {
          "title": "741年：发生XXXX事情。",
          "desc": "短描述",
        },
        {
          "title": "742年：发生XXXX事情。",
          "desc": "短描述",
        },
        {
          "title": "743年：发生XXXX事情。",
          "desc": "短描述",
        },
      ])}
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
    model: 'ernie-3.5-128k'
  })
  console.log(json)

  const match = json.match(/```json([\S|\s]+)\`\`\`/)
  if (match) {
    try {
      let children: CateItem[] = []
      try {
        children = JSON.parse(match[1]);
      } catch (e) {
        debugger
        children = eval(`(${match[1]})`)
        debugger
      }
      console.log('children', children);
      if (children.length === 1 && children[0].children) {
        children = children[0].children;
      }
      console.log(children);
      createCateJSON.value = children;
    } catch (e) {
      console.log(match);
      ElMessage.error('json结构不严格');
    }
  } else {
    console.log(json);
    ElMessage.error('大语言模型无法找到json结构');
  }
  createCateJSONLoading.value = false;
}
async function createBook() {
  creteLoading.value = true;
  const bookInfoJSON = await session.chat(`给这个书起个15个字以内的吸引人的名字，然后总结一段30字以内的短描述，短描述适合印刷在封皮上
  ## 格式要求
返回json结构，只返回json，不要跟我说客套话，示例如下：
\`\`\`json
{
  "name": "书名",
  "desc": "短描述",
}
\`\`\``)
  console.log(bookInfoJSON)
  const match = bookInfoJSON.match(/```json([\S|\s]+)\`\`\`/)
  if (match) {
    try {
      const bookInfo: {
        name: string,
        desc: string,
      } = JSON.parse(match[1]);
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
      const res = await post(`/admin/dbBase/tableCommon/book/book`, {
        data: insertInfo
      });
      console.log('创建成功', res);
      if (res) {
        insertVisible.value = false;
        ElMessage.success('创建成功')
        await initBookList();
        console.log('创建成功2')
        const insertInfo: any = await get(`/admin/dbBase/tableCommonDetail/book/book/${res}`)
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
  } else {
    ElMessage.error('返回无json结构')
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
async function initInsertByName() {
  insertByNameVisible.value = true;
  formByName.bookProblem = ''
  formByName.system = ''
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
  }, {
    model: 'ernie-3.5-128k'
  })

  const jsonText = await sessionImg.chat(`
根据刚才的信息，给我汇总一个json格式的数据，json里不要加任何注释。
## 格式要求
json结构，json里不要加任何注释。json里的backgroundColor的值后面，不要给任何注释。
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
    model: 'ernie-3.5-128k'
  })

  console.log('=====', jsonText)
  if (jsonText) {
    const match = jsonText.match(/```json([\S|\s]+)\`\`\`/)
    console.log('=====', match)
    if (match) {
      try {
        const json: {
          object: string[],
          backgroundColor: string[],
          style: (typeof allStyle)[keyof typeof allStyle],
        } = JSON.parse(match[1]);
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
  const prompt = await sessionImg.chat(`帮助我写一个文生图模型的Prompt，生成的图片作为图书的封皮使用，。
## 要求如下
背景主色调接近十六进制颜色代码“${mainColor}”。
让图片上半部分有大面积纯色留白，比如添加蓝色的天空，白色的黑板，纯色的墙面，大片雪地。
包含元素${objects.join('、')}中的一个或多个，元素尽可能在图片下半部分。
这个图片，作为图书的封皮使用，简约一些，图片不要太乱。
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
    model: 'ernie-3.5-128k'
  })
  const match2 = prompt.match(/```json([\S|\s]+)\`\`\`/)
  if (match2) {
    let json2
    try {
      json2 = JSON.parse(match2[1])
    } catch (e) {
      debugger
      json2 = eval(`(${match2[1]})`)
      debugger
    }
    createImgStep2AnswerJSON.value = json2;
    createImging.value = false
    chatCreateImgStep3()
  }
}
async function chatCreateImgStep3() {
  if (createImgStep1StyleSelect.value === undefined || createImgStep2AnswerJSON.value === undefined) {
    return;
  }
  createImging.value = true
  const selectStyle: keyof typeof allStyle = createImgStep1StyleSelect.value;
  get('https://api.studying1v1.com/wenxinyiyan/createImg', {
    prompt: createImgStep2AnswerJSON.value.prompt,
    size: '768x1024',
    style: selectStyle
  }).then(res => {
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
    let arr = dataurl.split(',')
    // @ts-ignore
    let mime = arr[0].match(/:(.*?);/)[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  const formData = new FormData()
  formData.append('file', base64ToBlob(createImgUrl.value))
  const { url } = await post('/oss', formData)
  if (url) {
    editImgIsShow.value = false;
    await put(`/admin/dbBase/tableCommonDetail/book/book/${createImgBook.value.id}`, {
      data: {
        img: url,
      },
    })
    initBookList()
  }
}
function deleteBook(book: IBook) {
  ElMessageBox.confirm('是否删除' + book.id + ':' + book.name, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await Delete(`/admin/dbBase/tableCommonDetail/book/book/${book.id}`)
    initBookList()
  }).catch(() => {
  })
}
function createClose() {
  createStep.value = 0
  createCateQuestion.value = ''
  createCateAnswerList.value = [];
  createCateJSON.value = []
}

async function getRecType() {
  const session = new Session(form.system)
  typeAIRecloading.value = true;
  const result = await session.chat(`现在有一个人${form.system}写一本${form.bookProblem}。你希望收录到哪个分类？分类有：
${typeList.value.map(v => v.name).join('、')}。
按照json格式返回。
\`\`\`json
{
  "type": "最适合分类名"
}
\`\`\`
`)
  console.log(result)
  const match = result.match(/```json([\S|\s]+)\`\`\`/)
  console.log(match)
  var jsonObj: {
    type: string
  };
  if (match) {
    try {
      jsonObj = JSON.parse(match[1]);
    } catch (e) {
      jsonObj = eval('(' + match[1] + ')')
    }
    console.log(jsonObj)
    if (jsonObj.type) {
      const find = typeList.value.find(v => v.name === jsonObj.type)
      console.log(find)
      if (find) {
        form.type = find.id;
      }
    }
  }
  typeAIRecloading.value = false;
}
async function insertInit(cateType: ICateType, type: number, system: string, bookProblem: string, message: string, strategy: string) {
  console.log('insertInit', cateType, system, message, strategy)
  form.system = system;
  form.bookProblem = bookProblem;
  form.cateType = cateType;
  form.type = type;
  insertVisible.value = true
  insertStrategy.value = strategy;
  createStep.value = 1;
  createCateAnswerList.value = []
  createCateAnswerLoading.value = true
  session = new Session(system)
  console.log(form)
  createCateAnswerList.value.push('');
  createCateAnswerList.value[createCateAnswerList.value.length - 1] = await session.chat(message, (res) => {
    createCateAnswerList.value[createCateAnswerList.value.length - 1] += res;
    if (createChatDom.value) {
      createChatDom.value.scrollTop += 3000
    }
  }, {
    model: 'ernie-3.5-128k'
  })
  createCateAnswerLoading.value = false
}
</script>
<style lang="less" scoped>
@import "../basic.less";

.nav {
  .navTools;
}

.bookList {
  display: flex;
  flex-wrap: wrap;
  margin: 12px;
  height: calc(100vh - 64px);
  overflow: auto;

  .bookTabs {
    width: 100%;
  }

  .book {
    margin: 4px;
    width: 200px;
    height: 317px;
    border: solid 1px #aaa;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .imgContent {
      min-height: 266px;
      background-color: #c8c8c8;
    }

    .info {
      position: absolute;
      top: 0;
      width: 100%;
      background: rgba(255, 255, 255, .7);
      padding: 8px;
      box-sizing: border-box;
    }

    .img {
      width: 100%;
    }

    .tools {
      display: flex;
      padding: 4px;
    }
  }
}

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
    border-right: solid 1px #d8d8d8;
    padding-right: 10px;
    margin-right: 10px;
    display: flex;
    flex-direction: column;

    .chatList {
      margin-top: 8px;
      overflow-y: auto;
    }

    .chatItem {
      border: solid 1px #333;
      border-radius: 4px;
      padding: 4px;

      &:not(:first-child) {
        margin-top: 4px;
      }
    }

    .createLoading {
      margin-left: 4px;
    }
  }

  .catList {
    max-width: 400px;
    min-width: 300px;
    height: 100%;
    overflow-y: auto;

    .cateItem {
      border: solid 1px rgb(95, 95, 95);
      border-radius: 4px;
      padding: 8px;
      cursor: pointer;
      margin: 4px 0;

      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .titleInput {
          background-color: transparent;

          :deep(.el-input__wrapper) {
            background-color: transparent;
            box-shadow: none;

            &.is-focus {
              background-color: white !important;
              box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset !important;

              .el-input__inner {
                color: black !important;
              }
            }
          }
        }

        .tools {
          flex-shrink: 0;
        }
      }

      .desc {
        color: #999;
        font-size: 12px;
      }

      .children {
        margin-left: 16px;
      }
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
</style>