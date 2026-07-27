import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';

polyfill({
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
});

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
