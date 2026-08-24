<template>
  <div class="edit">
    <div class="nav">
      <el-button-group v-if="bookInfo">
        <el-button size="small" :disabled="lockPage || cateJSON.length === 0" @click="saveBook">保存目录</el-button>
        <el-button size="small" :disabled="lockPage || cateJSON.length === 0" :loading="lockPage"
          @click="createAllContent('ernie-speed-128k')">补充正文</el-button>
        <el-button size="small" :disabled="lockPage || cateJSON.length === 0" :loading="lockPage"
          @click="createAllContent('ernie-3.5-128k')">补充正文（高级）</el-button>
        <el-button v-if="bookInfo.downUrl" size="small" :disabled="lockPage || cateJSON.length === 0"
          @click="exportBook(true)" :loading="exporting">重新生成PDF</el-button>
        <el-button v-else size="small" :disabled="lockPage || cateJSON.length === 0" @click="exportBook(true)"
          :loading="exporting" type="danger">生成PDF并上线</el-button>
        <el-button size="small" :disabled="lockPage || cateJSON.length === 0" @click="exportBook(false)"
          :loading="exporting">导出</el-button>
        <el-button size="small" :disabled="lockPage || cateJSON.length === 0" @click="pushBaidu">push百度</el-button>
      </el-button-group>
    </div>
    <div class="left">
      <div v-if="bookInfo" class="bookInfo">
        <el-button size="small" @click="router.back()">&lt;</el-button>
        <div class="name">{{ bookInfo.name }}</div>
        <div class="length" v-if="allBookLength">{{ allBookLength }}字</div>
        <div style="flex-grow: 1;"></div>
      </div>
      <div class="cateEdit">
        <div v-for="item in cateJSON" class="cateItem" :class="{ active: chooseCateInfo === item }"
          @click="lockPage === false && changeChooseCate(item, [item.title])">
          <div class="head">
            <el-input class="titleInput" :disabled="lockPage" v-model="item.title" />
            <span class="length">{{ getContentItemLength(item) }}字</span>
            <el-dropdown class="tools" :disabled="lockPage">
              <span>操作</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="initAddCate1Child(item, [item.title])">增加二级</el-dropdown-item>
                  <el-dropdown-item @click="deleteCate1(item)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="desc"><el-input v-model="item.desc" type="textarea" autosize :disabled="lockPage" />
          </div>
          <!-- <div>{{ item.contentId }}</div> -->
          <div class="children">
            <div v-for="item2 in item.children" class="cateItem" :class="{ active: chooseCateInfo === item2 }">
              <div @click="lockPage === false && changeChooseCate(item2, [item.title, item2.title])">
                <div class="head">
                  <el-input class="titleInput" :disabled="lockPage" v-model="item2.title" />
                  <span class="length">{{ getContentItemLength(item2) }}字</span>
                  <el-dropdown class="tools" :disabled="lockPage">
                    <span>操作</span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="toCate1(item, item2)">变为一级</el-dropdown-item>
                        <el-dropdown-item
                          @click="initAddCate1Child(item2, [item.title, item2.title])">增加三级</el-dropdown-item>
                        <el-dropdown-item @click="deleteCate2(item, item2)">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
                <div class="desc"><el-input v-model="item2.desc" type="textarea" autosize :disabled="lockPage" />
                </div>
                <!-- <div>{{ item2.contentId }}</div> -->
              </div>
              <div class="children">
                <div v-for="item3 in item2.children" class="cateItem" :class="{ active: chooseCateInfo === item3 }"
                  @click="lockPage === false && changeChooseCate(item3, [item.title, item2.title, item3.title])">
                  <div class="head">
                    <el-input class="titleInput" :disabled="lockPage" v-model="item3.title" />
                    <span class="length" v-if="item3.length">{{ item3.length }}字</span>
                    <el-dropdown class="tools" :disabled="lockPage">
                      <span>操作</span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="toCate2(item, item2, item3)">变为二级</el-dropdown-item>
                          <el-dropdown-item @click="deleteCate3(item2, item3)">删除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                  <div class="desc">
                    <el-input v-model="item3.desc" type="textarea" autosize :disabled="lockPage" />
                  </div>
                  <!-- <div>{{ item3.contentId }}</div> -->
                </div>
              </div>
            </div>
            <el-button-group>
              <el-button size="small" @click="item.children.push({ title: '', children: [] })">添加</el-button>
              <!-- <el-button size="small" @click="item.children.push({ title: '', children: [] })">AI添加</el-button> -->
            </el-button-group>
          </div>
        </div>
      </div>
    </div>
    <div class="contentEdit" v-loading="lockPage">
      <div v-if="showContentLoading" style="height: 100%;" v-loading="true"></div>
      <div v-else-if="showContent.length === 0" class="empty">
        <div v-if="chooseCate && chooseCate.length === 0">
          请选择左侧的章节
        </div>
        <div v-else style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
          <div>创建目录后，未生成内容，点击生成进行创建</div>
          <div>
            <el-button v-loading.fullscreen.lock="createContentLoading && !lockPage"
              @click="createContent('ernie-speed-128k')" style="width: 350px;margin-top: 12px;"
              type="primary">生成(免费)</el-button>
          </div>
          <div>
            <el-button v-loading.fullscreen.lock="createContentLoading && !lockPage"
              @click="createContent('ernie-3.5-128k')" style="width: 350px;margin-top: 12px;">高级生成(收费)输入：0.0008
              输出：0.002</el-button>
          </div>
          <div>
            <el-button v-loading.fullscreen.lock="createContentLoading && !lockPage"
              @click="createContent('ernie-4.0-turbo-8k-latest')" style="width: 350px;margin-top: 12px;">究极生成(收费)输入：0.02
              输出：0.06</el-button>
          </div>
          <div>
            <el-button v-loading.fullscreen.lock="createContentLoading && !lockPage"
              @click="createContent('ernie-novel-8k')" style="width: 350px;margin-top: 12px;">究极生成小说风格(收费)输入：0.04
              输出：0.12</el-button>
          </div>
        </div>
      </div>
      <!-- {{ chooseCate }} -->
      <div v-for="contentItem in showContent" class="codeItem">
        <div class="customTools">
          <el-button-group size="small">
            <el-button @click="showCreateNewContent(contentItem)">优化</el-button>
            <el-button @click="splitContentToCat(contentItem, true)">拆分到父级</el-button>
            <el-button @click="splitContentToCat(contentItem, false)">拆分成子级</el-button>
            <el-button @click="showCreateNewImg(contentItem)">插图</el-button>
            <el-button type="warning" @click="deleteContent()">删除</el-button>
          </el-button-group>
          <div style="flex-grow: 1;"></div>
          <div class="contentLength">
            字数{{ contentItem.length }}
          </div>
          <el-button-group size="small">
            <el-button @click="saveContent(contentItem)">保存</el-button>
          </el-button-group>
        </div>
        <div class="textarea">
          <el-input type="textarea" @mouseup="textSelect" v-model="contentItem.content" autosize />
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="addCate1ChildCateVisible" title="增加二/三级章节" width="1000">
    <div>{{ addCate1ChildCateEditCat }}</div>
    <div style="display: flex;">
      <el-input v-model="addCate1ChildCateInput" :disabled="addCate1ChildCateLoading" />
      <el-button-group style="flex-shrink: 0;margin-left: 8px">
        <el-button @click="addCate1ChildCate" :loading="addCate1ChildCateLoading">沟通</el-button>
        <el-button @click="createCatJSON" :loading="addCate1ChildCateLoading">生成</el-button>
      </el-button-group>
    </div>
    <div v-html="addCate1ChildCateAnswer.replace(/\n/g, '<br/>')"></div>
    <div v-if="addCate1ChildCateAnswerJSON && !addCate1ChildCateLoading">
      <el-input v-model="addCate1ChildCateAnswerJSON" type="textarea" :rows="10" />
      <el-button @click="useAnswerJSON" :disabled="addCate1ChildCateLoading">应用</el-button>
    </div>
  </el-dialog>
  <el-dialog v-model="newContentVisible" :title="chooseCate.join(' > ')" width="1000" class="newContentDialog">
    <!-- <div>对比</div> -->
    <div style="display: flex;">
      <el-input :disabled="newContentLoading" v-model="newContentInput" placeholder="输入告知AI的改进建议" />
      <el-button @click="getNewContent()" :disabled="newContentInput === ''"
        :loading="newContentLoading" style="margin-left: 4px;" type="primary">生成</el-button>
    </div>
    <div class="contentDiff">
      <div class="contentDiffItem">
        <div class="countLength">字数:{{ newContentOldContent?.content.slice(newContentOldSelect?.start,
          newContentOldSelect?.end).length }}</div>
        <div class="countText" v-html="newContentOldContent?.content.slice(newContentOldSelect?.start,
          newContentOldSelect?.end).replace(/\n/g, '<br/>')"></div>
      </div>
      <div class="contentDiffItem">
        <div class="creating" v-if="newContentLoading">内容生成中，请稍等</div>
        <div class="countLength" v-if="newContentNewContent.length">字数:{{ newContentNewContent.length }}</div>
        <el-input v-model="newContentNewContent" :disabled="newContentLoading" type="textarea" autosize />
      </div>
    </div>
    <div style="display: flex;justify-content: flex-end;margin-top: 4px;">
      <el-button :disabled="newContentNewContent === '' || newContentLoading" type="primary"
        @click="useNewContent">应用</el-button>
    </div>
  </el-dialog>
  <el-dialog v-model="newImgVisible" title="生成配图" width="1000" class="newContentDialog">
    <div style="display: flex;flex-wrap: wrap">
      <div v-for="imgUrl in baiduImgList" @click="addImgToContent(imgUrl)">
        <img :src="imgUrl" style="width: 100px;" />
      </div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { ElMessage, ElMessageBox, ElButtonGroup, ElButton, ElInput, ElDropdown, ElDropdownMenu, ElDropdownItem, ElDialog } from 'element-plus'
import jsPDF from 'jspdf';

import Session from '@/plugins/session';
import { useRoute } from 'vue-router';
import router from '@/router/index'
import { get, post, put, Delete } from '@/plugins/request'
import modifyStr from './modifyStr';
import { ModelEnum } from '@/plugins/wenxinyiyanConfig';

type CateItem = {
  title: string,
  children: CateItem[],
  desc?: string,
  length?: number,
  contentId?: number[],
}
type Content = {
  id: number,
  content: string,
  length: number,
  zipDesc50: string,
}
const bookInfo = ref<{
  id: number;
  name: string;
  img: string;
  desc: string;
  problem: string;
  downUrl: string;
  createUserSystem: string;
  cateType: 1 | 2;
  sendWord: string;
}>();

const route = useRoute()
const cateJSON = ref<CateItem[]>([])
const chooseCate = ref<string[]>([])
const chooseCateInfo = ref<CateItem>()
const bookId = ref<number>(5);
const showContent = ref<Content[]>([])
const showContentLoading = ref<boolean>(false)
const createContentLoading = ref<boolean>(false)
const exporting = ref<boolean>(false)
const lockPage = ref<boolean>(false)

// 给一级类目增加二级展示框
const addCate1ChildCateVisible = ref<boolean>(false);
const addCate1ChildCateEditCat = ref<string[]>([]);
const addCate1ChildCateInput = ref<string>('')
const addCate1ChildCateAnswer = ref<string>('')
const addCate1ChildCateAnswerJSON = ref<string>('')
const addCate1ChildCateLoading = ref<boolean>(false)
let addChate1Session: Session;

// 生成新文字对比
const newContentVisible = ref<boolean>(false);
const newContentInput = ref<string>('');
const newContentOldContent = ref<Content>()
const newContentNewContent = ref<string>('')
const newContentLoading = ref<boolean>(false)
const newContentOldSelect = ref<{ start: number, end: number | undefined }>({ start: 0, end: undefined })
const newContentOldSelectText = ref<string>();// 给newContentOldSelect做校验

// 生成配图
const newImgVisible = ref<boolean>(false);
const newImgContent = ref<Content>()
const newImgCreateUrl = ref<string>('');
const baiduImgList = ref<string[]>([])

onMounted(() => {
  bookId.value = parseInt(route.params.id as string);
  initBookCate()
});

async function initBookCate() {
  lockPage.value = true
  const info = await get(`/bookInfo/${bookId.value}`)
  const cateObj = JSON.parse(info.cateJSON);
  bookInfo.value = info;
  cateJSON.value = cateObj;
  lockPage.value = false
  getAllLength();
}

async function getAllLength() {
  const allContId: number[] = []
  cateJSON.value.forEach(v => {
    if (v.contentId) {
      allContId.push(...v.contentId)
    }
    if (v.children) {
      v.children.forEach(vv => {
        if (vv.contentId) {
          allContId.push(...vv.contentId)
        }
        if (vv.children) {
          vv.children.forEach(vvv => {
            if (vvv.contentId) {
              allContId.push(...vvv.contentId)
            }
          })
        }
      })
    }
  })
  const allLength: {
    [key in number]: number;
  } = allContId.length ? await get('/bookAllLength/' + bookId.value) : []
  cateJSON.value.forEach(v => {
    if (v.contentId) {
      let length = 0;
      v.contentId.forEach(id => {
        length = allLength[id]
      })
      v.length = length;
    }
    if (v.children) {
      v.children.forEach(vv => {
        let length = 0;
        if (vv.contentId) {
          vv.contentId.forEach(id => {
            length += allLength[id];
          })
          vv.length = length;
        }
        if (vv.children) {
          vv.children.forEach(vvv => {
            if (vvv.contentId) {
              let length = 0;
              vvv.contentId.forEach(id => {
                length += allLength[id];
              })
              vvv.length = length;
            }
          })
        }
      })
    }
  })
}

async function changeChooseCate(item: CateItem, val: string[]) {
  if (item.children && item.children.length) {
    return;
  }
  showContent.value = []
  chooseCateInfo.value = item;
  if (item.contentId && item.contentId.length) {
    showContentLoading.value = true;
    try {
      const contentList: {
        [key in number]: Content
      } = await get('/getContentByIds', {
        contentIds: item.contentId
      })
      showContentLoading.value = false;
      showContent.value = Object.values(contentList);
      chooseCate.value = val;
    } catch (e: any) {
      showContentLoading.value = false;
      ElMessage.error(e);
    }
  } else {
    chooseCate.value = val;
  }
}
async function toCate1(afterCat1: CateItem, cate2: CateItem) {
  const rootIndex = cateJSON.value.indexOf(afterCat1);
  cateJSON.value.splice(rootIndex + 1, 0, cate2);
  const findIndex = afterCat1.children.indexOf(cate2);
  afterCat1.children.splice(findIndex, 1)
}
async function toCate2(afterCat1: CateItem, afterCat2: CateItem, cate3: CateItem) {
  const rootIndex1 = cateJSON.value.indexOf(afterCat1);
  const rootIndex2 = cateJSON.value[rootIndex1].children.indexOf(afterCat2);
  const findIndex = cateJSON.value[rootIndex1].children[rootIndex2].children.indexOf(cate3);
  cateJSON.value[rootIndex1].children.splice(rootIndex2 + 1, 0, cate3);
  afterCat2.children.splice(findIndex, 1)
}

function findChooseCat() {
  let find: CateItem = {
    title: '',
    desc: '',
    length: 0,
    children: cateJSON.value
  };
  for (let i = 0; i < chooseCate.value.length; i++) {
    const match = find.children.find(v => v.title === chooseCate.value[i])
    if (match) {
      find = match;
    }
  }
  return find;
}
async function createContent(model: ModelEnum) {
  if (!bookInfo.value) {
    return
  }
  createContentLoading.value = true
  const find = findChooseCat();
  const chooseCateStr = chooseCate.value.join('/');
  const searchPropty = `你是${bookInfo.value.createUserSystem}，现在你要写一本名讲述${bookInfo.value.problem}的书。书名是《${bookInfo.value.name}》。
书的目录如下，锁进代表层级
\`\`\`text
${cateJSON.value.map(v => {
    let str = v.title
    if (v.children && v.children.length) {
      str += '\n'
      str += v.children.map(vv => {
        let str2 = '    ' + vv.title
        if (vv.children && vv.children.length) {
          str2 += '\n'
          str2 += vv.children.map(vvv => {
            return '        ' + vvv.title;
          }).join('\n')
        }
        return str2;
      }).join('\n')
    }
    return str;
  }).join('\n')}
\`\`\`
。正在写其中“${chooseCateStr}”这一章，${find.desc ? ('这一章内容是“' + find.desc + '”，') : ''}给出我这一章的内容。
## 内容特点
说的详细些，大于1300字。文章中不要有结语的章节。

## 格式要求
采用markdown格式。章节名称作为文章的开头，并用markdown一级标题。

## 示例
\`\`\`markdown
# ${chooseCateStr}
${bookInfo.value.cateType === 1 ? `
介绍文章的引言段落正文

## XXX

正文.........

## XXX

正文.........
` : `
段落1。
段落2。
`}
\`\`\`
"`
  const { id } = await post('/bookContent/create', {
    bookId: bookId.value,
    chooseCate: chooseCate.value,
    model,
    searchPropty,
    system: bookInfo.value.createUserSystem,
  }).catch((e) => {
    createContentLoading.value = false
    ElMessage.error(e);
  });
  if (id > 0) {
    if (!find.contentId) {
      find.contentId = [+id]
    } else {
      find.contentId.push(+id)
    }
    if (!find.desc) {
      const contentList: {
        [key in number]: Content
      } = await get('/getContentByIds', {
        contentIds: [id]
      })
      find.desc = contentList[id].zipDesc50
    }
    // await post('/book/bookUpdate/' + bookId.value, {
    //   cateJSON: cateJSON.value,
    // })
    if (chooseCateInfo.value) {
      await changeChooseCate(chooseCateInfo.value, chooseCate.value)
    }
    createContentLoading.value = false
    getAllLength();
  } else {
    createContentLoading.value = false
    ElMessage({
      message: '创建失败',
      type: 'error',
    })
  }
}
async function createAllContent(model: ModelEnum) {
  const startDate = (new Date()).getTime()
  let stepStartDate = startDate;
  function showTime() {
    const useTime = Math.floor(((new Date()).getTime() - startDate) / 1000);
    const second = useTime % 60;
    const showTimeStr = useTime > 60 ? (Math.floor(useTime / 60) + '分钟' + (second ? second + '秒' : '')) : (useTime + '秒');
    const stepTime = Math.floor(((new Date()).getTime() - stepStartDate) / 1000)
    ElMessage.info({
      duration: 10000,
      message: `累计消耗${showTimeStr}，本次消耗${stepTime}秒`
    })
  }
  lockPage.value = true;
  for (let i = 0; i < cateJSON.value.length; i++) {
    const cate1 = cateJSON.value[i]
    if (!cate1.children || cate1.children.length === 0) {
      if (!cate1.contentId || cate1.contentId.length === 0) {
        await changeChooseCate(cate1, [cate1.title])
        stepStartDate = (new Date()).getTime();
        await createContent(model)
        showTime()
      }
    } else {
      for (let j = 0; j < cate1.children.length; j++) {
        const cate2 = cate1.children[j]
        if (!cate2.children || cate2.children.length === 0) {
          if (!cate2.contentId || cate2.contentId.length === 0) {
            await changeChooseCate(cate2, [cate1.title, cate2.title])
            stepStartDate = (new Date()).getTime();
            await createContent(model)
            showTime()
          }
        } else {
          for (let k = 0; k < cate2.children.length; k++) {
            const cate3 = cate2.children[k]
            if (!cate3.contentId || cate3.contentId.length === 0) {
              await changeChooseCate(cate3, [cate1.title, cate2.title, cate3.title])
              stepStartDate = (new Date()).getTime();
              await createContent(model)
              showTime()
            }
          }
        }
      }
    }
  }
  showMsgNotification('书内容创建完成', '书内容创建完成')
  lockPage.value = false;
}
function showCreateNewImg(content: Content) {
  baiduImgList.value = []
  newImgCreateUrl.value = '';
  newImgVisible.value = true;
  newImgContent.value = content;
  getNewContentImg();
}
function showCreateNewContent(content: Content) {
  newContentNewContent.value = ''
  newContentInput.value = ''
  newContentVisible.value = true
  newContentOldContent.value = content
}
async function getNewContent() {
  newContentNewContent.value = ''
  if (chooseCate.value.length === 0 || !bookInfo.value || newContentInput.value === '') {
    return
  }
  if (!newContentOldContent.value || !newContentOldSelect.value) {
    return;
  }
  createContentLoading.value = true
  const find = findChooseCat();
  newContentLoading.value = true;
  const bookSystem = bookInfo.value.createUserSystem;
  const oldContent = newContentOldContent.value.content.slice(newContentOldSelect.value.start,
    newContentOldSelect.value.end);
  const chooseCateStr = chooseCate.value.join('/')
  const session = new Session(bookInfo.value.createUserSystem);
  const result1 = await session.chat(`你是${bookSystem}，现在你要写一本名讲述${bookInfo.value.problem}的书。正在写其中《${chooseCateStr}》这一章，${(find.desc ? ('这一章讲述了“' + find.desc + '”') : '')}，你读懂就好，本地对话不用给我改写的结局，回复我“好的”即可。下一次对话，我会给你一些改写要求。
## 原有内容
\`\`\`markdown
${newContentOldContent.value.content}
\`\`\``, () => {
    console.log(1)
  })
  console.log('result1', result1)
  let promptSession = '';
  if (newContentOldSelect.value.end) {
    promptSession = `刚才的文章中有如下的文字：从${newContentOldSelect.value.start}字符开始的这段文字：“【${oldContent}】”，进行改写。改写建议是：“${newContentInput.value}”。
不要在开头加上类似“新内容如下：”或者“以下为您提供的这一章节的正文内容：”这一类的客套话。`
  } else {
    promptSession = `对刚才的文章进行改写，改写建议是：“${newContentInput.value}”。不要在开头加上类似“新内容如下：”，或者“以下为您提供的这一章节的正文内容：”这一类的客套话。
## 格式要求
采用markdown格式。如果让你去掉某部分内容，则字数肯定减少。如果让你增加某部分内容，则字数增加。这不是一篇独立的文章，而是一本书里的某一章，所以不要有引言。
章节名称作为文章的开头，并用markdown一级标题。
\`\`\`markdown
# ${chooseCateStr}
修改后的正文......
\`\`\`

## 示例
\`\`\`markdown
# ${chooseCateStr}
修改后的正文......`
  }
  console.log(promptSession)
  newContentNewContent.value = '';
  newContentNewContent.value = await session.chat(promptSession, (res) => {
    newContentNewContent.value += res
  })
  newContentVisible.value = true;
  newContentLoading.value = false;
  newContentInput.value = '';
  createContentLoading.value = false
}
async function deleteContent() {
  if (!chooseCateInfo.value || !bookInfo.value) {
    return;
  }
  ElMessageBox.confirm('是否清空文章', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    if (!chooseCateInfo.value || !bookInfo.value) {
      return;
    }
    chooseCateInfo.value.contentId = [];
    chooseCateInfo.value.length = 0;
    showContent.value = []
  }).catch((e) => {
    console.log(e)
  })
}
async function findError() {
  newContentNewContent.value = ''
  if (chooseCate.value.length === 0 || !bookInfo.value) {
    return
  }
  if (!newContentOldContent.value) {
    return;
  }
  const session = new Session(bookInfo.value.createUserSystem)
  createContentLoading.value = true
  newContentLoading.value = true;
  const newContent = await session.chat(`现在又一篇文章帮我看看有没有什么实事错误。
## 文章如下
${newContentOldContent.value.content.slice(newContentOldSelect.value.start,
    newContentOldSelect.value.end)}
`)
  newContentNewContent.value = newContent;
  newContentVisible.value = true;
  newContentLoading.value = false;
  createContentLoading.value = false
}
async function getNewContentImg() {
  if (!bookInfo.value || !chooseCateInfo.value) {
    return;
  }
  const session = new Session(bookInfo.value.createUserSystem);
  try {
    console.log(chooseCateInfo)
    let receiveMsg = newImgContent.value?.content;
    receiveMsg = await session.chat(`帮我把以下这么一段文字浓缩成一个可以30字以内的短描述，文字如下：
    ${receiveMsg}`)
    console.log(receiveMsg)
    receiveMsg = chooseCateInfo.value.title + ' ' + receiveMsg;
    const baiduUrl = 'https://image.baidu.com/search/acjson?tn=resultjson_com&word=' + encodeURIComponent(receiveMsg)
    const json = await get('https://api.studying1v1.com/admin/getHTTPByUrl?url=' + encodeURIComponent(baiduUrl));
    const urls = json.data.map((v: any) => v.hoverURL);
    baiduImgList.value = urls;
  } catch (e) {
    console.log(e)
  }
}
async function addImgToContent(url: string) {
  showContent.value[0].content += `\n![插图](${url})`;
  newImgVisible.value = false;
}
async function useNewContent() {
  if (newContentOldContent.value) {
    if (newContentOldSelect.value.end === undefined) {// 如果是undefined，代表全篇选中
      newContentOldContent.value.content = newContentNewContent.value;
    } else {
      newContentOldContent.value.content = newContentOldContent.value.content.slice(0, newContentOldSelect.value.start) + newContentNewContent.value + newContentOldContent.value.content.slice(newContentOldSelect.value.end)
    }
    newContentVisible.value = false;
    newContentNewContent.value = ''
  }
  newContentOldSelect.value = { start: 0, end: undefined }
}
async function splitContentToCat(content: Content, toParent: boolean) {
  if (!chooseCateInfo.value || !bookInfo.value) {
    return;
  }
  const session = new Session(bookInfo.value.createUserSystem);
  lockPage.value = true;
  await session.chat(`我给你一篇文章，标题是《${chooseCateInfo.value.title}》，我将给你正文，给你正文后你就回复我收到即可。后续的对话我会给你指令。
#内容如下
\`\`\`markdown
${content.content}
\`\`\``)
  const json = await session.chat(`这篇文章，你按照内容的段落分割，拆分成2个以上独立的部分，并给每个部分重新起个标题和一个50字以内的描述。
## 格式要求
你将返回json格式给我，示例如下：
\`\`\`json
[
  {
    "title": "标题",
    "desc": "短描述"
  },
  {
    "title": "标题",
    "desc": "短描述"
  }
]
\`\`\`
`)
  lockPage.value = false;
  const match = json.match(/```json([\S|\s]+)```/) as RegExpMatchArray;
  if (!match) {
    return;
  }
  console.log(match[1]);
  const children = JSON.parse(match[1]);
  const splitCateList: CateItem[] = children.map((v: any) => {
    return {
      title: v.title,
      desc: v.desc,
      children: []
    }
  })
  if (toParent) {
    if (cateJSON.value.includes(chooseCateInfo.value)) {
      const cate1Index = cateJSON.value.indexOf(chooseCateInfo.value);
      cateJSON.value.splice(cate1Index, 1, ...splitCateList)
    } else {
      for (let i = 0; i < cateJSON.value.length; i++) {
        const cate1 = cateJSON.value[i];
        if (cate1.children && cate1.children.includes(chooseCateInfo.value)) {
          const cate2Index = cate1.children.indexOf(chooseCateInfo.value);
          cate1.children.splice(cate2Index, 1, ...splitCateList)
          return
        } else {
          if (cate1.children && cate1.children.length) {
            for (let j = 0; j < cate1.children.length; j++) {
              const cate2 = cate1.children[j];
              if (cate2.children && cate2.children.includes(chooseCateInfo.value)) {
                const cate3Index = cate2.children.indexOf(chooseCateInfo.value)
                cate2.children.splice(cate3Index, 1, ...splitCateList)
              }
            }
          }
        }
      }
      console.log(chooseCateInfo.value);
      console.log(content);
    }
  } else {
    chooseCateInfo.value.children = splitCateList;
  }
  chooseCateInfo.value = undefined
  chooseCate.value = []
  showContent.value = []
}
async function saveContent(content: Content) {
  console.log(content);
  lockPage.value = true
  try {
    const result = await post('/book/contentUpdate/' + content.id, {
      content: content.content,
    });
    lockPage.value = false
    console.log(result);
    ElMessage({
      message: result ? `保存成功${result}个正文` : '保存正文不成功，或无修改',
      type: 'success',
    })
    if (chooseCateInfo.value) {
      changeChooseCate(chooseCateInfo.value, chooseCate.value)
      getAllLength();
    }
  } catch (e) {
    lockPage.value = false
    ElMessage({
      type: 'error',
      message: '保存失败：' + e
    })
  }
}

const allBookLength = computed(() => {
  let allLength = 0;
  cateJSON.value.forEach(v => {
    if (v.contentId && v.length) {
      allLength += v.length;
    }
    if (v.children) {
      v.children.forEach(vv => {
        if (vv.contentId && vv.length) {
          allLength += vv.length;
        }
        if (vv.children) {
          vv.children.forEach(vvv => {
            if (vvv.contentId && vvv.length) {
              allLength += vvv.length;
            }
          })
        }
      })
    }
  })
  return allLength;
})
async function saveBook() {
  // 整理数据
  cateJSON.value.forEach(v => {
    if (v.contentId && v.contentId.length) {
      v.contentId = v.contentId.filter(id => id).map(id => +id)
    }
    if (v.children && v.children.length > 0) {
      v.children.forEach(vv => {
        if (vv.contentId && vv.contentId.length) {
          vv.contentId = vv.contentId.filter(id => id).map(id => +id)
        }
        if (vv.children && vv.children.length > 0) {
          vv.children.forEach(vvv => {
            if (vvv.contentId && vvv.contentId.length) {
              vvv.contentId = vvv.contentId.filter(id => id).map(id => +id)
            }
          })
          vv.contentId = undefined;
          vv.length = undefined;
        }
      })
      v.contentId = undefined;
      v.length = undefined;
    }
  })
  const result = await put(`/bookInfo/${bookId.value}`, {
    data: {
      cateJSON: JSON.stringify(cateJSON.value)
    }
  })
  // 删除脏数据，无用的content
  let deleteIds: number[] = [];
  cateJSON.value.forEach(v => {
    if (v.children && v.children.length) {
      if (v.contentId && v.contentId.length) {
        deleteIds = [...deleteIds, ...v.contentId]
        delete v.contentId;
        v.length = 0;
      }
    }
  })
  console.log(deleteIds)
  if (deleteIds.length > 0) {
    const deleteResult = await Delete('/book/content/delete', {
      ids: deleteIds,
    })
    console.log('删除无用content结果', deleteResult);
  }
  ElMessage({
    message: result ? `目录保存成功` : '目录保存失败，或无修改',
    type: 'success',
  })
  initBookCate();
}
async function exportBook(isUpload: boolean) {
  let page = 0;
  function addPage() {
    doc.addPage()
    page++;
    const oldFontSize = doc.getFontSize();
    const oldFontColor = doc.getTextColor();
    doc.setTextColor('#777');
    doc.setFontSize(10);
    if (page % 2 === 0) {
      doc.text(page.toString(), 10, pageHeight - 7, { align: 'center' })
    } else {
      doc.text(page.toString(), pageWidth - 10, pageHeight - 7, { align: 'center' })
    }
    doc.setTextColor(oldFontColor);
    doc.setFontSize(oldFontSize);
  }
  function Content(beginY: number, doc: jsPDF) {
    let lineY = beginY;
    const marginTop = 12;
    const marginBottom = 12;
    const marginLeft = 20;
    const marginRight = 20;
    return {
      drawLine: async function (strContent: string, x: number, fontSize: number) {
        // fontSize正文的时候一般建议传10
        const lineHeight = fontSize * 0.7;
        doc.setFontSize(fontSize);
        if (strContent === undefined) {// 前期调试问题方便，稳定后可以删除
          // debugger
        }
        const strArr = strContent.split('\n');
        for (let j = 0; j < strArr.length; j++) {
          const strs_ = strArr[j]
          doc.setFont('sans')
          const wordList = modifyStr(strs_);
          let lineXPosition = x + marginLeft;
          // console.log('===wordList===', wordList);
          let maxFontSize = 10;
          for (let j = 0; j < wordList.length; j++) {
            const { word, style } = wordList[j];
            if (style.includes('img')) {
              const { width, height } = await (new Promise<{
                width: number,
                height: number,
              }>((resolve, reject) => {
                const img = new Image()
                img.onload = function () {
                  resolve({
                    width: img.width,
                    height: img.height,
                  })
                }
                img.onerror = function () {
                  reject('图片下载失败')
                }
                img.src = word
              }));
              const s = pageWidth * 0.6 / width
              console.log(width, height);
              const imgWidth = width * s;
              const imgHeight = height * s;
              if (pageHeight - marginBottom - marginTop - lineY < imgHeight) {
                addPage()
                lineY = 0;
              }
              doc.addImage(word, 'JPEG', (pageWidth - imgWidth) / 2, lineY + marginTop + lineHeight, imgWidth, imgHeight)
              lineY += imgHeight;
            } else if (style.includes('split')) {
              // doc.text("!!" + word + '!!!', lineXPosition, lineY + marginTop + lineHeight);
              // lineY += lineHeight;
            } else {
              // 处理样式
              const bold = style.includes('**')
              const T3 = style.includes('###') || style.includes('##') || style.includes('#')
              if (bold) {
                doc.setFont('sansBolds')
              } else {
                doc.setFont('sans')
              }
              if (T3) {
                doc.setFontSize(12)
                maxFontSize = Math.max(maxFontSize, 12)
              } else {
                maxFontSize = Math.max(maxFontSize, 10)
                doc.setFontSize(fontSize)
              }
              // 开始计算位置
              const width = doc.getTextWidth(word);
              if (lineXPosition + width > pageWidth - marginRight) {
                lineY += lineHeight;
                if (lineY > pageHeight - marginBottom - marginTop - lineHeight) {
                  addPage()
                  lineY = 0;
                }
                lineXPosition = x + marginLeft;
              }
              doc.text(word, lineXPosition, lineY + marginTop + lineHeight);
              lineXPosition += width;
            }
          }
          lineY += Math.max(maxFontSize, fontSize) * 0.7;
          if (lineY > pageHeight - marginBottom - marginTop - lineHeight) {
            addPage()
            lineY = 0;
          }
        }
      },
      addY(addNum: number) {
        lineY += addNum
      },
      getY() {
        return lineY + marginTop;
      },
      getBottomY() {
        return pageHeight - marginBottom - marginTop - lineY;
      },
      getPage() {
        return page;
      },
      turnNewPage() {
        addPage()
        lineY = 0;
      }
    }
  }
  exporting.value = true;
  if (!bookInfo.value) {
    return;
  }
  const doc = new jsPDF('p', 'mm', 'a5');
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont('sans');//使用字体时，使用这句即可
  function loadImg(url: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = function () {
        // ctx.drawImage('https://yingshijiaoyuimg.oss-cn-beijing.aliyuncs.com/217766177edfc6998b7348135ce08100.png?x-oss-process=image/resize,m_fill,w_88,quality,q_60', 0, 0, 40, 30);
        resolve(image);
      };
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url.replace(/^https?:/, '') as string; // 替换为你的图片路径
    })
  }
  // 开始创建封皮
  const titleY = 0.2;
  if (bookInfo.value && bookInfo.value.img) {
    // 创建封皮，用图片当背景
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const image = await loadImg(bookInfo.value?.img.replace(/^https?:/, '') as string);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    (() => {
      let titleFontSize = 48;
      for (; titleFontSize > 20; titleFontSize--) {
        ctx.font = titleFontSize + 'px Arial';
        const width = ctx.measureText(bookInfo.value?.name || '').width
        if (width < canvas.width * 0.8) {
          break;
        }
      }
      const nameWidth = ctx.measureText(bookInfo.value?.name || '').width;
      let descFontSize = 48;
      for (; descFontSize > 2; descFontSize--) {
        ctx.font = descFontSize + 'px Arial';
        const width = ctx.measureText(bookInfo.value?.desc || '').width
        if (width < canvas.width * 0.8) {
          break;
        }
      }
      const descTextWidth = ctx.measureText(bookInfo.value?.desc || '').width;
      // 绘制方块
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const scWidth = Math.max(nameWidth, descTextWidth) + canvas.width * 0.1;
      const scHeight = titleFontSize;
      ctx.fillRect(canvas.width / 2 - scWidth / 2, canvas.height * titleY - scHeight - 15, scWidth, scHeight + 170);
      ctx.strokeStyle = '#999';
      ctx.strokeRect(canvas.width / 2 - scWidth / 2, canvas.height * titleY - scHeight - 15, scWidth, scHeight + 170);
      // 绘制名称
      ctx.font = titleFontSize + 'px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(bookInfo.value?.name || '', canvas.width / 2 - nameWidth / 2, canvas.height * titleY)
      // 绘制描述
      ctx.fillStyle = '#333';
      ctx.font = descFontSize + 'px Arial';
      ctx.fillText(bookInfo.value?.desc || '', canvas.width / 2 - descTextWidth / 2, canvas.height * titleY + 100)
    })()
    // 绘制底部
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(canvas.width / 2 - 230, canvas.height - 135, 460, 90);
    const icon = await loadImg('https://yingshijiaoyuimg.oss-cn-beijing.aliyuncs.com/217766177edfc6998b7348135ce08100.png?x-oss-process=image/resize,m_fill,w_88,quality,q_60');
    ctx.drawImage(icon, canvas.width / 2 - 200 - 10, canvas.height - 123, 55, 50);
    ctx.font = '18px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('微述', canvas.width / 2 - 200, canvas.height - 56)
    ctx.fillStyle = 'black';
    ctx.font = '26px Arial';
    const bottomTextWidth2 = ctx.measureText('www.microbook123.com').width
    ctx.fillText('www.microbook123.com', canvas.width / 2 - bottomTextWidth2 / 2 + 30, canvas.height - 96)
    const bottomTextWidth = ctx.measureText('内部资料，非出版物，禁止销售').width
    ctx.fillStyle = '#666';
    ctx.font = '18px Arial';
    ctx.fillText('内部资料，非出版物，禁止销售', canvas.width / 2 - bottomTextWidth / 2 + 70, canvas.height - 65)
    doc.addImage(canvas.toDataURL("image/png"), 'JPEG', 0, 0, pageWidth, pageHeight)
  }
  // 封皮背面留白
  // 添加字体可以用这个教程，亲测有效 https://www.cnblogs.com/andydao/p/18060680
  const { default: addSansFont } = await import('./font/sans');
  const { default: addSansBoldsFont } = await import('./font/sansBold');
  addSansFont(doc)
  addSansBoldsFont(doc);
  (() => {
    doc.addPage()
    const { drawLine, getBottomY, addY } = Content(0, doc);
    doc.setTextColor('#333');
    drawLine('         ' + bookInfo.value.sendWord, 0, 11)
    const bottomY = getBottomY()
    addY(bottomY - 21);
    drawLine('         本专栏由微述网站发布，内容非出版物，网站不售卖任何纸质内容，所有纸质内容均为用户在网站下载后个人打印产生，任何个人打印后仅供个人学习使用，不得售卖。', 0, 8)
  })()

  const cateToPage = new Map<CateItem, number>()
  // 开始写正文
  let contEndPage = 0
  await (async function () {
    addPage()
    doc.setTextColor('#000');
    const allContId: number[] = []
    cateJSON.value.forEach(v => {
      if (v.contentId) {
        allContId.push(...v.contentId)
      }
      if (v.children) {
        v.children.forEach(vv => {
          if (vv.contentId) {
            allContId.push(...vv.contentId)
          }
          if (vv.children) {
            vv.children.forEach(vvv => {
              if (vvv.contentId) {
                allContId.push(...vvv.contentId)
              }
            })
          }
        })
      }
    })
    const contentList: {
      [key in number]: Content
    } = await get('/getContentByIds', {
      contentIds: allContId
    })
    const { drawLine, getY, getBottomY, getPage, addY, turnNewPage } = Content(0, doc);
    // let contIndex = 0;
    // drawLine('This is my first time to be here. I’m a little nervous.This is my first time to be here. I’m a little nervous.This is my first time to be here. I’m a little nervous.This is my first time to be here. I’m a little nervous.', 0, 20);
    //     drawLine(`### Title2
    // description
    // 1. **bold**:hello world.hello world.hello world.hello world.hello world.hello world.hello world.hello world.hello world.hello world`, 0, 10);
    //     drawLine(`1. **bold**:hello world`, 0, 20);
    for (let i = 0; i < cateJSON.value.length; i++) {
      const v = cateJSON.value[i]
      if (i !== 0) {
        turnNewPage();
      }
      doc.setFillColor('#4e6ef2')
      doc.rect(13, getY() + 4, pageWidth - 26, 14, 'F');
      doc.setTextColor('#fff')
      drawLine(v.title, 0, 20);
      doc.setTextColor('#000');
      addY(2)
      if (v.desc) {
        drawLine(v.desc, 0, 10);
      }
      doc.setFillColor('#fff')
      addY(6)
      cateToPage.set(v, getPage())
      // addY(3);
      if (v.contentId) {
        for (let j = 0; j < v.contentId.length; j++) {
          const id = v.contentId[j]
          if (contentList[id] === undefined) {// 前期调试问题方便，稳定后可以删除
            // debugger
          }
          await drawLine(contentList[id].content, 0, 10);
          // contIndex++;
        }
      }
      if (v.children) {
        for (let j = 0; j < v.children.length; j++) {
          const vv = v.children[j]
          if (getBottomY() < 20) {
            turnNewPage();// 不让类目标题位于某一页的最后一行
          }
          doc.setFillColor('#b6d7ff')
          doc.roundedRect(16, getY() + 5, pageWidth - 29, 10, 2, 2, 'F');
          addY(2)
          drawLine(vv.title, 0, 14);
          addY(2)
          if (vv.desc) {
            drawLine(vv.desc, 0, 10);
          }
          cateToPage.set(vv, getPage())
          if (vv.contentId) {
            for (let k = 0; k < vv.contentId.length; k++) {
              const id = vv.contentId[k]
              if (!contentList[id]) {
                ElMessage.error('存在失效的文章id，对应标题【' + vv.title + '】')
                return;
              }
              await drawLine(contentList[id].content, 0, 10).catch(e => {
                ElMessage.error(e)
                exporting.value = false;
                return;
              });
              // contIndex++;
            }
          }
          if (vv.children) {
            for (let k = 0; k < vv.children.length; k++) {
              const vvv = vv.children[k]
              if (getBottomY() < 20) {
                turnNewPage();// 不让类目标题位于某一页的最后一行
              }
              doc.setFillColor('#dfebff')
              addY(1)
              doc.roundedRect(18, getY() + 3, pageWidth - 31, 8, 2, 2, 'F');
              drawLine(vvv.title, 0, 12);
              addY(1)
              if (vvv.desc) {
                drawLine(vvv.desc, 0, 10);
              }
              cateToPage.set(vvv, getPage())
              if (vvv.contentId) {
                for (let kk = 0; kk < vvv.contentId.length; kk++) {
                  const id = vvv.contentId[kk]
                  await drawLine(contentList[id].content, 0, 10);
                  // contIndex++;
                }
              }
            }
          }
        }
      }
    }
    contEndPage = getPage()
  })();

  // 开始写目录
  (function () {
    const marginTop = 12;
    const marginBottom = 12;
    const marginLeft = 20;
    const marginRight = 20;
    const lineHeight = 10;
    doc.addPage();
    doc.setFontSize(22);
    doc.setTextColor('#000');
    doc.text('目录', pageWidth / 2, 25, {
      align: 'center',
    });
    let lineY = 30;
    doc.setTextColor('#000');
    doc.setFontSize(10);
    let pageCount = 1
    const singleXingWidth = doc.getTextWidth('**********') / 10;
    function drawCateLine(str: CateItem, x: number) {
      const y = lineY + marginTop + lineHeight;
      // doc.html('<div>文字</div>')
      // doc.html('<div style="font-weight: bold;">文字</div>')
      doc.text(str.title.replace(/。$/, ''), x + marginLeft, y);
      const beginX = doc.getTextWidth(str.title) + x + marginLeft;
      const xingCount = Math.round((pageWidth - beginX - marginRight) / singleXingWidth);
      if (xingCount - 2 > 0) {
        doc.text(Array(xingCount - 2).fill('*').join(''), Math.ceil(beginX / singleXingWidth) * singleXingWidth, y + 1)
      }
      const pageCurrent = cateToPage.get(str)
      doc.text(pageCurrent ? pageCurrent.toString() : '', pageWidth - marginRight, y);
      lineY += lineHeight
      if (lineY > pageHeight - marginBottom - marginTop - lineHeight) {
        doc.addPage();
        pageCount++;
        lineY = 0;
      }
    }
    cateJSON.value.forEach(v => {
      drawCateLine(v, 0)
      if (v.children && v.children.length > 0) {
        v.children.forEach(vv => {
          drawCateLine(vv, 5);
          if (vv.children && vv.children.length) {
            vv.children.forEach(vvv => {
              drawCateLine(vvv, 10);
            })
          }
        })
      }
    })
    if (pageCount % 2 === 1) {
      // 正文开始不要用目录的反面
      doc.addPage();
      pageCount++;
    }
    for (let i = 0; i < pageCount; i++) {
      doc.movePage(contEndPage + 3 + i, 3 + i)
    }
  })();
  // 结尾封皮
  (() => {
    if (page % 2 === 0) {
      doc.addPage();
    }
    doc.addPage();
    const { drawLine, getBottomY, addY } = Content(0, doc);
    doc.setFontSize(13);
    doc.text('电脑端可在浏览器访问如下网址，阅读本专栏', pageWidth / 2, 20, {
      align: 'center',
    });
    doc.setFontSize(12);
    doc.text('https://www.microbook123.com/book/' + bookInfo.value.id, pageWidth / 2, 27, {
      align: 'center',
    });
    // 两个app图标，等ios上线后，可以添加
    (() => {
      // doc.setFontSize(13);
      // doc.text('手机端可在app上阅读本专栏', pageWidth / 2, 40, {
      //   align: 'center',
      // });
      // doc.setFontSize(12);
      // doc.text('ios', 50, 47, {
      //   align: 'center',
      // });
      // doc.text('Android', 100, 47, {
      //   align: 'center',
      // });
      // const androidScanImg = 'https://img1.baidu.com/it/u=2990740733,444721965&fm=253&fmt=auto&app=138&f=JPEG?w=600&h=400'//https://yingshijiaoyusystem.oss-cn-beijing.aliyuncs.com/microbook.png?x-oss-process=image/resize,m_fill,w_128,quality,q_60
      // doc.addImage(androidScanImg, 'PNG', 35, 50, 30, 30)
      // const iosScanImg = 'https://img1.baidu.com/it/u=2990740733,444721965&fm=253&fmt=auto&app=138&f=JPEG?w=600&h=400';//'https://yingshijiaoyusystem.oss-cn-beijing.aliyuncs.com/microbook.png?x-oss-process=image/resize,m_fill,w_128,quality,q_60'
      // doc.addImage(iosScanImg, 'PNG', 85, 50, 30, 30)
    })()

    doc.setTextColor('#666');
    const bottom = getBottomY()
    addY(bottom - 40)
    drawLine('**声明：**本专栏由微述网站发布，内容非出版物，网站不售卖任何纸质内容，所有纸质内容均为用户在网站下载后个人打印产生，任何个人打印后仅供个人学习使用，不得售卖。', 2, 11);
  })()

  if (isUpload) {
    try {
      const blob = doc.output('blob');
      console.log('blob')
      console.log(blob)
      const formData = new FormData()
      formData.append('file', blob)
      const res = await post('/microbook/uploadFile', formData)
      console.log(res)
      if (res.result === true) {
        const saveRes = await put(`/bookInfo/${bookId.value}`, {
          data: {
            downUrl: res.url,
            status: 1,
          }
        })
        bookInfo.value.downUrl = res.url;
        console.log(saveRes)
        if (saveRes) {
          exporting.value = false;
          ElMessage.success('地址生成成功')
        }
      }
    } catch (e: any) {
      exporting.value = false;
      ElMessage.error(e.toString())
    }
  } else {
    exporting.value = false;
    doc.save(bookInfo.value.name + '.pdf');
  }
}
function getContentItemLength(cate: CateItem) {
  let length = cate.length || 0;
  if (cate.children) {
    cate.children.forEach(v => {
      length += getContentItemLength(v);
    })
  }
  return length;
}
async function initAddCate1Child(cate: CateItem, cateStrs: string[]) {
  if (!bookInfo.value) {
    return;
  }
  if (!cate.desc) {
    ElMessage.warning('章节需要有短描述')
    return;
  }
  addCate1ChildCateEditCat.value = cateStrs;
  addCate1ChildCateVisible.value = true
  addCate1ChildCateLoading.value = true;
  addChate1Session = new Session(bookInfo.value.createUserSystem);
  addCate1ChildCateAnswer.value = ''
  addCate1ChildCateAnswerJSON.value = ''
  const demand = ({
    [1]: '',
    [2]: `采用时间线作为章节划分`,
  })[bookInfo.value.cateType]
  addCate1ChildCateAnswer.value = await addChate1Session.chat(`你现在正在写一本《${bookInfo.value.name}》的书，本书的作用是${bookInfo.value.desc}。
其中${addCate1ChildCateEditCat.value.join('/')}章节负责讲述“${cate.desc}”这个目标，为了讲明白这个目标，需要生成下一级章节。${demand}。
  `, (res) => {
    addCate1ChildCateAnswer.value += res;
  });
  addCate1ChildCateLoading.value = false;
}
async function addCate1ChildCate() {
  if (!bookInfo.value || !addChate1Session) {
    return;
  }
  addCate1ChildCateLoading.value = true;
  addCate1ChildCateAnswer.value = ''
  addCate1ChildCateAnswerJSON.value = '';
  addCate1ChildCateAnswer.value = await addChate1Session.chat(`本书${addCate1ChildCateEditCat.value.join('/')}章节，我要它的设置下属一级章节。
  我的想法是：` + addCate1ChildCateInput.value + `。
  你的修改策略，根据我的想法，${addCate1ChildCateEditCat.value.join('/')}章节，新的下属章节列表`, (res) => {
    addCate1ChildCateAnswer.value += res;
  })
  addCate1ChildCateLoading.value = false;
  addCate1ChildCateInput.value = '';
}
async function createCatJSON() {
  if (!bookInfo.value || !addChate1Session) {
    return;
  }
  addCate1ChildCateLoading.value = true;
  addCate1ChildCateAnswer.value = ''
  addCate1ChildCateAnswerJSON.value = ''
  const youhuaStr = addCate1ChildCateInput.value;
  addCate1ChildCateAnswerJSON.value = await addChate1Session.chat(
    `${youhuaStr ? ('我的想法是：' + youhuaStr) : '可以了，这个章节我很满意'}，帮我生成${addCate1ChildCateEditCat.value.join('/')}章节子章节列表的json数据。
## 格式示例
\`\`\`json
[
  {
    "title":"第一章名称",
    "desc": "第一章内容短描述"
  },
  {
    "title":"第二章名称",
    "desc": "第二章内容短描述"
  }
]
\`\`\`
## 格式要求
返回json结构的title，不要加自增的序列，例如：“第一章：XXX”、“一、”、“1.”。title就直接是章节名。
json结构不要添加children层，只返回${addCate1ChildCateEditCat.value.join('/')}下一层目录。`,
    (res) => {
      addCate1ChildCateAnswerJSON.value += res;
    })
  console.log(addCate1ChildCateAnswerJSON.value);
  addCate1ChildCateLoading.value = false;
  addCate1ChildCateInput.value = '';
}
async function useAnswerJSON() {
  if (!addCate1ChildCateAnswerJSON.value) {
    return;
  }
  console.log(addCate1ChildCateAnswerJSON.value);
  const match = addCate1ChildCateAnswerJSON.value.match(/```json([\S|\s]+)```/);
  if (match) {
    let children = JSON.parse(match[1]);
    if (children.length === 1 && children.children && children.children.length) {
      children = children.children;
    }
    console.log('children===', children);
    let find: CateItem = {
      title: '',
      desc: '',
      length: 0,
      children: cateJSON.value
    };
    for (let i = 0; i < addCate1ChildCateEditCat.value.length; i++) {
      console.log(i, addCate1ChildCateEditCat.value[i], find);
      const match = find.children.find(v => v.title === addCate1ChildCateEditCat.value[i])
      if (match) {
        find = match;
      }
    }
    console.log('find=======', find)
    find.children = children
    addCate1ChildCateEditCat
    addCate1ChildCateAnswerJSON.value = ''
    addCate1ChildCateVisible.value = false;
  } else {
    ElMessage.error('无法找到json')
  }
}
async function deleteCate1(cate1: CateItem) {
  const findIndex = cateJSON.value.indexOf(cate1);
  if (findIndex > -1) {
    cateJSON.value.splice(findIndex, 1)
  }
}
async function deleteCate2(cate1: CateItem, cate2: CateItem) {
  const findIndex = cate1.children.indexOf(cate2);
  if (findIndex > -1) {
    cate1.children.splice(findIndex, 1)
  }
}
async function deleteCate3(cate2: CateItem, cate3: CateItem) {
  const findIndex = cate2.children.indexOf(cate3);
  if (findIndex > -1) {
    cate2.children.splice(findIndex, 1)
  }
}
function textSelect(event: any) {
  // 获取被选中的文本
  const selection = event.target.value.substring(event.target.selectionStart, event.target.selectionEnd);
  if (selection) {// 有selection证明是框选后抬起的鼠标
    console.log('框选')
    newContentOldSelect.value = {
      start: event.target.selectionStart,
      end: event.target.selectionEnd
    }
    newContentOldSelectText.value = selection;
  } else {// 有selection证明是取消框选后抬起的鼠标
    console.log('不框选')
    newContentOldSelect.value = { start: 0, end: undefined }
    newContentOldSelectText.value = ''
  }
}
function showMsgNotification(title: string, msg: string) {
  // @ts-ignore
  const Notification = window.Notification || window.mozNotification || window.webkitNotification;
  if (Notification) { //支持桌面通知
    if (Notification.permission == "granted") {
      //已经允许通知                        
      const instance = new Notification(title, {
        body: msg,
        icon: "https://www.haolizi.net/skin/images/150x50_logo.png",
      });
      instance.onclick = function () {
        instance.close();
      };
      instance.onerror = function () {
        console.log('onerror');
      };
      instance.onshow = function () {
        console.log('onshow');
      };
      instance.onclose = function () {
        console.log('onclose');
      };
    } else {
      Notification.requestPermission(function (status) {
        if (status === "granted") {
          //用户允许                                
          const instance = new Notification(title, {
            body: msg,
            icon: "images/reload.png"
          }); instance.onclick = function () {
            // Something to do                                
          };
          instance.onerror = function () {
            // Something to do
          };
          instance.onshow = function () {
            // Something to do
          };
          instance.onclose = function () {
            // Something to do 
          };
        } else {
          //用户禁止
          return false
        }
      });
    }
  } else {
    // debugger
  }
}
async function pushBaidu() {
  if (!bookInfo.value) {
    return;
  }
  const result = await get('/book/admin/pushToBaidu/' + bookInfo.value.id);
  console.log(result);
}
</script>
<style lang="less" scoped>
.nav {
  position: fixed;
  top: 0;
  z-index: 1000;
  // left: @navSaveLeftWidth;
  right: 120px;
  padding: 0 5px;
  height: 40px;
  display: flex;
  align-items: center;
}

.edit {
  display: flex;
  height: calc(100vh - 40px);
  box-sizing: border-box;
  overflow: hidden;

  .left {
    width: 370px;
    height: 100%;
    margin-right: 8px;
    padding-right: 8px;
    margin-left: 4px;
    overflow-y: hidden;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: solid 2px #B7B7B8;

    .bookInfo {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 4px;
      height: 32px;

      .name {
        font-size: 14px;
        color: black;
        margin-left: 4px;
      }

      .length {
        font-size: 12px;
        flex-shrink: 0;
        color: #999;
        border: solid 1px #999;
        margin-left: 4px;
        display: inline-block;
        line-height: 12px;
        padding: 2px;
        border-radius: 4px;
        box-sizing: border-box;
      }
    }
  }

  .cateEdit {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    flex-grow: 0;
  }

  .contentEdit {
    flex-grow: 1;
    overflow-x: hidden;
    margin-right: 4px;
    padding-top: 4px;

    .empty {
      background-color: #ebebeb;
      height: 100%;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }

    .codeItem {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background-color: white;
      position: relative;
      overflow: hidden;

      .customTools {
        display: flex;
        align-items: center;
        padding: 4px 0;

        .contentLength {
          font-size: 14px;
          margin-right: 8px;
          color: #aaa;
        }
      }

      .textarea {
        overflow-y: auto;
        margin-bottom: 8px;
      }
    }
  }
}

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

  &.active {
    background-color: #358c35;
    color: white;

    .head {
      .titleInput {
        background-color: transparent;

        :deep(.el-input__wrapper) {
          background-color: transparent;
          box-shadow: none;

          .el-input__inner {
            color: white;
          }
        }
      }

      .tools {
        color: white;
      }
    }

    .desc {
      color: white;
    }
  }

  .desc {
    color: #999;
    font-size: 12px;

    :deep(textarea) {
      font-size: 12px;
    }
  }

  .length {
    font-size: 12px;
    flex-shrink: 0;
    color: #999;
    border: solid 1px #999;
    display: inline-block;
    line-height: 12px;
    padding: 2px;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .children {
    margin-left: 16px;
  }
}

.newContentDialog {
  .contentDiff {
    display: flex;
    margin-top: 8px;

    .contentDiffItem {
      width: 50%;
      border: solid 1px rgb(62, 62, 62);

      .countLength {
        color: #999;
        height: 24px;
        line-height: 24px;
        padding: 2px 8px;
        border-bottom: solid 1px rgb(62, 62, 62);
      }

      .creating {
        width: 100%;
        text-align: center;
        background: green;
        color: white;
      }

      .countText {
        padding: 8px;
      }
    }
  }
}
</style>