import axios from "axios";

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