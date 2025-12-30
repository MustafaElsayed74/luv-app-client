import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { PushNotificationService } from './app/services/push-notification.service';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    // Initialize push notifications after app is bootstrapped
    const pushService = appRef.injector.get(PushNotificationService);
    pushService.initializePushNotifications().catch(err =>
      console.error('Failed to initialize push notifications:', err)
    );
  })
  .catch((err) => console.error(err));
