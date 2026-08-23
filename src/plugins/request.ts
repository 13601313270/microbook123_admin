import axios from "axios";
import { ElMessage } from "element-plus";

function getCookie(name: string) {
  const strCookie = window.document.cookie;// 获取cookie字符串
  const arrCookie = strCookie.split('; ');// 分割
  for (let i = 0; i < arrCookie.length; i++) {
    const arr = arrCookie[i].split('=');
    if (arr[0] === name) {
      return arr[1];
    }
  }
  return '';
}

axios.interceptors.request.use(config => {
  // if (!config.url?.includes('restapi.amap.com')) {
  // }
  config.headers.token = localStorage.getItem('token') || getCookie('adminToken');
  return config;
}, error => Promise.reject(error));

axios.interceptors.response.use(response => {
  return response.data
}, (error: any) => {
  if (error.status === 404) {
    ElMessage('接口不存在');
  } else if ([401, 403].includes(error.status)) {
    ElMessage('未登陆');
    // if (location.pathname !== loginPathName) {
    //   Confirm()
    // }
  }
  return Promise.reject(error);
});


axios.defaults.baseURL = 'https://www.microbook123.com/';

export function get(method: string, params?: any): Promise<any> {
  return axios.get(method, {
    params: params,
  });
}

export function post(method: string, params?: any): Promise<any> {
  return axios.post(method, params);
}

export function put(method: string, params?: any): Promise<any> {
  return axios.put(method, params);
}

export function Delete(method: string, params?: any): Promise<any> {
  const newParams: any = {};
  if (params) {
    Object.keys(params).forEach(key => {
      const value = params[key];
      newParams[key] = typeof value === 'object' ? JSON.stringify(value) : value
    })
  }
  return axios.delete(method, {
    params: newParams,
  });
}