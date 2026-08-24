// @ts-ignore
import { RouteRecordRaw } from "vue-router";
import HomeView from '../views/HomeView.vue'
import BookEditorView from '../views/book/editor.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/book/editor/:id',
    name: 'bookEditor',
    component: BookEditorView,
  },
]
export default routes;