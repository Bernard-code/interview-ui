import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'todo',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'categories/:item',
    renderMode: RenderMode.Server,
  },
  {
    path: 'categories/:item/:id/:item',
    renderMode: RenderMode.Server,
  },
  {
    path: 'categories/:item/:id/:item/:id',
    renderMode: RenderMode.Server,
  },
];
