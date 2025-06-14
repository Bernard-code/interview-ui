
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/interview-ui/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/interview-ui"
  },
  {
    "renderMode": 2,
    "route": "/interview-ui/todo"
  },
  {
    "renderMode": 0,
    "route": "/interview-ui/categories/*"
  },
  {
    "renderMode": 0,
    "route": "/interview-ui/categories/*/*/*"
  },
  {
    "renderMode": 0,
    "route": "/interview-ui/categories/*/*/*/*"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 27823, hash: 'e39c90d3a7b2b662c4f1ac7175f172f3292a45f478c409b1770bcc79a0cff27e', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 21402, hash: 'f0b8396a0b268de6c558372c74ff3bc26533bc508f231b3cb49adb5d7f4a4e89', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'todo/index.html': {size: 58368, hash: '36dc45df17d54c8070afdc6a1d64a2251f5cb47df4fff1b2c4e4d1f6d334485d', text: () => import('./assets-chunks/todo_index_html.mjs').then(m => m.default)},
    'index.html': {size: 55849, hash: '6c773c929b36114352229a4b4a4f1b6f49a4d09b5197427e84bb3fb175f45772', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-6X2DERF6.css': {size: 6974, hash: 'hps5DMv3bQA', text: () => import('./assets-chunks/styles-6X2DERF6_css.mjs').then(m => m.default)}
  },
};
