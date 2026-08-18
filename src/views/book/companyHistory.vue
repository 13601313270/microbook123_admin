<template>
  <div>
    <div v-for="item in companyList">{{ item.name }}
      <el-button v-if="bookMap[item.id]" @click="toEditDetail(bookMap[item.id].id)">{{ bookMap[item.id].name
        }}</el-button>
      <el-button type="danger" v-else @click="create(item)">创建{{ item.id }}</el-button>
    </div>
    <!-- <div>{{ bookMap }}</div> -->
  </div>
</template>
<script setup lang="ts">
import { get } from '@/plugins/request';
import { onMounted, ref } from 'vue';

type IBook = {
  id: number;
  name: string;
  desc: string;
  problem: string;
  status: number,
  createUserSystem: string;
  img: string;
  type: number;
  strategy: string;
}

const emits = defineEmits(['insertInit', 'toEditDetail']);
const bookMap = ref<Record<number, IBook>>({})
const bookCount = ref<number>(-1)
const bookListLoading = ref<boolean>(false);

type Company = {
  id: number
  name: string;
}
const companyList = ref<Company[]>([
]);

onMounted(() => {
  bookMap.value = {};
  get('/admin/dbBase/tableCommon/book/company?page[page]=0&page[pageSize]=10').then(({ count, data }) => {
    console.log(count, data);
    companyList.value = data.map((item: any) => {
      return {
        id: item.id.val,
        name: item.name.val,
      };
    });
  })
  initBookList()
})

async function initBookList() {
  bookListLoading.value = true;
  const { data, count } = await get(`/admin/dbBase/tableCommon/book/book`, {
    query: {
      ['strategy like']: 'companyHistory:%'
    },
    sort: {
      id: 'desc',
    },
    page: {
      page: 0,
      pageSize: 100,
    },
  })
  bookCount.value = count;
  data.map((v: any) => {
    const id = v.strategy.val.split(':')[1];
    bookMap.value[id] = {
      id: v.id.val,
      name: v.name.val,
      desc: v.desc.val,
      problem: v.problem.val,
      status: v.status.val,
      createUserSystem: v.createUserSystem.val,
      img: v.img.val,
      type: v.type.val,
      strategy: v.strategy.val,
    };
  });
  bookListLoading.value = false;
}
function create(company: Company) {
  const companyName = "泡泡玛特"
  const bookProblem = '了解' + companyName + '发展历程'
  const message = `我们一起合作要写一本讲述${companyName}公司简史的书。你要考虑这本书都需要讲解什么内容，并生成本书的目录，目录类似小说，编年体，或人物传记，具体哪年干了什么事情，然后给我你规划的本书的目录。目录就一层结构。
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
`;
  emits('insertInit', 2, 8, "精通公司简史", bookProblem, message, 'companyHistory:' + company.id);
}
function toEditDetail(id: number) {
  emits('toEditDetail', id);
}
</script>