type ModelEnum = 'ernie-4.0-turbo-8k-latest'
  | 'ernie-4.0-turbo-128k'
  | 'ernie-3.5-128k'
  | 'ernie-3.5-8k-0701'
  | 'ernie-speed-128k'
  | 'ernie-novel-8k';

const costConfig: {
  [key in ModelEnum]: {
    prompt: number,
    completion: number,
  }
} = {
  'ernie-3.5-128k': {
    prompt: 0.0008,
    completion: 0.002,
  },
  "ernie-3.5-8k-0701": {
    prompt: 0.0008,
    completion: 0.002,
  },
  "ernie-speed-128k": {
    prompt: 0,
    completion: 0
  },
  "ernie-4.0-turbo-128k": {
    prompt: 0.003,
    completion: 0.009
  },
  "ernie-4.0-turbo-8k-latest": {
    prompt: 0.003,
    completion: 0.009
  },
  "ernie-novel-8k": {
    prompt: 0.04,
    completion: 0.12,
  }
}
export {
  costConfig,
}
export type { ModelEnum };